// controllers/chamadosController.js
const { Chamado, ComentarioChamado, User, Sala, Impressora } = require('../models');
const { Op } = require('sequelize');

const include = [
  { model: User, as: 'abertoPor', attributes: ['id','nome','email'] },
  { model: User, as: 'tecnico', attributes: ['id','nome','email'] },
  { model: Sala, as: 'sala', attributes: ['id','nome','localizacao'] },
  { model: Impressora, as: 'impressora', attributes: ['id','nome','setor','enderecoIp'] }
];

const listar = async (req, res) => {
  try {
    const { page=1, limit=10, status, categoria, prioridade, tecnicoId, busca, ordem='createdAt', direcao='DESC' } = req.query;
    const where = {};
    if (status) where.status = status;
    if (categoria) where.categoria = categoria;
    if (prioridade) where.prioridade = prioridade;
    if (tecnicoId) where.tecnicoId = tecnicoId;
    if (busca) where[Op.or] = [
      { titulo: { [Op.like]: `%${busca}%` } },
      { descricao: { [Op.like]: `%${busca}%` } }
    ];
    // Colaborador só vê os próprios
    if (req.user.perfil !== 'administrador') where.abertoPorId = req.user.id;

    const offset = (parseInt(page)-1) * parseInt(limit);
    const { count, rows } = await Chamado.findAndCountAll({
      where, include, order: [[ordem, direcao]],
      limit: parseInt(limit), offset
    });
    res.json({ total: count, paginas: Math.ceil(count/limit), pagina: parseInt(page), dados: rows });
  } catch(e) { res.status(500).json({ erro: 'Erro ao listar chamados.' }); }
};

const obter = async (req, res) => {
  try {
    const chamado = await Chamado.findByPk(req.params.id, {
      include: [
        ...include,
        { model: ComentarioChamado, as: 'comentarios',
          include: [{ model: User, as: 'usuario', attributes: ['id','nome','perfil'] }],
          order: [['createdAt','ASC']] }
      ]
    });
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado.' });
    res.json(chamado);
  } catch(e) { res.status(500).json({ erro: 'Erro ao obter chamado.' }); }
};

const criar = async (req, res) => {
  try {
    const { titulo, categoria, prioridade, descricao, salaId, impressoraId } = req.body;
    if (!titulo || !categoria || !descricao)
      return res.status(400).json({ erro: 'Título, categoria e descrição são obrigatórios.' });
    const chamado = await Chamado.create({
      titulo, categoria, prioridade, descricao, salaId, impressoraId,
      abertoPorId: req.user.id
    });
    const completo = await Chamado.findByPk(chamado.id, { include });
    res.status(201).json(completo);
  } catch(e) { res.status(500).json({ erro: 'Erro ao criar chamado.' }); }
};

const atualizar = async (req, res) => {
  try {
    const chamado = await Chamado.findByPk(req.params.id);
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado.' });
    const { status, tecnicoId, solucao, prioridade, titulo, descricao, categoria } = req.body;
    const dados = { titulo, descricao, categoria, prioridade, status, tecnicoId };
    if (solucao) dados.solucao = solucao;
    if (status === 'Resolvido' && !chamado.dataResolucao) dados.dataResolucao = new Date();
    await chamado.update(dados);
    const atualizado = await Chamado.findByPk(chamado.id, { include });
    res.json(atualizado);
  } catch(e) { res.status(500).json({ erro: 'Erro ao atualizar chamado.' }); }
};

const assumir = async (req, res) => {
  try {
    const chamado = await Chamado.findByPk(req.params.id);
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado.' });
    await chamado.update({ tecnicoId: req.user.id, status: 'Em andamento' });
    await ComentarioChamado.create({
      chamadoId: chamado.id, userId: req.user.id,
      texto: `Chamado assumido por ${req.user.nome}.`, tipo: 'acao'
    });
    res.json({ mensagem: 'Chamado assumido com sucesso.' });
  } catch(e) { res.status(500).json({ erro: 'Erro ao assumir chamado.' }); }
};

const comentar = async (req, res) => {
  try {
    const { texto, tipo } = req.body;
    if (!texto) return res.status(400).json({ erro: 'Texto do comentário é obrigatório.' });
    const comentario = await ComentarioChamado.create({
      chamadoId: req.params.id, userId: req.user.id, texto, tipo: tipo || 'comentario'
    });
    const completo = await ComentarioChamado.findByPk(comentario.id, {
      include: [{ model: User, as: 'usuario', attributes: ['id','nome','perfil'] }]
    });
    res.status(201).json(completo);
  } catch(e) { res.status(500).json({ erro: 'Erro ao comentar.' }); }
};

const excluir = async (req, res) => {
  try {
    const chamado = await Chamado.findByPk(req.params.id);
    if (!chamado) return res.status(404).json({ erro: 'Chamado não encontrado.' });
    await chamado.destroy();
    res.json({ mensagem: 'Chamado excluído.' });
  } catch(e) { res.status(500).json({ erro: 'Erro ao excluir chamado.' }); }
};

module.exports = { listar, obter, criar, atualizar, assumir, comentar, excluir };