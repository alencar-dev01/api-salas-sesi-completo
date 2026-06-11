// middleware/auth.js - Middleware de autenticação JWT
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const { User } = require('../models');

const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, secret);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ erro: 'Usuário não encontrado.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

const apenasAdmin = (req, res, next) => {
  if (req.user.perfil !== 'administrador') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  next();
};

module.exports = { autenticar, apenasAdmin };