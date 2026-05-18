const { Router } = require('express');
const { verify, receive, handleMercadoPagoWebhook, handleGoogleCalendarWebhook } = require('../controllers/webhook.controller');

const router = Router();

// WhatsApp webhook
router.get('/', verify);
router.post('/', receive);

// Mercado Pago webhook
router.post('/mercadopago', handleMercadoPagoWebhook);

// Google Calendar push notifications
router.post('/google-calendar', handleGoogleCalendarWebhook);

module.exports = router;
