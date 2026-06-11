// database/seed.js - Dados iniciais
const { User, Sala } = require('../models');

const seedInitial = async () => {
  try {
    // Cria admin padrão se não existir
    const adminExiste = await User.findOne({ where: { email: 'admin@sesi.senai.br' } });
    if (!adminExiste) {
      await User.create({
        nome: 'Administrador',
        email: 'admin@sesi.senai.br',
        senha: 'Admin@123',
        perfil: 'administrador'
      });
      console.log('Admin criado: admin@sesi.senai.br / Admin@123');
    }

    // Cria colaborador demo
    const colab = await User.findOne({ where: { email: 'colaborador@sesi.senai.br' } });
    if (!colab) {
      await User.create({
        nome: 'Responsável de Sala',
        email: 'colaborador@sesi.senai.br',
        senha: 'Colab@123',
        perfil: 'colaborador'
      });
    }

    // Cria salas demo
    const count = await Sala.count();
    if (count === 0) {
      await Sala.bulkCreate([
        { nome: 'Lab de Informática 16', capacidade: 30, localizacao: 'Sede 1° Andar', descricao: 'Laboratório com 30 computadores Dell, projetor e lousa digital', status: 'ativa' },
        { nome: 'Lab de Informática 18', capacidade: 30, localizacao: 'Sede 2° Andar', descricao: 'Laboratório equipado com computadores e softwares de design', status: 'ativa' },

      ]);
      console.log('Salas de demonstração criadas.');
    }
  } catch (err) {
    console.error('Erro no seed:', err.message);
  }
};

module.exports = { seedInitial };