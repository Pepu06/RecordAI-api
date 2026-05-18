const cron = require('node-cron');
const { supabase } = require('@autoagenda/db');
const { watchCalendar, stopCalendarWatch } = require('../services/google');
const { refreshAccessToken } = require('../services/google');
const { getOwnerCalendarId } = require('../controllers/calendar.controller');
const env = require('../config/env');
const logger = require('../config/logger');
const crypto = require('crypto');

async function renewExpiringWatches() {
  // Find watches expiring within 24 hours
  const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data: users, error } = await supabase
    .from('users')
    .select('id, tenant_id, google_access_token, google_refresh_token, google_channel_id, google_resource_id')
    .not('google_channel_id', 'is', null)
    .lt('google_watch_expiry', cutoff);

  if (error) {
    logger.error({ error }, '[WatchRenewal] Failed to query expiring watches');
    return;
  }

  logger.info({ count: users?.length || 0 }, '[WatchRenewal] Renewing expiring calendar watches');

  for (const user of users || []) {
    try {
      let accessToken = user.google_access_token;

      // Refresh token if needed
      if (!accessToken && user.google_refresh_token) {
        accessToken = await refreshAccessToken(user.google_refresh_token);
        await supabase.from('users').update({ google_access_token: accessToken }).eq('id', user.id);
      }
      if (!accessToken) continue;

      // Stop old watch (best effort)
      if (user.google_channel_id && user.google_resource_id) {
        await stopCalendarWatch(accessToken, user.google_channel_id, user.google_resource_id).catch(() => {});
      }

      // Register new watch
      const calendarId = await getOwnerCalendarId(user.tenant_id);
      const channelId = crypto.randomUUID();
      const watch = await watchCalendar(accessToken, calendarId, channelId, `${env.BASE_URL}/webhook/google-calendar`);

      if (watch?.id) {
        await supabase.from('users').update({
          google_channel_id: watch.id,
          google_resource_id: watch.resourceId,
          google_watch_expiry: new Date(Number(watch.expiration)).toISOString(),
        }).eq('id', user.id);
        logger.info({ userId: user.id, channelId: watch.id }, '[WatchRenewal] Watch renewed');
      } else {
        await supabase.from('users').update({
          google_channel_id: null,
          google_resource_id: null,
          google_watch_expiry: null,
        }).eq('id', user.id);
        logger.warn({ userId: user.id }, '[WatchRenewal] Watch renewal failed, cleared channel');
      }
    } catch (err) {
      logger.error({ err, userId: user.id }, '[WatchRenewal] Error renewing watch for user');
    }
  }
}

function startCalendarWatchRenewalCron() {
  // Run daily at 06:00 UTC
  cron.schedule('0 6 * * *', () => {
    renewExpiringWatches().catch(err =>
      logger.error({ err }, '[WatchRenewal] Cron job failed')
    );
  }, { timezone: 'UTC' });

  logger.info('[WatchRenewal] Calendar watch renewal cron started');
}

module.exports = { startCalendarWatchRenewalCron };
