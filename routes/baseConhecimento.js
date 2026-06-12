// routes/baseConhecimento.js
const router = require('express').Router();
const c = require('../controllers/baseConhecimentoController');
const { autenticar, apenasAdmin } = require('../middleware/auth');

router.use(autenticar);
router.get('/', c.listar);
router.get('/:id', c.obter);
router.post('/', apenasAdmin, c.criar);
router.put('/:id', apenasAdmin, c.atualizar);
router.delete('/:id', apenasAdmin, c.excluir);

module.exports = router;