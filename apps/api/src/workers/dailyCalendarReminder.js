const cron = require('node-cron');
const { supabase } = require('@recordai/db');
const { getTodayCalendarEvents, refreshAccessToken } = require('../services/google');
const { sendTextMessage } = require('../services/whatsapp');
const logger = require('../config/logger');
const env = require('../config/env');

const PHONE_REGEX = /\+\d[\d\s()-]{7,}/;

async function getValidToken(user) {
  let { google_access_token: accessToken, google_refresh_token: refreshToken } = user;

  const events = await getTodayCalendarEvents(accessToken);
  if (events === null && refreshToken) {
    try {
      accessToken = await refreshAccessToken(refreshToken);
      await supabase.from('users').update({ google_access_token: accessToken }).eq('id', user.id);
    } catch {
      return null;
    }
  } else if (events === null) {
    return null;
  }

  return accessToken;
}

async function runDailyReminders() {
  logger.info('Running daily calendar reminders...');

  const { data: users, error } = await supabase
    .from('users')
    .select('id, google_access_token, google_refresh_token')
    .not('google_access_token', 'is', null);

  if (error) {
    logger.error({ err: error.message }, 'Failed to fetch users for daily reminders');
    return;
  }

  for (const user of users || []) {
    const accessToken = await getValidToken(user);
    if (!accessToken) {
      logger.info({ userId: user.id }, 'Skipping user — invalid Google token');
      continue;
    }

    const events = await getTodayCalendarEvents(accessToken);
    if (!events?.length) continue;

    for (const event of events) {
      const title = event.summary || '';
      const match = title.match(PHONE_REGEX);
      if (!match) continue;

      const phone = match[0].replace(/[\s()-]/g, '');
      const token = Buffer.from(`${user.id}:${event.id}`).toString('base64url');
      const confirmUrl = `${env.BASE_URL}/turno?token=${token}`;

      const start = event.start?.dateTime || `${event.start?.date}T12:00:00`;
      const dateLabel = new Date(start).toLocaleString('es-AR', {
        timeZone:  'America/Argentina/Buenos_Aires',
        dateStyle: 'full',
        timeStyle: 'short',
      });

      const message =
        `Hola! 👋 Te recordamos tu cita de hoy:\n\n` +
        `📅 *${title}*\n` +
        `🕐 ${dateLabel}\n\n` +
        `Por favor confirmá o cancelá tu turno:\n${confirmUrl}`;

      try {
        await sendTextMessage(phone, message);
        logger.info({ phone, eventId: event.id }, 'Daily reminder sent');
      } catch (err) {
        logger.warn({ phone, eventId: event.id, err: err.message }, 'Failed to send reminder');
      }
    }
  }

  logger.info('Daily calendar reminders done.');
}

function startDailyReminderCron() {
  // Run at 8:00am Argentina time (UTC-3 = 11:00 UTC)
  cron.schedule('0 11 * * *', runDailyReminders, { timezone: 'UTC' });
  logger.info('Daily calendar reminder cron scheduled (8am AR / 11am UTC)');
}

module.exports = { startDailyReminderCron, runDailyReminders };
