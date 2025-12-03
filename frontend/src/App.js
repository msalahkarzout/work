import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import NewDashboard from './pages/NewDashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import CompanySettings from './pages/CompanySettings';
import ActivityLogs from './pages/ActivityLogs';
import './App.css';

// Protected Route wrapper with Layout
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><NewDashboard /></ProtectedRoute>} />
            <Route path="/company" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
