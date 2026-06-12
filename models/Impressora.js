// models/Impressora.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Impressora = sequelize.define('Impressora', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  setor: { type: DataTypes.STRING, allowNull: true },
  localizacao: { type: DataTypes.STRING, allowNull: true },
  modelo: { type: DataTypes.STRING, allowNull: true },
  fabricante: { type: DataTypes.STRING, allowNull: true },
  enderecoIp: { type: DataTypes.STRING, allowNull: true },
  porta: { type: DataTypes.STRING, allowNull: true, defaultValue: '9100' },
  tipoConexao: { type: DataTypes.ENUM('USB','Rede','Wi-Fi','Bluetooth'), defaultValue: 'Rede' },
  compartilhamento: { type: DataTypes.STRING, allowNull: true },
  status: {
    type: DataTypes.ENUM('Online','Offline','Em manutenção','Desativada'),
    defaultValue: 'Online'
  },
  observacoes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'impressoras' });

module.exports = Impressora;