import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './DepartmentLayout.css';
import NAVLOGO from '../../Images/fasonekre.png';

export default function DepartmentLayout({ children }) {
    // ...
    // ...
    return (
        <div className="department-layout">
            {/* Sidebar */}
            <aside className="department-sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <img src={NAVLOGO} alt="FASONEKRE" />
                        <h2>FASONEKRE</h2>
                    </div>
                    <p className="role-badge">👮 Chef de Département</p>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/department" end className="nav-item">
                        <span className="icon">📊</span>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/department/complaints" className="nav-item">
                        <span className="icon">📋</span>
                        <span>Plaintes</span>
                    </NavLink>
                    <NavLink to="/department/servicemen" className="nav-item">
                        <span className="icon">👥</span>
                        <span>Mon Équipe</span>
                    </NavLink>
                    <NavLink to="/department/stats" className="nav-item">
                        <span className="icon">📈</span>
                        <span>Statistiques</span>
                    </NavLink>
                    <NavLink to="/department/profile" className="nav-item">
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
            <main className="department-main">
                {children || <Outlet />}
            </main>
        </div>
    );
}
