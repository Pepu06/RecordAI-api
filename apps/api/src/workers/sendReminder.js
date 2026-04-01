const { supabase } = require('@recordai/db');
const { sendTextMessage } = require('../services/whatsapp');
const logger = require('../config/logger');

async function sendReminder({ appointmentId }) {
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, contact:contacts(*), service:services(*)')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!appointment) {
    logger.warn({ appointmentId }, 'Appointment not found for reminder');
    return;
  }

  if (appointment.status === 'cancelled') {
    logger.info({ appointmentId }, 'Skipping reminder, appointment cancelled');
    return;
  }

  const date = new Date(appointment.scheduled_at).toLocaleString('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const text =
    `Recordatorio 🔔\n\n` +
    `Hola ${appointment.contact.name}! Tu cita es mañana:\n` +
    `📅 ${date}\n` +
    `💼 ${appointment.service.name}\n\n` +
    `Te esperamos!`;

  await sendTextMessage(appointment.contact.phone, text);

  logger.info({ appointmentId }, 'Reminder sent');
}

module.exports = { sendReminder };
