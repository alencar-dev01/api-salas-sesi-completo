// routes/impressoras.js
const router = require('express').Router();
const c = require('../controllers/impressorasController');
const { autenticar, apenasAdmin } = require('../middleware/auth');

router.use(autenticar);
router.get('/dashboard', c.dashboard);
router.get('/', c.listar);
router.get('/:id', c.obter);
router.post('/', apenasAdmin, c.criar);
router.put('/:id', apenasAdmin, c.atualizar);
router.delete('/:id', apenasAdmin, c.excluir);
router.post('/:id/manutencao', c.adicionarManutencao);

module.exports = router;