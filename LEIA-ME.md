# Dr. Nuvio v2 — Sistema de Gestão Jurídica & Condominial

Sistema web integrado para a advocacia de Paulo Henrique (OAB/RN 16.475) e a Pratika Administradora de Condomínios.

## Como Rodar

### 1. Backend
```bash
cd dr-nuvio/backend
npm install
npm start
```
Servidor: `http://localhost:3001`

### 2. Frontend
```bash
cd dr-nuvio/frontend
npm install
npm run dev
```
Acesse: `http://localhost:5173`

## Módulos

### Jurídico / PJe
- Processos com número CNJ, partes, vara, comarca
- Ranking prioritário (Prazo 40% | Valor 25% | Inércia 20% | Tipo 15%)
- Sistema de semáforo (vermelho/amarelo/verde)
- Petições com fluxo: rascunho → aprovação → protocolo
- 2 estilos de redação: atual (limpo) e histórico (rebuscado)

### Pratika / Superlógica
- 60 condomínios integrados via API Superlógica (/v2/condor/)
- Inadimplência via endpoint /cobranca (2.187 unidades, R$ 12,8 Mi)
- Cruzamento inadimplência × PJe (1.861 sem processo)
- Unidades, financeiro, cadastro

### Tarefas T01-T10
- T01: Triagem Diária (PJe 1º + 2º grau)
- T02: Analisar + Responder (gerar minutas)
- T03: Protocolar (SOMENTE com aprovação do Paulo)
- T04-T06: Baixar docs, Consulta pública, Enriquecer acervo
- T07: Atualizar PDF Memórias (automática 8h)
- T08-T10: Inadimplência Superlógica, Cruzamento PJe, Cadastro

## API Endpoints

### Auth
- `POST /api/auth/register` — Criar conta
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Dados do usuário

### Dashboard
- `GET /api/dashboard/stats` — Estatísticas completas

### Processos
- `GET /api/processos` — Listar (filtros: status, semaforo, tipo, search)
- `GET /api/processos/:id` — Detalhe com movimentações e petições
- `POST /api/processos` — Criar processo
- `POST /api/processos/ranking/recalcular` — Recalcular scores

### Condomínios
- `GET /api/condominios` — Listar
- `GET /api/condominios/:id` — Detalhe com unidades e inadimplência
- `POST /api/condominios` — Criar
- `GET /api/condominios/inadimplencia/resumo` — Resumo geral

### Tarefas
- `GET /api/tarefas` — Listar (T01-T10 + custom)
- `PATCH /api/tarefas/:id` — Atualizar status

## Identidade Visual — Nuvio V3

- Deep Navy: #0A1628
- Ocean Blue: #1B3A5C
- True Blue: #2E86AB
- Cyan Gradient: #4ECDC4 → #7EFADB
- Cloud White: #E8F0F8

## Stack

- React 18 + Tailwind CSS 3 + Vite 5
- Node.js + Express + SQL.js (SQLite)
- JWT auth + Axios
