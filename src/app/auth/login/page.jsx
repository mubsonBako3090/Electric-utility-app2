'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/styles/Login.module.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className={styles.authPage}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className={styles.authCard}>
                <div className={styles.authHeader}>
                  <i className="bi bi-person-circle"></i>
                  <h2>Customer Login</h2>
                  <p>Access your account to manage services and bills</p>
                </div>

                {error && (
                  <div className={`alert alert-danger ${styles.alert}`}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className={styles.inputGroup}>
                      <i className="bi bi-envelope"></i>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className={styles.inputGroup}>
                      <i className="bi bi-lock"></i>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  <div className={styles.authOptions}>
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        id="rememberMe" 
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <a href="/auth/forgot-password" className={styles.forgotLink}>
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary w-100 ${styles.authButton}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className={styles.authFooter}>
                  <p>
                    Don't have an account?{' '}
                    <a href="/auth/register" className={styles.switchLink}>
                      Create one here
                    </a>
                  </p>
                </div>

                <div className={styles.socialAuth}>
                  <div className={styles.divider}>
                    <span>Or continue with</span>
                  </div>
                  <div className={styles.socialButtons}>
                    <button className={`btn btn-outline-secondary ${styles.socialButton}`}>
                      <i className="bi bi-google"></i>
                      Google
                    </button>
                    <button className={`btn btn-outline-secondary ${styles.socialButton}`}>
                      <i className="bi bi-facebook"></i>
                      Facebook
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}