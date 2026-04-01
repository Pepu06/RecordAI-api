const express = require('express');
const { confirmationPage, processAction } = require('../controllers/confirmation.controller');

const router = express.Router();

// Public routes — no auth required (accessed from WhatsApp links)
router.get('/turno', confirmationPage);
router.get('/accion', processAction);

module.exports = router;
