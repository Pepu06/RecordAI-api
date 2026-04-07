const { Router } = require('express');
const auth = require('../middleware/auth');
const { getSettings, updateSettings, deleteAccount, getOnboarding, updateOnboarding } = require('../controllers/settings.controller');

const router = Router();
router.use(auth);

router.get('/', getSettings);
router.put('/', updateSettings);
router.delete('/account', deleteAccount);
router.get('/onboarding', getOnboarding);
router.put('/onboarding', updateOnboarding);

module.exports = router;
