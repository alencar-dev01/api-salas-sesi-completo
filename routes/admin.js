// routes/admin.js
const router = require('express').Router();
const c = require('../controllers/adminController');
const { autenticar, apenasAdmin } = require('../middleware/auth');

router.use(autenticar);

// Comunicados (todos podem ver)
router.get('/comunicados', c.comunicadoListar);
router.post('/comunicados', apenasAdmin, c.comunicadoCriar);
router.put('/comunicados/:id', apenasAdmin, c.comunicadoAtualizar);
router.delete('/comunicados/:id', apenasAdmin, c.comunicadoExcluir);

// Painel de ocupação (todos)
router.get('/painel-ocupacao', c.painelOcupacao);

// Admin only
router.get('/auditoria', apenasAdmin, c.logListar);
router.get('/bloqueios', apenasAdmin, c.bloqueioListar);
router.post('/bloqueios', apenasAdmin, c.bloqueioCriar);
router.delete('/bloqueios/:id', apenasAdmin, c.bloqueioExcluir);
// router.get('/manutencao-preventiva', apenasAdmin, c.manListar);
// router.post('/manutencao-preventiva', apenasAdmin, c.manCriar);
// router.put('/manutencao-preventiva/:id', apenasAdmin, c.manAtualizar);
router.get('/relatorios', apenasAdmin, c.relatorios);
router.get('/dashboard-executivo', apenasAdmin, c.dashboardExecutivo);

module.exports = router;