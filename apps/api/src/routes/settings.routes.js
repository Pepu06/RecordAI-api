const { Router } = require('express');
const auth = require('../middleware/auth');
const { getSettings, updateSettings, deleteAccount } = require('../controllers/settings.controller');

const router = Router();
router.use(auth);

router.get('/', getSettings);
router.put('/', updateSettings);
router.delete('/account', deleteAccount);

module.exports = router;
