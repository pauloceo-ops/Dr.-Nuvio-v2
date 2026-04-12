import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding Nuvio V3 */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1B3A5C 100%)' }}>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl" style={{ background: '#4ECDC4' }}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl" style={{ background: '#2E86AB' }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #7EFADB 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l8 4 8-4"/>
                <path d="M4 12l8 4 8-4"/>
                <path d="M4 20l8-4 8 4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dr. Nuvio</h1>
              <p className="text-sm" style={{ color: '#4ECDC4' }}>Gestão Inteligente</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Advocacia &<br/>Administração<br/>Condominial
          </h2>
          <p className="text-lg max-w-md" style={{ color: '#E8F0F8' }}>
            PJe + Superlógica integrados. Processos, petições, inadimplência e 60 condomínios em uma plataforma.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          <div>
            <p className="text-3xl font-bold" style={{ color: '#4ECDC4' }}>528</p>
            <p className="text-sm" style={{ color: '#E8F0F8' }}>Processos</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: '#4ECDC4' }}>60</p>
            <p className="text-sm" style={{ color: '#E8F0F8' }}>Condomínios</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: '#4ECDC4' }}>10</p>
            <p className="text-sm" style={{ color: '#E8F0F8' }}>Tarefas Auto</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ background: '#E8F0F8' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
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
              <h2 className="text-2xl font-bold" style={{ color: '#0A1628' }}>Bem-vindo de volta</h2>
              <p className="mt-1" style={{ color: '#1B3A5C80' }}>Faça login para continuar</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B3A5C' }}>Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1B3A5C80' }} />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com" required
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none transition-all text-sm"
                    style={{ borderColor: '#2E86AB30' }}
                    onFocus={(e) => e.target.style.borderColor = '#4ECDC4'}
                    onBlur={(e) => e.target.style.borderColor = '#2E86AB30'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1B3A5C' }}>Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#1B3A5C80' }} />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none transition-all text-sm"
                    style={{ borderColor: '#2E86AB30' }}
                    onFocus={(e) => e.target.style.borderColor = '#4ECDC4'}
                    onBlur={(e) => e.target.style.borderColor = '#2E86AB30'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#1B3A5C60' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full text-sm py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #4ECDC4 0%, #7EFADB 100%)', color: '#0A1628' }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: '#1B3A5C80' }}>
              Não tem conta?{' '}
              <Link to="/register" className="font-medium" style={{ color: '#2E86AB' }}>Criar conta</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
