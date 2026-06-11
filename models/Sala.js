// models/Sala.js - Modelo de Sala de Informática
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sala = sequelize.define('Sala', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  capacidade: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  localizacao: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ativa', 'inativa'),
    defaultValue: 'ativa'
  }
}, {
  tableName: 'salas'
});

module.exports = Sala;