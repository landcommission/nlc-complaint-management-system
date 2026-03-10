import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('cms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    const savedUser = localStorage.getItem('cms_user');

    if (token && savedUser && savedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user data in localStorage:", error);
        localStorage.removeItem('cms_user');
        localStorage.removeItem('cms_token');
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });

    if (res.data?.token && res.data?.user) {
      localStorage.setItem('cms_token', res.data.token);
      localStorage.setItem('cms_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }

    return res.data;
  };

  const register = async (name, email, password, phone) => {
    const res = await API.post('/auth/register', { name, email, password, phone });

    if (res.data?.token && res.data?.user) {
      localStorage.setItem('cms_token', res.data.token);
      localStorage.setItem('cms_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { API };