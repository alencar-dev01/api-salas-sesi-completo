// models/Chamado.js - Central de Chamados
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chamado = sequelize.define('Chamado', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  categoria: {
    type: DataTypes.ENUM('Computador','Projetor','Rede/Internet','Impressora','Software','Hardware','Infraestrutura','Sistema','Outros'),
    allowNull: false
  },
  prioridade: {
    type: DataTypes.ENUM('Baixa','Média','Alta','Crítica'),
    defaultValue: 'Média'
  },
  status: {
    type: DataTypes.ENUM('Aberto','Em andamento','Aguardando peça','Aguardando usuário','Resolvido','Encerrado'),
    defaultValue: 'Aberto'
  },
  descricao: { type: DataTypes.TEXT, allowNull: false },
  solucao: { type: DataTypes.TEXT, allowNull: true },
  salaId: { type: DataTypes.INTEGER, allowNull: true },
  impressoraId: { type: DataTypes.INTEGER, allowNull: true },
  abertoPorId: { type: DataTypes.INTEGER, allowNull: false },
  tecnicoId: { type: DataTypes.INTEGER, allowNull: true },
  dataResolucao: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'chamados' });

module.exports = Chamado;