// models/Comunicado.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comunicado = sequelize.define('Comunicado', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  conteudo: { type: DataTypes.TEXT, allowNull: false },
  tipo: {
    type: DataTypes.ENUM('Aviso','Manutenção','Interrupção','Evento','Outro'),
    defaultValue: 'Aviso'
  },
  prioridade: { type: DataTypes.ENUM('Normal','Importante','Urgente'), defaultValue: 'Normal' },
  autorId: { type: DataTypes.INTEGER, allowNull: false },
  dataExpiracao: { type: DataTypes.DATEONLY, allowNull: true },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'comunicados' });

module.exports = Comunicado;