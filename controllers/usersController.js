// controllers/usersController.js - CRUD de usuários
const { User } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, busca, perfil, ordem = 'nome', direcao = 'ASC' } = req.query;
    const where = {};
    if (busca) where[Op.or] = [
      { nome: { [Op.like]: `%${busca}%` } },
      { email: { [Op.like]: `%${busca}%` } }
    ];
    if (perfil) where.perfil = perfil;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['senha'] },
      order: [[ordem, direcao]],
      limit: parseInt(limit),
      offset
    });
    res.json({ total: count, paginas: Math.ceil(count / limit), pagina: parseInt(page), dados: rows });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar usuários.' });
  }
};

const obter = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['senha'] } });
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao obter usuário.' });
  }
};

const criar = async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
    }
    const existente = await User.findOne({ where: { email } });
    if (existente) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

    const user = await User.create({ nome, email, senha, perfil: perfil || 'colaborador' });
    res.status(201).json({ id: user.id, nome: user.nome, email: user.email, perfil: user.perfil });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar usuário.' });
  }
};

const atualizar = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const { nome, email, senha, perfil } = req.body;
    if (email && email !== user.email) {
      const existente = await User.findOne({ where: { email } });
      if (existente) return res.status(409).json({ erro: 'E-mail já em uso.' });
    }
    await user.update({ nome, email, perfil, ...(senha ? { senha } : {}) });
    res.json({ id: user.id, nome: user.nome, email: user.email, perfil: user.perfil });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar usuário.' });
  }
};

const excluir = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (user.id === req.user.id) return res.status(400).json({ erro: 'Não é possível excluir o próprio usuário.' });
    await user.destroy();
    res.json({ mensagem: 'Usuário excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir usuário.' });
  }
};

module.exports = { listar, obter, criar, atualizar, excluir };