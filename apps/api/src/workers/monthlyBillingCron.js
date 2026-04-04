const cron = require('node-cron');
const logger = require('../config/logger');
const { resetAllMonthlyCounters } = require('./usageTracking');

/**
 * Runs on the 1st of each month at midnight UTC.
 * Resets messagesSentThisMonth counter for all tenants.
 */
async function runMonthlyReset() {
  logger.info('Running monthly billing reset...');
  try {
    await resetAllMonthlyCounters();
    logger.info('Monthly billing reset completed.');
  } catch (err) {
    logger.error({ err: err.message }, 'Monthly billing reset failed');
  }
}

function startMonthlyBillingCron() {
  // Día 1 de cada mes a medianoche UTC
  cron.schedule('0 0 1 * *', runMonthlyReset, { timezone: 'UTC' });
  logger.info('Monthly billing cron scheduled (1st of month at 00:00 UTC)');
}

module.exports = { startMonthlyBillingCron, runMonthlyReset };
