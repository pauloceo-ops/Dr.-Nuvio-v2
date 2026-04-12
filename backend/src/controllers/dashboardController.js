const { prepare } = require('../config/database');

exports.getStats = (req, res) => {
  try {
    const userId = req.userId;

    // === JURÍDICO (PJe) ===
    const totalProcessos = prepare('SELECT COUNT(*) as count FROM processos').get()?.count || 0;
    const processosAtivos = prepare("SELECT COUNT(*) as count FROM processos WHERE status = 'em_andamento'").get()?.count || 0;
    const prazosProximos = prepare("SELECT COUNT(*) as count FROM processos WHERE prazo_proximo BETWEEN date('now') AND date('now', '+7 days')").get()?.count || 0;
    const prazosVencidos = prepare("SELECT COUNT(*) as count FROM processos WHERE prazo_proximo < date('now') AND prazo_proximo IS NOT NULL AND status = 'em_andamento'").get()?.count || 0;

    // Ranking semáforo
    const semVermelhos = prepare("SELECT COUNT(*) as count FROM processos WHERE semaforo = 'vermelho'").get()?.count || 0;
    const semAmarelos = prepare("SELECT COUNT(*) as count FROM processos WHERE semaforo = 'amarelo'").get()?.count || 0;
    const semVerdes = prepare("SELECT COUNT(*) as count FROM processos WHERE semaforo = 'verde'").get()?.count || 0;

    // Processos urgentes (top 10 por score)
    const processosUrgentes = prepare(`
      SELECT id, numero_cnj, titulo, polo_ativo, polo_passivo, vara, prazo_proximo,
             score_total, semaforo, tipo, status
      FROM processos
      WHERE status = 'em_andamento'
      ORDER BY score_total DESC, prazo_proximo ASC
      LIMIT 10
    `).all();

    // === CONDOMÍNIO (Superlógica) ===
    const totalCondominios = prepare('SELECT COUNT(*) as count FROM condominios').get()?.count || 0;
    const totalUnidades = prepare('SELECT COUNT(*) as count FROM unidades').get()?.count || 0;

    // Inadimplência
    const totalInadimplentes = prepare("SELECT COUNT(DISTINCT unidade_id) as count FROM inadimplencia WHERE fl_status = '1'").get()?.count || 0;
    const valorInadimplencia = prepare("SELECT COALESCE(SUM(valor_original), 0) as total FROM inadimplencia WHERE fl_status = '1'").get()?.total || 0;
    const inadSemProcesso = prepare("SELECT COUNT(DISTINCT unidade_id) as count FROM inadimplencia WHERE fl_status = '1' AND tem_processo = 0").get()?.count || 0;
    const inadComProcesso = prepare("SELECT COUNT(DISTINCT unidade_id) as count FROM inadimplencia WHERE fl_status = '1' AND tem_processo = 1").get()?.count || 0;

    // === FINANCEIRO ===
    const receitasMes = prepare(`
      SELECT COALESCE(SUM(valor), 0) as total FROM financeiro
      WHERE tipo = 'receita' AND strftime('%Y-%m', data_vencimento) = strftime('%Y-%m', 'now')
    `).get()?.total || 0;

    const despesasMes = prepare(`
      SELECT COALESCE(SUM(valor), 0) as total FROM financeiro
      WHERE tipo = 'despesa' AND strftime('%Y-%m', data_vencimento) = strftime('%Y-%m', 'now')
    `).get()?.total || 0;

    // === TAREFAS (T01-T10) ===
    const tarefasAtivas = prepare("SELECT * FROM tarefas WHERE codigo IS NOT NULL ORDER BY codigo").all();

    const tarefasPendentes = prepare("SELECT COUNT(*) as count FROM tarefas WHERE codigo IS NULL AND status IN ('pendente', 'em_andamento')").get()?.count || 0;

    // === PETIÇÕES ===
    const peticoesRascunho = prepare("SELECT COUNT(*) as count FROM peticoes WHERE status = 'rascunho'").get()?.count || 0;
    const peticoesAprovacao = prepare("SELECT COUNT(*) as count FROM peticoes WHERE status = 'aguardando_aprovacao'").get()?.count || 0;
    const peticoesProtocoladas = prepare("SELECT COUNT(*) as count FROM peticoes WHERE status = 'protocolada'").get()?.count || 0;

    // Próximos prazos
    const proximosPrazos = prepare(`
      SELECT id, numero_cnj, titulo, prazo_proximo, prazo_tipo, semaforo, score_total
      FROM processos
      WHERE prazo_proximo >= date('now') AND status = 'em_andamento'
      ORDER BY prazo_proximo ASC LIMIT 10
    `).all();

    res.json({
      juridico: {
        totalProcessos,
        processosAtivos,
        prazosProximos,
        prazosVencidos,
        ranking: { vermelhos: semVermelhos, amarelos: semAmarelos, verdes: semVerdes },
        processosUrgentes,
      },
      condominio: {
        totalCondominios,
        totalUnidades,
        inadimplencia: {
          total: totalInadimplentes,
          valor: valorInadimplencia,
          semProcesso: inadSemProcesso,
          comProcesso: inadComProcesso,
        },
      },
      financeiro: {
        receitasMes,
        despesasMes,
        saldo: receitasMes - despesasMes,
      },
      tarefas: {
        sistema: tarefasAtivas,
        pendentes: tarefasPendentes,
      },
      peticoes: {
        rascunho: peticoesRascunho,
        aguardandoAprovacao: peticoesAprovacao,
        protocoladas: peticoesProtocoladas,
      },
      proximosPrazos,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
