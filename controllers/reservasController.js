// controllers/reservasController.js - CRUD de reservas com validação de conflito
const { Reserva, Sala, User } = require('../models');
const { Op } = require('sequelize');

// Verifica conflito de horário
// Verifica conflito de horário de forma infalível
const verificarConflito = async (salaId, data, horaInicio, horaFim, excluirId = null) => {
  // Garantia extra: Se o front-end enviar apenas "10:30", padroniza para "10:30:00" 
  // para evitar problemas de comparação de strings se o seu banco salvar com segundos.
  const inicioFormatado = horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio;
  const fimFormatado = horaFim.length === 5 ? `${horaFim}:00` : horaFim;

  const where = {
    salaId,
    data,
    status: { [Op.ne]: 'cancelada' },
    // Regra matemática universal de sobreposição de intervalos:
    // O início registrado deve ser MENOR que o fim desejado E o fim registrado deve ser MAIOR que o início desejado.
    horaInicio: { [Op.lt]: fimFormatado },
    horaFim: { [Op.gt]: inicioFormatado }
  };

  if (excluirId) {
    where.id = { [Op.ne]: excluirId };
  }

  const conflito = await Reserva.findOne({ where });
  return conflito;
};

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, salaId, status, dataInicio, dataFim, busca, ordem = 'data', direcao = 'DESC' } = req.query;
    const where = {};

    // Colaborador só vê suas reservas
    if (req.user.perfil !== 'administrador') where.userId = req.user.id;

    if (salaId) where.salaId = salaId;
    if (status) where.status = status;
    if (busca) where[Op.or] = [
      { titulo: { [Op.like]: `%${busca}%` } },
      { responsavel: { [Op.like]: `%${busca}%` } },
      { turma: { [Op.like]: `%${busca}%` } }
    ];
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data[Op.gte] = dataInicio;
      if (dataFim) where.data[Op.lte] = dataFim;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Reserva.findAndCountAll({
      where,
      include: [
        { model: Sala, as: 'sala', attributes: ['id', 'nome', 'localizacao'] },
        { model: User, as: 'usuario', attributes: ['id', 'nome', 'email'] }
      ],
      order: [[ordem, direcao]],
      limit: parseInt(limit),
      offset
    });
    res.json({ total: count, paginas: Math.ceil(count / limit), pagina: parseInt(page), dados: rows });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar reservas.' });
  }
};

const calendario = async (req, res) => {
  try {
    const { dataInicio, dataFim, salaId } = req.query;
    const where = { status: { [Op.ne]: 'cancelada' } };
    if (dataInicio) where.data = { ...(where.data || {}), [Op.gte]: dataInicio };
    if (dataFim) where.data = { ...(where.data || {}), [Op.lte]: dataFim };
    if (salaId) where.salaId = salaId;

    const reservas = await Reserva.findAll({
      where,
      include: [
        { model: Sala, as: 'sala', attributes: ['id', 'nome'] },
        { model: User, as: 'usuario', attributes: ['id', 'nome'] }
      ],
      order: [['data', 'ASC'], ['horaInicio', 'ASC']]
    });
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar calendário.' });
  }
};

const obter = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.perfil !== 'administrador') where.userId = req.user.id;
    const reserva = await Reserva.findOne({
      where,
      include: [
        { model: Sala, as: 'sala' },
        { model: User, as: 'usuario', attributes: ['id', 'nome', 'email'] }
      ]
    });
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada.' });
    res.json(reserva);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao obter reserva.' });
  }
};

const criar = async (req, res) => {
  try {
    const { titulo, descricao, data, horaInicio, horaFim, responsavel, turma, observacoes, salaId, status } = req.body;
    if (!titulo || !data || !horaInicio || !horaFim || !salaId) {
      return res.status(400).json({ erro: 'Título, data, horários e sala são obrigatórios.' });
    }
    if (horaInicio >= horaFim) {
      return res.status(400).json({ erro: 'Hora de início deve ser anterior à hora de fim.' });
    }
    const sala = await Sala.findByPk(salaId);
    if (!sala || sala.status === 'inativa') {
      return res.status(400).json({ erro: 'Sala não disponível.' });
    }
    const conflito = await verificarConflito(salaId, data, horaInicio, horaFim);
    if (conflito) {
      return res.status(409).json({ erro: 'A sala já possui reserva neste horário.' });
    }
    const reserva = await Reserva.create({
      titulo, descricao, data, horaInicio, horaFim,
      responsavel: responsavel || req.user.nome,
      turma, observacoes,
      status: status || 'confirmada',
      userId: req.user.id,
      salaId
    });
    const reservaCompleta = await Reserva.findByPk(reserva.id, {
      include: [{ model: Sala, as: 'sala' }, { model: User, as: 'usuario', attributes: ['id', 'nome'] }]
    });
    res.status(201).json(reservaCompleta);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar reserva.' });
  }
};

const atualizar = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.perfil !== 'administrador') where.userId = req.user.id;

    const reserva = await Reserva.findOne({ where });
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada.' });
    if (reserva.status === 'cancelada') return res.status(400).json({ erro: 'Reserva cancelada não pode ser editada.' });

    const { titulo, descricao, data, horaInicio, horaFim, responsavel, turma, observacoes, salaId, status } = req.body;

    const novaData = data || reserva.data;
    const novoInicio = horaInicio || reserva.horaInicio;
    const novoFim = horaFim || reserva.horaFim;
    const novaSala = salaId || reserva.salaId;

    if (novoInicio >= novoFim) {
      return res.status(400).json({ erro: 'Hora de início deve ser anterior à hora de fim.' });
    }
    const conflito = await verificarConflito(novaSala, novaData, novoInicio, novoFim, reserva.id);
    if (conflito) {
      return res.status(409).json({ erro: 'A sala já possui reserva neste horário.' });
    }
    await reserva.update({ titulo, descricao, data: novaData, horaInicio: novoInicio, horaFim: novoFim, responsavel, turma, observacoes, salaId: novaSala, status });
    const atualizada = await Reserva.findByPk(reserva.id, {
      include: [{ model: Sala, as: 'sala' }, { model: User, as: 'usuario', attributes: ['id', 'nome'] }]
    });
    res.json(atualizada);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar reserva.' });
  }
};

const excluir = async (req, res) => {
  try {
    const where = { id: req.params.id };
    if (req.user.perfil !== 'administrador') where.userId = req.user.id;

    const reserva = await Reserva.findOne({ where });
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada.' });

    // 🔒 TRAVA DE SEGURANÇA: Só permite se o status atual for 'finalizada'
    if (reserva.status !== 'finalizada') {
      return res.status(400).json({ erro: 'Apenas reservas finalizadas podem ser excluídas permanentemente.' });
    }

    // DELETA PERMANENTEMENTE DO BANCO DE DADOS
    await reserva.destroy();
    res.json({ mensagem: 'Reserva deletada permanentemente do sistema.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar reserva.' });
  }
};

const dashboard = async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const [totalSalas, salasAtivas, reservasHoje, proximasReservas, totalReservas] = await Promise.all([
      require('../models/Sala').count(),
      require('../models/Sala').count({ where: { status: 'ativa' } }),
      Reserva.count({ where: { data: hoje, status: { [Op.ne]: 'cancelada' } } }),
      Reserva.findAll({
        where: { data: { [Op.gte]: hoje }, status: 'confirmada' },
        include: [{ model: Sala, as: 'sala', attributes: ['id', 'nome'] }],
        order: [['data', 'ASC'], ['horaInicio', 'ASC']],
        limit: 5
      }),
      Reserva.count({ where: { status: { [Op.ne]: 'cancelada' } } })
    ]);
    res.json({ totalSalas, salasAtivas, reservasHoje, proximasReservas, totalReservas });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao carregar dashboard.' });
  }
};

const getReservasPortaria = async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];

    const reservas = await Reserva.findAll({
      where: {
        data: hoje,          // Apenas agendamentos de hoje
        status: 'confirmada' // Apenas o que está confirmado
      },
      include: [
        { model: Sala, as: 'sala', attributes: ['nome', 'localizacao'] }
      ],
      order: [['horaInicio', 'ASC']] // Ordena por horário cronológico
    });

    res.json(reservas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao carregar dados da portaria.' });
  }
};

// Exportações atualizadas incluindo a nova rota pública
module.exports = { listar, calendario, obter, criar, atualizar, excluir, dashboard, getReservasPortaria };