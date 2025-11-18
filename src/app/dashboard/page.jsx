'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import NotificationList from '@/components/dashboard/NotificationList';
import Footer from '@/components/Footer';
import styles from '@/styles/Dashboard.module.css';
import BillCard from '@/components/dashboard/BillCard';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch dashboard data
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      // Simulate API call
      const mockData = {
        currentBill: {
          amount: 125.75,
          dueDate: '2024-01-15',
          status: 'pending'
        },
        usage: {
          current: 450,
          previous: 420,
          unit: 'kWh'
        },
        outages: {
          reported: 2,
          resolved: 1
        },
        notifications: [
          {
            id: 1,
            type: 'info',
            message: 'Scheduled maintenance on Jan 20th',
            date: '2024-01-10'
          },
          {
            id: 2,
            type: 'warning',
            message: 'Your bill is due in 5 days',
            date: '2024-01-10'
          }
        ]
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingContainer}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className={styles.unauthorized}>
          <div className="container text-center">
            <i className="bi bi-shield-exclamation"></i>
            <h2>Access Denied</h2>
            <p>Please log in to access your dashboard.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
    
      
      <div className={styles.dashboard}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1>Welcome back, {user?.firstName}!</h1>
                <p className={styles.welcomeSubtitle}>
                  Account: {user?.accountNumber} • {user?.customerType?.charAt(0).toUpperCase() + user?.customerType?.slice(1)} Customer
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className={styles.accountStatus}>
                  <span className={styles.statusBadge}>
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        {dashboardData && (
          <section className="section-padding">
            <div className="container">
              <div className="row">
                <div className="col-md-3 mb-4">
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <i className="bi bi-receipt"></i>
                    </div>
                    <div className={styles.statContent}>
                      <h3>${dashboardData.currentBill.amount}</h3>
                      <p>Current Bill</p>
                      <small>Due {new Date(dashboardData.currentBill.dueDate).toLocaleDateString()}</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3 mb-4">
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <i className="bi bi-lightning"></i>
                    </div>
                    <div className={styles.statContent}>
                      <h3>{dashboardData.usage.current} {dashboardData.usage.unit}</h3>
                      <p>Energy Usage</p>
                      <small>
                        {dashboardData.usage.current > dashboardData.usage.previous ? '↑' : '↓'} 
                        from last month
                      </small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3 mb-4">
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <i className="bi bi-house-exclamation"></i>
                    </div>
                    <div className={styles.statContent}>
                      <h3>{dashboardData.outages.reported}</h3>
                      <p>Reported Outages</p>
                      <small>{dashboardData.outages.resolved} resolved</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3 mb-4">
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                      <i className="bi bi-bell"></i>
                    </div>
                    <div className={styles.statContent}>
                      <h3>{dashboardData.notifications.length}</h3>
                      <p>Notifications</p>
                      <small>Unread alerts</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className={`section-padding bg-light ${styles.actionsSection}`}>
          <div className="container">
            <h2 className="section-title text-center mb-5">Quick Actions</h2>
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className={styles.actionCard}>
                  <i className="bi bi-credit-card"></i>
                  <h4>Pay Bill</h4>
                  <p>Make a payment securely online</p>
                  <button className="btn btn-primary w-100">Pay Now</button>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className={styles.actionCard}>
                  <i className="bi bi-graph-up"></i>
                  <h4>Usage Report</h4>
                  <p>View your energy consumption</p>
                  <button className="btn btn-outline-primary w-100">View Report</button>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className={styles.actionCard}>
                  <i className="bi bi-tools"></i>
                  <h4>Service Request</h4>
                  <p>Request maintenance or repairs</p>
                  <button className="btn btn-outline-primary w-100">Request Service</button>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className={styles.actionCard}>
                  <i className="bi bi-person-gear"></i>
                  <h4>Profile Settings</h4>
                  <p>Update your account information</p>
                  <button className="btn btn-outline-primary w-100">Edit Profile</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        {dashboardData && dashboardData.notifications.length > 0 && (
          <section className="section-padding">
            <div className="container">
              <h2 className="section-title mb-4">Recent Notifications</h2>
              <div className={styles.notifications}>
                {dashboardData.notifications.map(notification => (
                  <div key={notification.id} className={styles.notificationItem}>
                    <div className={styles.notificationIcon}>
                      <i className={`bi bi-${notification.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}`}></i>
                    </div>
                    <div className={styles.notificationContent}>
                      <p>{notification.message}</p>
                      <small>{new Date(notification.date).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}
                    