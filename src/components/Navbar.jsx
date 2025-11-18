'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/components/AuthModalContext';
import styles from '@/styles/components/Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { openLogin, openRegister, AuthModalComponent } = useAuthModal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar navbar-expand-lg fixed-top ${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <Link href="/" className={`navbar-brand ${styles.brand}`}>
            <i className="bi bi-lightning-charge-fill me-2"></i>
            PowerGrid Utilities
          </Link>

          <button 
            className={`navbar-toggler ${styles.navbarToggler}`}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link href="/" className={`nav-link ${styles.navLink}`} onClick={() => setIsMenuOpen(false)}>Home</Link></li>
              <li className="nav-item"><Link href="/about" className={`nav-link ${styles.navLink}`} onClick={() => setIsMenuOpen(false)}>About</Link></li>
              <li className="nav-item"><Link href="/services" className={`nav-link ${styles.navLink}`} onClick={() => setIsMenuOpen(false)}>Services</Link></li>
              <li className="nav-item"><Link href="/outage-map" className={`nav-link ${styles.navLink}`} onClick={() => setIsMenuOpen(false)}>Outage Map</Link></li>
              <li className="nav-item"><Link href="/contact" className={`nav-link ${styles.navLink}`} onClick={() => setIsMenuOpen(false)}>Contact</Link></li>

              {isAuthenticated ? (
                <li className="nav-item dropdown">
                  <a className={`nav-link dropdown-toggle ${styles.navLink}`} href="#" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle me-1"></i>{user?.firstName}
                  </a>
                  <ul className={`dropdown-menu ${styles.dropdownMenu}`}>
                    <li><Link href="/dashboard" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></li>
                    <li><Link href="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>My Profile</Link></li>
                    <li><Link href="/bills" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>My Bills</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item">
                  <div className={styles.authButtons}>
                    <button className={`btn btn-outline-primary me-2 ${styles.authBtn}`} onClick={openLogin}>Login</button>
                    <button className={`btn btn-primary ${styles.authBtn}`} onClick={openRegister}>Register</button>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModalComponent />
    </>
  );
}
