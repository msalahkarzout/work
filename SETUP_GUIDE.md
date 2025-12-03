# 🚀 Professional Facturation System - Setup & User Guide

## 📋 Table of Contents
1. [Clean Database & Start Fresh](#clean-database)
2. [Start the System](#start-system)
3. [First Time Setup](#first-time-setup)
4. [Configure Your Company](#configure-company)
5. [View Invoice Preview](#invoice-preview)
6. [Create Your First Invoice](#create-invoice)
7. [Complete Workflow](#complete-workflow)

---

## 1. Clean Database & Start Fresh {#clean-database}

### Option A: Using Navicat (Recommended)

1. **Open Navicat** and connect to `business_db`

2. **Execute the reset script:**
   - Click "Query" → "New Query"
   - Open the file: `database_reset.sql`
   - Click "Run" (or press F5)
   - All tables and old data will be deleted

3. **Verify:** All tables should be gone

### Option B: Manual SQL

Run this in Navicat Query:
```sql
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
```

---

## 2. Start the System {#start-system}

### Step 1: Start Backend

```bash
# Stop any running backend first
netstat -ano | findstr :8080
# If a process is found, kill it:
taskkill //PID [PID_NUMBER] //F

# Start fresh backend
mvn spring-boot:run
```

**Wait for:** `Started DemoApplication in X seconds`

### Step 2: Frontend is Already Running

The frontend should already be running on port 3000. If not:
```bash
cd frontend
npm start
```

### Step 3: Access the System

Open browser: **http://localhost:3000**

---

## 3. First Time Setup {#first-time-setup}

### Register a New Admin User

1. Click **"S'inscrire" / "Sign Up"**
2. Fill in:
   - Username: `admin`
   - Email: `admin@company.com`
   - Password: `admin123`
3. Click **"S'inscrire"**

### Login

1. Use the credentials you just created
2. Click **"Se connecter" / "Sign In"**
3. You'll see the new **Facturation Dashboard**

---

## 4. Configure Your Company {#configure-company}

### Go to Company Settings

Click **"Company Settings"** in the sidebar or the setup guide

### Fill in Your Company Information

#### 📋 Basic Information
- **Company Name:** Your business name
- **Email:** contact@yourcompany.com
- **Phone:** +33 1 23 45 67 89
- **Website:** www.yourcompany.com
- **Address:** Full address
- **City, Postal Code, Country**

#### 💼 Legal Information
- **Tax Number (TVA):** FR12345678901
- **Registration Number (SIRET):** 123 456 789 00010

#### 🏦 Banking Information
- **Bank Name:** Your bank
- **Bank Account (IBAN):** FR76 1234 5678 9012 3456 7890 123
- **SWIFT/BIC Code:** BNPAFRPPXXX

#### 📄 Invoice Configuration (IMPORTANT!)

This is where you configure how your invoices will look:

- **Invoice Prefix:**
  - French: `FACT` (will generate FACT-0001, FACT-0002...)
  - English: `INV` (will generate INV-0001, INV-0002...)
  - Custom: Any prefix you want (max 10 characters)

- **Next Invoice Number:**
  - Start from 1 for new system
  - Or set to continue from existing number

- **Default Tax Rate (%):**
  - France: 20% (TVA standard)
  - Other: Your country's tax rate

- **Currency:**
  - EUR (€) - Euro
  - USD ($) - Dollar
  - GBP (£) - Pound
  - MAD (DH) - Dirham

#### 👀 Preview Numbering

You'll see a preview of how your invoice numbers will look:
```
FACT-0001  FACT-0002  FACT-0003
```

#### 📝 Notes and Terms

- **Invoice Notes:** Message that appears on all invoices
  - Example: "Merci pour votre confiance"
  - Example: "Thank you for your business"

- **Terms & Conditions:** Payment terms
  - Example: "Paiement à 30 jours. Pas d'escompte pour règlement anticipé."
  - Example: "Payment within 30 days. No discount for early payment."

### Save Configuration

Click **"Save"** button

---

## 5. View Invoice Preview {#invoice-preview}

### See How Your Invoices Will Look

1. In Company Settings page
2. Click **"Aperçu Facture" / "Invoice Preview"** button (top right)
3. You'll see a professional invoice template with:
   - Your company information
   - Sample client information
   - Sample products
   - Automatic calculations:
     - Subtotal HT (excluding tax)
     - TVA (20% by default)
     - Total TTC (including tax)
   - Your notes and terms
   - Banking details

### What You'll See:

```
┌─────────────────────────────────────────┐
│  YOUR COMPANY NAME         FACTURE      │
│  123 Rue...                FACT-0001    │
│  75001 Paris               Date: ...    │
│  Tel: ...                               │
│─────────────────────────────────────────│
│  Facturé à:                             │
│  Client Example                         │
│  123 Rue Client                         │
│─────────────────────────────────────────│
│  Description     Qty   Price    Total   │
│  Product 1       2     100€     200€    │
│  Product 2       1     50€      50€     │
│─────────────────────────────────────────│
│                  Sous-total HT:  250€   │
│                  TVA (20%):      50€    │
│                  TOTAL TTC:      300€   │
│─────────────────────────────────────────│
│  Notes: Merci pour votre confiance      │
│  Terms: Paiement à 30 jours             │
│  Bank: IBAN...                          │
└─────────────────────────────────────────┘
```

**This is exactly how your real invoices will look!**

---

## 6. Create Your First Invoice {#create-invoice}

### Before Creating Invoices, You Need:

1. **At least one Client** (go to Client Management)
2. **At least one Product** (go to Products)
3. **Company configured** (done in step 4)

### Add a Client

1. Go to **"Client Management"** (sidebar)
2. Click **"Add Client"**
3. Fill in:
   - Name: Client Company Name
   - Email, Phone
   - Address details
   - Tax Number (if applicable)
4. Click **"Create"**

### Add Products

1. Go to **"Products"** (sidebar)
2. Click **"Add Product"**
3. Fill in:
   - Product Name
   - Description
   - Price (e.g., 100.00)
   - Stock Quantity (e.g., 50)
   - Category
4. Click **"Save"**

### Now Create Invoice

1. Go to **"Invoices"** (sidebar)
2. Click **"Create New Invoice"**
3. Select **Client** from dropdown
4. Add **Products:**
   - Select product
   - Enter quantity
   - Click "Add Another Item" for more products
5. System **automatically calculates:**
   - Subtotal = Sum of (Price × Quantity)
   - TVA = Subtotal × Tax Rate
   - Total = Subtotal + TVA
6. Click **"Create Invoice"**

### What Happens:

- ✅ Invoice number auto-generated (FACT-0001)
- ✅ Product stock automatically deducted
- ✅ Calculations done automatically
- ✅ Invoice saved to database
- ✅ Next invoice will be FACT-0002

---

## 7. Complete Workflow {#complete-workflow}

### Example: Creating Invoice FACT-0001

**Setup (Done Once):**
1. ✅ Company configured with prefix "FACT", TVA 20%
2. ✅ Client added: "ABC Company"
3. ✅ Products added:
   - Web Development: 100€, Stock: 50
   - Consulting: 75€, Stock: 100

**Creating the Invoice:**
1. Go to Invoices → Create New Invoice
2. Select Client: "ABC Company"
3. Add items:
   - Web Development: Quantity 5
   - Consulting: Quantity 2
4. System calculates:
   ```
   Web Development: 100€ × 5 = 500€
   Consulting:      75€  × 2 = 150€
   ─────────────────────────────────
   Subtotal HT:              650€
   TVA (20%):                130€
   ─────────────────────────────────
   TOTAL TTC:                780€
   ```
5. Click "Create Invoice"

**Result:**
- ✅ Invoice FACT-0001 created
- ✅ Stock updated:
  - Web Development: 50 → 45
  - Consulting: 100 → 98
- ✅ Invoice status: PENDING
- ✅ Next invoice will be: FACT-0002

---

## 📊 Dashboard Overview

### Statistics Cards
- **Total Clients:** Number of clients in system
- **Total Products:** Products in your catalog
- **Total Invoices:** All invoices created
- **Revenue:** Total from PAID invoices

### Invoice Status
- **Pending:** Awaiting payment
- **Paid:** Payment received
- **Cancelled:** Invoice cancelled

### Quick Actions
Direct buttons to:
- Create new invoice
- Add client
- Add product
- Configure company settings

### 🚀 Quick Start Guide
Step-by-step cards showing:
1. Configure company settings
2. Add your clients
3. Create product catalog
4. Create your first invoice

---

## 🌍 Language Switching

### Switch Between French and English

**In Dashboard:**
- Top right corner: **FR / EN** toggle
- Entire interface changes language
- Settings preserved

**Languages Available:**
- 🇫🇷 **French:** Full facturation terminology
- 🇬🇧 **English:** Full invoicing terminology

**All pages translated:**
- Dashboard
- Company Settings
- Client Management
- Products
- Invoices
- Users

---

## 🎨 Modern Interface Features

### New Dashboard
- **Modern gradient sidebar**
- **Statistics cards with icons**
- **Quick action buttons**
- **Setup guide**
- **Real-time data**

### Company Settings
- **Professional form layout**
- **Live invoice numbering preview**
- **Full invoice preview modal**
- **Tax configuration**
- **Banking details**

### Invoice Preview
- **Professional invoice template**
- **Company logo space**
- **Client details**
- **Line items table**
- **Tax breakdown**
- **Terms and conditions**
- **Banking information**

---

## 💡 Tips & Best Practices

### Invoice Numbering
- **Start from 1** for new business
- **Use consistent prefix** (FACT, INV, etc.)
- **Never manually change** invoice numbers
- **System auto-increments** perfectly

### Tax Configuration
- **France:** Use 20% TVA
- **Check your country** tax rate
- **Update in Company Settings**
- **Applied to all new invoices**

### Client Management
- **Complete information** = professional invoices
- **Tax numbers** for business clients
- **Full address** required

### Product Catalog
- **Accurate pricing**
- **Keep stock updated**
- **Categories** for organization

### Invoice Workflow
1. Configure company **once**
2. Add clients **as needed**
3. Build product catalog
4. Create invoices **in seconds**
5. System handles **everything automatically**

---

## 🎯 What's Automated

The system automatically:
- ✅ Generates invoice numbers (FACT-0001, FACT-0002...)
- ✅ Calculates subtotals
- ✅ Applies tax/TVA
- ✅ Calculates totals
- ✅ Deducts product stock
- ✅ Links clients to invoices
- ✅ Sets due dates (30 days default)
- ✅ Adds company information
- ✅ Formats professional invoices

You just:
- Select client
- Add products
- Click create
- **Done!**

---

## 🔒 Access Control

### Admin Users Can:
- ✅ Configure company settings
- ✅ Manage all clients
- ✅ Manage all products
- ✅ Create/edit/delete invoices
- ✅ Manage users
- ✅ View all statistics

### Manager Users Can:
- ✅ Manage clients
- ✅ Manage products
- ✅ Create/edit invoices
- ✅ View statistics
- ❌ Cannot manage users
- ❌ Cannot change company settings

### Regular Users Can:
- ✅ View invoices
- ✅ View products
- ❌ Cannot create/edit

---

## 📱 Responsive Design

Works perfectly on:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px)
- 📱 Tablet (768px)
- 📱 Mobile (375px)

All pages adapt automatically!

---

## 🎉 You're Ready!

Your professional facturation system is now configured and ready to use!

**Next Steps:**
1. ✅ Clean database (if needed)
2. ✅ Configure your company
3. ✅ View invoice preview
4. ✅ Add your clients
5. ✅ Add your products
6. ✅ Create your first invoice
7. ✅ Switch language as needed

**Questions?**
- All fields have placeholders
- Hover for tooltips
- Preview shows exactly what clients see
- System prevents errors automatically

**Enjoy your new facturation system!** 🎊
