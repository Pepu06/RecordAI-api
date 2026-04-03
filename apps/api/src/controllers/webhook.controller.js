const { supabase } = require('@recordai/db');
const { getCalendarEvent, updateEventTitleAndColor, refreshAccessToken } = require('../services/google');
const { sendTemplate } = require('../services/whatsapp');
const env = require('../config/env');
const logger = require('../config/logger');
const { formatTime } = require('../utils/datetime');

function verify(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

async function receive(req, res) {
  try {
    const body = req.body;
    logger.info({ object: body?.object }, '[Webhook] Incoming payload');

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value.messages) continue;

        for (const message of value.messages) {
          await processMessage(message, value.metadata);
        }
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    logger.error({ err }, 'Webhook processing error');
    return res.sendStatus(200); // Always 200 to Meta
  }
}

function parseIntent(text) {
  if (!text) return null;
  const t = text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t === 'confirm' || t === '1' || t === 'confirmar' || t === 'si' || t === 'sí') return 'confirm';
  if (t === 'cancel' || t === '2' || t === 'cancelar' || t === 'no') return 'cancel';
  return null;
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

async function findPendingAppointmentByPhone(phone) {
  const phoneDigits = onlyDigits(phone);
  const phoneLast10 = phoneDigits.slice(-10);

  // Match contacts by last 10 digits to avoid format issues (+54, 549, spaces, etc.)
  const { data: contacts, error: contactsError } = await supabase
    .from('contacts')
    .select('id, phone')
    .ilike('phone', `%${phoneLast10}`)
    .limit(50);

  if (contactsError) throw contactsError;

  if (!contacts?.length) return null;

  const matchedContact = contacts.find((c) => onlyDigits(c.phone).endsWith(phoneLast10));
  if (!matchedContact) return null;

  // Find the appointment closest to now (upcoming or up to 2h past)
  const windowStart = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select('id, tenant_id, google_event_id, user_id, contact_id')
    .eq('contact_id', matchedContact.id)
    .in('status', ['pending', 'notified', 'confirmed', 'cancelled'])
    .gte('scheduled_at', windowStart)
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (appointmentError) throw appointmentError;

  return appointment || null;
}

async function processMessage(message, _metadata) {
  const from = message.from;
  let rawText = null;

  if (message.type === 'interactive' && message.interactive?.button_reply) {
    rawText = message.interactive.button_reply.id
      || message.interactive.button_reply.title
      || null;
  } else if (message.type === 'button') {
    rawText = message.button?.payload
      || message.button?.text
      || null;
  } else if (message.type === 'text') {
    rawText = message.text?.body?.trim();
  }

  logger.info({ from, type: message.type, rawText }, '[Webhook] Parsed inbound message');

  if (!rawText) {
    logger.info({ from, type: message.type }, '[Webhook] Ignored message without text/button payload');
    return;
  }

  // Check if it's a daily report request: "daily_report_<tenantId>_<morning|evening>"
  const reportMatch = rawText.match(/^daily_report_([^_]+)_(morning|evening)$/);
  if (reportMatch) {
    const tenantId = reportMatch[1];
    const reportType = reportMatch[2];
    const phone = from.startsWith('+') ? from : `+${from}`;
    await handleDailyReportRequest(phone, tenantId, reportType);
    return;
  }

  // Extract embedded appointmentId from button payload: "confirm_<uuid>" / "cancel_<uuid>"
  let directAppointmentId = null;
  const embedMatch = rawText.match(/^(confirm|cancel)_([0-9a-f-]{36})$/i);
  if (embedMatch) {
    rawText = embedMatch[1];
    directAppointmentId = embedMatch[2];
  }

  const intent = parseIntent(rawText);
  if (!intent) {
    logger.info({ from, rawText }, '[Webhook] Ignored message without valid intent');
    return;
  }

  // Meta sends phone without '+'; DB stores E.164 with '+'
  const phone = from.startsWith('+') ? from : `+${from}`;
  logger.info({ phone, intent, directAppointmentId }, '[Webhook] Processing intent');

  let appointment;
  if (directAppointmentId) {
    // Direct lookup by appointmentId embedded in button payload — 100% accurate
    const { data } = await supabase
      .from('appointments')
      .select('id, tenant_id, google_event_id, user_id, contact_id')
      .eq('id', directAppointmentId)
      .maybeSingle();
    appointment = data;
  } else {
    // Fallback: find by phone (for manual text replies)
    appointment = await findPendingAppointmentByPhone(phone);
  }

  if (!appointment) {
    logger.warn({ phone, directAppointmentId }, '[Webhook] Appointment not found');
    return;
  }
  const newStatus = intent === 'confirm' ? 'confirmed' : 'cancelled';

  // Update appointment status in DB
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointment.id);
  if (updateError) throw updateError;

  const { error: logError } = await supabase
    .from('message_logs')
    .insert({
      tenant_id: appointment.tenant_id,
      appointment_id: appointment.id,
      type: 'reply',
      direction: 'inbound',
      status: 'delivered',
      wa_message_id: message.id,
    });
  if (logError) throw logError;

  logger.info({ appointmentId: appointment.id, status: newStatus }, 'Appointment status updated via WhatsApp');

  // Notify admin on cancellation (best effort)
  if (newStatus === 'cancelled') {
    try {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('admin_whatsapp, timezone, time_format')
        .eq('id', appointment.tenant_id)
        .single();

      if (tenant?.admin_whatsapp) {
        const { data: fullAppt } = await supabase
          .from('appointments')
          .select('scheduled_at, contact:contacts(name, phone), service:services(name)')
          .eq('id', appointment.id)
          .single();

        const tz = tenant.timezone || 'America/Argentina/Buenos_Aires';
        const apptDate = new Date(fullAppt.scheduled_at);
        const dateStr = apptDate.toLocaleDateString('es-AR', { timeZone: tz, weekday: 'long', day: '2-digit', month: '2-digit' });
        const timeStr = formatTime(apptDate, { timeZone: tz, timeFormat: tenant.time_format });

        const rawPhone = fullAppt.contact.phone.replace(/^\+?549?/, '');

        // Always use the default cancellation template
        const templateName = 'admin_cancelacion';
        const adminNumbers = tenant.admin_whatsapp.split(',').map(n => n.trim()).filter(Boolean);

        for (const adminPhone of adminNumbers) {
          await sendTemplate(adminPhone, templateName, [
            fullAppt.contact.name,
            rawPhone,
            dateStr,
            timeStr,
            fullAppt.service.name,
          ]).catch(() => {});
        }

        logger.info({ appointmentId: appointment.id, adminNumbers }, 'Admin cancellation alert sent');
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to send admin cancellation alert');
    }
  }

  // Update Google Calendar event (best effort)
  try {
    const { data: apptData } = await supabase
      .from('appointments')
      .select('google_event_id, user_id')
      .eq('id', appointment.id)
      .single();

    if (!apptData?.google_event_id || !apptData?.user_id) return;

    const { data: userData } = await supabase
      .from('users')
      .select('google_access_token, google_refresh_token')
      .eq('id', apptData.user_id)
      .single();

    if (!userData?.google_access_token && !userData?.google_refresh_token) return;

    let accessToken = userData.google_access_token;

    // Always refresh if we have a refresh token — access tokens expire in 1h
    if (userData.google_refresh_token) {
      try {
        accessToken = await refreshAccessToken(userData.google_refresh_token);
        await supabase.from('users').update({ google_access_token: accessToken }).eq('id', apptData.user_id);
      } catch (refreshErr) {
        logger.warn({ refreshErr }, 'Failed to refresh Google token, using stored access token');
      }
    }

    const calEvent = await getCalendarEvent(accessToken, apptData.google_event_id);
    if (!calEvent) {
      logger.warn({ appointmentId: appointment.id, googleEventId: apptData.google_event_id }, 'Calendar event not found for status update');
      return;
    }

    const STATUS_SUFFIX = { confirmed: 'CONFIRMADO', cancelled: 'CANCELADO' };
    const baseTitle = (calEvent.summary || '').replace(/\s*-\s*(CONFIRMADO|CANCELADO)$/i, '').trim();
    const newTitle = `${baseTitle} - ${STATUS_SUFFIX[newStatus]}`;

    await updateEventTitleAndColor(accessToken, apptData.google_event_id, newTitle, newStatus, {
      sendUpdates: 'none',
    });

    logger.info({ appointmentId: appointment.id, googleEventId: apptData.google_event_id }, 'Calendar updated from webhook');
  } catch (err) {
    logger.warn({ err }, 'Failed to update Calendar from webhook');
  }
}

async function handleDailyReportRequest(phone, tenantId, reportType) {
  logger.info({ phone, tenantId, reportType }, '[Webhook] Processing daily report request');

  // Verify the phone matches the tenant's admin_whatsapp
  const { data: tenant } = await supabase
    .from('tenants')
    .select('admin_whatsapp, timezone')
    .eq('id', tenantId)
    .maybeSingle();

  if (!tenant || tenant.admin_whatsapp !== phone) {
    logger.warn({ phone, tenantId }, '[Webhook] Phone does not match tenant admin');
    return;
  }

  const tz = tenant.timezone || 'America/Argentina/Buenos_Aires';
  const now = new Date();

  // Determine which day to report
  let targetDate;
  if (reportType === 'morning') {
    // Morning report: show today's appointments
    targetDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  } else {
    // Evening report: show tomorrow's appointments
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    targetDate = new Date(localDate);
    targetDate.setDate(targetDate.getDate() + 1);
  }

  // Get start and end of target day in UTC
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Convert to UTC for query
  const startUTC = new Date(dayStart.toLocaleString('en-US', { timeZone: tz }));
  const endUTC = new Date(dayEnd.toLocaleString('en-US', { timeZone: tz }));

  // Fetch appointments for the day
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      scheduled_at,
      status,
      notes,
      contact:contacts(name, phone),
      service:services(name)
    `)
    .eq('tenant_id', tenantId)
    .gte('scheduled_at', startUTC.toISOString())
    .lte('scheduled_at', endUTC.toISOString())
    .order('scheduled_at', { ascending: true });

  if (error) {
    logger.error({ error: error.message }, '[Webhook] Failed to fetch appointments for daily report');
    return;
  }

  if (!appointments || appointments.length === 0) {
    const { sendTextMessage } = require('../services/whatsapp');
    const dayLabel = targetDate.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    await sendTextMessage(phone, `📊 Reporte diario - ${dayLabel}\n\nNo hay turnos programados para este día.`);
    return;
  }

  // Format the report
  const dayLabel = targetDate.toLocaleDateString('es-AR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });

  let report = `📊 *Reporte diario - ${dayLabel}*\n\n`;
  report += `Total de turnos: ${appointments.length}\n\n`;

  // Group by status
  const statusEmoji = {
    pending: '⏳',
    notified: '📧',
    confirmed: '✅',
    cancelled: '❌'
  };

  const statusLabels = {
    pending: 'Pendiente',
    notified: 'Notificado',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado'
  };

  appointments.forEach((appt, idx) => {
    const timeLabel = new Date(appt.scheduled_at).toLocaleTimeString('es-AR', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const emoji = statusEmoji[appt.status] || '•';
    const statusLabel = statusLabels[appt.status] || appt.status;

    report += `${idx + 1}. ${emoji} ${timeLabel} - ${appt.contact.name}\n`;
    report += `   📞 ${appt.contact.phone}\n`;
    report += `   💼 ${appt.service.name}\n`;
    report += `   📌 Estado: ${statusLabel}\n`;
    if (appt.notes) {
      report += `   📝 ${appt.notes}\n`;
    }
    report += `\n`;
  });

  // Add summary by status
  const statusCount = {};
  appointments.forEach(appt => {
    statusCount[appt.status] = (statusCount[appt.status] || 0) + 1;
  });

  report += `\n📈 *Resumen por estado:*\n`;
  Object.entries(statusCount).forEach(([status, count]) => {
    const emoji = statusEmoji[status] || '•';
    const label = statusLabels[status] || status;
    report += `${emoji} ${label}: ${count}\n`;
  });

  const { sendTextMessage } = require('../services/whatsapp');
  await sendTextMessage(phone, report);

  logger.info({ phone, tenantId, reportType, count: appointments.length }, '[Webhook] Daily report sent');
}

module.exports = { verify, receive };
