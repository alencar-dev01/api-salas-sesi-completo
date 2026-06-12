// controllers/baseConhecimentoController.js
const { BaseConhecimento, User } = require('../models');
const { Op } = require('sequelize');

const include = [{ model: User, as: 'autor', attributes: ['id','nome'] }];

const listar = async (req, res) => {
  try {
    const { page=1, limit=10, busca, categoria, ordem='createdAt', direcao='DESC' } = req.query;
    const where = { publicado: true };
    if (categoria) where.categoria = categoria;
    if (busca) where[Op.or] = [
      { titulo: { [Op.like]: `%${busca}%` } },
      { conteudo: { [Op.like]: `%${busca}%` } },
      { tags: { [Op.like]: `%${busca}%` } }
    ];
    const offset = (parseInt(page)-1)*parseInt(limit);
    const { count, rows } = await BaseConhecimento.findAndCountAll({
      where, include, order: [[ordem, direcao]], limit: parseInt(limit), offset
    });
    res.json({ total: count, paginas: Math.ceil(count/limit), pagina: parseInt(page), dados: rows });
  } catch(e) { res.status(500).json({ erro: 'Erro ao listar artigos.' }); }
};

const obter = async (req, res) => {
  try {
    const art = await BaseConhecimento.findByPk(req.params.id, { include });
    if (!art) return res.status(404).json({ erro: 'Artigo não encontrado.' });
    await art.increment('visualizacoes');
    res.json(art);
  } catch(e) { res.status(500).json({ erro: 'Erro ao obter artigo.' }); }
};

const criar = async (req, res) => {
  try {
    const { titulo, categoria, conteudo, tags, publicado } = req.body;
    if (!titulo || !conteudo) return res.status(400).json({ erro: 'Título e conteúdo são obrigatórios.' });
    const art = await BaseConhecimento.create({ titulo, categoria, conteudo, tags, publicado, autorId: req.user.id });
    res.status(201).json(art);
  } catch(e) { res.status(500).json({ erro: 'Erro ao criar artigo.' }); }
};

const atualizar = async (req, res) => {
  try {
    const art = await BaseConhecimento.findByPk(req.params.id);
    if (!art) return res.status(404).json({ erro: 'Artigo não encontrado.' });
    await art.update({ ...req.body, versao: art.versao + 1 });
    res.json(art);
  } catch(e) { res.status(500).json({ erro: 'Erro ao atualizar artigo.' }); }
};

const excluir = async (req, res) => {
  try {
    const art = await BaseConhecimento.findByPk(req.params.id);
    if (!art) return res.status(404).json({ erro: 'Artigo não encontrado.' });
    await art.destroy();
    res.json({ mensagem: 'Artigo excluído.' });
  } catch(e) { res.status(500).json({ erro: 'Erro ao excluir artigo.' }); }
};

module.exports = { listar, obter, criar, atualizar, excluir };