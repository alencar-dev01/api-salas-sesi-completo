// config/database.js - Configuração do Sequelize com SQLite
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/sesi_senai.sqlite'),
  logging: false,
  define: {
    timestamps: true,
    underscored: false
  }
});

module.exports = sequelize;