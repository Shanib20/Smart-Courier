import { useState } from 'react';
import { AuthContext } from './AuthContextValue';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
    name: localStorage.getItem('name') || null,
    userId: localStorage.getItem('userId') || null,
  });

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('name', data.name);
    localStorage.setItem('userId', data.userId);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    setUser({ token: null, role: null, name: null, userId: null });
  };

  const isAdmin = () => {
    return user.role === 'ADMIN';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
