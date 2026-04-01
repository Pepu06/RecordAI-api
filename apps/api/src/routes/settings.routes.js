const { Router } = require('express');
const auth = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settings.controller');

const router = Router();
router.use(auth);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
