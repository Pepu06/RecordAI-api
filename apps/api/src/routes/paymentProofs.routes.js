const express = require('express');
const authenticate = require('../middleware/auth');
const { createPaymentProof, getAdminPaymentProofs } = require('../controllers/paymentProofs.controller');

const router = express.Router();

// Tenant endpoint: upload payment proof
router.post('/payment-proofs', authenticate, createPaymentProof);

// Admin endpoint: list all proofs
router.get('/admin/payment-proofs', getAdminPaymentProofs);

module.exports = router;
