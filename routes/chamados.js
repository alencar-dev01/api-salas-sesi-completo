// // routes/chamados.js
// const router = require('express').Router();
// const c = require('../controllers/chamadosController');
// const { autenticar, apenasAdmin } = require('../middleware/auth');

// router.use(autenticar);
// router.get('/', c.listar);
// router.get('/:id', c.obter);
// router.post('/', c.criar);
// router.put('/:id', c.atualizar);
// router.post('/:id/assumir', c.assumir);
// router.post('/:id/comentar', c.comentar);
// router.delete('/:id', apenasAdmin, c.excluir);

// module.exports = router;