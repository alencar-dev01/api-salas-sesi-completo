// routes/users.js
const router = require('express').Router();
const { listar, obter, criar, atualizar, excluir } = require('../controllers/usersController');
const { autenticar, apenasAdmin } = require('../middleware/auth');

router.use(autenticar);
router.get('/', apenasAdmin, listar);
router.get('/:id', apenasAdmin, obter);
router.post('/', apenasAdmin, criar);
router.put('/:id', apenasAdmin, atualizar);
router.delete('/:id', apenasAdmin, excluir);

module.exports = router;