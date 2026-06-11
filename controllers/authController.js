// controllers/authController.js - Autenticação
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwt');
const { User } = require('../models');

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const senhaOk = await user.verificarSenha(senha);
    if (!senhaOk) return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, perfil: user.perfil },
      secret,
      { expiresIn }
    );
    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil }
    });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao realizar login.' });
  }
};

const register = async (req, res) => {
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
    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
};

const me = async (req, res) => {
  res.json({ id: req.user.id, nome: req.user.nome, email: req.user.email, perfil: req.user.perfil });
};

module.exports = { login, register, me };