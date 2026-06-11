// routes/reservas.js
const router = require('express').Router();
const { listar, calendario, obter, criar, atualizar, excluir, dashboard } = require('../controllers/reservasController');
const { autenticar, apenasAdmin } = require('../middleware/auth');

router.use(autenticar);
router.get('/dashboard', dashboard);
router.get('/calendario', calendario);
router.get('/', listar);
router.get('/:id', obter);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);

module.exports = router;