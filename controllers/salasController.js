// controllers/salasController.js - CRUD de salas
const { Sala, Reserva } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { status, busca, page = 1, limit = 10, ordem = 'nome', direcao = 'ASC' } = req.query;
    const where = {};
    if (status) where.status = status;
    if (busca) where[Op.or] = [
      { nome: { [Op.like]: `%${busca}%` } },
      { localizacao: { [Op.like]: `%${busca}%` } }
    ];

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Sala.findAndCountAll({
      where,
      order: [[ordem, direcao]],
      limit: parseInt(limit),
      offset
    });
    res.json({ total: count, paginas: Math.ceil(count / limit), pagina: parseInt(page), dados: rows });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar salas.' });
  }
};

const obter = async (req, res) => {
  try {
    const sala = await Sala.findByPk(req.params.id);
    if (!sala) return res.status(404).json({ erro: 'Sala não encontrada.' });
    res.json(sala);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao obter sala.' });
  }
};

const criar = async (req, res) => {
  try {
    const { nome, capacidade, descricao, localizacao, status } = req.body;
    if (!nome || !capacidade) {
      return res.status(400).json({ erro: 'Nome e capacidade são obrigatórios.' });
    }
    const sala = await Sala.create({ nome, capacidade, descricao, localizacao, status: status || 'ativa' });
    res.status(201).json(sala);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar sala.' });
  }
};

const atualizar = async (req, res) => {
  try {
    const sala = await Sala.findByPk(req.params.id);
    if (!sala) return res.status(404).json({ erro: 'Sala não encontrada.' });
    await sala.update(req.body);
    res.json(sala);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar sala.' });
  }
};

const excluir = async (req, res) => {
  try {
    const sala = await Sala.findByPk(req.params.id);
    if (!sala) return res.status(404).json({ erro: 'Sala não encontrada.' });
    const reservas = await Reserva.count({ where: { salaId: sala.id, status: { [Op.ne]: 'cancelada' } } });
    if (reservas > 0) return res.status(400).json({ erro: 'Sala possui reservas ativas. Cancele-as antes de excluir.' });
    await sala.destroy();
    res.json({ mensagem: 'Sala excluída com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir sala.' });
  }
};

const disponibilidade = async (req, res) => {
  try {
    const { salaId, data } = req.query;
    if (!salaId || !data) return res.status(400).json({ erro: 'salaId e data são obrigatórios.' });

    const reservas = await Reserva.findAll({
      where: { salaId, data, status: { [Op.ne]: 'cancelada' } },
      attributes: ['horaInicio', 'horaFim']
    });

    const horariosBase = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];
    const horariosDisponiveis = horariosBase.filter(hora => {
      return !reservas.some(r => hora >= r.horaInicio && hora < r.horaFim);
    });

    res.json({ reservas, horariosDisponiveis });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao verificar disponibilidade.' });
  }
};

module.exports = { listar, obter, criar, atualizar, excluir, disponibilidade };