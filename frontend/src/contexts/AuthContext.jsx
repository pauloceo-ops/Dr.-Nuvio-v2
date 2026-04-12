import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('@drnuvio:user');
    const storedToken = localStorage.getItem('@drnuvio:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      api.get('/auth/me')
        .then(response => {
          setUser(response.data.user);
          localStorage.setItem('@drnuvio:user', JSON.stringify(response.data.user));
        })
        .catch(() => {
          localStorage.removeItem('@drnuvio:token');
          localStorage.removeItem('@drnuvio:user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;

    localStorage.setItem('@drnuvio:token', token);
    localStorage.setItem('@drnuvio:user', JSON.stringify(user));
    setUser(user);

    return user;
  };

  const register = async (name, email, password, modules) => {
    const response = await api.post('/auth/register', { name, email, password, modules });
    const { user, token } = response.data;

    localStorage.setItem('@drnuvio:token', token);
    localStorage.setItem('@drnuvio:user', JSON.stringify(user));
    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem('@drnuvio:token');
    localStorage.removeItem('@drnuvio:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, signed: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
