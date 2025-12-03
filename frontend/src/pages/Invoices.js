import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/translations';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import './Invoices.css';

const Invoices = () => {
  const { language } = useLanguage();
  const t = (key) => translations[language][key] || key;

  const [currentUser, setCurrentUser] = useState(undefined);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([{ productId: '', quantity: 1 }]);
  const [customerName, setCustomerName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChange, setStatusChange] = useState({ invoice: null, newStatus: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadInvoices();
      loadProducts();
      loadCompanySettings();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadInvoices = () => {
    setLoading(true);
    ApiService.getAllInvoices()
      .then(response => {
        setInvoices(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading invoices:', error);
        setLoading(false);
      });
  };

  const loadProducts = () => {
    ApiService.getAllProducts()
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error loading products:', error);
      });
  };

  const loadCompanySettings = () => {
    ApiService.getCompanySettings()
      .then(response => {
        setCompanySettings(response.data);
      })
      .catch(error => {
        console.error('Error loading company settings:', error);
      });
  };

  const handleAddItem = () => {
    setInvoiceItems([...invoiceItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;
    setInvoiceItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert(language === 'fr' ? 'Veuillez entrer le nom du client' : 'Please enter customer name');
      return;
    }

    const validItems = invoiceItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      alert(language === 'fr' ? 'Veuillez ajouter au moins un article' : 'Please add at least one valid item');
      return;
    }

    const invoiceData = {
      customerName: customerName.trim(),
      items: validItems.map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity)
      }))
    };

    if (editMode) {
      ApiService.updateInvoice(editingInvoiceId, invoiceData)
        .then(response => {
          alert(language === 'fr' ? 'Facture mise à jour avec succès!' : 'Invoice updated successfully!');
          setInvoices(invoices.map(inv => inv.id === editingInvoiceId ? response.data : inv));
          handleCloseModal();
          loadProducts();
        })
        .catch(error => {
          console.error('Error updating invoice:', error);
          alert(language === 'fr' ? 'Échec de la mise à jour de la facture' : 'Failed to update invoice');
        });
    } else {
      ApiService.createInvoice(invoiceData)
        .then(response => {
          alert(language === 'fr' ? 'Facture créée avec succès!' : 'Invoice created successfully!');
          setInvoices([response.data, ...invoices]);
          handleCloseModal();
          loadProducts();
        })
        .catch(error => {
          console.error('Error creating invoice:', error);
          alert(language === 'fr' ? 'Échec de la création de la facture' : 'Failed to create invoice');
        });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditingInvoiceId(null);
    setCustomerName('');
    setInvoiceItems([{ productId: '', quantity: 1 }]);
  };

  const handleEditInvoice = (invoice) => {
    setEditMode(true);
    setEditingInvoiceId(invoice.id);
    setCustomerName(invoice.customerName);
    setInvoiceItems(invoice.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    })));
    setShowModal(true);
  };

  const handleUpdateStatus = (invoice, newStatus) => {
    setStatusChange({ invoice, newStatus });
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (statusChange.invoice && statusChange.newStatus) {
      ApiService.updateInvoiceStatus(statusChange.invoice.id, statusChange.newStatus)
        .then(response => {
          setInvoices(invoices.map(inv =>
            inv.id === statusChange.invoice.id ? response.data : inv
          ));
          setShowStatusModal(false);
          setStatusChange({ invoice: null, newStatus: '' });
        })
        .catch(error => {
          console.error('Error updating invoice status:', error);
          alert(language === 'fr' ? 'Échec de la mise à jour du statut' : 'Failed to update invoice status');
        });
    }
  };

  const cancelStatusChange = () => {
    setShowStatusModal(false);
    setStatusChange({ invoice: null, newStatus: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleExportToExcel = (invoice) => {
    const data = [];
    if (companySettings) {
      data.push(['Company Name', companySettings.companyName || '']);
      data.push(['Address', companySettings.address || '']);
      data.push(['Phone', companySettings.phone || '']);
      data.push(['Email', companySettings.email || '']);
      data.push(['']);
    }
    data.push(['Invoice Number', invoice.invoiceNumber || `#${invoice.id}`]);
    data.push(['Customer', invoice.customerName]);
    data.push(['Date', formatDate(invoice.invoiceDate)]);
    data.push(['Status', invoice.status]);
    data.push(['']);
    data.push(['Product', 'Quantity', 'Unit Price', 'Subtotal']);
    invoice.items.forEach(item => {
      data.push([
        item.product.name,
        item.quantity,
        `€${item.unitPrice.toFixed(2)}`,
        `€${item.subtotal.toFixed(2)}`
      ]);
    });
    data.push(['']);
    data.push(['Subtotal', '', '', `€${invoice.subtotal.toFixed(2)}`]);
    data.push(['Tax (' + invoice.taxRate + '%)', '', '', `€${invoice.taxAmount.toFixed(2)}`]);
    data.push(['Total', '', '', `€${invoice.totalAmount.toFixed(2)}`]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
    XLSX.writeFile(wb, `Invoice_${invoice.invoiceNumber || invoice.id}.xlsx`);
  };

  const handleExportToPDF = (invoice) => {
    const doc = new jsPDF();
    const currency = companySettings?.currency || 'EUR';
    const currencySymbol = currency === 'TND' ? 'TND ' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

    let textStartX = 20;
    let textStartY = 25;

    // Add Logo if exists (left side)
    if (companySettings && companySettings.logo) {
      try {
        doc.addImage(companySettings.logo, 'AUTO', 20, 15, 35, 25);
        textStartX = 60;
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    // Company Name and Details (next to logo)
    if (companySettings) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(companySettings.companyName || 'Company Name', textStartX, textStartY);

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      let infoY = textStartY + 6;
      if (companySettings.address) { doc.text(companySettings.address, textStartX, infoY); infoY += 4; }
      if (companySettings.city || companySettings.postalCode) {
        doc.text(`${companySettings.postalCode || ''} ${companySettings.city || ''}, ${companySettings.country || ''}`, textStartX, infoY);
        infoY += 4;
      }
      if (companySettings.phone) { doc.text(`${language === 'fr' ? 'Tél:' : 'Phone:'} ${companySettings.phone}`, textStartX, infoY); infoY += 4; }
      if (companySettings.email) { doc.text(`Email: ${companySettings.email}`, textStartX, infoY); infoY += 4; }
      if (companySettings.taxNumber) { doc.text(`${language === 'fr' ? 'TVA:' : 'VAT:'} ${companySettings.taxNumber}`, textStartX, infoY); }
    }

    // Invoice Title (right side, blue color)
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text(language === 'fr' ? 'FACTURE' : 'INVOICE', 190, 25, { align: 'right' });

    // Invoice Details (right aligned)
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`#: ${invoice.invoiceNumber || 'FACT-' + invoice.id}`, 190, 35, { align: 'right' });
    doc.text(`Date: ${formatDate(invoice.invoiceDate)}`, 190, 42, { align: 'right' });

    // Status badge
    const statusText = invoice.status === 'PAID' ? (language === 'fr' ? 'PAYÉ' : 'PAID') :
                      invoice.status === 'PENDING' ? (language === 'fr' ? 'EN ATTENTE' : 'PENDING') :
                      invoice.status === 'CANCELLED' ? (language === 'fr' ? 'ANNULÉ' : 'CANCELLED') : invoice.status;
    doc.setFont(undefined, 'bold');
    if (invoice.status === 'PAID') {
      doc.setTextColor(34, 139, 34);
    } else if (invoice.status === 'PENDING') {
      doc.setTextColor(255, 165, 0);
    } else {
      doc.setTextColor(220, 53, 69);
    }
    doc.text(`${language === 'fr' ? 'Statut:' : 'Status:'} ${statusText}`, 190, 49, { align: 'right' });

    // Bill To Section
    let yPos = 70;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text(language === 'fr' ? 'Facturé à:' : 'Bill To:', 20, yPos);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(invoice.customerName, 20, yPos + 7);

    // Items Table
    const tableTop = 95;

    // Table Header with gradient-like background
    doc.setFillColor(102, 126, 234);
    doc.rect(20, tableTop, 170, 10, 'F');

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(language === 'fr' ? 'Produit' : 'Product', 25, tableTop + 7);
    doc.text(language === 'fr' ? 'Qté' : 'Qty', 105, tableTop + 7);
    doc.text(language === 'fr' ? 'Prix Unit.' : 'Unit Price', 125, tableTop + 7);
    doc.text(language === 'fr' ? 'Sous-total' : 'Subtotal', 160, tableTop + 7);

    // Table Rows
    yPos = tableTop + 18;
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');

    invoice.items.forEach((item, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPos - 5, 170, 10, 'F');
      }

      const productName = item.product.name.length > 35 ? item.product.name.substring(0, 35) + '...' : item.product.name;
      doc.text(productName, 25, yPos);
      doc.text(item.quantity.toString(), 108, yPos);
      doc.text(`${currencySymbol}${item.unitPrice.toFixed(2)}`, 125, yPos);
      doc.text(`${currencySymbol}${item.subtotal.toFixed(2)}`, 160, yPos);
      yPos += 10;
    });

    // Line after items
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);

    // Totals Section (right aligned)
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    // Subtotal
    doc.setFont(undefined, 'normal');
    doc.text(`${language === 'fr' ? 'Sous-total:' : 'Subtotal:'}`, 130, yPos);
    doc.text(`${currencySymbol}${invoice.subtotal.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 8;

    // Tax
    doc.text(`${language === 'fr' ? 'TVA' : 'Tax'} (${invoice.taxRate}%):`, 130, yPos);
    doc.text(`${currencySymbol}${invoice.taxAmount.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 12;

    // Total (bold and colored)
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text(`${language === 'fr' ? 'Total:' : 'Total:'}`, 130, yPos);
    doc.text(`${currencySymbol}${invoice.totalAmount.toFixed(2)}`, 190, yPos, { align: 'right' });

    // Bank Details Footer (if available)
    if (companySettings && (companySettings.bankName || companySettings.bankAccount)) {
      const footerY = 270;
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`${language === 'fr' ? 'Coordonnées Bancaires:' : 'Bank Details:'}`, 20, footerY);
      doc.text(`${companySettings.bankName || ''} - IBAN: ${companySettings.bankAccount || ''}`, 20, footerY + 4);
      if (companySettings.swiftCode) {
        doc.text(`BIC: ${companySettings.swiftCode}`, 20, footerY + 8);
      }
    }

    // Notes (if available)
    if (companySettings && companySettings.invoiceNotes) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(companySettings.invoiceNotes, 20, 258);
    }

    doc.save(`${language === 'fr' ? 'Facture' : 'Invoice'}_${invoice.invoiceNumber || invoice.id}.pdf`);
  };

  const handleDeleteInvoice = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      ApiService.deleteInvoice(invoiceToDelete.id)
        .then(() => {
          setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
          setShowConfirmModal(false);
          setInvoiceToDelete(null);
        })
        .catch(error => {
          console.error('Error deleting invoice:', error);
          alert(language === 'fr' ? 'Échec de la suppression' : 'Failed to delete invoice');
        });
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setInvoiceToDelete(null);
  };

  if (loading || !currentUser) {
    return <div className="page-loading"><i className="pi pi-spin pi-spinner"></i> {t('loading')}</div>;
  }

  const isAdmin = currentUser && currentUser.roles && currentUser.roles.includes('ROLE_ADMIN');
  const isManager = currentUser && currentUser.roles && currentUser.roles.includes('ROLE_MANAGER');

  return (
    <div className="invoices-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-info">
          <h1><i className="pi pi-file"></i> {t('invoices')}</h1>
          <p className="subtitle">
            {language === 'fr' ? 'Créez et gérez vos factures' : 'Create and manage invoices'}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <i className="pi pi-plus"></i>
          {language === 'fr' ? 'Créer Facture' : 'Create Invoice'}
        </button>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{language === 'fr' ? 'Client' : 'Customer'}</th>
                <th>{language === 'fr' ? 'Date' : 'Date'}</th>
                <th>{language === 'fr' ? 'Articles' : 'Items'}</th>
                <th>{language === 'fr' ? 'Montant Total' : 'Total Amount'}</th>
                <th>{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td className="invoice-id">#{invoice.id}</td>
                  <td className="customer-name">{invoice.customerName}</td>
                  <td>{formatDate(invoice.invoiceDate)}</td>
                  <td className="items-count">{invoice.items ? invoice.items.length : 0}</td>
                  <td className="amount">€{invoice.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${invoice.status.toLowerCase()}`}>
                      {invoice.status === 'PAID' ? (language === 'fr' ? 'Payé' : 'Paid') :
                       invoice.status === 'PENDING' ? (language === 'fr' ? 'En attente' : 'Pending') :
                       invoice.status === 'CANCELLED' ? (language === 'fr' ? 'Annulé' : 'Cancelled') : invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleViewInvoice(invoice)} className="action-btn view" title={language === 'fr' ? 'Voir' : 'View'}>
                        <i className="pi pi-eye"></i>
                      </button>
                      <button onClick={() => handleExportToPDF(invoice)} className="action-btn pdf" title={language === 'fr' ? 'Exporter PDF' : 'Export PDF'}>
                        <i className="pi pi-file-pdf"></i>
                      </button>
                      <button onClick={() => handleExportToExcel(invoice)} className="action-btn excel" title={language === 'fr' ? 'Exporter Excel' : 'Export Excel'}>
                        <i className="pi pi-file-excel"></i>
                      </button>
                      {(isAdmin || isManager) && invoice.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleEditInvoice(invoice)} className="action-btn edit" title={language === 'fr' ? 'Modifier' : 'Edit'}>
                            <i className="pi pi-pencil"></i>
                          </button>
                          <button onClick={() => handleUpdateStatus(invoice, 'PAID')} className="action-btn paid" title={language === 'fr' ? 'Marquer payé' : 'Mark as Paid'}>
                            <i className="pi pi-check"></i>
                          </button>
                          <button onClick={() => handleDeleteInvoice(invoice)} className="action-btn delete" title={language === 'fr' ? 'Supprimer' : 'Delete'}>
                            <i className="pi pi-trash"></i>
                          </button>
                        </>
                      )}
                      {(isAdmin || isManager) && invoice.status === 'PAID' && (
                        <button onClick={() => handleUpdateStatus(invoice, 'PENDING')} className="action-btn pending" title={language === 'fr' ? 'Marquer en attente' : 'Mark as Pending'}>
                          <i className="pi pi-replay"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices.length === 0 && (
            <div className="empty-state">
              <i className="pi pi-inbox"></i>
              <p>{language === 'fr' ? 'Aucune facture trouvée' : 'No invoices found'}</p>
              <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
                {language === 'fr' ? 'Créer votre première facture' : 'Create your first invoice'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="pi pi-file-edit"></i> {editMode ? (language === 'fr' ? 'Modifier Facture' : 'Edit Invoice') : (language === 'fr' ? 'Nouvelle Facture' : 'New Invoice')}</h2>
              <button onClick={handleCloseModal} className="modal-close"><i className="pi pi-times"></i></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="pi pi-user"></i> {language === 'fr' ? 'Nom du Client' : 'Customer Name'}*</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  placeholder={language === 'fr' ? 'Entrez le nom du client' : 'Enter customer name'}
                />
              </div>

              <div className="form-group">
                <label><i className="pi pi-list"></i> {language === 'fr' ? 'Articles' : 'Items'}</label>
                <div className="items-list">
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="invoice-item-row">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        required
                      >
                        <option value="">{language === 'fr' ? 'Sélectionner un produit' : 'Select Product'}</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - €{product.price} (Stock: {product.stockQuantity})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        required
                        placeholder={language === 'fr' ? 'Qté' : 'Qty'}
                        className="quantity-input"
                      />
                      {invoiceItems.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(index)} className="btn-remove-item">
                          <i className="pi pi-times"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleAddItem} className="btn btn-outline btn-sm">
                  <i className="pi pi-plus"></i> {language === 'fr' ? 'Ajouter un Article' : 'Add Item'}
                </button>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  <i className="pi pi-times"></i> {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="pi pi-check"></i> {editMode ? (language === 'fr' ? 'Mettre à jour' : 'Update') : (language === 'fr' ? 'Créer' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="pi pi-eye"></i> {language === 'fr' ? 'Aperçu de la Facture' : 'Invoice Preview'}</h2>
              <button onClick={() => setShowPreviewModal(false)} className="modal-close"><i className="pi pi-times"></i></button>
            </div>

            <div className="invoice-preview-content">
              {/* Company Header */}
              <div className="preview-company-section">
                {companySettings && companySettings.logo && (
                  <img src={companySettings.logo} alt="Logo" className="preview-logo" />
                )}
                <div className="preview-company-info">
                  <h3>{companySettings?.companyName || 'Company Name'}</h3>
                  <p>{companySettings?.address}</p>
                  <p>{companySettings?.phone} | {companySettings?.email}</p>
                </div>
              </div>

              {/* Invoice Title */}
              <div className="preview-title">
                <h1>{language === 'fr' ? 'FACTURE' : 'INVOICE'}</h1>
              </div>

              {/* Invoice Info */}
              <div className="preview-info-grid">
                <div className="preview-info-block">
                  <label>{language === 'fr' ? 'Facturé à' : 'Bill To'}</label>
                  <p className="customer-name">{selectedInvoice.customerName}</p>
                </div>
                <div className="preview-info-block right">
                  <div className="info-row">
                    <span className="label">{language === 'fr' ? 'N° Facture' : 'Invoice #'}:</span>
                    <span className="value">{selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id}`}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">{language === 'fr' ? 'Date' : 'Date'}:</span>
                    <span className="value">{formatDate(selectedInvoice.invoiceDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">{language === 'fr' ? 'Statut' : 'Status'}:</span>
                    <span className={`status-badge status-${selectedInvoice.status.toLowerCase()}`}>
                      {selectedInvoice.status === 'PAID' ? (language === 'fr' ? 'Payé' : 'Paid') :
                       selectedInvoice.status === 'PENDING' ? (language === 'fr' ? 'En attente' : 'Pending') : selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="preview-items-table">
                <thead>
                  <tr>
                    <th>{language === 'fr' ? 'Produit' : 'Product'}</th>
                    <th className="center">{language === 'fr' ? 'Qté' : 'Qty'}</th>
                    <th className="right">{language === 'fr' ? 'Prix Unit.' : 'Unit Price'}</th>
                    <th className="right">{language === 'fr' ? 'Sous-total' : 'Subtotal'}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.product.name}</td>
                      <td className="center">{item.quantity}</td>
                      <td className="right">€{item.unitPrice.toFixed(2)}</td>
                      <td className="right">€{item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="preview-totals">
                <div className="totals-row">
                  <span>{language === 'fr' ? 'Sous-total' : 'Subtotal'}:</span>
                  <span>€{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>{language === 'fr' ? 'TVA' : 'Tax'} ({selectedInvoice.taxRate}%):</span>
                  <span>€{selectedInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="totals-row total">
                  <span>{language === 'fr' ? 'Total' : 'Total'}:</span>
                  <span>€{selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer preview-footer">
              <button onClick={() => handleExportToPDF(selectedInvoice)} className="btn btn-pdf">
                <i className="pi pi-file-pdf"></i> {language === 'fr' ? 'Exporter PDF' : 'Export PDF'}
              </button>
              <button onClick={() => handleExportToExcel(selectedInvoice)} className="btn btn-excel">
                <i className="pi pi-file-excel"></i> {language === 'fr' ? 'Exporter Excel' : 'Export Excel'}
              </button>
              <button onClick={() => setShowPreviewModal(false)} className="btn btn-secondary">
                <i className="pi pi-times"></i> {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && invoiceToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <i className="pi pi-exclamation-triangle"></i>
            </div>
            <h3>{language === 'fr' ? 'Confirmer la suppression' : 'Confirm Delete'}</h3>
            <p>
              {language === 'fr'
                ? `Êtes-vous sûr de vouloir supprimer la facture ${invoiceToDelete.invoiceNumber || '#' + invoiceToDelete.id} ?`
                : `Are you sure you want to delete invoice ${invoiceToDelete.invoiceNumber || '#' + invoiceToDelete.id}?`}
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

      {/* Confirm Status Change Modal */}
      {showStatusModal && statusChange.invoice && (
        <div className="modal-overlay" onClick={cancelStatusChange}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-modal-icon ${statusChange.newStatus === 'PAID' ? 'success' : 'warning'}`}>
              <i className={`pi ${statusChange.newStatus === 'PAID' ? 'pi-check-circle' : 'pi-replay'}`}></i>
            </div>
            <h3>
              {statusChange.newStatus === 'PAID'
                ? (language === 'fr' ? 'Marquer comme payé' : 'Mark as Paid')
                : (language === 'fr' ? 'Marquer en attente' : 'Mark as Pending')}
            </h3>
            <p>
              {statusChange.newStatus === 'PAID'
                ? (language === 'fr'
                    ? `Voulez-vous marquer la facture ${statusChange.invoice.invoiceNumber || '#' + statusChange.invoice.id} comme payée ?`
                    : `Do you want to mark invoice ${statusChange.invoice.invoiceNumber || '#' + statusChange.invoice.id} as paid?`)
                : (language === 'fr'
                    ? `Voulez-vous remettre la facture ${statusChange.invoice.invoiceNumber || '#' + statusChange.invoice.id} en attente ?`
                    : `Do you want to mark invoice ${statusChange.invoice.invoiceNumber || '#' + statusChange.invoice.id} as pending?`)}
            </p>
            <p className="confirm-info">
              {language === 'fr' ? 'Client:' : 'Customer:'} <strong>{statusChange.invoice.customerName}</strong>
              <br />
              {language === 'fr' ? 'Montant:' : 'Amount:'} <strong>€{statusChange.invoice.totalAmount.toFixed(2)}</strong>
            </p>
            <div className="confirm-modal-buttons">
              <button onClick={cancelStatusChange} className="btn btn-secondary">
                <i className="pi pi-times"></i> {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button onClick={confirmStatusChange} className={`btn ${statusChange.newStatus === 'PAID' ? 'btn-success' : 'btn-warning'}`}>
                <i className={`pi ${statusChange.newStatus === 'PAID' ? 'pi-check' : 'pi-replay'}`}></i>
                {statusChange.newStatus === 'PAID'
                  ? (language === 'fr' ? 'Confirmer le paiement' : 'Confirm Payment')
                  : (language === 'fr' ? 'Confirmer' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
