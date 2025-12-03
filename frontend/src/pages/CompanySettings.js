import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service';
import { useLanguage } from '../context/LanguageContext';
import './CompanySettings.css';

const CompanySettings = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    taxNumber: '',
    registrationNumber: '',
    bankName: '',
    bankAccount: '',
    swiftCode: '',
    logo: '',
    invoicePrefix: 'FACT',
    nextInvoiceNumber: 1,
    defaultTaxRate: 20.0,
    currency: 'EUR',
    termsAndConditions: '',
    invoiceNotes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      loadSettings();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadSettings = () => {
    setLoading(true);
    ApiService.getCompanySettings()
      .then(response => {
        setFormData({
          ...formData,
          ...response.data
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading settings:', error);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(language === 'fr' ? 'Le fichier est trop grand. Maximum 2MB.' : 'File is too large. Maximum 2MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert(language === 'fr' ? 'Veuillez sélectionner une image.' : 'Please select an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          logo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({
      ...formData,
      logo: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    ApiService.updateCompanySettings(formData)
      .then(response => {
        setFormData({
          ...formData,
          ...response.data
        });
        setSaving(false);
      })
      .catch(error => {
        console.error('Error saving settings:', error);
        alert(language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving settings');
        setSaving(false);
      });
  };

  const handleExportEmptyPDF = () => {
    const doc = new jsPDF();
    const invoiceNumber = `${formData.invoicePrefix}-${String(formData.nextInvoiceNumber).padStart(4, '0')}`;

    let textStartX = 20;
    let textStartY = 25;

    // Add Logo if exists
    if (formData.logo) {
      try {
        doc.addImage(formData.logo, 'AUTO', 20, 15, 35, 25);
        textStartX = 60;
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text(formData.companyName || 'Company Name', textStartX, textStartY);

    doc.setFontSize(10);
    doc.setTextColor(100);
    if (formData.address) doc.text(formData.address, textStartX, textStartY + 10);
    doc.text(`${formData.postalCode || ''} ${formData.city || ''}, ${formData.country || ''}`, textStartX, textStartY + 17);
    if (formData.phone) doc.text(`Tel: ${formData.phone}`, textStartX, textStartY + 24);
    if (formData.email) doc.text(`Email: ${formData.email}`, textStartX, textStartY + 31);
    if (formData.taxNumber) doc.text(`TVA: ${formData.taxNumber}`, textStartX, textStartY + 38);

    // Invoice Title
    doc.setFontSize(28);
    doc.setTextColor(102, 126, 234);
    doc.text(language === 'fr' ? 'FACTURE' : 'INVOICE', 140, 30);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`${language === 'fr' ? 'N°' : '#'}: ${invoiceNumber}`, 140, 40);
    doc.text(`Date: ____/____/________`, 140, 48);

    // Bill To Section
    doc.setFontSize(12);
    doc.setTextColor(102, 126, 234);
    doc.text(language === 'fr' ? 'Facturé à:' : 'Bill To:', 20, 85);

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text('_________________________________', 20, 95);
    doc.text('_________________________________', 20, 105);
    doc.text('_________________________________', 20, 115);

    // Items Table Header
    const tableTop = 135;
    doc.setFillColor(102, 126, 234);
    doc.rect(20, tableTop, 170, 10, 'F');

    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.text('Description', 25, tableTop + 7);
    doc.text(language === 'fr' ? 'Qté' : 'Qty', 100, tableTop + 7);
    doc.text(language === 'fr' ? 'Prix Unit.' : 'Unit Price', 120, tableTop + 7);
    doc.text('Total', 160, tableTop + 7);

    // Empty rows
    doc.setTextColor(0);
    doc.setDrawColor(200);
    for (let i = 0; i < 5; i++) {
      const y = tableTop + 15 + (i * 12);
      doc.line(20, y + 8, 190, y + 8);
    }

    // Totals Section
    const totalsY = tableTop + 90;
    doc.setFontSize(10);
    doc.text(`${language === 'fr' ? 'Sous-total HT:' : 'Subtotal:'}`, 120, totalsY);
    doc.text('____________', 160, totalsY);

    doc.text(`${language === 'fr' ? 'TVA' : 'TAX'} (${formData.defaultTaxRate}%):`, 120, totalsY + 10);
    doc.text('____________', 160, totalsY + 10);

    doc.setFontSize(12);
    doc.setTextColor(102, 126, 234);
    doc.text(`${language === 'fr' ? 'TOTAL TTC:' : 'TOTAL:'}`, 120, totalsY + 25);
    doc.text('____________', 160, totalsY + 25);

    // Notes
    if (formData.invoiceNotes) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(formData.invoiceNotes, 20, totalsY + 45);
    }

    // Terms
    if (formData.termsAndConditions) {
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`${language === 'fr' ? 'Conditions:' : 'Terms:'} ${formData.termsAndConditions}`, 20, totalsY + 55);
    }

    // Bank Info Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    const footerY = 280;
    doc.text(`${language === 'fr' ? 'Coordonnées Bancaires:' : 'Bank Details:'}`, 20, footerY);
    doc.text(`${formData.bankName || ''} - IBAN: ${formData.bankAccount || ''}`, 20, footerY + 5);
    doc.text(`BIC: ${formData.swiftCode || ''}`, 20, footerY + 10);

    doc.save(`${language === 'fr' ? 'facture_vierge' : 'blank_invoice'}_${invoiceNumber}.pdf`);
  };

  const handleExportEmptyExcel = () => {
    const invoiceNumber = `${formData.invoicePrefix}-${String(formData.nextInvoiceNumber).padStart(4, '0')}`;
    const currentDate = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');

    // Professional Invoice Template Data
    const data = [
      // Row 1-2: Header with Company Name and Invoice Title
      [formData.companyName || 'Company Name', '', '', '', language === 'fr' ? 'FACTURE' : 'INVOICE'],
      ['', '', '', '', ''],
      // Row 3-6: Company Details and Invoice Info
      [formData.address || '', '', '', language === 'fr' ? 'N° Facture:' : 'Invoice #:', invoiceNumber],
      [`${formData.postalCode || ''} ${formData.city || ''}`, '', '', 'Date:', currentDate],
      [formData.country || '', '', '', language === 'fr' ? 'Échéance:' : 'Due Date:', '___/___/______'],
      [`${language === 'fr' ? 'Tél:' : 'Phone:'} ${formData.phone || ''}`, '', '', '', ''],
      [`Email: ${formData.email || ''}`, '', '', '', ''],
      [`${language === 'fr' ? 'N° TVA:' : 'VAT #:'} ${formData.taxNumber || ''}`, '', '', '', ''],
      // Row 9: Empty separator
      ['', '', '', '', ''],
      // Row 10-14: Bill To Section
      [language === 'fr' ? 'FACTURÉ À:' : 'BILL TO:', '', '', language === 'fr' ? 'LIVRÉ À:' : 'SHIP TO:', ''],
      [language === 'fr' ? 'Nom du client:' : 'Client Name:', '', '', language === 'fr' ? 'Nom:' : 'Name:', ''],
      [language === 'fr' ? 'Adresse:' : 'Address:', '', '', language === 'fr' ? 'Adresse:' : 'Address:', ''],
      [language === 'fr' ? 'Ville, Code Postal:' : 'City, Postal Code:', '', '', language === 'fr' ? 'Ville:' : 'City:', ''],
      [language === 'fr' ? 'Pays:' : 'Country:', '', '', language === 'fr' ? 'Pays:' : 'Country:', ''],
      // Row 15: Empty separator
      ['', '', '', '', ''],
      // Row 16: Table Header
      [
        language === 'fr' ? 'DESCRIPTION' : 'DESCRIPTION',
        language === 'fr' ? 'QUANTITÉ' : 'QTY',
        language === 'fr' ? 'PRIX UNITAIRE' : 'UNIT PRICE',
        language === 'fr' ? 'TVA %' : 'TAX %',
        language === 'fr' ? 'MONTANT' : 'AMOUNT'
      ],
      // Row 17-26: Empty item rows (10 rows for items)
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      // Row 27: Empty separator
      ['', '', '', '', ''],
      // Row 28-31: Totals Section
      ['', '', '', language === 'fr' ? 'SOUS-TOTAL HT:' : 'SUBTOTAL:', ''],
      ['', '', '', `${language === 'fr' ? 'TVA' : 'TAX'} (${formData.defaultTaxRate}%):`, ''],
      ['', '', '', language === 'fr' ? 'REMISE:' : 'DISCOUNT:', ''],
      ['', '', '', language === 'fr' ? 'TOTAL TTC:' : 'TOTAL:', ''],
      // Row 32: Empty separator
      ['', '', '', '', ''],
      // Row 33-34: Notes Section
      [language === 'fr' ? 'NOTES:' : 'NOTES:', '', '', '', ''],
      [formData.invoiceNotes || '', '', '', '', ''],
      // Row 35: Empty separator
      ['', '', '', '', ''],
      // Row 36-37: Terms Section
      [language === 'fr' ? 'CONDITIONS GÉNÉRALES:' : 'TERMS & CONDITIONS:', '', '', '', ''],
      [formData.termsAndConditions || '', '', '', '', ''],
      // Row 38: Empty separator
      ['', '', '', '', ''],
      // Row 39-41: Bank Details
      [language === 'fr' ? 'COORDONNÉES BANCAIRES:' : 'BANK DETAILS:', '', '', '', ''],
      [`${language === 'fr' ? 'Banque:' : 'Bank:'} ${formData.bankName || ''}`, '', `IBAN: ${formData.bankAccount || ''}`, '', ''],
      [`BIC/SWIFT: ${formData.swiftCode || ''}`, '', '', '', ''],
      // Row 42: Empty separator
      ['', '', '', '', ''],
      // Row 43: Footer
      [language === 'fr' ? 'Merci pour votre confiance!' : 'Thank you for your business!', '', '', '', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths for professional look
    ws['!cols'] = [
      { wch: 35 },  // Column A - Description
      { wch: 12 },  // Column B - Quantity
      { wch: 18 },  // Column C - Unit Price
      { wch: 18 },  // Column D - Tax/Labels
      { wch: 18 }   // Column E - Amount
    ];

    // Set row heights
    ws['!rows'] = [
      { hpt: 28 },  // Row 1 - Company name (taller)
      { hpt: 15 },  // Row 2
      { hpt: 18 },  // Row 3
      { hpt: 18 },  // Row 4
      { hpt: 18 },  // Row 5
      { hpt: 18 },  // Row 6
      { hpt: 18 },  // Row 7
      { hpt: 18 },  // Row 8
      { hpt: 10 },  // Row 9 - separator
      { hpt: 22 },  // Row 10 - Bill To header
      { hpt: 18 },  // Row 11
      { hpt: 18 },  // Row 12
      { hpt: 18 },  // Row 13
      { hpt: 18 },  // Row 14
      { hpt: 10 },  // Row 15 - separator
      { hpt: 22 },  // Row 16 - Table header
    ];

    // Merge cells for better layout
    ws['!merges'] = [
      // Company name spans A1:C1
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      // Invoice title spans E1:E2
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
      // Notes content spans A34:E34
      { s: { r: 33, c: 0 }, e: { r: 33, c: 4 } },
      // Terms content spans A37:E37
      { s: { r: 36, c: 0 }, e: { r: 36, c: 4 } },
      // Thank you message spans A43:E43
      { s: { r: 42, c: 0 }, e: { r: 42, c: 4 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, language === 'fr' ? 'Facture' : 'Invoice');

    XLSX.writeFile(wb, `${language === 'fr' ? 'facture_vierge' : 'blank_invoice'}_${invoiceNumber}.xlsx`);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <i className="pi pi-spin pi-spinner"></i>
        {language === 'fr' ? 'Chargement...' : 'Loading...'}
      </div>
    );
  }

  const nextInvoiceNumber = `${formData.invoicePrefix}-${String(formData.nextInvoiceNumber).padStart(4, '0')}`;

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-info">
          <h1>
            <i className="pi pi-cog"></i>
            {language === 'fr' ? 'Paramètres Entreprise' : 'Company Settings'}
          </h1>
          <p className="subtitle">
            {language === 'fr' ? 'Configurez les informations de votre entreprise' : 'Configure your company information'}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleExportEmptyPDF} className="btn btn-pdf">
            <i className="pi pi-file-pdf"></i>
            {language === 'fr' ? 'Facture Vierge PDF' : 'Blank Invoice PDF'}
          </button>
          <button onClick={handleExportEmptyExcel} className="btn btn-excel">
            <i className="pi pi-file-excel"></i>
            {language === 'fr' ? 'Facture Vierge Excel' : 'Blank Invoice Excel'}
          </button>
          <button onClick={() => setShowPreview(!showPreview)} className="btn btn-primary">
            <i className={`pi ${showPreview ? 'pi-eye-slash' : 'pi-eye'}`}></i>
            {showPreview
              ? (language === 'fr' ? 'Masquer Aperçu' : 'Hide Preview')
              : (language === 'fr' ? 'Aperçu Facture' : 'Invoice Preview')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="card settings-section">
          <h3>
            <i className="pi pi-building"></i>
            {language === 'fr' ? 'Informations de Base' : 'Basic Information'}
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="pi pi-id-card"></i>
                {language === 'fr' ? 'Nom de l\'Entreprise' : 'Company Name'}*
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Ma Société SARL"
              />
            </div>
            <div className="form-group">
              <label>
                <i className="pi pi-envelope"></i>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div className="form-row">
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
            <div className="form-group">
              <label>
                <i className="pi pi-globe"></i>
                {language === 'fr' ? 'Site Web' : 'Website'}
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="www.company.com"
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
              placeholder="123 Rue de la République"
            />
          </div>

          <div className="form-row three-cols">
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
                placeholder="Paris"
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
                placeholder="75001"
              />
            </div>
            <div className="form-group">
              <label>
                <i className="pi pi-flag"></i>
                {language === 'fr' ? 'Pays' : 'Country'}
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="France"
              />
            </div>
          </div>
        </div>

        <div className="card settings-section">
          <h3>
            <i className="pi pi-image"></i>
            {language === 'fr' ? 'Logo de l\'Entreprise' : 'Company Logo'}
          </h3>
          <div className="logo-section">
            {formData.logo ? (
              <div className="logo-preview-container">
                <img src={formData.logo} alt="Company Logo" className="logo-preview" />
                <button type="button" onClick={handleRemoveLogo} className="btn btn-secondary btn-sm">
                  <i className="pi pi-trash"></i>
                  {language === 'fr' ? 'Supprimer' : 'Remove'}
                </button>
              </div>
            ) : (
              <div className="logo-placeholder">
                <i className="pi pi-image"></i>
                <p>{language === 'fr' ? 'Aucun logo téléchargé' : 'No logo uploaded'}</p>
              </div>
            )}
            <div className="form-group">
              <label className="file-label">
                <i className="pi pi-upload"></i>
                {language === 'fr' ? 'Télécharger un Logo' : 'Upload Logo'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="file-input"
              />
              <small>{language === 'fr' ? 'Format: JPG, PNG, GIF. Taille max: 2MB' : 'Format: JPG, PNG, GIF. Max size: 2MB'}</small>
            </div>
          </div>
        </div>

        <div className="card settings-section">
          <h3>
            <i className="pi pi-file"></i>
            {language === 'fr' ? 'Informations Légales' : 'Legal Information'}
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="pi pi-percentage"></i>
                {language === 'fr' ? 'N° TVA' : 'VAT Number'}
              </label>
              <input
                type="text"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleChange}
                placeholder="FR12345678901"
              />
            </div>
            <div className="form-group">
              <label>
                <i className="pi pi-id-card"></i>
                {language === 'fr' ? 'N° SIRET' : 'Registration Number'}
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="123 456 789 00010"
              />
            </div>
          </div>
        </div>

        <div className="card settings-section">
          <h3>
            <i className="pi pi-wallet"></i>
            {language === 'fr' ? 'Informations Bancaires' : 'Banking Information'}
          </h3>
          <div className="form-row three-cols">
            <div className="form-group">
              <label>
                <i className="pi pi-building"></i>
                {language === 'fr' ? 'Nom de la Banque' : 'Bank Name'}
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="BNP Paribas"
              />
            </div>
            <div className="form-group">
              <label>
                <i className="pi pi-credit-card"></i>
                IBAN
              </label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </div>
            <div className="form-group">
              <label>
                <i className="pi pi-send"></i>
                BIC/SWIFT
              </label>
              <input
                type="text"
                name="swiftCode"
                value={formData.swiftCode}
                onChange={handleChange}
                placeholder="BNPAFRPPXXX"
              />
            </div>
          </div>
        </div>

        <div className="card settings-section highlight">
          <h3>
            <i className="pi pi-file-edit"></i>
            {language === 'fr' ? 'Configuration Factures' : 'Invoice Configuration'}
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="pi pi-tag"></i>
                {language === 'fr' ? 'Préfixe Facture' : 'Invoice Prefix'}
              </label>
              <input
                type="text"
                name="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={handleChange}
                placeholder="FACT"
                maxLength="10"
              />
              <small>{language === 'fr' ? 'Exemple: FACT, INV, F' : 'Example: FACT, INV, F'}</small>
            </div>
            <div className="form-group">
              <label>
                <i className="pi pi-sort-numeric-up"></i>
                {language === 'fr' ? 'Prochain Numéro' : 'Next Invoice Number'}
              </label>
              <input
                type="number"
                name="nextInvoiceNumber"
                value={formData.nextInvoiceNumber}
                onChange={handleChange}
                min="1"
              />
              <small>{language === 'fr' ? 'Prochaine facture: ' : 'Next invoice: '}<strong>{nextInvoiceNumber}</strong></small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <i className="pi pi-percentage"></i>
                {language === 'fr' ? 'Taux TVA par Défaut (%)' : 'Default TAX Rate (%)'}
              </label>
              <input
                type="number"
                name="defaultTaxRate"
                value={formData.defaultTaxRate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
              />
              <small>{language === 'fr' ? 'TVA appliquée aux nouvelles factures' : 'Tax applied to new invoices'}</small>
            </div>
            <div className="form-group">
              <label>
                <i className="pi pi-dollar"></i>
                {language === 'fr' ? 'Devise' : 'Currency'}
              </label>
              <select name="currency" value={formData.currency} onChange={handleChange}>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - US Dollar</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="TND">TND - Tunisian Dinar</option>
                <option value="MAD">MAD - Moroccan Dirham</option>
              </select>
            </div>
          </div>

          <div className="preview-box">
            <div className="preview-label">{language === 'fr' ? 'Aperçu Numérotation' : 'Numbering Preview'}</div>
            <div className="preview-numbers">
              <span className="preview-number">{nextInvoiceNumber}</span>
              <span className="preview-number">{formData.invoicePrefix}-{String(formData.nextInvoiceNumber + 1).padStart(4, '0')}</span>
              <span className="preview-number">{formData.invoicePrefix}-{String(formData.nextInvoiceNumber + 2).padStart(4, '0')}</span>
            </div>
          </div>
        </div>

        <div className="card settings-section">
          <h3>
            <i className="pi pi-align-left"></i>
            {language === 'fr' ? 'Notes et Conditions' : 'Notes and Terms'}
          </h3>
          <div className="form-group">
            <label>
              <i className="pi pi-comment"></i>
              {language === 'fr' ? 'Notes de Facture' : 'Invoice Notes'}
            </label>
            <textarea
              name="invoiceNotes"
              value={formData.invoiceNotes}
              onChange={handleChange}
              rows="3"
              placeholder={language === 'fr'
                ? 'Notes qui apparaîtront sur toutes vos factures (ex: Merci pour votre confiance)'
                : 'Notes that will appear on all your invoices (ex: Thank you for your business)'}
            />
          </div>

          <div className="form-group">
            <label>
              <i className="pi pi-file-pdf"></i>
              {language === 'fr' ? 'Conditions Générales' : 'Terms & Conditions'}
            </label>
            <textarea
              name="termsAndConditions"
              value={formData.termsAndConditions}
              onChange={handleChange}
              rows="4"
              placeholder={language === 'fr'
                ? 'Conditions générales (ex: Paiement à 30 jours, Pas d\'escompte, etc.)'
                : 'General terms (ex: Payment within 30 days, No discount, etc.)'}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            <i className="pi pi-times"></i>
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <i className={`pi ${saving ? 'pi-spin pi-spinner' : 'pi-check'}`}></i>
            {saving
              ? (language === 'fr' ? 'Enregistrement...' : 'Saving...')
              : (language === 'fr' ? 'Enregistrer' : 'Save')}
          </button>
        </div>
      </form>

      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="pi pi-file"></i>
                {language === 'fr' ? 'Aperçu Facture' : 'Invoice Preview'}
              </h2>
              <button onClick={() => setShowPreview(false)} className="modal-close">
                <i className="pi pi-times"></i>
              </button>
            </div>
            <div className="invoice-preview-content">
              <div className="preview-company-section">
                {formData.logo && (
                  <img src={formData.logo} alt="Company Logo" className="preview-logo" />
                )}
                <div className="preview-company-info">
                  <h3>{formData.companyName || 'Votre Société'}</h3>
                  <p>{formData.address}</p>
                  <p>{formData.postalCode} {formData.city}, {formData.country}</p>
                  <p>Tel: {formData.phone} | Email: {formData.email}</p>
                  <p>TVA: {formData.taxNumber}</p>
                </div>
              </div>

              <div className="preview-title">
                <h1>{language === 'fr' ? 'FACTURE' : 'INVOICE'}</h1>
              </div>

              <div className="preview-info-grid">
                <div className="preview-info-block">
                  <label>{language === 'fr' ? 'Facturé à:' : 'Bill To:'}</label>
                  <p className="customer-name">Client Example</p>
                  <p>123 Rue Client</p>
                  <p>75001 Paris, France</p>
                </div>
                <div className="preview-info-block right">
                  <div className="info-row">
                    <span className="label">{language === 'fr' ? 'N° Facture:' : 'Invoice #:'}</span>
                    <span className="value">{nextInvoiceNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date:</span>
                    <span className="value">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <table className="preview-items-table">
                <thead>
                  <tr>
                    <th>{language === 'fr' ? 'Description' : 'Description'}</th>
                    <th className="center">{language === 'fr' ? 'Qté' : 'Qty'}</th>
                    <th className="right">{language === 'fr' ? 'Prix Unit.' : 'Unit Price'}</th>
                    <th className="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Produit Example 1</td>
                    <td className="center">2</td>
                    <td className="right">100.00 {formData.currency}</td>
                    <td className="right">200.00 {formData.currency}</td>
                  </tr>
                  <tr>
                    <td>Produit Example 2</td>
                    <td className="center">1</td>
                    <td className="right">50.00 {formData.currency}</td>
                    <td className="right">50.00 {formData.currency}</td>
                  </tr>
                </tbody>
              </table>

              <div className="preview-totals">
                <div className="totals-row">
                  <span>{language === 'fr' ? 'Sous-total HT:' : 'Subtotal:'}</span>
                  <span>250.00 {formData.currency}</span>
                </div>
                <div className="totals-row">
                  <span>{language === 'fr' ? 'TVA' : 'TAX'} ({formData.defaultTaxRate}%):</span>
                  <span>{(250 * formData.defaultTaxRate / 100).toFixed(2)} {formData.currency}</span>
                </div>
                <div className="totals-row total">
                  <span>{language === 'fr' ? 'TOTAL TTC:' : 'TOTAL:'}</span>
                  <span>{(250 + (250 * formData.defaultTaxRate / 100)).toFixed(2)} {formData.currency}</span>
                </div>
              </div>

              {formData.invoiceNotes && (
                <div className="preview-notes">
                  <p>{formData.invoiceNotes}</p>
                </div>
              )}

              {formData.termsAndConditions && (
                <div className="preview-terms">
                  <h4>{language === 'fr' ? 'Conditions:' : 'Terms:'}</h4>
                  <p>{formData.termsAndConditions}</p>
                </div>
              )}

              <div className="preview-bank-info">
                <p><strong>{language === 'fr' ? 'Coordonnées Bancaires:' : 'Bank Details:'}</strong></p>
                <p>{formData.bankName} - IBAN: {formData.bankAccount}</p>
                <p>BIC: {formData.swiftCode}</p>
              </div>
            </div>

            <div className="modal-footer preview-footer">
              <button onClick={() => setShowPreview(false)} className="btn btn-secondary">
                <i className="pi pi-times"></i>
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;
