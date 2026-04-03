const express = require('express');
const { confirmationPage, processAction, confirmByAppointmentId, processAppointmentAction } = require('../controllers/confirmation.controller');

const router = express.Router();

// Public routes — no auth required (accessed from WhatsApp links)
router.get('/turno', confirmationPage);
router.get('/accion', processAction);

// Wasender confirmation page (by appointmentId)
router.get('/c/:appointmentId', confirmByAppointmentId);
router.get('/c/:appointmentId/action', processAppointmentAction);

module.exports = router;
