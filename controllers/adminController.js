// controllers/adminController.js - Auditoria, Bloqueios, Comunicados, Manutenção, Relatórios
const { LogAuditoria, BloqueioSala, Comunicado, ManutencaoPreventiva,
        Reserva, Chamado, User, Sala, Impressora } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// ── LOG AUDITORIA ──────────────────────────────────────────────────────────
const logListar = async (req, res) => {
  try {
    const { page=1, limit=20, modulo, acao, userId, dataInicio, dataFim } = req.query;
    const where = {};
    if (modulo) where.modulo = modulo;
    if (acao) where.acao = { [Op.like]: `%${acao}%` };
    if (userId) where.userId = userId;
    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt[Op.gte] = new Date(dataInicio);
      if (dataFim) where.createdAt[Op.lte] = new Date(dataFim + 'T23:59:59');
    }
    const offset = (parseInt(page)-1)*parseInt(limit);
    const { count, rows } = await LogAuditoria.findAndCountAll({
      where, order: [['createdAt','DESC']], limit: parseInt(limit), offset
    });
    res.json({ total: count, paginas: Math.ceil(count/limit), pagina: parseInt(page), dados: rows });
  } catch(e) { res.status(500).json({ erro: 'Erro ao listar logs.' }); }
};

// ── BLOQUEIOS ──────────────────────────────────────────────────────────────
const bloqueioListar = async (req, res) => {
  try {
    const { salaId, ativo } = req.query;
    const where = {};
    if (salaId) where.salaId = salaId;
    if (ativo !== undefined) where.ativo = ativo === 'true';
    const rows = await BloqueioSala.findAll({
      where, include: [
        { model: Sala, as: 'sala', attributes: ['id','nome'] },
        { model: User, as: 'criadoPor', attributes: ['id','nome'] }
      ], order: [['dataInicio','ASC']]
    });
    res.json(rows);
  } catch(e) { res.status(500).json({ erro: 'Erro ao listar bloqueios.' }); }
};

const bloqueioCriar = async (req, res) => {
  try {
    const { salaId, titulo, motivo, dataInicio, dataFim, horaInicio, horaFim, diaInteiro, observacoes } = req.body;
    if (!salaId || !titulo || !dataInicio || !dataFim) return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
    const bloqueio = await BloqueioSala.create({
      salaId, titulo, motivo, dataInicio, dataFim, horaInicio, horaFim,
      diaInteiro: diaInteiro !== false, observacoes, criadoPorId: req.user.id
    });
    res.status(201).json(bloqueio);
  } catch(e) { res.status(500).json({ erro: 'Erro ao criar bloqueio.' }); }
};

const bloqueioExcluir = async (req, res) => {
  try {
    const b = await BloqueioSala.findByPk(req.params.id);
    if (!b) return res.status(404).json({ erro: 'Bloqueio não encontrado.' });
    await b.update({ ativo: false });
    res.json({ mensagem: 'Bloqueio removido.' });
  } catch(e) { res.status(500).json({ erro: 'Erro ao remover bloqueio.' }); }
};

// ── COMUNICADOS ────────────────────────────────────────────────────────────
const comunicadoListar = async (req, res) => {
  try {
    const { ativo } = req.query;
    const where = {};
    if (ativo !== undefined) where.ativo = ativo === 'true';
    // Só mostra não-expirados para colaboradores
    const hoje = new Date().toISOString().split('T')[0];
    if (req.user.perfil !== 'administrador') {
      where.ativo = true;
      where[Op.or] = [{ dataExpiracao: null }, { dataExpiracao: { [Op.gte]: hoje } }];
    }
    const rows = await Comunicado.findAll({
      where, include: [{ model: User, as: 'autor', attributes: ['id','nome'] }],
      order: [['prioridade','DESC'],['createdAt','DESC']]
    });
    res.json(rows);
  } catch(e) { res.status(500).json({ erro: 'Erro ao listar comunicados.' }); }
};

const comunicadoCriar = async (req, res) => {
  try {
    const { titulo, conteudo, tipo, prioridade, dataExpiracao } = req.body;
    if (!titulo || !conteudo) return res.status(400).json({ erro: 'Título e conteúdo obrigatórios.' });
    const com = await Comunicado.create({ titulo, conteudo, tipo, prioridade, dataExpiracao, autorId: req.user.id });
    res.status(201).json(com);
  } catch(e) { res.status(500).json({ erro: 'Erro ao criar comunicado.' }); }
};

const comunicadoAtualizar = async (req, res) => {
  try {
    const c = await Comunicado.findByPk(req.params.id);
    if (!c) return res.status(404).json({ erro: 'Comunicado não encontrado.' });
    await c.update(req.body);
    res.json(c);
  } catch(e) { res.status(500).json({ erro: 'Erro ao atualizar comunicado.' }); }
};

const comunicadoExcluir = async (req, res) => {
  try {
    const c = await Comunicado.findByPk(req.params.id);
    if (!c) return res.status(404).json({ erro: 'Comunicado não encontrado.' });
    await c.destroy();
    res.json({ mensagem: 'Comunicado excluído.' });
  } catch(e) { res.status(500).json({ erro: 'Erro ao excluir comunicado.' }); }
};

// ── MANUTENÇÃO PREVENTIVA ──────────────────────────────────────────────────
const manListar = async (req, res) => {
  try {
    const { status, salaId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (salaId) where.salaId = salaId;
    // Marca vencidas automaticamente
    await ManutencaoPreventiva.update(
      { status: 'Vencida' },
      { where: { status: 'Agendada', dataProgramada: { [Op.lt]: new Date().toISOString().split('T')[0] } } }
    );
    const rows = await ManutencaoPreventiva.findAll({
      where, include: [
        { model: Sala, as: 'sala', attributes: ['id','nome'] },
        { model: User, as: 'criadoPor', attributes: ['id','nome'] }
      ], order: [['dataProgramada','ASC']]
    });
    res.json(rows);
  } catch(e) { res.status(500).json({ erro: 'Erro ao listar manutenções.' }); }
};

const manCriar = async (req, res) => {
  try {
    const man = await ManutencaoPreventiva.create({ ...req.body, criadoPorId: req.user.id });
    res.status(201).json(man);
  } catch(e) { res.status(500).json({ erro: 'Erro ao criar manutenção.' }); }
};

const manAtualizar = async (req, res) => {
  try {
    const m = await ManutencaoPreventiva.findByPk(req.params.id);
    if (!m) return res.status(404).json({ erro: 'Manutenção não encontrada.' });
    await m.update(req.body);
    res.json(m);
  } catch(e) { res.status(500).json({ erro: 'Erro ao atualizar manutenção.' }); }
};

// ── RELATÓRIOS ─────────────────────────────────────────────────────────────
const relatorios = async (req, res) => {
  try {
    const { tipo, dataInicio, dataFim, salaId, userId, status } = req.query;
    const hoje = new Date().toISOString().split('T')[0];
    const di = dataInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const df = dataFim || hoje;

    const whereRes = { data: { [Op.between]: [di, df] } };
    if (salaId) whereRes.salaId = salaId;
    if (userId) whereRes.userId = userId;
    if (status) whereRes.status = status;

    switch (tipo) {
      case 'utilizacao': {
        const reservas = await Reserva.findAll({
          where: whereRes,
          include: [
            { model: Sala, as: 'sala', attributes: ['id','nome'] },
            { model: User, as: 'usuario', attributes: ['id','nome'] }
          ],
          order: [['data','ASC']]
        });
        return res.json({ tipo, dados: reservas, periodo: { di, df } });
      }
      case 'salas': {
        const salas = await Sala.findAll({ include: [{ model: Reserva, as: 'reservas', where: { data: { [Op.between]: [di, df] }, status: { [Op.ne]: 'cancelada' } }, required: false }] });
        const dados = salas.map(s => ({
          id: s.id, nome: s.nome, capacidade: s.capacidade,
          totalReservas: s.reservas?.length || 0,
          status: s.status
        }));
        return res.json({ tipo, dados, periodo: { di, df } });
      }
      case 'usuarios_ativos': {
        const dados = await User.findAll({
          attributes: { exclude: ['senha'] },
          include: [{ model: Reserva, as: 'reservas', where: { data: { [Op.between]: [di, df] } }, required: false }]
        });
        const sorted = dados.map(u => ({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, totalReservas: u.reservas?.length || 0 }))
          .sort((a,b) => b.totalReservas - a.totalReservas);
        return res.json({ tipo, dados: sorted, periodo: { di, df } });
      }
      case 'cancelamentos': {
        const dados = await Reserva.findAll({
          where: { ...whereRes, status: 'cancelada' },
          include: [{ model: Sala, as: 'sala' }, { model: User, as: 'usuario', attributes: ['id','nome'] }],
          order: [['updatedAt','DESC']]
        });
        return res.json({ tipo, dados, periodo: { di, df } });
      }
      case 'chamados': {
        const whereCh = {};
        if (di) whereCh.createdAt = { [Op.between]: [new Date(di), new Date(df + 'T23:59:59')] };
        const dados = await Chamado.findAll({
          where: whereCh,
          include: [
            { model: User, as: 'abertoPor', attributes: ['id','nome'] },
            { model: User, as: 'tecnico', attributes: ['id','nome'] }
          ],
          order: [['createdAt','DESC']]
        });
        return res.json({ tipo, dados, periodo: { di, df } });
      }
      case 'executivo': {
        const [totalReservas, reservasAtivas, totalChamados, chamadosAbertos,
          chamadosCriticos, totalSalas, salasAtivas] = await Promise.all([
          Reserva.count({ where: { data: { [Op.between]: [di, df] } } }),
          Reserva.count({ where: { data: { [Op.between]: [di, df] }, status: 'confirmada' } }),
          Chamado.count(),
          Chamado.count({ where: { status: { [Op.notIn]: ['Resolvido','Encerrado'] } } }),
          Chamado.count({ where: { prioridade: 'Crítica', status: { [Op.notIn]: ['Resolvido','Encerrado'] } } }),
          Sala.count(), Sala.count({ where: { status: 'ativa' } })
        ]);
        return res.json({ tipo, dados: { totalReservas, reservasAtivas, totalChamados, chamadosAbertos, chamadosCriticos, totalSalas, salasAtivas }, periodo: { di, df } });
      }
      default:
        return res.status(400).json({ erro: 'Tipo de relatório inválido.' });
    }
  } catch(e) { console.error(e); res.status(500).json({ erro: 'Erro ao gerar relatório.' }); }
};

// ── PAINEL DE OCUPAÇÃO (tempo real) ───────────────────────────────────────
const painelOcupacao = async (req, res) => {
  try {
    const agora = new Date();
    const hoje = agora.toISOString().split('T')[0];
    const horaAtual = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;

    const salas = await Sala.findAll({ where: { status: 'ativa' } });
    const reservasHoje = await Reserva.findAll({
      where: { data: hoje, status: { [Op.ne]: 'cancelada' } },
      include: [
        { model: Sala, as: 'sala' },
        { model: User, as: 'usuario', attributes: ['id','nome'] }
      ],
      order: [['horaInicio','ASC']]
    });

    const resultado = salas.map(sala => {
      const reservasDaSala = reservasHoje.filter(r => r.salaId === sala.id);
      const ocupadaAgora = reservasDaSala.find(r => r.horaInicio <= horaAtual && r.horaFim > horaAtual);
      const proxima = reservasDaSala.find(r => r.horaInicio > horaAtual);
      return {
        sala: { id: sala.id, nome: sala.nome, capacidade: sala.capacidade, localizacao: sala.localizacao },
        ocupada: !!ocupadaAgora,
        reservaAtual: ocupadaAgora || null,
        proximaReserva: proxima || null,
        totalHoje: reservasDaSala.length
      };
    });

    res.json({ horaAtual, hoje, salas: resultado });
  } catch(e) { res.status(500).json({ erro: 'Erro ao carregar painel.' }); }
};

// ── DASHBOARD EXECUTIVO ────────────────────────────────────────────────────
const dashboardExecutivo = async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const mesInicio = `${hoje.slice(0,7)}-01`;

    const [
      totalReservasMes, reservasHoje,
      chamadosAbertos, chamadosCriticos, chamadosResolvidos,
      totalSalas, salasAtivas,
      totalUsuarios, totalImpressoras, impressorasOffline
    ] = await Promise.all([
      Reserva.count({ where: { data: { [Op.between]: [mesInicio, hoje] }, status: { [Op.ne]: 'cancelada' } } }),
      Reserva.count({ where: { data: hoje, status: { [Op.ne]: 'cancelada' } } }),
      Chamado.count({ where: { status: { [Op.notIn]: ['Resolvido','Encerrado'] } } }),
      Chamado.count({ where: { prioridade: 'Crítica', status: { [Op.notIn]: ['Resolvido','Encerrado'] } } }),
      Chamado.count({ where: { status: 'Resolvido' } }),
      Sala.count(), Sala.count({ where: { status: 'ativa' } }),
      User.count(), Impressora.count(),
      Impressora.count({ where: { status: 'Offline' } })
    ]);

    // Salas mais usadas no mês
    const salasMaisUsadas = await Sala.findAll({
      include: [{ model: Reserva, as: 'reservas', where: { data: { [Op.between]: [mesInicio, hoje] }, status: { [Op.ne]: 'cancelada' } }, required: false }],
      attributes: ['id','nome','capacidade']
    });
    const rankSalas = salasMaisUsadas.map(s => ({ nome: s.nome, total: s.reservas?.length||0 }))
      .sort((a,b) => b.total - a.total).slice(0, 5);

    // Chamados por categoria
    const chamadosCat = await Chamado.findAll({
      attributes: ['categoria', [fn('COUNT','*'), 'total']],
      group: ['categoria'], raw: true
    });

    // Reservas por dia nos últimos 7 dias
    const ultimos7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const cnt = await Reserva.count({ where: { data: ds, status: { [Op.ne]: 'cancelada' } } });
      ultimos7.push({ data: ds, total: cnt });
    }

    res.json({
      kpis: { totalReservasMes, reservasHoje, chamadosAbertos, chamadosCriticos, chamadosResolvidos, totalSalas, salasAtivas, totalUsuarios, totalImpressoras, impressorasOffline },
      rankSalas, chamadosCat, reservas7dias: ultimos7
    });
  } catch(e) { console.error(e); res.status(500).json({ erro: 'Erro ao carregar dashboard executivo.' }); }
};

module.exports = {
  logListar,
  bloqueioListar, bloqueioCriar, bloqueioExcluir,
  comunicadoListar, comunicadoCriar, comunicadoAtualizar, comunicadoExcluir,
  manListar, manCriar, manAtualizar,
  relatorios, painelOcupacao, dashboardExecutivo
};