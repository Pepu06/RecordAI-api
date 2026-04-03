const { supabase } = require('@recordai/db');
const { sendTemplate } = require('../services/whatsapp');
const logger = require('../config/logger');
const { formatTime } = require('../utils/datetime');

async function sendFollowUp({ appointmentId }) {
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, contact:contacts(*), service:services(*), tenant:tenants(timezone, time_format)')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!appointment) {
    logger.warn({ appointmentId }, 'Appointment not found for follow-up');
    return;
  }

  // Skip if already confirmed or cancelled (allow notified and pending)
  if (!['pending', 'sin_enviar', 'notified'].includes(appointment.status)) {
    logger.info({ appointmentId, status: appointment.status }, 'Skipping follow-up, already responded');
    return;
  }

  const tz = appointment.tenant?.timezone || 'America/Argentina/Buenos_Aires';
  const dateObj = new Date(appointment.scheduled_at);
  const date = dateObj.toLocaleDateString('es-AR', {
    timeZone: tz,
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
  const time = formatTime(dateObj, { timeZone: tz, timeFormat: appointment.tenant?.time_format });

  const encabezado = 'Seguimiento de turno';
  const mensajeEditable = `Aún no confirmaste tu cita del ${date} ${time}.`;

  await sendTemplate(appointment.contact.phone, 'recordatorio_turno', {
    header: [{ name: 'encabezado', value: encabezado }],
    body: [
      { name: 'nombre_cliente', value: appointment.contact.name || 'Cliente' },
      { name: 'mensaje_editable', value: mensajeEditable },
      { name: 'fecha', value: date },
      { name: 'hora', value: time },
    ],
    buttons: [
      { index: 0, payload: `confirm_${appointmentId}` },
      { index: 1, payload: `cancel_${appointmentId}` },
    ],
  });

  logger.info({ appointmentId }, 'Follow-up sent');
}

module.exports = { sendFollowUp };
