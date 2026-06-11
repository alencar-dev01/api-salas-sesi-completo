// routes/salas.js
const router = require('express').Router();
const { listar, obter, criar, atualizar, excluir, disponibilidade } = require('../controllers/salasController');
const { autenticar, apenasAdmin } = require('../middleware/auth');

router.use(autenticar);
router.get('/disponibilidade', disponibilidade);
router.get('/', listar);
router.get('/:id', obter);
router.post('/', apenasAdmin, criar);
router.put('/:id', apenasAdmin, atualizar);
router.delete('/:id', apenasAdmin, excluir);

module.exports = router;