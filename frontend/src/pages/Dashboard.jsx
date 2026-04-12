import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Scale,
  Building2,
  FileText,
  AlertTriangle,
  CheckSquare,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  FileSignature,
  BarChart3,
  Zap,
  Users,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('geral');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  const semaforoColors = {
    vermelho: 'bg-red-500',
    amarelo: 'bg-amber-400',
    verde: 'bg-emerald-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '3px solid #E8F0F8', borderTopColor: '#4ECDC4' }}></div>
      </div>
    );
  }

  const tabs = [
    { id: 'geral', label: 'Visão Geral' },
    { id: 'juridico', label: 'Jurídico / PJe' },
    { id: 'condominio', label: 'Pratika / Superlógica' },
    { id: 'tarefas', label: 'Tarefas' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628]">
          Olá, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-[#1B3A5C]/50 mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white p-1 rounded-lg w-fit border border-[#2E86AB]/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-[#0A1628] shadow-sm'
                : 'text-[#1B3A5C]/50 hover:text-[#1B3A5C]'
            }`}
            style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #4ECDC4 0%, #7EFADB 100%)' } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== VISÃO GERAL ===================== */}
      {activeTab === 'geral' && (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Processos Ativos"
              value={stats?.juridico?.processosAtivos || 0}
              subtitle={`${stats?.juridico?.totalProcessos || 0} total no acervo`}
              icon={Scale}
              color="navy"
            />
            <StatCard
              title="Prazos em 7 dias"
              value={stats?.juridico?.prazosProximos || 0}
              subtitle={stats?.juridico?.prazosVencidos > 0 ? `${stats.juridico.prazosVencidos} vencidos!` : 'Nenhum vencido'}
              icon={Clock}
              color={stats?.juridico?.prazosVencidos > 0 ? 'red' : 'green'}
            />
            <StatCard
              title="Condomínios Pratika"
              value={stats?.condominio?.totalCondominios || 0}
              subtitle={`${stats?.condominio?.totalUnidades || 0} unidades`}
              icon={Building2}
              color="blue"
            />
            <StatCard
              title="Inadimplência"
              value={formatCurrency(stats?.condominio?.inadimplencia?.valor)}
              subtitle={`${stats?.condominio?.inadimplencia?.total || 0} unidades | ${stats?.condominio?.inadimplencia?.semProcesso || 0} sem ação`}
              icon={AlertTriangle}
              color={stats?.condominio?.inadimplencia?.total > 0 ? 'orange' : 'green'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Semáforo Ranking */}
            <div className="bg-white rounded-xl border border-[#2E86AB]/10 p-6">
              <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
                <BarChart3 size={18} style={{ color: '#2E86AB' }} />
                Ranking Prioritário
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-2xl font-bold text-[#0A1628]">{stats?.juridico?.ranking?.vermelhos || 0}</span>
                  <span className="text-xs text-[#1B3A5C]/50">urgentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400"></div>
                  <span className="text-2xl font-bold text-[#0A1628]">{stats?.juridico?.ranking?.amarelos || 0}</span>
                  <span className="text-xs text-[#1B3A5C]/50">atenção</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <span className="text-2xl font-bold text-[#0A1628]">{stats?.juridico?.ranking?.verdes || 0}</span>
                  <span className="text-xs text-[#1B3A5C]/50">ok</span>
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E8F0F8] overflow-hidden flex">
                {(() => {
                  const total = (stats?.juridico?.ranking?.vermelhos || 0) + (stats?.juridico?.ranking?.amarelos || 0) + (stats?.juridico?.ranking?.verdes || 0);
                  if (total === 0) return <div className="h-full w-full bg-[#E8F0F8]"></div>;
                  return (
                    <>
                      <div className="h-full bg-red-500" style={{ width: `${(stats?.juridico?.ranking?.vermelhos / total) * 100}%` }}></div>
                      <div className="h-full bg-amber-400" style={{ width: `${(stats?.juridico?.ranking?.amarelos / total) * 100}%` }}></div>
                      <div className="h-full bg-emerald-500" style={{ width: `${(stats?.juridico?.ranking?.verdes / total) * 100}%` }}></div>
                    </>
                  );
                })()}
              </div>
              <p className="text-xs text-[#1B3A5C]/40 mt-2">Prazo 40% | Valor 25% | Inércia 20% | Tipo 15%</p>
            </div>

            {/* Petições */}
            <div className="bg-white rounded-xl border border-[#2E86AB]/10 p-6">
              <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
                <FileSignature size={18} style={{ color: '#2E86AB' }} />
                Petições
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1B3A5C]/60">Rascunhos</span>
                  <span className="text-sm font-semibold text-[#0A1628]">{stats?.peticoes?.rascunho || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1B3A5C]/60 flex items-center gap-1">
                    <Zap size={12} className="text-amber-500" />
                    Aguardando aprovação
                  </span>
                  <span className="text-sm font-bold text-amber-600">{stats?.peticoes?.aguardandoAprovacao || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1B3A5C]/60">Protocoladas</span>
                  <span className="text-sm font-semibold text-emerald-600">{stats?.peticoes?.protocoladas || 0}</span>
                </div>
              </div>
            </div>

            {/* Financeiro */}
            <div className="bg-white rounded-xl border border-[#2E86AB]/10 p-6">
              <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
                <DollarSign size={18} style={{ color: '#4ECDC4' }} />
                Financeiro do Mês
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1B3A5C]/60">Receitas</span>
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(stats?.financeiro?.receitasMes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#1B3A5C]/60">Despesas</span>
                  <span className="text-sm font-semibold text-red-500">{formatCurrency(stats?.financeiro?.despesasMes)}</span>
                </div>
                <div className="border-t border-[#E8F0F8] pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-[#0A1628]">Saldo</span>
                  <span className={`text-lg font-bold ${(stats?.financeiro?.saldo || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(stats?.financeiro?.saldo)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos Prazos */}
          <div className="bg-white rounded-xl border border-[#2E86AB]/10 p-6">
            <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
              <Calendar size={18} style={{ color: '#2E86AB' }} />
              Próximos Prazos Processuais
            </h3>

            {stats?.proximosPrazos?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#1B3A5C]/40 text-xs border-b border-[#E8F0F8]">
                      <th className="pb-2 font-medium w-6"></th>
                      <th className="pb-2 font-medium">Processo</th>
                      <th className="pb-2 font-medium">Título</th>
                      <th className="pb-2 font-medium">Prazo</th>
                      <th className="pb-2 font-medium">Tipo</th>
                      <th className="pb-2 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.proximosPrazos.map(proc => (
                      <tr key={proc.id} className="border-b border-[#E8F0F8]/50 hover:bg-[#E8F0F8]/30">
                        <td className="py-2.5">
                          <div className={`w-3 h-3 rounded-full ${semaforoColors[proc.semaforo] || 'bg-slate-300'}`}></div>
                        </td>
                        <td className="py-2.5 font-mono text-xs" style={{ color: '#2E86AB' }}>{proc.numero_cnj || '-'}</td>
                        <td className="py-2.5 text-[#0A1628]">{proc.titulo}</td>
                        <td className="py-2.5 text-[#1B3A5C]/70">{formatDate(proc.prazo_proximo)}</td>
                        <td className="py-2.5 text-xs text-[#1B3A5C]/50">{proc.prazo_tipo || '-'}</td>
                        <td className="py-2.5">
                          <span className="text-xs font-mono font-bold text-[#0A1628]">{proc.score_total?.toFixed(0) || 0}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#1B3A5C]/30">
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum prazo próximo cadastrado</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================== JURÍDICO ===================== */}
      {activeTab === 'juridico' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total de Processos" value={stats?.juridico?.totalProcessos || 0} icon={FileText} color="navy" />
            <StatCard title="Processos Ativos" value={stats?.juridico?.processosAtivos || 0} icon={Scale} color="blue" />
            <StatCard title="Prazos em 7 dias" value={stats?.juridico?.prazosProximos || 0} icon={Clock} color="orange" />
            <StatCard title="Prazos Vencidos" value={stats?.juridico?.prazosVencidos || 0} icon={AlertTriangle} color="red" />
          </div>

          {/* Processos urgentes */}
          <div className="bg-white rounded-xl border border-[#2E86AB]/10 p-6">
            <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
              <BarChart3 size={18} style={{ color: '#2E86AB' }} />
              Top 10 — Ranking Prioritário
            </h3>

            {stats?.juridico?.processosUrgentes?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#1B3A5C]/40 text-xs border-b border-[#E8F0F8]">
                      <th className="pb-2 w-6"></th>
                      <th className="pb-2 font-medium">CNJ</th>
                      <th className="pb-2 font-medium">Título</th>
                      <th className="pb-2 font-medium">Polo Ativo</th>
                      <th className="pb-2 font-medium">Vara</th>
                      <th className="pb-2 font-medium">Prazo</th>
                      <th className="pb-2 font-medium text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.juridico.processosUrgentes.map((p, i) => (
                      <tr key={p.id} className="border-b border-[#E8F0F8]/50 hover:bg-[#E8F0F8]/30">
                        <td className="py-2.5"><div className={`w-3 h-3 rounded-full ${semaforoColors[p.semaforo]}`}></div></td>
                        <td className="py-2.5 font-mono text-xs" style={{ color: '#2E86AB' }}>{p.numero_cnj || '-'}</td>
                        <td className="py-2.5 text-[#0A1628] font-medium">{p.titulo}</td>
                        <td className="py-2.5 text-[#1B3A5C]/70 text-xs">{p.polo_ativo || '-'}</td>
                        <td className="py-2.5 text-[#1B3A5C]/50 text-xs">{p.vara || '-'}</td>
                        <td className="py-2.5 text-[#1B3A5C]/70">{formatDate(p.prazo_proximo)}</td>
                        <td className="py-2.5 text-right">
                          <span className="font-mono font-bold text-[#0A1628]">{p.score_total?.toFixed(0)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#1B3A5C]/30">
                <Scale size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum processo cadastrado ainda</p>
                <p className="text-xs mt-1">Use a tarefa T01 para fazer a triagem do PJe</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================== PRATIKA / CONDOMÍNIO ===================== */}
      {activeTab === 'condominio' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Condomínios" value={stats?.condominio?.totalCondominios || 0} icon={Building2} color="blue" />
            <StatCard title="Unidades" value={stats?.condominio?.totalUnidades || 0} icon={Users} color="cyan" />
            <StatCard title="Inadimplentes" value={stats?.condominio?.inadimplencia?.total || 0} subtitle={formatCurrency(stats?.condominio?.inadimplencia?.valor)} icon={AlertTriangle} color="red" />
            <StatCard title="Sem Processo Judicial" value={stats?.condominio?.inadimplencia?.semProcesso || 0} subtitle="Candidatos a ajuizamento" icon={Scale} color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#2E86AB]/10 p-6">
              <h3 className="font-semibold text-[#0A1628] mb-4">Integração Superlógica</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[#1B3A5C]/70">API Conectada — /v2/condor/</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[#1B3A5C]/70">11 endpoints funcionais</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#4ECDC4' }}></div>
                  <span className="text-[#1B3A5C]/70">/cobranca — fonte principal inadimplência</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#2E86AB]/10 p-6">
              <h3 className="font-semibold text-[#0A1628] mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm hover:bg-[#E8F0F8] transition-all text-[#1B3A5C]">
                  T08 — Extrair inadimplência do Superlógica
                </button>
                <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm hover:bg-[#E8F0F8] transition-all text-[#1B3A5C]">
                  T09 — Cruzar inadimplência × PJe
                </button>
                <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm hover:bg-[#E8F0F8] transition-all text-[#1B3A5C]">
                  T10 — Cadastrar novo condomínio
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===================== TAREFAS ===================== */}
      {activeTab === 'tarefas' && (
        <div className="bg-white rounded-xl border border-[#2E86AB]/10 p-6">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2 mb-4">
            <CheckSquare size={18} style={{ color: '#2E86AB' }} />
            Tarefas do Sistema (T01–T10)
          </h3>
          <p className="text-xs text-[#1B3A5C]/40 mb-4">T01 Triagem → T02 Análise + Minuta → Paulo aprova → T03 Protocolar</p>

          <div className="space-y-2">
            {stats?.tarefas?.sistema?.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#E8F0F8]/50 transition-all border border-[#E8F0F8]">
                <span className="font-mono text-xs font-bold px-2 py-1 rounded"
                  style={{ background: t.modulo === 'juridico' ? '#2E86AB20' : t.modulo === 'condominio' ? '#4ECDC420' : '#1B3A5C10',
                           color: t.modulo === 'juridico' ? '#2E86AB' : t.modulo === 'condominio' ? '#0A1628' : '#1B3A5C' }}>
                  {t.codigo}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0A1628]">{t.titulo}</p>
                  <p className="text-xs text-[#1B3A5C]/40">{t.descricao}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  t.tipo === 'automatica' ? 'bg-purple-100 text-purple-600' : 'bg-[#E8F0F8] text-[#1B3A5C]/60'
                }`}>
                  {t.tipo === 'automatica' ? `Auto ${t.cron_expression || ''}` : 'Manual'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  t.modulo === 'juridico' ? 'bg-[#2E86AB]/10 text-[#2E86AB]' :
                  t.modulo === 'condominio' ? 'bg-[#4ECDC4]/20 text-[#0A1628]' :
                  'bg-[#1B3A5C]/10 text-[#1B3A5C]'
                }`}>
                  {t.modulo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
