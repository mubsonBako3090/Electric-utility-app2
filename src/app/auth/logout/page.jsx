'use client';
import { useEffect, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from '@/styles/pages/Auth.module.css';

export default function LogoutPage() {
  const { logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      
      // Optional: Show confirmation message
      setTimeout(() => {
        router.push('/');
      }, 2000);
    };

    performLogout();
  }, [logout, router]);

  return (
    <div className={styles.logoutContainer}>
      <div className={styles.logoutContent}>
        <div className={styles.logoutIcon}>
          <i className="bi bi-box-arrow-right"></i>
        </div>
        <h1>Logging Out...</h1>
        <p>You are being safely logged out of your account.</p>
        <div className="spinner-border text-primary mt-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
}