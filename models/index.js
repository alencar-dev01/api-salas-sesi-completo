// // models/index.js - Centraliza modelos e associações
// const sequelize = require('../config/database');
// const User = require('./User');
// const Sala = require('./Sala');
// const Reserva = require('./Reserva');

// // Associações
// User.hasMany(Reserva, { foreignKey: 'userId', as: 'reservas' });
// Reserva.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });

// Sala.hasMany(Reserva, { foreignKey: 'salaId', as: 'reservas' });
// Reserva.belongsTo(Sala, { foreignKey: 'salaId', as: 'sala' });

// module.exports = { sequelize, User, Sala, Reserva };

const sequelize = require('../config/database');
const User = require('./User');
const Sala = require('./Sala');
const Reserva = require('./Reserva');
const Chamado = require('./Chamado');
const ComentarioChamado = require('./ComentarioChamado');
const Impressora = require('./Impressora');
const ManutencaoImpressora = require('./ManutencaoImpressora');
const BaseConhecimento = require('./BaseConhecimento');
const LogAuditoria = require('./LogAuditoria');
const BloqueioSala = require('./BloqueioSala');
const Comunicado = require('./Comunicado');
const ManutencaoPreventiva = require('./ManutencaoPreventiva');

// ── Reservas ──────────────────────────────────
User.hasMany(Reserva, { foreignKey: 'userId', as: 'reservas' });
Reserva.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });
Sala.hasMany(Reserva, { foreignKey: 'salaId', as: 'reservas' });
Reserva.belongsTo(Sala, { foreignKey: 'salaId', as: 'sala' });

// ── Chamados ──────────────────────────────────
User.hasMany(Chamado, { foreignKey: 'abertoPorId', as: 'chamadosAbertos' });
Chamado.belongsTo(User, { foreignKey: 'abertoPorId', as: 'abertoPor' });
User.hasMany(Chamado, { foreignKey: 'tecnicoId', as: 'chamadosAtribuidos' });
Chamado.belongsTo(User, { foreignKey: 'tecnicoId', as: 'tecnico' });
Sala.hasMany(Chamado, { foreignKey: 'salaId', as: 'chamados' });
Chamado.belongsTo(Sala, { foreignKey: 'salaId', as: 'sala' });
Impressora.hasMany(Chamado, { foreignKey: 'impressoraId', as: 'chamados' });
Chamado.belongsTo(Impressora, { foreignKey: 'impressoraId', as: 'impressora' });

// ── Comentários Chamados ──────────────────────
Chamado.hasMany(ComentarioChamado, { foreignKey: 'chamadoId', as: 'comentarios' });
ComentarioChamado.belongsTo(Chamado, { foreignKey: 'chamadoId', as: 'chamado' });
User.hasMany(ComentarioChamado, { foreignKey: 'userId', as: 'comentarios' });
ComentarioChamado.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });

// ── Impressoras ────────────────────────────────
Impressora.hasMany(ManutencaoImpressora, { foreignKey: 'impressoraId', as: 'manutencoes' });
ManutencaoImpressora.belongsTo(Impressora, { foreignKey: 'impressoraId', as: 'impressora' });
User.hasMany(ManutencaoImpressora, { foreignKey: 'tecnicoId', as: 'manutencoesRealizadas' });
ManutencaoImpressora.belongsTo(User, { foreignKey: 'tecnicoId', as: 'tecnico' });

// ── Base de Conhecimento ───────────────────────
User.hasMany(BaseConhecimento, { foreignKey: 'autorId', as: 'artigos' });
BaseConhecimento.belongsTo(User, { foreignKey: 'autorId', as: 'autor' });

// ── Bloqueios ──────────────────────────────────
Sala.hasMany(BloqueioSala, { foreignKey: 'salaId', as: 'bloqueios' });
BloqueioSala.belongsTo(Sala, { foreignKey: 'salaId', as: 'sala' });
User.hasMany(BloqueioSala, { foreignKey: 'criadoPorId', as: 'bloqueiosCriados' });
BloqueioSala.belongsTo(User, { foreignKey: 'criadoPorId', as: 'criadoPor' });

// ── Comunicados ────────────────────────────────
User.hasMany(Comunicado, { foreignKey: 'autorId', as: 'comunicados' });
Comunicado.belongsTo(User, { foreignKey: 'autorId', as: 'autor' });

// ── Manutenção Preventiva ──────────────────────
Sala.hasMany(ManutencaoPreventiva, { foreignKey: 'salaId', as: 'manutencoesPreventivas' });
ManutencaoPreventiva.belongsTo(Sala, { foreignKey: 'salaId', as: 'sala' });
User.hasMany(ManutencaoPreventiva, { foreignKey: 'criadoPorId', as: 'manutencoesAgendadas' });
ManutencaoPreventiva.belongsTo(User, { foreignKey: 'criadoPorId', as: 'criadoPor' });

module.exports = {
  sequelize,
  User, Sala, Reserva,
  Chamado, ComentarioChamado,
  Impressora, ManutencaoImpressora,
  BaseConhecimento, LogAuditoria,
  BloqueioSala, Comunicado, ManutencaoPreventiva
};