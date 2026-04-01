const { supabase, convertKeys } = require('@recordai/db');
const { NotFoundError } = require('../errors');
const { appointmentsQueue } = require('../workers/queue');
const { JobName } = require('@recordai/shared');
const { updateEventColor, refreshAccessToken, getCalendarEvents } = require('../services/google');

const APPOINTMENT_SELECT = '*, contact:contacts(*), service:services(*), user:users(*)';

async function list(req, res, next) {
  try {
    const { date, status } = req.query;
    let query = supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .eq('tenant_id', req.tenantId)
      .order('scheduled_at', { ascending: true });

    if (status) query = query.eq('status', status);
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query = query.gte('scheduled_at', start.toISOString()).lt('scheduled_at', end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data: convertKeys(data) });
  } catch (err) { return next(err); }
}

function calcReminderDelay(scheduledAt, timezone, reminderType, reminderTime) {
  const [hh, mm] = (reminderTime || '10:00').split(':').map(Number);
  const appt = new Date(scheduledAt);

  // Get the appointment's local date (YYYY-MM-DD) in the tenant timezone
  const localDateStr = appt.toLocaleDateString('en-CA', { timeZone: timezone || 'UTC' });
  let [year, month, day] = localDateStr.split('-').map(Number);
  if (reminderType === 'day_before') day -= 1;

  // Build a Date treating local time as UTC (to correct below)
  const reminderAsUTC = new Date(Date.UTC(year, month - 1, day, hh, mm, 0));

  // Find the actual UTC offset for the tenant timezone at that time
  const localMs = new Date(reminderAsUTC.toLocaleString('en-US', { timeZone: timezone || 'UTC' })).getTime();
  const utcMs   = new Date(reminderAsUTC.toLocaleString('en-US', { timeZone: 'UTC' })).getTime();
  const offsetMs = utcMs - localMs;

  const reminderUTC = new Date(reminderAsUTC.getTime() + offsetMs);
  return reminderUTC.getTime() - Date.now();
}

async function create(req, res, next) {
  try {
    const { contactId, serviceId, scheduledAt, notes } = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        tenant_id:    req.tenantId,
        contact_id:   contactId,
        service_id:   serviceId,
        user_id:      req.userId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        notes,
      })
      .select(APPOINTMENT_SELECT)
      .single();
    if (error) throw error;

    // Fire-and-forget — no bloquea si Redis está caído
    const queueJob = (name, opts = {}) =>
      appointmentsQueue.add(name, { appointmentId: data.id }, opts).catch(() => {});

    queueJob(JobName.SEND_CONFIRMATION);

    // Fetch tenant settings to calculate reminder timing
    const { data: tenant } = await supabase
      .from('tenants')
      .select('timezone, reminder_type, reminder_time')
      .eq('id', req.tenantId)
      .single();

    const reminderDelay = calcReminderDelay(
      scheduledAt,
      tenant?.timezone || 'UTC',
      tenant?.reminder_type || 'day_before',
      tenant?.reminder_time || '10:00',
    );
    if (reminderDelay > 0) queueJob(JobName.SEND_REMINDER, { delay: reminderDelay });

    queueJob(JobName.SEND_FOLLOW_UP, { delay: 2 * 60 * 60 * 1000 });

    return res.status(201).json({ success: true, data: convertKeys(data) });
  } catch (err) { return next(err); }
}

async function getOne(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`${APPOINTMENT_SELECT}, message_logs:message_logs(*)`)
      .eq('id', req.params.id)
      .eq('tenant_id', req.tenantId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundError('Appointment not found');
    return res.json({ success: true, data: convertKeys(data) });
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    const { data: existing } = await supabase
      .from('appointments').select('id').eq('id', req.params.id).eq('tenant_id', req.tenantId).maybeSingle();
    if (!existing) throw new NotFoundError('Appointment not found');

    const { scheduledAt, status, notes, contactId, serviceId } = req.body;
    const updates = {
      ...(scheduledAt  && { scheduled_at: new Date(scheduledAt).toISOString() }),
      ...(status       && { status }),
      ...(notes !== undefined && { notes }),
      ...(contactId    && { contact_id: contactId }),
      ...(serviceId    && { service_id: serviceId }),
    };

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', req.params.id)
      .select(`${APPOINTMENT_SELECT}, google_event_id, user:users(google_access_token, google_refresh_token)`)
      .single();
    if (error) throw error;

    // Sync status color back to Google Calendar if linked
    if (data.google_event_id && updates.status) {
      const u = data.user;
      let token = u?.google_access_token;
      if (token) {
        const test = await getCalendarEvents(token, { days: 1 });
        if (test === null && u.google_refresh_token) {
          token = await refreshAccessToken(u.google_refresh_token);
          await supabase.from('users').update({ google_access_token: token }).eq('id', req.userId);
        }
        updateEventColor(token, data.google_event_id, updates.status).catch(() => {});
      }
    }

    return res.json({ success: true, data: convertKeys(data) });
  } catch (err) { return next(err); }
}

async function remove(req, res, next) {
  try {
    const { data: existing } = await supabase
      .from('appointments').select('id').eq('id', req.params.id).eq('tenant_id', req.tenantId).maybeSingle();
    if (!existing) throw new NotFoundError('Appointment not found');

    const { error } = await supabase.from('appointments').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ success: true, data: null });
  } catch (err) { return next(err); }
}

module.exports = { list, create, getOne, update, remove };
