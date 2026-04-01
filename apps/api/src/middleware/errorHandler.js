const { AppError } = require('../errors');
const logger = require('../config/logger');

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Surface WhatsApp / Meta API errors directly
  if (err.isAxiosError && err.response?.data?.error) {
    const metaErr = err.response.data.error;
    const message = metaErr.error_data?.details || metaErr.message || 'Error de WhatsApp API';
    logger.error({ err }, 'WhatsApp API error');
    return res.status(502).json({ success: false, error: message });
  }

  logger.error({ err }, 'Unhandled error');

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}

module.exports = errorHandler;
