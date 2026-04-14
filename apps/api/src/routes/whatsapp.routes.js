const { Router } = require('express');
const auth = require('../middleware/auth');
const { connectStatus, connectManual, connectEmbeddedSignup, disconnect } = require('../controllers/whatsapp.controller');

const router = Router();

router.use(auth);

router.get('/status',                  connectStatus);
router.post('/connect/manual',         connectManual);
router.post('/connect/embedded-signup', connectEmbeddedSignup);
router.delete('/disconnect',           disconnect);

module.exports = router;
