const { supabase } = require('@recordai/db');
const { sendTemplate } = require('../services/whatsapp');
const logger = require('../config/logger');

async function sendConfirmation({ appointmentId }) {
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, contact:contacts(*), service:services(*), tenant:tenants(*)')
    .eq('id', appointmentId)
    .maybeSingle();

  if (!appointment) {
    logger.warn({ appointmentId }, 'Appointment not found for confirmation');
    return;
  }

  if (appointment.status !== 'pending') {
    logger.info({ appointmentId, status: appointment.status }, 'Skipping confirmation, not pending');
    return;
  }

  const tz = appointment.tenant?.timezone || 'America/Argentina/Buenos_Aires';
  const dateObj = new Date(appointment.scheduled_at);
  
  // Formato día: "viernes, 3 de abril de 2026"
  const diaLabel = dateObj.toLocaleDateString('es-AR', {
    timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  
  // Formato hora: "10:00"
  const horaLabel = dateObj.toLocaleTimeString('es-AR', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  });

  // Determinar texto del recordatorio basado en reminder_type
  const reminderType = appointment.tenant?.reminder_type || 'day_before';
  const recordatorioTexto = reminderType === 'same_day' ? 'el mismo día' : 'el día anterior';

  // Enviar plantilla confirmacion_turno (sin botones, parámetros posicionales)
  await sendTemplate(appointment.contact.phone, 'confirmacion_turno', {
    body: [
      appointment.contact.name,        // {{1}} nombre del paciente
      recordatorioTexto,               // {{2}} cuando se manda recordatorio
      diaLabel,                        // {{3}} día de la cita
      horaLabel,                       // {{4}} hora de la cita
      appointment.service.name,        // {{5}} servicio
    ],
  });

  await supabase.from('appointments').update({ confirmation_sent_at: new Date().toISOString() }).eq('id', appointmentId);

  await supabase.from('message_logs').insert({
    tenant_id:      appointment.tenant_id,
    appointment_id: appointmentId,
    type:           'confirmation',
    direction:      'outbound',
    status:         'sent',
  });

  logger.info({ appointmentId }, 'Confirmation sent via confirmacion_turno template');
}

module.exports = { sendConfirmation };
