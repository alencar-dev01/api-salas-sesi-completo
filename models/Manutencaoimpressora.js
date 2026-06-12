// models/ManutencaoImpressora.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ManutencaoImpressora = sequelize.define('ManutencaoImpressora', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  impressoraId: { type: DataTypes.INTEGER, allowNull: false },
  tecnicoId: { type: DataTypes.INTEGER, allowNull: true },
  tecnicoNome: { type: DataTypes.STRING, allowNull: true },
  problema: { type: DataTypes.TEXT, allowNull: false },
  solucao: { type: DataTypes.TEXT, allowNull: true },
  pecasSubstituidas: { type: DataTypes.TEXT, allowNull: true },
  observacoes: { type: DataTypes.TEXT, allowNull: true },
  dataManutencao: { type: DataTypes.DATEONLY, allowNull: false }
}, { tableName: 'manutencoes_impressoras' });

module.exports = ManutencaoImpressora;