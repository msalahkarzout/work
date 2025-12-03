import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service';
import { useLanguage } from '../context/LanguageContext';
import './ActivityLogs.css';

const ActivityLogs = () => {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(undefined);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filters
  const [filters, setFilters] = useState({
    username: '',
    entityType: '',
    action: ''
  });
  const [filterOptions, setFilterOptions] = useState({
    usernames: [],
    entityTypes: [],
    actions: []
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
      const isAdmin = user.roles && user.roles.includes('ROLE_ADMIN');

      if (!isAdmin) {
        navigate('/dashboard');
        return;
      }

      loadFilterOptions();
      loadLogs();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadFilterOptions = () => {
    ApiService.getActivityLogsFilterOptions()
      .then(response => {
        setFilterOptions(response.data);
      })
      .catch(error => {
        console.error('Error loading filter options:', error);
      });
  };

  const loadLogs = () => {
    setLoading(true);
    const { username, entityType, action } = filters;

    if (username || entityType || action) {
      ApiService.getActivityLogsByFilters(username, entityType, action)
        .then(response => {
          setLogs(response.data);
          setTotalItems(response.data.length);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading logs:', error);
          setError(language === 'fr' ? 'Erreur de chargement des logs' : 'Failed to load activity logs');
          setLoading(false);
        });
    } else {
      ApiService.getAllActivityLogs()
        .then(response => {
          setLogs(response.data);
          setTotalItems(response.data.length);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading logs:', error);
          setError(language === 'fr' ? 'Erreur de chargement des logs' : 'Failed to load activity logs');
          setLoading(false);
        });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    loadLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      username: '',
      entityType: '',
      action: ''
    });
    setCurrentPage(0);
    setTimeout(() => {
      ApiService.getAllActivityLogs()
        .then(response => {
          setLogs(response.data);
          setTotalItems(response.data.length);
        })
        .catch(error => {
          console.error('Error loading logs:', error);
        });
    }, 0);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeClass = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create') || actionLower.includes('register')) return 'action-create';
    if (actionLower.includes('update') || actionLower.includes('status')) return 'action-update';
    if (actionLower.includes('delete')) return 'action-delete';
    if (actionLower.includes('login')) return 'action-login';
    return 'action-default';
  };

  const getEntityIcon = (entityType) => {
    const type = entityType?.toUpperCase() || '';
    switch (type) {
      case 'INVOICE': return 'pi pi-file';
      case 'CLIENT': return 'pi pi-users';
      case 'PRODUCT': return 'pi pi-box';
      case 'USER': return 'pi pi-user';
      case 'AUTH': return 'pi pi-shield';
      case 'COMPANY': return 'pi pi-building';
      default: return 'pi pi-circle';
    }
  };

  // Pagination logic
  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = currentPage * itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading || !currentUser) {
    return (
      <div className="page-loading">
        <i className="pi pi-spin pi-spinner"></i>
        {language === 'fr' ? 'Chargement...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <div className="header-info">
          <h1>
            <i className="pi pi-history"></i>
            {language === 'fr' ? 'Journal d\'Activité' : 'Activity Logs'}
          </h1>
          <p className="subtitle">
            {language === 'fr'
              ? 'Suivez toutes les actions effectuées dans le système'
              : 'Track all actions performed in the system'}
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{totalItems}</span>
            <span className="stat-label">{language === 'fr' ? 'Total Actions' : 'Total Actions'}</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters Section */}
      <div className="filters-card">
        <div className="filters-header">
          <i className="pi pi-filter"></i>
          <span>{language === 'fr' ? 'Filtres' : 'Filters'}</span>
        </div>
        <div className="filters-body">
          <div className="filter-group">
            <label>{language === 'fr' ? 'Utilisateur' : 'User'}</label>
            <select
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
            >
              <option value="">{language === 'fr' ? 'Tous les utilisateurs' : 'All Users'}</option>
              {filterOptions.usernames.map((username, index) => (
                <option key={index} value={username}>{username}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>{language === 'fr' ? 'Type d\'Entité' : 'Entity Type'}</label>
            <select
              name="entityType"
              value={filters.entityType}
              onChange={handleFilterChange}
            >
              <option value="">{language === 'fr' ? 'Tous les types' : 'All Types'}</option>
              {filterOptions.entityTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Action</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
            >
              <option value="">{language === 'fr' ? 'Toutes les actions' : 'All Actions'}</option>
              {filterOptions.actions.map((action, index) => (
                <option key={index} value={action}>{action}</option>
              ))}
            </select>
          </div>
          <div className="filter-buttons">
            <button className="btn-apply" onClick={handleApplyFilters}>
              <i className="pi pi-search"></i>
              {language === 'fr' ? 'Appliquer' : 'Apply'}
            </button>
            <button className="btn-clear" onClick={handleClearFilters}>
              <i className="pi pi-times"></i>
              {language === 'fr' ? 'Effacer' : 'Clear'}
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="table-container">
          {currentLogs.length > 0 ? (
            <table className="data-table logs-table">
              <thead>
                <tr>
                  <th>{language === 'fr' ? 'Date/Heure' : 'Date/Time'}</th>
                  <th>{language === 'fr' ? 'Utilisateur' : 'User'}</th>
                  <th>{language === 'fr' ? 'Rôle' : 'Role'}</th>
                  <th>Action</th>
                  <th>{language === 'fr' ? 'Type' : 'Type'}</th>
                  <th>{language === 'fr' ? 'Détails' : 'Details'}</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map(log => (
                  <tr key={log.id}>
                    <td className="datetime-cell">
                      <i className="pi pi-clock"></i>
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="user-cell">
                      <span className="user-avatar">
                        {log.username?.charAt(0).toUpperCase() || '?'}
                      </span>
                      {log.username}
                    </td>
                    <td>
                      <span className="role-badge-small">
                        {log.userRole?.replace('ROLE_', '').replace(', ', ' / ') || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="entity-type">
                        <i className={getEntityIcon(log.entityType)}></i>
                        {log.entityType}
                        {log.entityId && <span className="entity-id">#{log.entityId}</span>}
                      </span>
                    </td>
                    <td className="details-cell">
                      <span className="details-text" title={log.details}>
                        {log.details}
                      </span>
                    </td>
                    <td className="ip-cell">
                      <i className="pi pi-globe"></i>
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="pi pi-history"></i>
              <p>{language === 'fr' ? 'Aucun log trouvé' : 'No activity logs found'}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
            >
              <i className="pi pi-angle-double-left"></i>
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <i className="pi pi-angle-left"></i>
            </button>
            <span className="pagination-info">
              {language === 'fr' ? 'Page' : 'Page'} {currentPage + 1} {language === 'fr' ? 'sur' : 'of'} {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <i className="pi pi-angle-right"></i>
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <i className="pi pi-angle-double-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
