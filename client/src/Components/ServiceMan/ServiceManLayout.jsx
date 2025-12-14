import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './ServiceManLayout.css';
import NAVLOGO from '../../Images/fasonekre.png';

export default function ServiceManLayout({ children }) {
    // ...
    // ...
    return (
        <div className="serviceman-layout">
            {/* Sidebar */}
            <aside className="serviceman-sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <img src={NAVLOGO} alt="FASONEKRE" />
                        <h2>FASONEKRE</h2>
                    </div>
                    <p className="role-badge">🔧 Technicien</p>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/serviceman" end className="nav-item">
                        <span className="icon">📊</span>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/serviceman/complaints" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Mes Plaintes</span>
                    </NavLink>
                    <NavLink to="/serviceman/reports" className="nav-item">
                        <span className="icon">📝</span>
                        <span>Mes Rapports</span>
                    </NavLink>
                    <NavLink to="/serviceman/profile" className="nav-item">
                        <span className="icon">👤</span>
                        <span>Mon Profil</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <span className="icon">🚪</span>
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="serviceman-main">
                {children || <Outlet />}
            </main>
        </div>
    );
}
