import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Scale, Building2 } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oab, setOab] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modules, setModules] = useState(['juridico', 'condominio']);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleModule = (mod) => {
    setModules(prev => prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) { setError('As senhas não coincidem'); return; }
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres'); return; }
    if (modules.length === 0) { setError('Selecione pelo menos um módulo'); return; }

    setLoading(true);
    try {
      await register(name, email, password, modules);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#E8F0F8' }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #7EFADB 100%)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l8 4 8-4"/><path d="M4 12l8 4 8-4"/><path d="M4 20l8-4 8 4"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#0A1628' }}>Dr. Nuvio</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#2E86AB]/10 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#0A1628' }}>Criar conta</h2>
            <p className="mt-1" style={{ color: '#1B3A5C80' }}>Preencha seus dados para começar</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B3A5C' }}>Nome completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1B3A5C80' }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Paulo Henrique Marques" required
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#2E86AB30' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B3A5C' }}>Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1B3A5C80' }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#2E86AB30' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B3A5C' }}>OAB (opcional)</label>
                <input type="text" value={oab} onChange={(e) => setOab(e.target.value)} placeholder="OAB/RN 16.475"
                  className="w-full px-4 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#2E86AB30' }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B3A5C' }}>Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1B3A5C80' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#2E86AB30' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B3A5C' }}>Confirmar</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1B3A5C80' }} />
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" required className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none text-sm" style={{ borderColor: '#2E86AB30' }} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: '#1B3A5C60' }} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPassword ? 'Ocultar senhas' : 'Mostrar senhas'}
            </div>

            {/* Module selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1B3A5C' }}>Módulos de acesso</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => toggleModule('juridico')}
                  className={`p-3 rounded-lg border-2 text-left transition-all`}
                  style={{ borderColor: modules.includes('juridico') ? '#2E86AB' : '#2E86AB20',
                           background: modules.includes('juridico') ? '#2E86AB10' : 'transparent' }}>
                  <Scale size={20} style={{ color: modules.includes('juridico') ? '#2E86AB' : '#1B3A5C60' }} />
                  <p className="text-sm font-medium mt-1" style={{ color: modules.includes('juridico') ? '#2E86AB' : '#1B3A5C' }}>Jurídico / PJe</p>
                  <p className="text-[10px]" style={{ color: '#1B3A5C60' }}>Processos e petições</p>
                </button>

                <button type="button" onClick={() => toggleModule('condominio')}
                  className={`p-3 rounded-lg border-2 text-left transition-all`}
                  style={{ borderColor: modules.includes('condominio') ? '#4ECDC4' : '#4ECDC420',
                           background: modules.includes('condominio') ? '#4ECDC410' : 'transparent' }}>
                  <Building2 size={20} style={{ color: modules.includes('condominio') ? '#0A1628' : '#1B3A5C60' }} />
                  <p className="text-sm font-medium mt-1" style={{ color: modules.includes('condominio') ? '#0A1628' : '#1B3A5C' }}>Pratika</p>
                  <p className="text-[10px]" style={{ color: '#1B3A5C60' }}>60 condomínios + Superlógica</p>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full text-sm py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #7EFADB 100%)', color: '#0A1628' }}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#1B3A5C80' }}>
            Já tem conta? <Link to="/login" className="font-medium" style={{ color: '#2E86AB' }}>Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
