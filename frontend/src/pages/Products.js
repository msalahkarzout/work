import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service';
import { useLanguage } from '../context/LanguageContext';
import './Products.css';

const Products = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      loadProducts();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadProducts = () => {
    setLoading(true);
    ApiService.getAllProducts()
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setError(language === 'fr' ? 'Erreur de chargement des produits' : 'Failed to load products');
        setLoading(false);
      });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stockQuantity: '',
      category: ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stockQuantity: product.stockQuantity || '',
      category: product.category || ''
    });
    setShowModal(true);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      ApiService.deleteProduct(productToDelete.id)
        .then(() => {
          setProducts(products.filter(product => product.id !== productToDelete.id));
          setShowConfirmModal(false);
          setProductToDelete(null);
        })
        .catch(error => {
          console.error('Error deleting product:', error);
          alert(language === 'fr' ? 'Erreur lors de la suppression!' : 'Error deleting product!');
        });
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setProductToDelete(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity)
    };

    if (editingProduct) {
      ApiService.updateProduct(editingProduct.id, productData)
        .then(response => {
          setProducts(products.map(product =>
            product.id === editingProduct.id ? response.data : product
          ));
          setShowModal(false);
        })
        .catch(error => {
          console.error('Error updating product:', error);
          alert(language === 'fr' ? 'Erreur lors de la mise à jour!' : 'Error updating product!');
        });
    } else {
      ApiService.createProduct(productData)
        .then(response => {
          setProducts([...products, response.data]);
          setShowModal(false);
        })
        .catch(error => {
          console.error('Error creating product:', error);
          alert(language === 'fr' ? 'Erreur lors de la création!' : 'Error creating product!');
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
    <div className="products-page">
      <div className="page-header">
        <div className="header-info">
          <h1>
            <i className="pi pi-box"></i>
            {language === 'fr' ? 'Gestion des Produits' : 'Product Management'}
          </h1>
          <p className="subtitle">
            {language === 'fr'
              ? 'Gérez vos produits et services'
              : 'Manage your products and services'}
          </p>
        </div>
        <button onClick={handleAddProduct} className="btn btn-primary">
          <i className="pi pi-plus"></i>
          {language === 'fr' ? 'Ajouter Produit' : 'Add Product'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="table-container">
          {products.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{language === 'fr' ? 'Nom' : 'Name'}</th>
                  <th>{language === 'fr' ? 'Catégorie' : 'Category'}</th>
                  <th>{language === 'fr' ? 'Prix' : 'Price'}</th>
                  <th>{language === 'fr' ? 'Stock' : 'Stock'}</th>
                  <th>{language === 'fr' ? 'Description' : 'Description'}</th>
                  <th>{language === 'fr' ? 'Actions' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td className="product-id">{product.id}</td>
                    <td className="product-name">{product.name}</td>
                    <td>{product.category || '-'}</td>
                    <td className="product-price">${parseFloat(product.price).toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${product.stockQuantity < 10 ? 'low' : 'normal'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="product-description">{product.description || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="action-btn edit"
                          title={language === 'fr' ? 'Modifier' : 'Edit'}
                        >
                          <i className="pi pi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
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
              <i className="pi pi-box"></i>
              <p>{language === 'fr' ? 'Aucun produit trouvé' : 'No products found'}</p>
              <button onClick={handleAddProduct} className="btn btn-outline">
                <i className="pi pi-plus"></i>
                {language === 'fr' ? 'Ajouter votre premier produit' : 'Add your first product'}
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
                <i className="pi pi-box"></i>
                {editingProduct
                  ? (language === 'fr' ? 'Modifier le Produit' : 'Edit Product')
                  : (language === 'fr' ? 'Ajouter un Produit' : 'Add Product')}
              </h2>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <i className="pi pi-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <i className="pi pi-tag"></i>
                  {language === 'fr' ? 'Nom du Produit' : 'Product Name'}*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={language === 'fr' ? 'Nom du produit' : 'Product name'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="pi pi-folder"></i>
                    {language === 'fr' ? 'Catégorie' : 'Category'}
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder={language === 'fr' ? 'Ex: Services Web, Consulting...' : 'Ex: Web Services, Consulting...'}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="pi pi-dollar"></i>
                    {language === 'fr' ? 'Prix ($)' : 'Price ($)'}*
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="1500.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <i className="pi pi-inbox"></i>
                  {language === 'fr' ? 'Quantité en Stock' : 'Stock Quantity'}*
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="100"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="pi pi-align-left"></i>
                  {language === 'fr' ? 'Description' : 'Description'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder={language === 'fr' ? 'Description détaillée du produit ou service...' : 'Detailed product or service description...'}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  <i className="pi pi-times"></i>
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="pi pi-check"></i>
                  {editingProduct
                    ? (language === 'fr' ? 'Mettre à jour' : 'Update')
                    : (language === 'fr' ? 'Créer' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && productToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <i className="pi pi-exclamation-triangle"></i>
            </div>
            <h3>{language === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}</h3>
            <p>
              {language === 'fr'
                ? `Êtes-vous sûr de vouloir supprimer le produit "${productToDelete.name}" ?`
                : `Are you sure you want to delete product "${productToDelete.name}"?`}
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

export default Products;
