// models/Reserva.js - Modelo de Reserva
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horaInicio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  horaFim: {
    type: DataTypes.STRING,
    allowNull: false
  },
  responsavel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  turma: {
    type: DataTypes.STRING,
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('confirmada', 'pendente', 'cancelada', 'finalizada'),
    defaultValue: 'confirmada'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  salaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'salas', key: 'id' }
  }
}, {
  tableName: 'reservas'
});

module.exports = Reserva;