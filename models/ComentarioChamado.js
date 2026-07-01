// // models/ComentarioChamado.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const ComentarioChamado = sequelize.define('ComentarioChamado', {
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//   chamadoId: { type: DataTypes.INTEGER, allowNull: false },
//   userId: { type: DataTypes.INTEGER, allowNull: false },
//   texto: { type: DataTypes.TEXT, allowNull: false },
//   tipo: { type: DataTypes.ENUM('comentario','acao','solucao'), defaultValue: 'comentario' }
// }, { tableName: 'comentarios_chamados' });

// module.exports = ComentarioChamado;