const { Router } = require('express');
const ctrl = require('../controllers/services.controller');
const authenticate = require('../middleware/auth');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
