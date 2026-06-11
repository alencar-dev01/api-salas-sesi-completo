// config/jwt.js - Configurações do JWT
module.exports = {
  secret: process.env.JWT_SECRET || 'sesi_senai_secret_key_2024',
  expiresIn: '8h'
};