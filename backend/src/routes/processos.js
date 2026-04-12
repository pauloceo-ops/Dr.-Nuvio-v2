const express = require('express');
const router = express.Router();
const { prepare } = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// List all processos with optional filters
router.get('/', (req, res) => {
  try {
    const { status, semaforo, tipo, search, sort } = req.query;
    let sql = 'SELECT * FROM processos WHERE 1=1';
    const params = [];

    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (semaforo) { sql += ' AND semaforo = ?'; params.push(semaforo); }
    if (tipo) { sql += ' AND tipo = ?'; params.push(tipo); }
    if (search) {
      sql += ' AND (numero_cnj LIKE ? OR titulo LIKE ? OR polo_ativo LIKE ? OR polo_passivo LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += sort === 'prazo' ? ' ORDER BY prazo_proximo ASC' : ' ORDER BY score_total DESC, prazo_proximo ASC';

    const processos = prepare(sql).all(...params);
    res.json({ processos, total: processos.length });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar processos' });
  }
});

// Get single processo
router.get('/:id', (req, res) => {
  try {
    const processo = prepare('SELECT * FROM processos WHERE id = ?').get(req.params.id);
    if (!processo) return res.status(404).json({ error: 'Processo não encontrado' });

    const movimentacoes = prepare('SELECT * FROM movimentacoes WHERE processo_id = ? ORDER BY data DESC').all(req.params.id);
    const peticoes = prepare('SELECT * FROM peticoes WHERE processo_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({ processo, movimentacoes, peticoes });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar processo' });
  }
});

// Create processo
router.post('/', (req, res) => {
  try {
    const { numero_cnj, titulo, classe, assunto, vara, comarca, instancia, polo_ativo, polo_ativo_doc, polo_passivo, polo_passivo_doc, tipo, valor_causa, data_distribuicao, prazo_proximo, prazo_tipo, estilo_redacao, condominio_id } = req.body;

    const result = prepare(`
      INSERT INTO processos (numero_cnj, titulo, classe, assunto, vara, comarca, instancia, polo_ativo, polo_ativo_doc, polo_passivo, polo_passivo_doc, tipo, valor_causa, data_distribuicao, prazo_proximo, prazo_tipo, estilo_redacao, condominio_id, responsavel_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(numero_cnj, titulo, classe, assunto, vara, comarca || 'Natal/RN', instancia || '1g', polo_ativo, polo_ativo_doc, polo_passivo, polo_passivo_doc, tipo, valor_causa, data_distribuicao, prazo_proximo, prazo_tipo, estilo_redacao || 'atual', condominio_id, req.userId);

    const processo = prepare('SELECT * FROM processos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ processo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar processo' });
  }
});

// Ranking: recalculate scores
router.post('/ranking/recalcular', (req, res) => {
  try {
    const processos = prepare("SELECT * FROM processos WHERE status = 'em_andamento'").all();
    let updated = 0;

    for (const p of processos) {
      // Prazo (40%)
      let scorePrazo = 0;
      if (p.prazo_proximo) {
        const dias = Math.floor((new Date(p.prazo_proximo) - new Date()) / (1000 * 60 * 60 * 24));
        if (dias < 0) scorePrazo = 100;
        else if (dias <= 2) scorePrazo = 90;
        else if (dias <= 5) scorePrazo = 70;
        else if (dias <= 15) scorePrazo = 50;
        else if (dias <= 30) scorePrazo = 30;
        else scorePrazo = 10;
      }

      // Valor (25%)
      let scoreValor = 0;
      const v = p.valor_causa || 0;
      if (v > 100000) scoreValor = 100;
      else if (v > 50000) scoreValor = 80;
      else if (v > 20000) scoreValor = 60;
      else if (v > 5000) scoreValor = 40;
      else scoreValor = 20;

      // Inércia (20%)
      let scoreInercia = 0;
      if (p.data_ultima_mov) {
        const diasInercia = Math.floor((new Date() - new Date(p.data_ultima_mov)) / (1000 * 60 * 60 * 24));
        if (diasInercia > 180) scoreInercia = 100;
        else if (diasInercia > 90) scoreInercia = 70;
        else if (diasInercia > 30) scoreInercia = 40;
        else scoreInercia = 10;
      }

      // Tipo (15%)
      let scoreTipo = 50;
      const tiposAltos = ['execucao', 'embargo', 'agravo', 'apelacao', 'recurso'];
      if (tiposAltos.some(t => (p.tipo || '').toLowerCase().includes(t))) scoreTipo = 80;

      const total = (scorePrazo * 0.4) + (scoreValor * 0.25) + (scoreInercia * 0.2) + (scoreTipo * 0.15);
      let semaforo = 'verde';
      if (scorePrazo >= 70 || total >= 55) semaforo = 'vermelho';
      else if (total >= 35) semaforo = 'amarelo';

      prepare(`UPDATE processos SET score_prazo=?, score_valor=?, score_inercia=?, score_tipo=?, score_total=?, semaforo=? WHERE id=?`)
        .run(scorePrazo, scoreValor, scoreInercia, scoreTipo, total, semaforo, p.id);
      updated++;
    }

    res.json({ message: `Ranking recalculado: ${updated} processos atualizados` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao recalcular ranking' });
  }
});

module.exports = router;
