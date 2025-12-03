import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ApiService from '../services/api.service';
import './AppTopbar.css';

const AppTopbar = ({ onMenuButtonClick, onToggleSidebar, sidebarCollapsed }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);

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
    const isAdmin = userData.roles && userData.roles.includes('ROLE_ADMIN');

    // Load recent activity logs as notifications
    useEffect(() => {
        if (isAdmin) {
            loadNotifications();
        }
    }, [isAdmin]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = () => {
        ApiService.getActivityLogsPaginated(0, 5)
            .then(response => {
                const logs = response.data.content || response.data || [];
                setNotifications(logs.slice(0, 5));
                setUnreadCount(Math.min(logs.length, 5));
            })
            .catch(error => {
                console.error('Error loading notifications:', error);
            });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return language === 'fr' ? 'À l\'instant' : 'Just now';
        if (diffMins < 60) return language === 'fr' ? `Il y a ${diffMins} min` : `${diffMins}m ago`;
        if (diffHours < 24) return language === 'fr' ? `Il y a ${diffHours}h` : `${diffHours}h ago`;
        return language === 'fr' ? `Il y a ${diffDays}j` : `${diffDays}d ago`;
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'CREATE': return 'pi-plus-circle';
            case 'UPDATE': return 'pi-pencil';
            case 'DELETE': return 'pi-trash';
            case 'LOGIN': return 'pi-sign-in';
            case 'LOGOUT': return 'pi-sign-out';
            default: return 'pi-info-circle';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return '#48bb78';
            case 'UPDATE': return '#ed8936';
            case 'DELETE': return '#f56565';
            case 'LOGIN': return '#667eea';
            case 'LOGOUT': return '#a0aec0';
            default: return '#718096';
        }
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

    return (
        <div className="layout-topbar">
            <div className="layout-topbar-left">
                <button className="layout-menu-button mobile-only" onClick={onMenuButtonClick}>
                    <i className="pi pi-bars"></i>
                </button>

                <button
                    className="layout-toggle-button desktop-only"
                    onClick={onToggleSidebar}
                    title={sidebarCollapsed ? (language === 'fr' ? 'Ouvrir le menu' : 'Expand menu') : (language === 'fr' ? 'Fermer le menu' : 'Collapse menu')}
                >
                    <i className={`pi ${sidebarCollapsed ? 'pi-angle-double-right' : 'pi-angle-double-left'}`}></i>
                </button>

                <div className="layout-topbar-logo">
                    <div className="logo-icon">
                        <i className="pi pi-receipt"></i>
                    </div>
                    <span className="app-name">Invoice Pro</span>
                </div>
            </div>

            <div className="layout-topbar-menu">
                <LanguageSwitcher />

                <div className="layout-topbar-divider"></div>

                {/* Notification Bell with Dropdown */}
                <div className="notification-wrapper" ref={notificationRef}>
                    <div
                        className="layout-topbar-item notification-bell"
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowUserMenu(false);
                        }}
                    >
                        <i className="pi pi-bell"></i>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </div>

                    {showNotifications && (
                        <div className="dropdown-menu notification-dropdown">
                            <div className="dropdown-header">
                                <span>{language === 'fr' ? 'Notifications' : 'Notifications'}</span>
                                {isAdmin && (
                                    <button
                                        className="view-all-btn"
                                        onClick={() => {
                                            navigate('/activity-logs');
                                            setShowNotifications(false);
                                        }}
                                    >
                                        {language === 'fr' ? 'Voir tout' : 'View all'}
                                    </button>
                                )}
                            </div>
                            <div className="dropdown-content">
                                {notifications.length > 0 ? (
                                    notifications.map((notif, index) => (
                                        <div key={index} className="notification-item">
                                            <div
                                                className="notification-icon"
                                                style={{ backgroundColor: `${getActionColor(notif.action)}15`, color: getActionColor(notif.action) }}
                                            >
                                                <i className={`pi ${getActionIcon(notif.action)}`}></i>
                                            </div>
                                            <div className="notification-content">
                                                <span className="notification-text">
                                                    <strong>{notif.username}</strong> {notif.action.toLowerCase()}d {notif.entityType.toLowerCase()}
                                                </span>
                                                <span className="notification-time">{formatTimeAgo(notif.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="notification-empty">
                                        <i className="pi pi-bell-slash"></i>
                                        <span>{language === 'fr' ? 'Aucune notification' : 'No notifications'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu with Dropdown */}
                <div className="user-menu-wrapper" ref={userMenuRef}>
                    <div
                        className="layout-topbar-item user-info"
                        onClick={() => {
                            setShowUserMenu(!showUserMenu);
                            setShowNotifications(false);
                        }}
                    >
                        <div className="user-avatar">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{username}</span>
                            {role && <span className="user-role">{getDisplayRole(role)}</span>}
                        </div>
                        <i className={`pi pi-chevron-down user-dropdown-icon ${showUserMenu ? 'rotated' : ''}`}></i>
                    </div>

                    {showUserMenu && (
                        <div className="dropdown-menu user-dropdown">
                            <div className="dropdown-user-header">
                                <div className="dropdown-avatar">
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <div className="dropdown-user-info">
                                    <span className="dropdown-username">{username}</span>
                                    <span className="dropdown-role">{getDisplayRole(role)}</span>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-content">
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        navigate('/company');
                                        setShowUserMenu(false);
                                    }}
                                >
                                    <i className="pi pi-cog"></i>
                                    <span>{language === 'fr' ? 'Paramètres' : 'Settings'}</span>
                                </button>
                                {isAdmin && (
                                    <button
                                        className="dropdown-item"
                                        onClick={() => {
                                            navigate('/users');
                                            setShowUserMenu(false);
                                        }}
                                    >
                                        <i className="pi pi-users"></i>
                                        <span>{language === 'fr' ? 'Utilisateurs' : 'Users'}</span>
                                    </button>
                                )}
                            </div>
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-content">
                                <button
                                    className="dropdown-item logout-item"
                                    onClick={handleLogout}
                                >
                                    <i className="pi pi-sign-out"></i>
                                    <span>{language === 'fr' ? 'Déconnexion' : 'Logout'}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppTopbar;
