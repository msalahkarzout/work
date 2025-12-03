import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import './Dashboard.css';

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const isAdmin = currentUser.roles && currentUser.roles.includes('ROLE_ADMIN');

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Business System</h2>
        <nav>
          <a href="/dashboard" className="active">Dashboard</a>
          {isAdmin && <a href="/users">User Management</a>}
          <a href="/products">Products & Stock</a>
          <a href="/invoices">Invoices</a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="main-content">
        <header className="dashboard-header">
          <h1>Welcome, {currentUser.username}!</h1>
          <p>Role: {currentUser.roles && currentUser.roles.join(', ')}</p>
        </header>

        <div className="dashboard-cards">
          <div className="card">
            <h3>Total Users</h3>
            <p className="card-number">--</p>
            <p className="card-description">Registered users in the system</p>
          </div>

          <div className="card">
            <h3>Products</h3>
            <p className="card-number">--</p>
            <p className="card-description">Total products in stock</p>
          </div>

          <div className="card">
            <h3>Invoices</h3>
            <p className="card-number">--</p>
            <p className="card-description">Total invoices generated</p>
          </div>

          <div className="card">
            <h3>Revenue</h3>
            <p className="card-number">$--</p>
            <p className="card-description">Total revenue this month</p>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/products')}>
              Add New Product
            </button>
            <button className="action-btn" onClick={() => navigate('/invoices')}>
              Create Invoice
            </button>
            {isAdmin && (
              <button className="action-btn" onClick={() => navigate('/users')}>
                Manage Users
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
