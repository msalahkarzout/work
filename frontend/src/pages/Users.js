import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service';
import { useLanguage } from '../context/LanguageContext';
import './Users.css';

const Users = () => {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(undefined);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
      const isAdmin = user.roles && user.roles.includes('ROLE_ADMIN');

      if (!isAdmin) {
        navigate('/dashboard');
        return;
      }

      loadUsers();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadUsers = () => {
    setLoading(true);
    ApiService.getAllUsers()
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading users:', error);
        setError(language === 'fr' ? 'Erreur de chargement des utilisateurs' : 'Failed to load users');
        setLoading(false);
      });
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      ApiService.deleteUser(userToDelete.id)
        .then(() => {
          setUsers(users.filter(user => user.id !== userToDelete.id));
          setShowConfirmModal(false);
          setUserToDelete(null);
        })
        .catch(error => {
          console.error('Error deleting user:', error);
          alert(language === 'fr' ? 'Échec de la suppression de l\'utilisateur' : 'Failed to delete user');
        });
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = (userId) => {
    ApiService.toggleUserStatus(userId)
      .then(response => {
        setUsers(users.map(user =>
          user.id === userId ? response.data : user
        ));
      })
      .catch(error => {
        console.error('Error toggling user status:', error);
        alert(language === 'fr' ? 'Échec de la mise à jour du statut' : 'Failed to update user status');
      });
  };

  const getRoleName = (role) => {
    if (typeof role === 'string') {
      return role.replace('ROLE_', '');
    }
    if (role && role.name) {
      return role.name.replace('ROLE_', '');
    }
    return '';
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
    <div className="users-page">
      <div className="page-header">
        <div className="header-info">
          <h1>
            <i className="pi pi-users"></i>
            {language === 'fr' ? 'Gestion des Utilisateurs' : 'User Management'}
          </h1>
          <p className="subtitle">
            {language === 'fr'
              ? 'Gérez les utilisateurs et les permissions du système'
              : 'Manage system users and permissions'}
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="table-container">
          {users.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{language === 'fr' ? 'Nom d\'utilisateur' : 'Username'}</th>
                  <th>Email</th>
                  <th>{language === 'fr' ? 'Rôles' : 'Roles'}</th>
                  <th>{language === 'fr' ? 'Statut' : 'Status'}</th>
                  <th>{language === 'fr' ? 'Actions' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="user-id">{user.id}</td>
                    <td className="user-name">{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="roles-container">
                        {user.roles && user.roles.map((role, index) => (
                          <span key={index} className="role-badge">
                            {getRoleName(role)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
                        {user.enabled
                          ? (language === 'fr' ? 'Actif' : 'Active')
                          : (language === 'fr' ? 'Inactif' : 'Inactive')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`action-btn ${user.enabled ? 'warning' : 'success'}`}
                          title={user.enabled
                            ? (language === 'fr' ? 'Désactiver' : 'Disable')
                            : (language === 'fr' ? 'Activer' : 'Enable')}
                        >
                          <i className={`pi ${user.enabled ? 'pi-ban' : 'pi-check'}`}></i>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="action-btn delete"
                          disabled={user.id === currentUser.id}
                          title={language === 'fr' ? 'Supprimer' : 'Delete'}
                        >
                          <i className="pi pi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="pi pi-users"></i>
              <p>{language === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {showConfirmModal && userToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <i className="pi pi-exclamation-triangle"></i>
            </div>
            <h3>{language === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}</h3>
            <p>
              {language === 'fr'
                ? `Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete.username}" ?`
                : `Are you sure you want to delete user "${userToDelete.username}"?`}
            </p>
            <p className="confirm-warning">
              {language === 'fr'
                ? 'Cette action est irréversible.'
                : 'This action cannot be undone.'}
            </p>
            <div className="confirm-modal-buttons">
              <button onClick={cancelDelete} className="btn btn-secondary">
                <i className="pi pi-times"></i> {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button onClick={confirmDelete} className="btn btn-danger">
                <i className="pi pi-trash"></i> {language === 'fr' ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
