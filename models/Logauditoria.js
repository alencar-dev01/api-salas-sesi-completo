// models/LogAuditoria.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogAuditoria = sequelize.define('LogAuditoria', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  userNome: { type: DataTypes.STRING, allowNull: true },
  acao: { type: DataTypes.STRING, allowNull: false },
  modulo: { type: DataTypes.STRING, allowNull: true },
  descricao: { type: DataTypes.TEXT, allowNull: true },
  ip: { type: DataTypes.STRING, allowNull: true },
  dadosAntigos: { type: DataTypes.TEXT, allowNull: true },
  dadosNovos: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'log_auditoria' });

module.exports = LogAuditoria;