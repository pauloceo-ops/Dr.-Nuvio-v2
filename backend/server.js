const express = require('express');
const cors = require('cors');
require('dotenv').config();

async function start() {
  const { getDb } = require('./src/config/database');
  await getDb();

  const app = express();

  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/dashboard', require('./src/routes/dashboard'));
  app.use('/api/processos', require('./src/routes/processos'));
  app.use('/api/condominios', require('./src/routes/condominios'));
  app.use('/api/tarefas', require('./src/routes/tarefas'));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      name: 'Dr. Nuvio API',
      version: '2.0.0',
      modules: ['juridico', 'condominio', 'superlogica'],
    });
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Dr. Nuvio API v2 rodando na porta ${PORT}`);
  });
}

start().catch(console.error);
