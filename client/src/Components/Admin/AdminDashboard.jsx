import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        citizens: 0,
        departments: 0,
        services: 0,
        inCharge: 0,
        openRequests: 0,
        inProgressRequests: 0,
        archivedRequests: 0,
        completedRequests: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/v1/admin/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement stats:', error);
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Citoyens',
            value: stats.citizens,
            icon: '👥',
            color: '#3498db',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            title: 'Départements',
            value: stats.departments,
            icon: '🏢',
            color: '#e74c3c',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            title: 'Services',
            value: stats.services,
            icon: '⚙️',
            color: '#f39c12',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        },
        {
            title: 'Responsables',
            value: stats.inCharge,
            icon: '👔',
            color: '#9b59b6',
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        },
        {
            title: 'Requêtes Ouvertes',
            value: stats.openRequests,
            icon: '📬',
            color: '#e67e22',
            gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        },
        {
            title: 'En Cours',
            value: stats.inProgressRequests,
            icon: '⏳',
            color: '#3498db',
            gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
        },
        {
            title: 'Archivées',
            value: stats.archivedRequests,
            icon: '📦',
            color: '#95a5a6',
            gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
        },
        {
            title: 'Complétées',
            value: stats.completedRequests,
            icon: '✅',
            color: '#27ae60',
            gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)'
        }
    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Chargement des statistiques...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <div className="demo-badge">Mode Démo</div>
            </div>

            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="stat-card"
                        style={{ background: card.gradient }}
                    >
                        <div className="stat-icon">{card.icon}</div>
                        <div className="stat-content">
                            <div className="stat-value">{card.value}</div>
                            <div className="stat-title">{card.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-charts">
                <div className="chart-card">
                    <h3>Statistiques des Requêtes par Département</h3>
                    <div className="chart-placeholder">
                        <p>📊 Graphique à venir</p>
                        <small>Intégration Chart.js en cours</small>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Évolution des Requêtes</h3>
                    <div className="chart-placeholder">
                        <p>📈 Graphique à venir</p>
                        <small>Intégration Chart.js en cours</small>
                    </div>
                </div>
            </div>

            <div className="recent-activity">
                <h3>Activité Récente</h3>
                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon">🆕</div>
                        <div className="activity-content">
                            <p><strong>Nouvelle requête</strong> - Problème d'éclairage public</p>
                            <small>Il y a 5 minutes</small>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">✅</div>
                        <div className="activity-content">
                            <p><strong>Requête complétée</strong> - Réparation route</p>
                            <small>Il y a 1 heure</small>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-icon">👤</div>
                        <div className="activity-content">
                            <p><strong>Nouveau citoyen</strong> - Inscription validée</p>
                            <small>Il y a 2 heures</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
