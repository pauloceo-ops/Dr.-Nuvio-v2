const express = require('express');
const router = express.Router();
const { prepare } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// List condominios
router.get('/', (req, res) => {
  try {
    const condominios = prepare('SELECT * FROM condominios ORDER BY nome').all();
    res.json({ condominios });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar condomínios' });
  }
});

// Get single condominio with unidades and inadimplência
router.get('/:id', (req, res) => {
  try {
    const cond = prepare('SELECT * FROM condominios WHERE id = ?').get(req.params.id);
    if (!cond) return res.status(404).json({ error: 'Condomínio não encontrado' });

    const unidades = prepare('SELECT * FROM unidades WHERE condominio_id = ? ORDER BY bloco, numero').all(req.params.id);

    const inadimplencia = prepare(`
      SELECT i.*, u.numero, u.bloco, u.proprietario_nome
      FROM inadimplencia i
      LEFT JOIN unidades u ON i.unidade_id = u.id
      WHERE i.condominio_id = ? AND i.fl_status = '1'
      ORDER BY i.valor_original DESC
    `).all(req.params.id);

    const totalInadimplencia = prepare("SELECT COALESCE(SUM(valor_original), 0) as total FROM inadimplencia WHERE condominio_id = ? AND fl_status = '1'").get(req.params.id)?.total || 0;

    res.json({ condominio: cond, unidades, inadimplencia, totalInadimplencia });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar condomínio' });
  }
});

// Create condominio
router.post('/', (req, res) => {
  try {
    const { nome, cnpj, endereco, sindico_nome, sindico_telefone, total_unidades, taxa_condominio, id_superlogica } = req.body;

    const result = prepare(`
      INSERT INTO condominios (nome, cnpj, endereco, sindico_nome, sindico_telefone, total_unidades, taxa_condominio, id_superlogica, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nome, cnpj, endereco, sindico_nome, sindico_telefone, total_unidades || 0, taxa_condominio || 0, id_superlogica, req.userId);

    const cond = prepare('SELECT * FROM condominios WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ condominio: cond });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar condomínio' });
  }
});

// Inadimplência summary across all condominios
router.get('/inadimplencia/resumo', (req, res) => {
  try {
    const resumo = prepare(`
      SELECT c.id, c.nome, c.cnpj,
        COUNT(DISTINCT CASE WHEN i.fl_status = '1' THEN i.unidade_id END) as unidades_inadimplentes,
        COALESCE(SUM(CASE WHEN i.fl_status = '1' THEN i.valor_original ELSE 0 END), 0) as valor_total,
        COUNT(CASE WHEN i.fl_status = '1' AND i.tem_processo = 0 THEN 1 END) as sem_processo,
        COUNT(CASE WHEN i.fl_status = '1' AND i.tem_processo = 1 THEN 1 END) as com_processo
      FROM condominios c
      LEFT JOIN inadimplencia i ON c.id = i.condominio_id
      GROUP BY c.id
      ORDER BY valor_total DESC
    `).all();

    res.json({ resumo });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resumo de inadimplência' });
  }
});

module.exports = router;
