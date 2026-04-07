const { Router } = require('express');
const auth = require('../middleware/auth');
const { metrics } = require('../controllers/dashboard.controller');

const router = Router();
router.use(auth);

router.get('/metrics', metrics);

module.exports = router;
