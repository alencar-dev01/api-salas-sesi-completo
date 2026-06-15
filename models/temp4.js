// models/BloqueioSala.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BloqueioSala = sequelize.define('BloqueioSala', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  salaId: { type: DataTypes.INTEGER, allowNull: false },
  titulo: { type: DataTypes.STRING, allowNull: false },
  motivo: {
    type: DataTypes.ENUM('Manutenção','Evento Interno','Treinamento','Auditoria','Outro'),
    defaultValue: 'Manutenção'
  },
  dataInicio: { type: DataTypes.DATEONLY, allowNull: false },
  dataFim: { type: DataTypes.DATEONLY, allowNull: false },
  horaInicio: { type: DataTypes.STRING, allowNull: true },
  horaFim: { type: DataTypes.STRING, allowNull: true },
  diaInteiro: { type: DataTypes.BOOLEAN, defaultValue: true },
  observacoes: { type: DataTypes.TEXT, allowNull: true },
  criadoPorId: { type: DataTypes.INTEGER, allowNull: false },
  ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'bloqueios_sala' });

module.exports = BloqueioSala;