# 📝 Step-by-Step: Create Your First Facture

## ✅ Prerequisites

Both servers should be running:
- ✅ Backend on port 8080
- ✅ Frontend on port 3000

---

## Step 1: Clean Start (Optional but Recommended)

### Reset Database in Navicat:

1. Open **Navicat**
2. Connect to **business_db**
3. Click **Query** → **New Query**
4. Paste this SQL:
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
5. Press **F5** or click **Run**
6. Close Navicat

### Restart Backend:

```bash
# Find process on port 8080
netstat -ano | findstr :8080

# Kill it (replace XXXXX with the PID number)
taskkill //PID XXXXX //F

# Start fresh backend
mvn spring-boot:run
```

**Wait for:** `Started DemoApplication` message

---

## Step 2: Register & Login

### Open Browser:
```
http://localhost:3000
```

### Create Admin Account:

1. Click **"S'inscrire"** (Sign Up) button
2. Fill in:
   ```
   Username:  admin
   Email:     admin@company.com
   Password:  admin123
   ```
3. Click **"S'inscrire"** (Sign Up)
4. You'll see: "User registered successfully!"

### Login:

1. Click **"Connexion"** (Login) link
2. Enter:
   ```
   Username:  admin
   Password:  admin123
   ```
3. Click **"Se connecter"** (Sign In)

**You'll see:** New modern dashboard with gradient sidebar

---

## Step 3: Configure Company (CRITICAL!)

### Go to Company Settings:

1. In the sidebar, click **"Company Settings"** 🏢
   - OR click the card in "Quick Start Guide" section

### Fill Company Information:

#### 📋 Basic Information:
```
Company Name:     Ma Société SARL
Email:            contact@masociete.fr
Phone:            +33 1 23 45 67 89
Website:          www.masociete.fr
Address:          123 Avenue des Champs-Élysées
City:             Paris
Postal Code:      75008
Country:          France
```

#### 💼 Legal Information:
```
Tax Number (TVA):          FR12345678901
Registration Number:       123 456 789 00010
```

#### 🏦 Banking Information:
```
Bank Name:        BNP Paribas
Bank Account:     FR76 1234 5678 9012 3456 7890 123
SWIFT/BIC:        BNPAFRPPXXX
```

#### 📄 Invoice Configuration (IMPORTANT!):
```
Invoice Prefix:           FACT
Next Invoice Number:      1
Default Tax Rate (%):     20
Currency:                 EUR (€)
```

**You'll see preview:** FACT-0001  FACT-0002  FACT-0003

#### 📝 Notes and Terms:
```
Invoice Notes:
Merci pour votre confiance. Paiement à réception de facture.

Terms & Conditions:
Paiement à 30 jours par virement bancaire.
Aucun escompte pour règlement anticipé.
En cas de retard, pénalités de 3 fois le taux d'intérêt légal.
```

### Save Configuration:

Click **"Save"** button at bottom

**Wait for:** "Success" message

---

## Step 4: View Invoice Preview

### See How Your Invoices Will Look:

1. Click **"Aperçu Facture"** (Invoice Preview) button (top right)
2. **You'll see a professional invoice with:**
   - Your company name and address
   - Sample client
   - Sample products
   - Automatic calculations
   - Your notes and banking details

**This is exactly how your real invoices will look!**

3. Click **×** to close preview

---

## Step 5: Add Your First Client

### Go to Client Management:

1. In sidebar, click **"Client Management"** 👥

### Add Client:

1. Click **"Add Client"** button
2. Fill in:

```
Client Name:        Entreprise ABC
Company Name:       ABC Consulting SARL
Email:              contact@abc-consulting.fr
Phone:              +33 6 12 34 56 78

Address:            456 Boulevard Saint-Germain
City:               Paris
Postal Code:        75006
Country:            France

Tax Number:         FR98765432109

Notes:
Client important, paiement toujours à temps.
```

3. Click **"Create"** button

**You'll see:** Client added to the table

### Add Second Client (Optional):

Repeat to add more clients:
```
Client Name:        Tech Solutions
Company Name:       Tech Solutions SAS
Email:              info@techsolutions.fr
Phone:              +33 6 98 76 54 32
Address:            789 Rue de Rivoli
City:               Lyon
Postal Code:        69001
Country:            France
```

---

## Step 6: Add Your Products/Services

### Go to Products:

1. In sidebar, click **"Products"** 📦

### Add Product 1:

1. Click **"Add Product"** button
2. Fill in:

```
Product Name:       Développement Web
Description:        Développement site web responsive
Price:              1500.00
Stock Quantity:     100
Category:           Services Web
```

3. Click **"Save"**

### Add Product 2:

1. Click **"Add Product"** again
2. Fill in:

```
Product Name:       Consultation IT
Description:        Consultation et conseil informatique (par jour)
Price:              800.00
Stock Quantity:     50
Category:           Consulting
```

3. Click **"Save"**

### Add Product 3:

```
Product Name:       Maintenance Annuelle
Description:        Maintenance et support technique annuel
Price:              2500.00
Stock Quantity:     20
Category:           Support
```

**You'll see:** 3 products in your catalog

---

## Step 7: Create Your First Facture! 🎉

### Go to Invoices:

1. In sidebar, click **"Invoices"** 📄

### Create New Invoice:

1. Click **"Create New Invoice"** button
2. **You'll see the invoice creation form**

### Fill Invoice Form:

#### Select Client:
```
Client:  Entreprise ABC
```

#### Add Items:

**Item 1:**
1. Click **"Select Product"** dropdown
2. Choose: **"Développement Web - 1500€ (Stock: 100)"**
3. Quantity: **2**

**The system shows:**
- Product: Développement Web
- Quantity: 2
- Price: 1500.00 €
- **Line Total: 3000.00 €**

**Item 2:**
1. Click **"Add Another Item"** button
2. Select Product: **"Consultation IT - 800€"**
3. Quantity: **3**

**The system shows:**
- Product: Consultation IT
- Quantity: 3
- Price: 800.00 €
- **Line Total: 2400.00 €**

### See Automatic Calculation:

**The system automatically calculates:**

```
Item 1: Développement Web    2 × 1500.00 = 3000.00 €
Item 2: Consultation IT       3 ×  800.00 = 2400.00 €
─────────────────────────────────────────────────────
Sous-total HT:                           5400.00 €
TVA (20%):                               1080.00 €
─────────────────────────────────────────────────────
TOTAL TTC:                               6480.00 €
```

### Create Invoice:

Click **"Create Invoice"** button

**What happens:**
1. ✅ Invoice number generated: **FACT-0001**
2. ✅ Client linked: Entreprise ABC
3. ✅ Products added with quantities
4. ✅ Subtotal calculated: 5400.00 €
5. ✅ TVA calculated: 1080.00 €
6. ✅ Total calculated: 6480.00 €
7. ✅ Stock updated:
   - Développement Web: 100 → 98
   - Consultation IT: 50 → 47
8. ✅ Invoice saved with status: **PENDING**
9. ✅ Next invoice will be: **FACT-0002**

**You'll see:** Success message and invoice in the list!

---

## Step 8: View Your Invoice

### In Invoice List:

You'll see:
```
┌─────────────────────────────────────────────────────────────┐
│ Invoice #  │ Customer          │ Date       │ Total    │ Status  │
│ FACT-0001  │ Entreprise ABC    │ 02/12/2025 │ 6480.00€ │ PENDING │
└─────────────────────────────────────────────────────────────┘
```

### Invoice Status:

- **PENDING** (Orange) = Waiting for payment
- You can mark it **PAID** (Green) when client pays
- Or **CANCELLED** (Red) if needed

---

## Step 9: Create Second Invoice

### Test the Automatic Numbering:

1. Click **"Create New Invoice"** again
2. Select Client: **"Tech Solutions"** (if you added it)
3. Add products:
   - Maintenance Annuelle × 1 = 2500.00 €
4. System calculates:
   ```
   Sous-total: 2500.00 €
   TVA (20%):   500.00 €
   TOTAL:      3000.00 €
   ```
5. Click **"Create Invoice"**

**Result:**
- Invoice number: **FACT-0002** ✅ (automatically incremented!)
- Stock updated automatically
- Status: PENDING

---

## 🎯 Complete Workflow Example

### Real Business Scenario:

**Your Company:** Ma Société SARL (configured in Step 3)

**Client Calls:** "I need a website"

**You:**
1. ✅ Add client to system (if new)
2. ✅ Go to Invoices → Create New Invoice
3. ✅ Select client
4. ✅ Add products/services
5. ✅ System calculates everything automatically
6. ✅ Click Create
7. ✅ Invoice FACT-0003 generated!
8. ✅ Email client (coming soon) or print
9. ✅ Mark as PAID when payment received

**Done in 2 minutes!**

---

## 📊 Check Your Dashboard

### View Statistics:

1. Click **"Dashboard"** in sidebar
2. You'll see:

```
┌─────────────────────────────────────────┐
│  👥 Clients           📦 Products        │
│      2                    3              │
│                                          │
│  📄 Invoices          💰 Revenue         │
│      2                    0.00€          │
│  (0 paid, 2 pending)                     │
└─────────────────────────────────────────┘
```

### When You Mark Invoice as PAID:

1. Go to Invoices
2. Find FACT-0001
3. Click **"Mark Paid"** button
4. Status changes to **PAID** ✅
5. Revenue updates: **6480.00€**

---

## 🌍 Switch Language

### Try French/English:

1. Top right corner: **FR** / **EN** buttons
2. Click **EN** → Everything in English
3. Click **FR** → Everything in French

**Both interfaces work perfectly!**

---

## ✅ Summary - What You Just Did:

1. ✅ **Cleaned database** (fresh start)
2. ✅ **Registered admin user**
3. ✅ **Configured company** with all details
4. ✅ **Viewed invoice preview** (exactly how invoices look)
5. ✅ **Added clients** (Entreprise ABC, Tech Solutions)
6. ✅ **Added products** (Développement Web, Consultation IT, Maintenance)
7. ✅ **Created invoice FACT-0001** with automatic calculations
8. ✅ **Created invoice FACT-0002** (auto-numbered!)
9. ✅ **Checked dashboard** with real statistics

---

## 🎉 Congratulations!

You now have a **fully functional facturation system** with:

- ✅ Professional invoices with your branding
- ✅ Automatic calculations (Subtotal, TVA, Total)
- ✅ Automatic invoice numbering (FACT-0001, FACT-0002...)
- ✅ Stock management (auto-deduction)
- ✅ Client database
- ✅ Product catalog
- ✅ Bilingual interface (FR/EN)

---

## 🚀 Next Steps:

### Daily Usage:

**When a client orders:**
1. Invoices → Create New Invoice
2. Select client
3. Add products
4. Click Create
5. **Done!** System handles everything

**When client pays:**
1. Find invoice in list
2. Click "Mark Paid"
3. **Done!** Revenue updates automatically

### Additional Features:

**Add more clients:**
- Client Management → Add Client

**Add more products:**
- Products → Add Product

**View statistics:**
- Dashboard shows real-time data

**Change language:**
- FR/EN toggle anytime

---

## 📱 Where Everything Is:

### Sidebar Navigation:

- **📊 Dashboard** → Statistics & overview
- **🏢 Company Settings** → Configure company & preview invoices
- **👥 Client Management** → Add/edit clients
- **📦 Products** → Manage products/services catalog
- **📄 Invoices** → Create & manage invoices
- **⚙️ User Management** → Manage users (Admin only)

---

## 🎯 Pro Tips:

### Invoice Numbering:
- Never manually change numbers
- System auto-increments perfectly
- FACT-0001 → FACT-0002 → FACT-0003...

### Tax Calculation:
- Always applied automatically
- Configure once in Company Settings
- France: Use 20% TVA

### Stock Management:
- Automatically deducted when invoice created
- Check Products page for current stock
- System prevents negative stock

### Professional Touch:
- Always fill complete client information
- Add detailed product descriptions
- Use Invoice Notes for personal message
- Include payment terms

---

## 📞 Support:

### If Something Doesn't Work:

1. **Check both servers are running:**
   - Backend: Port 8080
   - Frontend: Port 3000

2. **Check console for errors:**
   - Press F12 in browser
   - Look at Console tab

3. **Reset database if needed:**
   - Run SQL script again
   - Restart backend
   - Start from Step 1

---

## 🎊 You're Ready to Invoice!

Your facturation system is **100% ready** for production use!

Start generating professional invoices in **seconds** instead of **hours**!

**Bonne facturation! / Happy invoicing!** 🚀
