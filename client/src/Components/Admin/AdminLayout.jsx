import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        {
            title: 'Dashboard',
            icon: '📊',
            path: '/admin/dashboard',
            submenu: []
        },
        {
            title: 'Temps Réel',
            icon: '🔴',
            path: '/admin/live-requests',
            submenu: []
        },
        {
            title: 'Gestion Citoyens',
            icon: '👥',
            path: '/admin/citizens',
            submenu: []
        },
        {
            title: 'Gestion Départements',
            icon: '🏢',
            submenu: [
                { title: 'Responsables', path: '/admin/departments/incharge' },
                { title: 'Départements', path: '/admin/departments' },
                { title: 'Responsables Inactifs', path: '/admin/departments/inactive' }
            ]
        },
        {
            title: 'Gestion Services',
            icon: '⚙️',
            path: '/admin/services',
            submenu: []
        },
        {
            title: 'Requêtes de Plaintes',
            icon: '📝',
            path: '/admin/requests',
            submenu: []
        },
        {
            title: 'Analytics Avancés',
            icon: '📈',
            submenu: [
                { title: 'Rapports Analytics', path: '/admin/analytics' },
                { title: 'Geo Analytics', path: '/admin/geo-analytics' }
            ]
        },
        {
            title: 'Notifications',
            icon: '🔔',
            path: '/admin/notifications',
            submenu: []
        },
        {
            title: 'Paramètres',
            icon: '⚙️',
            submenu: [
                { title: 'Paramètres App', path: '/admin/settings/app' },
                { title: 'Configurations Notifications', path: '/admin/settings/notifications' },
                { title: 'Paramètres Panel', path: '/admin/settings/panel' }
            ]
        }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>FASONEKRE</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <div key={index} className="menu-item">
                            {item.submenu && item.submenu.length > 0 ? (
                                <details>
                                    <summary>
                                        <span className="menu-icon">{item.icon}</span>
                                        {sidebarOpen && <span className="menu-title">{item.title}</span>}
                                    </summary>
                                    <div className="submenu">
                                        {item.submenu.map((subitem, subindex) => (
                                            <Link
                                                key={subindex}
                                                to={subitem.path}
                                                className={`submenu-item ${isActive(subitem.path) ? 'active' : ''}`}
                                            >
                                                {subitem.title}
                                            </Link>
                                        ))}
                                    </div>
                                </details>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`menu-link ${isActive(item.path) ? 'active' : ''}`}
                                >
                                    <span className="menu-icon">{item.icon}</span>
                                    {sidebarOpen && <span className="menu-title">{item.title}</span>}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/logout" className="logout-link">
                        <span className="menu-icon">🚪</span>
                        {sidebarOpen && <span>Déconnexion</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        {/* Mobile Toggle Button */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                display: 'none', /* Hidden by default, shown in CSS media query */
                                background: 'transparent',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                marginRight: '1rem',
                                color: '#374151'
                            }}
                        >
                            ☰
                        </button>
                        <h1>Panel Administrateur</h1>
                    </div>
                    <div className="header-right">
                        <span className="demo-badge">Mode Démo</span>
                        <div className="admin-profile">
                            <span>Admin</span>
                            <div className="avatar">A</div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
