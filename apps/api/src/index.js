require('./config/env'); // Validate env vars at startup
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
require('./workers/queue'); // Start workers
const { startDailyReminderCron } = require('./workers/dailyCalendarReminder');
const { startDailyReportCron } = require('./workers/dailyReportCron');
const { startMonthlyBillingCron } = require('./workers/monthlyBillingCron');
const { startSubscriptionRenewalCron } = require('./workers/subscriptionRenewalCron');

if (!env.REDIS_URL) {
  logger.warn('⚠️  REDIS_URL is not set — BullMQ reminder queue is DISABLED. Appointment reminders will NOT be sent.');
}

app.listen(env.PORT, () => {
  logger.info(`AutoAgenda API running on port ${env.PORT}`);
  startDailyReminderCron();
  startDailyReportCron();
  startMonthlyBillingCron();
  startSubscriptionRenewalCron();
});
