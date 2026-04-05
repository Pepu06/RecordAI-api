const express = require('express');
const authenticate = require('../middleware/auth');
const {
	createPaymentProof,
	getAdminPaymentProofs,
	approvePaymentProof,
	getAdminPaymentProofImage,
} = require('../controllers/paymentProofs.controller');

const router = express.Router();

// Tenant endpoint: upload payment proof
router.post('/payment-proofs', authenticate, createPaymentProof);

// Admin endpoint: list all proofs
router.get('/admin/payment-proofs', getAdminPaymentProofs);
router.post('/admin/payment-proofs/:proofId/approve', approvePaymentProof);
router.get('/admin/payment-proofs/:proofId/image', getAdminPaymentProofImage);

module.exports = router;
