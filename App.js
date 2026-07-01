// app.js - Ponto de entrada do servidor SESI/SENAI Salas
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const salaRoutes = require('./routes/salas');
const reservaRoutes = require('./routes/reservas');

const app = express();
const PORT = process.env.PORT || 3000;

import './Services/cleanupService.js';
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🚫 COMENTADO PARA NÃO DAR ERRO NO RENDER:
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/users',           require('./routes/users'));
app.use('/api/salas',           require('./routes/salas'));
app.use('/api/reservas',        require('./routes/reservas'));
// app.use('/api/chamados',        require('./routes/chamados')); // removido/desativado: Chamados - plano futuro
app.use('/api/impressoras',     require('./routes/impressoras'));
app.use('/api/conhecimento',    require('./routes/baseConhecimento'));
app.use('/api/admin',           require('./routes/admin'));

// 🚫 COMENTADO PARA NÃO DAR ERRO NO RENDER:
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  }
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// 🔥 ATENÇÃO AQUI: Mudamos de { force: true } para { alter: true }
// Se deixar 'force: true', toda vez que o Render "acordar", ele vai APAGAR seu banco e resetar tudo.
sequelize.sync().then(async () => {
  console.log('Banco de dados PostgreSQL sincronizado na nuvem! 🚀');
  
  // O seu seed original do SESI
  const { seedInitial } = require('./database/seed');
  await seedInitial();
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao sincronizar banco:', err);
});