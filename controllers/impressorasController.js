// controllers/impressorasController.js
const { Impressora, ManutencaoImpressora, Chamado, User } = require('../models');
const { Op } = require('sequelize');

const listar = async (req, res) => {
  try {
    const { page=1, limit=10, busca, status, setor, ordem='nome', direcao='ASC' } = req.query;
    const where = {};
    if (status) where.status = status;
    if (setor) where.setor = { [Op.like]: `%${setor}%` };
    if (busca) where[Op.or] = [
      { nome: { [Op.like]: `%${busca}%` } },
      { setor: { [Op.like]: `%${busca}%` } },
      { enderecoIp: { [Op.like]: `%${busca}%` } },
      { modelo: { [Op.like]: `%${busca}%` } }
    ];
    const offset = (parseInt(page)-1)*parseInt(limit);
    const { count, rows } = await Impressora.findAndCountAll({
      where, order: [[ordem, direcao]], limit: parseInt(limit), offset
    });
    res.json({ total: count, paginas: Math.ceil(count/limit), pagina: parseInt(page), dados: rows });
  } catch(e) { res.status(500).json({ erro: 'Erro ao listar impressoras.' }); }
};

const obter = async (req, res) => {
  try {
    const impressora = await Impressora.findByPk(req.params.id, {
      include: [
        { model: ManutencaoImpressora, as: 'manutencoes',
          include: [{ model: User, as: 'tecnico', attributes: ['id','nome'] }],
          order: [['dataManutencao','DESC']] },
        { model: Chamado, as: 'chamados',
          include: [{ model: User, as: 'abertoPor', attributes: ['id','nome'] }],
          order: [['createdAt','DESC']], limit: 5 }
      ]
    });
    if (!impressora) return res.status(404).json({ erro: 'Impressora não encontrada.' });
    res.json(impressora);
  } catch(e) { res.status(500).json({ erro: 'Erro ao obter impressora.' }); }
};

const criar = async (req, res) => {
  try {
    const impressora = await Impressora.create(req.body);
    res.status(201).json(impressora);
  } catch(e) { res.status(500).json({ erro: 'Erro ao criar impressora.' }); }
};

const atualizar = async (req, res) => {
  try {
    const imp = await Impressora.findByPk(req.params.id);
    if (!imp) return res.status(404).json({ erro: 'Impressora não encontrada.' });
    await imp.update(req.body);
    res.json(imp);
  } catch(e) { res.status(500).json({ erro: 'Erro ao atualizar impressora.' }); }
};

const excluir = async (req, res) => {
  try {
    const imp = await Impressora.findByPk(req.params.id);
    if (!imp) return res.status(404).json({ erro: 'Impressora não encontrada.' });
    await imp.destroy();
    res.json({ mensagem: 'Impressora excluída.' });
  } catch(e) { res.status(500).json({ erro: 'Erro ao excluir impressora.' }); }
};

const adicionarManutencao = async (req, res) => {
  try {
    const { problema, solucao, pecasSubstituidas, observacoes, dataManutencao, tecnicoNome } = req.body;
    if (!problema || !dataManutencao) return res.status(400).json({ erro: 'Problema e data são obrigatórios.' });
    const man = await ManutencaoImpressora.create({
      impressoraId: req.params.id,
      tecnicoId: req.user.id,
      tecnicoNome: tecnicoNome || req.user.nome,
      problema, solucao, pecasSubstituidas, observacoes, dataManutencao
    });
    res.status(201).json(man);
  } catch(e) { res.status(500).json({ erro: 'Erro ao registrar manutenção.' }); }
};

const dashboard = async (req, res) => {
  try {
    const [total, online, offline, manutencao] = await Promise.all([
      Impressora.count(),
      Impressora.count({ where: { status: 'Online' } }),
      Impressora.count({ where: { status: 'Offline' } }),
      Impressora.count({ where: { status: 'Em manutenção' } })
    ]);
    const porSetor = await Impressora.findAll({
      attributes: ['setor', [require('sequelize').fn('COUNT','*'), 'total']],
      group: ['setor'], raw: true
    });
    res.json({ total, online, offline, manutencao, porSetor });
  } catch(e) { res.status(500).json({ erro: 'Erro ao carregar dashboard.' }); }
};

module.exports = { listar, obter, criar, atualizar, excluir, adicionarManutencao, dashboard };