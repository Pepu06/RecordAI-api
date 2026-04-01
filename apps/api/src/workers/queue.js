const env = require('../config/env');
const logger = require('../config/logger');

// Si no hay REDIS_URL configurada, exportar una queue mock que no hace nada
if (!env.REDIS_URL) {
  logger.warn('REDIS_URL not set — job queue disabled');
  module.exports = { appointmentsQueue: { add: async () => {} } };
  return;
}

const { Queue, Worker } = require('bullmq');
const { JobName } = require('@recordai/shared');

const connection = { url: env.REDIS_URL, maxRetriesPerRequest: null, lazyConnect: true };

const appointmentsQueue = new Queue('appointments', { connection });

const worker = new Worker(
  'appointments',
  async (job) => {
    switch (job.name) {
      case JobName.SEND_CONFIRMATION: {
        const { sendConfirmation } = require('./sendConfirmation');
        await sendConfirmation(job.data);
        break;
      }
      case JobName.SEND_REMINDER: {
        const { sendReminder } = require('./sendReminder');
        await sendReminder(job.data);
        break;
      }
      case JobName.SEND_FOLLOW_UP: {
        const { sendFollowUp } = require('./sendFollowUp');
        await sendFollowUp(job.data);
        break;
      }
      default:
        logger.warn({ jobName: job.name }, 'Unknown job type');
    }
  },
  { connection }
);

worker.on('completed', (job) => logger.info({ jobId: job.id, jobName: job.name }, 'Job completed'));
worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Job failed'));
worker.on('error', () => {});

appointmentsQueue.on('error', () => {});

module.exports = { appointmentsQueue };
