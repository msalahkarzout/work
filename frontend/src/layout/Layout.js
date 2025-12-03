import React, { useState, useEffect } from 'react';
import AppTopbar from './AppTopbar';
import AppMenu from './AppMenu';
import './Layout.css';

const Layout = ({ children }) => {
    const [sidebarActive, setSidebarActive] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const onMenuButtonClick = () => {
        setSidebarActive(!sidebarActive);
    };

    const onToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const closeSidebar = () => {
        setSidebarActive(false);
    };

    return (
        <div className={`layout-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <AppTopbar
                onMenuButtonClick={onMenuButtonClick}
                onToggleSidebar={onToggleSidebar}
                sidebarCollapsed={sidebarCollapsed}
            />

            <div className={`layout-sidebar ${sidebarActive ? 'active' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <AppMenu collapsed={sidebarCollapsed} />
            </div>

            {sidebarActive && (
                <div className="layout-mask" onClick={closeSidebar}></div>
            )}

            <div className={`layout-main-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="layout-main">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
