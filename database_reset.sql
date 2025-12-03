-- ========================================
-- DATABASE RESET SCRIPT
-- Run this in Navicat or psql to clean all data
-- ========================================

-- Drop all tables to start fresh
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Tables will be recreated automatically by Hibernate when you restart the backend
-- The system will create clean tables with the new facturation structure

-- ========================================
-- INSTRUCTIONS:
-- ========================================
-- 1. Open Navicat
-- 2. Connect to business_db database
-- 3. Click "Query" -> "New Query"
-- 4. Copy and paste this entire script
-- 5. Click "Run" (F5)
-- 6. All tables and data will be deleted
-- 7. Restart the Spring Boot backend
-- 8. Hibernate will recreate all tables automatically
-- ========================================
