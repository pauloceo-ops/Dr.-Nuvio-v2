const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../', process.env.DB_PATH || './database.sqlite');

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // ========================
  // USUARIOS
  // ========================
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'advogado',
      oab TEXT,
      modules TEXT DEFAULT '["juridico","condominio"]',
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ========================
  // PROCESSOS PJe
  // ========================
  db.run(`
    CREATE TABLE IF NOT EXISTS processos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_cnj TEXT UNIQUE,
      titulo TEXT NOT NULL,
      classe TEXT,
      assunto TEXT,
      vara TEXT,
      comarca TEXT DEFAULT 'Natal/RN',
      instancia TEXT DEFAULT '1g',
      polo_ativo TEXT,
      polo_ativo_doc TEXT,
      polo_passivo TEXT,
      polo_passivo_doc TEXT,
      tipo TEXT,
      status TEXT DEFAULT 'em_andamento',
      valor_causa REAL,
      data_distribuicao DATE,
      prazo_proximo DATE,
      prazo_tipo TEXT,
      ultima_movimentacao TEXT,
      data_ultima_mov DATE,
      score_prazo REAL DEFAULT 0,
      score_valor REAL DEFAULT 0,
      score_inercia REAL DEFAULT 0,
      score_tipo REAL DEFAULT 0,
      score_total REAL DEFAULT 0,
      semaforo TEXT DEFAULT 'verde',
      estilo_redacao TEXT DEFAULT 'atual',
      condominio_id INTEGER,
      responsavel_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS movimentacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      processo_id INTEGER,
      data DATE NOT NULL,
      tipo TEXT,
      descricao TEXT NOT NULL,
      requer_acao INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ========================
  // CONDOMINIOS (Superlógica)
  // ========================
  db.run(`
    CREATE TABLE IF NOT EXISTS condominios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_superlogica INTEGER,
      nome TEXT NOT NULL,
      cnpj TEXT,
      endereco TEXT,
      sindico_nome TEXT,
      sindico_telefone TEXT,
      total_unidades INTEGER DEFAULT 0,
      taxa_condominio REAL DEFAULT 0,
      taxa_juros REAL DEFAULT 0,
      taxa_multa REAL DEFAULT 0,
      status TEXT DEFAULT 'ativo',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS unidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_superlogica INTEGER,
      condominio_id INTEGER,
      numero TEXT NOT NULL,
      bloco TEXT,
      proprietario_nome TEXT,
      proprietario_cpf TEXT,
      proprietario_telefone TEXT,
      proprietario_email TEXT,
      status TEXT DEFAULT 'adimplente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ========================
  // INADIMPLENCIA (Superlógica → /v2/condor/cobranca)
  // ========================
  db.run(`
    CREATE TABLE IF NOT EXISTS inadimplencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      condominio_id INTEGER,
      unidade_id INTEGER,
      id_superlogica_cobranca INTEGER,
      sacado_nome TEXT,
      sacado_cpf TEXT,
      valor_original REAL,
      valor_atualizado REAL,
      data_vencimento DATE,
      data_pagamento DATE,
      fl_status TEXT DEFAULT '1',
      tem_processo INTEGER DEFAULT 0,
      processo_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ========================
  // FINANCEIRO CONDOMINIAL
  // ========================
  db.run(`
    CREATE TABLE IF NOT EXISTS financeiro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      condominio_id INTEGER,
      unidade_id INTEGER,
      tipo TEXT NOT NULL,
      categoria TEXT,
      descricao TEXT,
      valor REAL NOT NULL,
      data_vencimento DATE,
      data_pagamento DATE,
      status TEXT DEFAULT 'pendente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ========================
  // TAREFAS (T01-T10)
  // ========================
  db.run(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      modulo TEXT DEFAULT 'geral',
      tipo TEXT DEFAULT 'manual',
      prioridade TEXT DEFAULT 'media',
      status TEXT DEFAULT 'pendente',
      data_limite DATE,
      processo_id INTEGER,
      condominio_id INTEGER,
      responsavel_id INTEGER,
      created_by INTEGER,
      resultado TEXT,
      cron_expression TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ========================
  // PETICOES GERADAS
  // ========================
  db.run(`
    CREATE TABLE IF NOT EXISTS peticoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      processo_id INTEGER,
      titulo TEXT NOT NULL,
      tipo TEXT,
      estilo TEXT DEFAULT 'atual',
      status TEXT DEFAULT 'rascunho',
      arquivo_path TEXT,
      aprovado_por TEXT,
      data_aprovacao DATETIME,
      data_protocolo DATETIME,
      numero_protocolo TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ========================
  // SEED: Tarefas padrão T01-T10
  // ========================
  const tarefaCount = prepare('SELECT COUNT(*) as count FROM tarefas WHERE codigo IS NOT NULL').get()?.count || 0;
  if (tarefaCount === 0) {
    const tarefasSeed = [
      { codigo: 'T01', titulo: 'Triagem Diária', descricao: 'Acessa PJe-TJRN e lista intimações pendentes + prazos (1º e 2º grau)', modulo: 'juridico', tipo: 'manual' },
      { codigo: 'T02', titulo: 'Analisar + Responder', descricao: 'Analisa processos no PJe e gera minutas .docx para aprovação', modulo: 'juridico', tipo: 'manual' },
      { codigo: 'T03', titulo: 'Protocolar', descricao: 'Envia petição APROVADA ao PJe. NUNCA sem aprovação do Paulo.', modulo: 'juridico', tipo: 'manual' },
      { codigo: 'T04', titulo: 'Baixar Documentos', descricao: 'Baixa peças de processo PJe e organiza na pasta', modulo: 'juridico', tipo: 'manual' },
      { codigo: 'T05', titulo: 'Consulta Pública', descricao: 'Busca no PJe com filtros para relatórios gerenciais', modulo: 'juridico', tipo: 'manual' },
      { codigo: 'T06', titulo: 'Enriquecer Acervo', descricao: 'Complementa dados de partes nos processos do acervo', modulo: 'juridico', tipo: 'manual' },
      { codigo: 'T07', titulo: 'Atualizar PDF Memórias', descricao: 'Regenera PDF consolidado do Dr. Nuvio (automática 8h)', modulo: 'geral', tipo: 'automatica', cron_expression: '0 8 * * *' },
      { codigo: 'T08', titulo: 'Extrair Inadimplência', descricao: 'Exporta inadimplência do Superlógica via /v2/condor/cobranca', modulo: 'condominio', tipo: 'manual' },
      { codigo: 'T09', titulo: 'Cruzar Inadimplência × PJe', descricao: 'Cruza devedores Superlógica com processos PJe', modulo: 'condominio', tipo: 'manual' },
      { codigo: 'T10', titulo: 'Cadastrar Condomínio', descricao: 'Registra novo condomínio via API Superlógica', modulo: 'condominio', tipo: 'manual' },
    ];

    for (const t of tarefasSeed) {
      prepare('INSERT INTO tarefas (codigo, titulo, descricao, modulo, tipo, status) VALUES (?, ?, ?, ?, ?, ?)')
        .run(t.codigo, t.titulo, t.descricao, t.modulo, t.tipo, 'ativo');
    }
  }

  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function prepare(sql) {
  return {
    run(...params) {
      db.run(sql, params);
      saveDb();
      const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
      return { lastInsertRowid: lastId, changes: db.getRowsModified() };
    },
    get(...params) {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const cols = stmt.getColumnNames();
        const vals = stmt.get();
        stmt.free();
        const row = {};
        cols.forEach((col, i) => row[col] = vals[i]);
        return row;
      }
      stmt.free();
      return undefined;
    },
    all(...params) {
      const results = [];
      const stmt = db.prepare(sql);
      stmt.bind(params);
      while (stmt.step()) {
        const cols = stmt.getColumnNames();
        const vals = stmt.get();
        const row = {};
        cols.forEach((col, i) => row[col] = vals[i]);
        results.push(row);
      }
      stmt.free();
      return results;
    }
  };
}

module.exports = { getDb, saveDb, prepare };
