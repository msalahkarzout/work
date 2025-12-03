import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service';
import { useLanguage } from '../context/LanguageContext';
import './Clients.css';

const Clients = () => {
  const { language } = useLanguage();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    taxNumber: '',
    notes: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      loadClients();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadClients = () => {
    setLoading(true);
    ApiService.getAllClients()
      .then(response => {
        setClients(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading clients:', error);
        setError(language === 'fr' ? 'Erreur de chargement des clients' : 'Failed to load clients');
        setLoading(false);
      });
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      taxNumber: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      companyName: client.companyName || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      postalCode: client.postalCode || '',
      country: client.country || '',
      taxNumber: client.taxNumber || '',
      notes: client.notes || ''
    });
    setShowModal(true);
  };

  const handleDeleteClient = (client) => {
    setClientToDelete(client);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      ApiService.deleteClient(clientToDelete.id)
        .then(() => {
          setClients(clients.filter(client => client.id !== clientToDelete.id));
          setShowConfirmModal(false);
          setClientToDelete(null);
        })
        .catch(error => {
          console.error('Error deleting client:', error);
          alert(language === 'fr' ? 'Erreur lors de la suppression!' : 'Error deleting client!');
        });
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setClientToDelete(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingClient) {
      ApiService.updateClient(editingClient.id, formData)
        .then(response => {
          setClients(clients.map(client =>
            client.id === editingClient.id ? response.data : client
          ));
          setShowModal(false);
        })
        .catch(error => {
          console.error('Error updating client:', error);
          alert(language === 'fr' ? 'Erreur lors de la mise à jour!' : 'Error updating client!');
        });
    } else {
      ApiService.createClient(formData)
        .then(response => {
          setClients([...clients, response.data]);
          setShowModal(false);
        })
        .catch(error => {
          console.error('Error creating client:', error);
          alert(language === 'fr' ? 'Erreur lors de la création!' : 'Error creating client!');
        });
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <i className="pi pi-spin pi-spinner"></i>
        {language === 'fr' ? 'Chargement...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="clients-page">
      <div className="page-header">
        <div className="header-info">
          <h1>
            <i className="pi pi-users"></i>
            {language === 'fr' ? 'Gestion des Clients' : 'Client Management'}
          </h1>
          <p className="subtitle">
            {language === 'fr'
              ? 'Gérez vos clients et leurs informations'
              : 'Manage your clients and their information'}
          </p>
        </div>
        <button onClick={handleAddClient} className="btn btn-primary">
          <i className="pi pi-plus"></i>
          {language === 'fr' ? 'Ajouter Client' : 'Add Client'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="table-container">
          {clients.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{language === 'fr' ? 'Nom' : 'Name'}</th>
                  <th>{language === 'fr' ? 'Entreprise' : 'Company'}</th>
                  <th>{language === 'fr' ? 'Email' : 'Email'}</th>
                  <th>{language === 'fr' ? 'Téléphone' : 'Phone'}</th>
                  <th>{language === 'fr' ? 'Ville' : 'City'}</th>
                  <th>{language === 'fr' ? 'Pays' : 'Country'}</th>
                  <th>{language === 'fr' ? 'Actions' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td className="client-id">{client.id}</td>
                    <td className="client-name">{client.name}</td>
                    <td>{client.companyName || '-'}</td>
                    <td>{client.email || '-'}</td>
                    <td>{client.phone || '-'}</td>
                    <td>{client.city || '-'}</td>
                    <td>{client.country || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="action-btn edit"
                          title={language === 'fr' ? 'Modifier' : 'Edit'}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client)}
                          className="action-btn delete"
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
              <p>{language === 'fr' ? 'Aucun client trouvé' : 'No clients found'}</p>
              <button onClick={handleAddClient} className="btn btn-outline">
                <i className="pi pi-plus"></i>
                {language === 'fr' ? 'Ajouter votre premier client' : 'Add your first client'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="pi pi-user-edit"></i>
                {editingClient
                  ? (language === 'fr' ? 'Modifier le Client' : 'Edit Client')
                  : (language === 'fr' ? 'Ajouter un Client' : 'Add Client')}
              </h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <i className="pi pi-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="pi pi-user"></i>
                    {language === 'fr' ? 'Nom du Client' : 'Client Name'}*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={language === 'fr' ? 'Nom du client' : 'Client name'}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="pi pi-building"></i>
                    {language === 'fr' ? 'Nom de l\'Entreprise' : 'Company Name'}
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder={language === 'fr' ? "Nom de l'entreprise" : 'Company name'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="pi pi-envelope"></i>
                    {language === 'fr' ? 'Email' : 'Email'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="pi pi-phone"></i>
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="pi pi-map-marker"></i>
                  {language === 'fr' ? 'Adresse' : 'Address'}
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  placeholder={language === 'fr' ? 'Adresse complète' : 'Full address'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="pi pi-map"></i>
                    {language === 'fr' ? 'Ville' : 'City'}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={language === 'fr' ? 'Ville' : 'City'}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="pi pi-hashtag"></i>
                    {language === 'fr' ? 'Code Postal' : 'Postal Code'}
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="75008"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="pi pi-globe"></i>
                    {language === 'fr' ? 'Pays' : 'Country'}
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder={language === 'fr' ? 'Pays' : 'Country'}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="pi pi-id-card"></i>
                    {language === 'fr' ? 'Numéro de TVA' : 'Tax Number'}
                  </label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleChange}
                    placeholder="FR12345678901"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="pi pi-file"></i>
                  {language === 'fr' ? 'Notes' : 'Notes'}
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder={language === 'fr' ? 'Notes additionnelles...' : 'Additional notes...'}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  <i className="pi pi-times"></i>
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="pi pi-check"></i>
                  {editingClient
                    ? (language === 'fr' ? 'Mettre à jour' : 'Update')
                    : (language === 'fr' ? 'Créer' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && clientToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <i className="pi pi-exclamation-triangle"></i>
            </div>
            <h3>{language === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}</h3>
            <p>
              {language === 'fr'
                ? `Êtes-vous sûr de vouloir supprimer le client "${clientToDelete.name}" ?`
                : `Are you sure you want to delete client "${clientToDelete.name}"?`}
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

export default Clients;
