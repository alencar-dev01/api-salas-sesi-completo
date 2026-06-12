// middleware/auditoria.js - Registra ações automaticamente
const { LogAuditoria } = require('../models');

const registrar = (acao, modulo) => async (req, res, next) => {
  // Guarda o json original para capturar depois
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    // Só loga se a requisição foi bem-sucedida (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconhecido';
      LogAuditoria.create({
        userId: req.user.id,
        userNome: req.user.nome,
        acao,
        modulo,
        descricao: gerarDescricao(acao, modulo, req, data),
        ip,
        dadosNovos: req.body ? JSON.stringify(req.body).slice(0, 500) : null
      }).catch(() => {}); // silencioso
    }
    return originalJson(data);
  };
  next();
};

function gerarDescricao(acao, modulo, req, data) {
  const id = req.params?.id || data?.id || '';
  const titulo = req.body?.titulo || req.body?.nome || req.body?.email || '';
  return `${acao} em ${modulo}${id ? ` #${id}` : ''}${titulo ? ` - "${titulo}"` : ''}`;
}

module.exports = { registrar };