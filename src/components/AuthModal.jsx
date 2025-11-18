'use client';
import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import styles from '@/styles/Login.module.css';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthModal() {
  const { showAuthModal, closeAuth } = useAuth();
  const [mode, setMode] = useState('login');

  if (!showAuthModal) return null;

  return (
    <div className={styles.authModal}>
      <div className={styles.authContent}>
        <button className={styles.closeButton} onClick={closeAuth}>
          <i className="bi bi-x-lg"></i>
        </button>
        {mode === 'login' ? (
          <Login onSwitchToRegister={() => setMode('register')} onClose={closeAuth} />
        ) : (
          <Register onSwitchToLogin={() => setMode('login')} onClose={closeAuth} />
        )}
      </div>
    </div>
  );
}
