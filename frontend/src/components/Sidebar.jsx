import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Scale,
  Building2,
  FileText,
  Users,
  DollarSign,
  CheckSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BarChart3,
  FileSignature,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'geral' },

  { type: 'separator', label: 'JURÍDICO', module: 'juridico' },
  { path: '/processos', label: 'Processos PJe', icon: Scale, module: 'juridico' },
  { path: '/processos/ranking', label: 'Ranking Prioritário', icon: BarChart3, module: 'juridico', sub: true },
  { path: '/peticoes', label: 'Petições', icon: FileSignature, module: 'juridico' },

  { type: 'separator', label: 'PRATIKA', module: 'condominio' },
  { path: '/condominios', label: 'Condomínios', icon: Building2, module: 'condominio' },
  { path: '/condominios/inadimplencia', label: 'Inadimplência', icon: AlertTriangle, module: 'condominio', sub: true },
  { path: '/condominios/unidades', label: 'Unidades', icon: Users, module: 'condominio', sub: true },
  { path: '/financeiro', label: 'Financeiro', icon: DollarSign, module: 'condominio' },

  { type: 'separator', label: 'SISTEMA', module: 'geral' },
  { path: '/tarefas', label: 'Tarefas (T01-T10)', icon: CheckSquare, module: 'geral' },
  { path: '/configuracoes', label: 'Configurações', icon: Settings, module: 'geral' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const userModules = user?.modules || ['juridico', 'condominio'];

  const filteredItems = menuItems.filter(
    item => item.module === 'geral' || userModules.includes(item.module)
  );

  return (
    <aside className={`fixed left-0 top-0 h-full text-white transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #1B3A5C 100%)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #7EFADB 100%)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l8 4 8-4"/>
            <path d="M4 12l8 4 8-4"/>
            <path d="M4 20l8-4 8 4"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Dr. Nuvio</h1>
            <p className="text-[10px] mt-0.5" style={{ color: '#4ECDC4' }}>Gestão Inteligente</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {filteredItems.map((item, idx) => {
          if (item.type === 'separator') {
            if (collapsed) return null;
            return (
              <div key={idx} className="px-4 pt-4 pb-1">
                <p className="text-[10px] font-semibold tracking-wider" style={{ color: '#4ECDC4' }}>
                  {item.label}
                </p>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg transition-all duration-200
                ${item.sub && !collapsed ? 'ml-6' : ''}
                ${isActive
                  ? 'text-[#0A1628] shadow-lg'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              style={isActive ? { background: 'linear-gradient(135deg, #4ECDC4 0%, #7EFADB 100%)' } : {}}
            >
              <Icon size={item.sub ? 16 : 18} className="flex-shrink-0" />
              {!collapsed && (
                <span className={`text-sm ${item.sub ? 'text-xs' : 'font-medium'}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#0A1628]"
              style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #7EFADB 100%)' }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 truncate">{user.oab || user.email}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all text-sm"
          >
            <LogOut size={18} />
            {!collapsed && 'Sair'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
