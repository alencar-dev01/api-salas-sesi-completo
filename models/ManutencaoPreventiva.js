// models/ManutencaoPreventiva.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ManutencaoPreventiva = sequelize.define('ManutencaoPreventiva', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  salaId: { type: DataTypes.INTEGER, allowNull: true },
  equipamento: { type: DataTypes.STRING, allowNull: false },
  tipoManutencao: {
    type: DataTypes.ENUM('Limpeza','Atualização','Troca de peça','Verificação','Calibração','Outro'),
    defaultValue: 'Verificação'
  },
  responsavel: { type: DataTypes.STRING, allowNull: true },
  dataProgramada: { type: DataTypes.DATEONLY, allowNull: false },
  dataRealizada: { type: DataTypes.DATEONLY, allowNull: true },
  status: {
    type: DataTypes.ENUM('Agendada','Realizada','Vencida','Cancelada'),
    defaultValue: 'Agendada'
  },
  observacoes: { type: DataTypes.TEXT, allowNull: true },
  criadoPorId: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'manutencoes_preventivas' });

module.exports = ManutencaoPreventiva;