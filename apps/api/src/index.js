require('./config/env'); // Validate env vars at startup
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
require('./workers/queue'); // Start workers
const { startDailyReminderCron } = require('./workers/dailyCalendarReminder');
const { startDailyReportCron } = require('./workers/dailyReportCron');

app.listen(env.PORT, () => {
  logger.info(`RecordAI API running on port ${env.PORT}`);
  startDailyReminderCron();
  startDailyReportCron();
});
