'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // -------------------------------------------
  // CHECK AUTH STATUS USING HTTP-ONLY COOKIE
  // -------------------------------------------
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // ⭐ Important for cookie auth
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------
  // LOGIN
  // -------------------------------------------
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ⭐ allow cookies to be set
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      }

      return { success: false, error: data.message || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // -------------------------------------------
  // REGISTER (ALSO USES COOKIE AUTH)
  // -------------------------------------------
  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      }

      return { success: false, error: data.message || 'Registration failed' };
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // -------------------------------------------
  // LOGOUT
  // -------------------------------------------
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
      router.refresh();
    }
  };

  // -------------------------------------------
  // CONTEXT VALUE
  // -------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user, // ⭐ Now Dashboard will work
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
