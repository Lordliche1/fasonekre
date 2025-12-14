import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartmentDashboard.css';

export default function DepartmentStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'http://127.0.0.1:3000/api/v1/department/stats',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStats(res.data.stats);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner-large"></div></div>;

    if (!stats) return <div className="error-container">Aucune statistique disponible</div>;

    return (
        <div className="department-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>📊 Statistiques du Département</h1>
                    <p className="subtitle">Indicateurs de performance</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card pending">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <h3>{stats.complaints.total}</h3>
                        <p>Total Plaintes</p>
                    </div>
                </div>
                <div className="stat-card resolved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.complaints.resolved}</h3>
                        <p>Plaintes Résolues</p>
                    </div>
                </div>
                <div className="stat-card in-progress">
                    <div className="stat-icon">🔧</div>
                    <div className="stat-content">
                        <h3>{stats.complaints.inProgress}</h3>
                        <p>En cours</p>
                    </div>
                </div>
                <div className="stat-card assigned">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{stats.servicemen.total}</h3>
                        <p>Techniciens</p>
                    </div>
                </div>
            </div>

            <div className="section">
                <h2>État des Équipes</h2>
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                    <div className="stat-box" style={{ background: '#e8f5e9', padding: '20px', borderRadius: '10px', flex: 1 }}>
                        <h3 style={{ color: '#2e7d32' }}>✅ Disponibles</h3>
                        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.servicemen.available}</p>
                    </div>
                    <div className="stat-box" style={{ background: '#ffebee', padding: '20px', borderRadius: '10px', flex: 1 }}>
                        <h3 style={{ color: '#c62828' }}>🔴 Occupés</h3>
                        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.servicemen.busy}</p>
                    </div>
                    <div className="stat-box" style={{ background: '#f5f5f5', padding: '20px', borderRadius: '10px', flex: 1 }}>
                        <h3 style={{ color: '#616161' }}>⚫ Hors Ligne</h3>
                        <p style={{ fontSize: '2em', fontWeight: 'bold' }}>{stats.servicemen.offline}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
