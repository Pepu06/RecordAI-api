const { supabase } = require('@recordai/db');
const { sendInteractiveButtons } = require('../services/whatsapp');
const logger = require('../config/logger');

async function sendFollowUp({ appointmentId }) {
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, contact:contacts(*), service:services(*)')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!appointment) {
    logger.warn({ appointmentId }, 'Appointment not found for follow-up');
    return;
  }

  if (appointment.status !== 'pending') {
    logger.info({ appointmentId, status: appointment.status }, 'Skipping follow-up, already responded');
    return;
  }

  const date = new Date(appointment.scheduled_at).toLocaleString('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const body =
    `Hola ${appointment.contact.name}! 👋\n\n` +
    `Aún no confirmaste tu cita del ${date}.\n` +
    `¿Vas a poder asistir?`;

  await sendInteractiveButtons(appointment.contact.phone, body, [
    { id: 'confirm', title: '✅ Confirmar' },
    { id: 'cancel',  title: '❌ Cancelar'  },
  ]);

  logger.info({ appointmentId }, 'Follow-up sent');
}

module.exports = { sendFollowUp };
