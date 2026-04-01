const { Router } = require('express');
const { register, login, googleAuth } = require('../controllers/auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

module.exports = router;
