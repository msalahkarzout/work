import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './AppMenu.css';

const AppMenu = ({ collapsed }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();

    // Get user data from localStorage
    const getUserData = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user || {};
        } catch {
            return {};
        }
    };

    const userData = getUserData();
    const username = userData.username || 'User';
    const role = userData.roles && userData.roles.length > 0 ? userData.roles[0] : '';

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getDisplayRole = (role) => {
        if (!role) return '';
        const roleMap = {
            'ROLE_ADMIN': language === 'fr' ? 'Administrateur' : 'Administrator',
            'ROLE_MANAGER': language === 'fr' ? 'Gestionnaire' : 'Manager',
            'ROLE_USER': language === 'fr' ? 'Utilisateur' : 'User'
        };
        return roleMap[role] || role.replace('ROLE_', '');
    };

    const menuItems = [
        {
            label: language === 'fr' ? 'Tableau de bord' : 'Dashboard',
            icon: 'pi pi-home',
            to: '/dashboard'
        },
        {
            label: language === 'fr' ? 'Factures' : 'Invoices',
            icon: 'pi pi-file',
            to: '/invoices'
        },
        {
            label: language === 'fr' ? 'Clients' : 'Clients',
            icon: 'pi pi-users',
            to: '/clients'
        },
        {
            label: language === 'fr' ? 'Produits' : 'Products',
            icon: 'pi pi-box',
            to: '/products'
        },
        {
            label: language === 'fr' ? 'Utilisateurs' : 'Users',
            icon: 'pi pi-user',
            to: '/users'
        },
        {
            label: language === 'fr' ? 'Journal d\'Activité' : 'Activity Logs',
            icon: 'pi pi-history',
            to: '/activity-logs'
        },
        {
            label: language === 'fr' ? 'Paramètres' : 'Settings',
            icon: 'pi pi-cog',
            to: '/company'
        }
    ];

    return (
        <div className={`layout-menu-container ${collapsed ? 'collapsed' : ''}`}>
            {/* User Profile Section */}
            <div className="sidebar-profile">
                <div className="profile-avatar">
                    {username.charAt(0).toUpperCase()}
                </div>
                {!collapsed && (
                    <div className="profile-info">
                        <span className="profile-name">{username}</span>
                        <span className="profile-role">{getDisplayRole(role)}</span>
                    </div>
                )}
            </div>

            {/* Menu Label */}
            {!collapsed && (
                <div className="menu-section-label">
                    {language === 'fr' ? 'MENU PRINCIPAL' : 'MAIN MENU'}
                </div>
            )}

            {/* Navigation Menu */}
            <ul className="layout-menu">
                {menuItems.map((item, index) => (
                    <li key={index} className="layout-menuitem">
                        <NavLink
                            to={item.to}
                            className={({ isActive }) => isActive ? 'layout-menuitem-link active' : 'layout-menuitem-link'}
                            title={collapsed ? item.label : ''}
                        >
                            <i className={item.icon}></i>
                            {!collapsed && <span className="layout-menuitem-text">{item.label}</span>}
                        </NavLink>
                    </li>
                ))}
            </ul>

            {/* Logout Section */}
            <div className="sidebar-footer">
                {!collapsed && (
                    <div className="menu-section-label">
                        {language === 'fr' ? 'COMPTE' : 'ACCOUNT'}
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="layout-menuitem-link logout-btn"
                    title={collapsed ? (language === 'fr' ? 'Déconnexion' : 'Logout') : ''}
                >
                    <i className="pi pi-sign-out"></i>
                    {!collapsed && (
                        <span className="layout-menuitem-text">
                            {language === 'fr' ? 'Déconnexion' : 'Logout'}
                        </span>
                    )}
                </button>
            </div>

            {/* Version Footer */}
            {!collapsed && (
                <div className="sidebar-version">
                    <span>Invoice Pro v1.0</span>
                    <span>© 2024</span>
                </div>
            )}
        </div>
    );
};

export default AppMenu;
