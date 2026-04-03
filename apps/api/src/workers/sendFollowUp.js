const { supabase } = require('@recordai/db');
const { sendTemplate } = require('../services/whatsapp');
const logger = require('../config/logger');
const { formatTime } = require('../utils/datetime');

async function sendFollowUp({ appointmentId }) {
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, contact:contacts(*), service:services(*), tenant:tenants(timezone, time_format, whatsapp_provider, whatsapp_phone_number_id, whatsapp_access_token, wasender_api_key)')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!appointment) {
    logger.warn({ appointmentId }, 'Appointment not found for follow-up');
    return;
  }

  // Send follow-up only for pending appointments
  if (appointment.status !== 'pending') {
    logger.info({ appointmentId, status: appointment.status }, 'Skipping follow-up, status is not pending');
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

  const tenantConfig = {
    provider: appointment.tenant?.whatsapp_provider || 'meta',
    whatsappPhoneNumberId: appointment.tenant?.whatsapp_phone_number_id,
    whatsappAccessToken: appointment.tenant?.whatsapp_access_token,
    wasender_api_key: appointment.tenant?.wasender_api_key,
  };

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
  }, tenantConfig);

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'pending' })
    .eq('id', appointmentId)
    .eq('tenant_id', appointment.tenant_id);

  if (updateError) {
    logger.error({ appointmentId, updateError }, 'Failed to mark appointment as pending after follow-up');
    throw updateError;
  }

  logger.info({ appointmentId }, 'Follow-up sent');
}

module.exports = { sendFollowUp };
