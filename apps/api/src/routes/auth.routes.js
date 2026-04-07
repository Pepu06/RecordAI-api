const { Router } = require('express');
const auth = require('../middleware/auth');
const {
  register, login, googleAuth,
  forgotPassword, resetPassword,
  verifyEmail, resendVerification,
} = require('../controllers/auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', auth, resendVerification);

module.exports = router;
