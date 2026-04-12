const express = require('express');
const router = express.Router();
const { prepare } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// List all tarefas (T01-T10 + custom)
router.get('/', (req, res) => {
  try {
    const { modulo, status } = req.query;
    let sql = 'SELECT * FROM tarefas WHERE 1=1';
    const params = [];

    if (modulo) { sql += ' AND modulo = ?'; params.push(modulo); }
    if (status) { sql += ' AND status = ?'; params.push(status); }

    sql += ' ORDER BY CASE WHEN codigo IS NOT NULL THEN 0 ELSE 1 END, codigo, created_at DESC';

    const tarefas = prepare(sql).all(...params);
    res.json({ tarefas });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar tarefas' });
  }
});

// Update tarefa status
router.patch('/:id', (req, res) => {
  try {
    const { status, resultado } = req.body;
    if (status) {
      prepare('UPDATE tarefas SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    }
    if (resultado) {
      prepare('UPDATE tarefas SET resultado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(resultado, req.params.id);
    }
    const tarefa = prepare('SELECT * FROM tarefas WHERE id = ?').get(req.params.id);
    res.json({ tarefa });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa' });
  }
});

module.exports = router;
