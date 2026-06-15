// models/BaseConhecimento.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BaseConhecimento = sequelize.define('BaseConhecimento', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  categoria: {
    type: DataTypes.ENUM('Tutorial','Procedimento','Solução Recorrente','Boa Prática','Outro'),
    defaultValue: 'Tutorial'
  },
  conteudo: { type: DataTypes.TEXT, allowNull: false },
  tags: { type: DataTypes.STRING, allowNull: true },
  versao: { type: DataTypes.INTEGER, defaultValue: 1 },
  autorId: { type: DataTypes.INTEGER, allowNull: false },
  publicado: { type: DataTypes.BOOLEAN, defaultValue: true },
  visualizacoes: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'base_conhecimento' });

module.exports = BaseConhecimento;