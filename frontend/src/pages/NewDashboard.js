import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import './NewDashboard.css';

const NewDashboard = () => {
  const { language } = useLanguage();
  const t = (key) => translations[language][key] || key;

  const [currentUser, setCurrentUser] = useState(undefined);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProducts: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadStats();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [clients, products, invoices] = await Promise.all([
        ApiService.getAllClients(),
        ApiService.getAllProducts(),
        ApiService.getAllInvoices()
      ]);

      const pending = invoices.data.filter(inv => inv.status === 'PENDING').length;
      const paid = invoices.data.filter(inv => inv.status === 'PAID').length;
      const overdue = invoices.data.filter(inv => inv.status === 'OVERDUE').length;
      const revenue = invoices.data
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);

      const sortedInvoices = [...invoices.data]
        .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
        .slice(0, 5);

      setRecentInvoices(sortedInvoices);
      setStats({
        totalClients: clients.data.length,
        totalProducts: products.data.length,
        totalInvoices: invoices.data.length,
        pendingInvoices: pending,
        paidInvoices: paid,
        overdueInvoices: overdue,
        totalRevenue: revenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PAID': return 'status-paid';
      case 'PENDING': return 'status-pending';
      case 'OVERDUE': return 'status-overdue';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  if (!currentUser) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div className="header-info">
          <h1>{t('welcome')}, {currentUser.username}!</h1>
          <p className="subtitle">
            {language === 'fr'
              ? 'Gérez vos factures, clients et produits en toute simplicité'
              : 'Manage your invoices, clients and products with ease'}
          </p>
        </div>
        <button onClick={() => navigate('/invoices')} className="btn btn-primary">
          <i className="pi pi-plus"></i>
          {t('createInvoice')}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon-wrapper blue-bg">
            <i className="pi pi-users"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalClients}</div>
            <div className="stat-label">{t('allClients')}</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon-wrapper green-bg">
            <i className="pi pi-box"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">{t('totalProducts')}</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon-wrapper orange-bg">
            <i className="pi pi-file"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalInvoices}</div>
            <div className="stat-label">{t('totalInvoices')}</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon-wrapper purple-bg">
            <i className="pi pi-euro"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalRevenue.toFixed(2)} €</div>
            <div className="stat-label">{t('revenue')}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card invoice-status-card">
          <div className="card-header">
            <h3><i className="pi pi-chart-pie"></i> {language === 'fr' ? 'Statut des Factures' : 'Invoice Status'}</h3>
          </div>
          <div className="status-breakdown">
            <div className="status-row">
              <div className="status-info">
                <span className="status-dot paid"></span>
                <span className="status-name">{t('paid')}</span>
              </div>
              <div className="status-bar-container">
                <div className="status-bar paid" style={{ width: `${stats.totalInvoices ? (stats.paidInvoices / stats.totalInvoices) * 100 : 0}%` }}></div>
              </div>
              <span className="status-count">{stats.paidInvoices}</span>
            </div>
            <div className="status-row">
              <div className="status-info">
                <span className="status-dot pending"></span>
                <span className="status-name">{t('pending')}</span>
              </div>
              <div className="status-bar-container">
                <div className="status-bar pending" style={{ width: `${stats.totalInvoices ? (stats.pendingInvoices / stats.totalInvoices) * 100 : 0}%` }}></div>
              </div>
              <span className="status-count">{stats.pendingInvoices}</span>
            </div>
            <div className="status-row">
              <div className="status-info">
                <span className="status-dot overdue"></span>
                <span className="status-name">{language === 'fr' ? 'En retard' : 'Overdue'}</span>
              </div>
              <div className="status-bar-container">
                <div className="status-bar overdue" style={{ width: `${stats.totalInvoices ? (stats.overdueInvoices / stats.totalInvoices) * 100 : 0}%` }}></div>
              </div>
              <span className="status-count">{stats.overdueInvoices}</span>
            </div>
          </div>
        </div>

        <div className="card quick-actions-card">
          <div className="card-header">
            <h3><i className="pi pi-bolt"></i> {t('quickActions')}</h3>
          </div>
          <div className="action-buttons">
            <button onClick={() => navigate('/invoices')} className="action-button">
              <div className="action-icon blue-bg"><i className="pi pi-file-plus"></i></div>
              <div className="action-text">
                <div className="action-title">{t('createNewInvoice')}</div>
                <div className="action-desc">{language === 'fr' ? 'Créer une nouvelle facture' : 'Create a new invoice'}</div>
              </div>
              <i className="pi pi-chevron-right"></i>
            </button>
            <button onClick={() => navigate('/clients')} className="action-button">
              <div className="action-icon green-bg"><i className="pi pi-user-plus"></i></div>
              <div className="action-text">
                <div className="action-title">{t('addClient')}</div>
                <div className="action-desc">{language === 'fr' ? 'Ajouter un nouveau client' : 'Add a new client'}</div>
              </div>
              <i className="pi pi-chevron-right"></i>
            </button>
            <button onClick={() => navigate('/products')} className="action-button">
              <div className="action-icon orange-bg"><i className="pi pi-plus-circle"></i></div>
              <div className="action-text">
                <div className="action-title">{t('addProduct')}</div>
                <div className="action-desc">{language === 'fr' ? 'Ajouter un produit' : 'Add a product'}</div>
              </div>
              <i className="pi pi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="card recent-invoices-card">
        <div className="card-header">
          <h3><i className="pi pi-clock"></i> {language === 'fr' ? 'Factures Récentes' : 'Recent Invoices'}</h3>
          <button onClick={() => navigate('/invoices')} className="view-all-btn">
            {language === 'fr' ? 'Voir tout' : 'View All'} <i className="pi pi-arrow-right"></i>
          </button>
        </div>
        <div className="table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>{language === 'fr' ? 'N° Facture' : 'Invoice #'}</th>
                <th>{t('client')}</th>
                <th>{t('date')}</th>
                <th>{t('amount')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="invoice-number">#{invoice.invoiceNumber || invoice.id}</td>
                    <td>{invoice.client?.name || '-'}</td>
                    <td>{formatDate(invoice.invoiceDate)}</td>
                    <td className="amount">{parseFloat(invoice.totalAmount || 0).toFixed(2)} €</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                        {t(invoice.status?.toLowerCase()) || invoice.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    {language === 'fr' ? 'Aucune facture récente' : 'No recent invoices'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NewDashboard;
