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

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/salas', salaRoutes);
app.use('/api/reservas', reservaRoutes);

// Rota catch-all para SPA
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

// Inicializa banco e servidor
sequelize.sync({ force: true }).then(async () => {
  console.log('Banco de dados sincronizado.');
  // Seed inicial se necessário
  const { seedInitial } = require('./database/seed');
  await seedInitial();
  app.listen(PORT, () => {
    console.log(`Servidor SESI/SENAI rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao sincronizar banco:', err);
});