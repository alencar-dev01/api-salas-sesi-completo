// models/index.js - Centraliza modelos e associações
const sequelize = require('../config/database');
const User = require('./User');
const Sala = require('./Sala');
const Reserva = require('./Reserva');

// Associações
User.hasMany(Reserva, { foreignKey: 'userId', as: 'reservas' });
Reserva.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });

Sala.hasMany(Reserva, { foreignKey: 'salaId', as: 'reservas' });
Reserva.belongsTo(Sala, { foreignKey: 'salaId', as: 'sala' });

module.exports = { sequelize, User, Sala, Reserva };