const { Resend } = require('resend');
const env = require('../config/env');
const logger = require('../config/logger');

let resend = null;

function getClient() {
  if (!resend) {
    if (!env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Send a plain-text email.
 * @param {object} opts
 * @param {string} opts.to - Recipient email
 * @param {string} opts.subject - Subject line
 * @param {string} opts.text - Plain text body
 * @param {string} [opts.html] - Optional HTML body
 */
async function sendEmail({ to, subject, text, html }) {
  const client = getClient();

  const { data, error } = await client.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });

  if (error) {
    logger.error({ to, subject, error: error.message }, '[Email] Send failed');
    throw new Error(error.message);
  }

  logger.info({ to, subject, id: data?.id }, '[Email] Sent');
  return data;
}

module.exports = { sendEmail };
