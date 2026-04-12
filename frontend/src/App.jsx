import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function PrivateRoute() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#E8F0F8' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-3"
            style={{ border: '3px solid #E8F0F8', borderTopColor: '#4ECDC4' }}></div>
          <p className="text-sm" style={{ color: '#1B3A5C80' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!signed) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen" style={{ background: '#E8F0F8' }}>
      <Sidebar />
      <main className="flex-1 ml-64 p-6 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}

function PublicRoute() {
  const { signed, loading } = useAuth();
  if (loading) return null;
  if (signed) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function ComingSoon({ title, description }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #4ECDC420 0%, #7EFADB20 100%)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E86AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l8 4 8-4"/><path d="M4 12l8 4 8-4"/><path d="M4 20l8-4 8 4"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#0A1628' }}>{title}</h2>
        <p className="text-sm" style={{ color: '#1B3A5C80' }}>{description || 'Este módulo está em desenvolvimento.'}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/processos" element={<ComingSoon title="Processos PJe" description="CRUD de processos com integração PJe, ranking prioritário e semáforo." />} />
            <Route path="/processos/ranking" element={<ComingSoon title="Ranking Prioritário" description="Prazo 40% | Valor 25% | Inércia 20% | Tipo 15% — Sistema de semáforo." />} />
            <Route path="/peticoes" element={<ComingSoon title="Petições" description="Geração de minutas, controle de aprovação e protocolo." />} />
            <Route path="/condominios" element={<ComingSoon title="Condomínios Pratika" description="60 condomínios integrados ao Superlógica." />} />
            <Route path="/condominios/inadimplencia" element={<ComingSoon title="Inadimplência" description="2.187 unidades inadimplentes | 1.861 sem processo | R$ 12,8 Mi." />} />
            <Route path="/condominios/unidades" element={<ComingSoon title="Unidades" description="Cadastro de unidades e proprietários por condomínio." />} />
            <Route path="/financeiro" element={<ComingSoon title="Financeiro" description="Receitas, despesas e balanço condominial." />} />
            <Route path="/tarefas" element={<ComingSoon title="Tarefas T01-T10" description="Fluxo: T01 Triagem → T02 Análise → Paulo aprova → T03 Protocolar." />} />
            <Route path="/configuracoes" element={<ComingSoon title="Configurações" description="API Superlógica, credenciais PJe, preferências." />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
