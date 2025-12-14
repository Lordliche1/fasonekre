import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ServiceManDashboard.css';

export default function ServiceManDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        inProgress: 0,
        completed: 0,
        total: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Récupérer profil
            const profileRes = await axios.get('/api/v1/serviceman/profile', config);
            setProfile(profileRes.data.serviceman);

            // Récupérer plaintes
            const complaintsRes = await axios.get('/api/v1/serviceman/complaints', config);
            const complaintsData = complaintsRes.data.complaints;
            setComplaints(complaintsData.slice(0, 5)); // 5 dernières

            // Calculer stats
            setStats({
                pending: complaintsData.filter(c => c.status === 'pending').length,
                inProgress: complaintsData.filter(c => c.status === 'in process').length,
                completed: complaintsData.filter(c => c.status === 'resolved').length,
                total: complaintsData.length
            });

            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.status === 401) {
                navigate('/auth');
            }
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                '/api/v1/serviceman/status',
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile({ ...profile, status: newStatus });
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-large"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="serviceman-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Bonjour, {profile?.name} 👋</h1>
                    <p className="subtitle">Voici vos interventions du jour</p>
                </div>
                <div className="status-selector">
                    <label>Statut :</label>
                    <select
                        value={profile?.status || 'available'}
                        onChange={(e) => updateStatus(e.target.value)}
                        className={`status-select ${profile?.status}`}
                    >
                        <option value="available">✅ Disponible</option>
                        <option value="busy">🔴 Occupé</option>
                        <option value="offline">⚫ Hors ligne</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>{stats.pending}</h3>
                        <p>En attente</p>
                    </div>
                </div>
                <div className="stat-card in-progress">
                    <div className="stat-icon">🔧</div>
                    <div className="stat-content">
                        <h3>{stats.inProgress}</h3>
                        <p>En cours</p>
                    </div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.completed}</h3>
                        <p>Terminées</p>
                    </div>
                </div>
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{stats.total}</h3>
                        <p>Total assignées</p>
                    </div>
                </div>
            </div>

            {/* Profile Stats */}
            <div className="profile-stats">
                <div className="stat-item">
                    <span className="label">Interventions totales</span>
                    <span className="value">{profile?.stats?.totalInterventions || 0}</span>
                </div>
                <div className="stat-item">
                    <span className="label">Interventions complétées</span>
                    <span className="value">{profile?.stats?.completedInterventions || 0}</span>
                </div>
                <div className="stat-item">
                    <span className="label">Note moyenne</span>
                    <span className="value">
                        {profile?.stats?.averageRating ?
                            `⭐ ${profile.stats.averageRating.toFixed(1)}` :
                            'N/A'}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="label">Spécialisation</span>
                    <span className="value">{profile?.specialization || 'Général'}</span>
                </div>
            </div>

            {/* Recent Complaints */}
            <div className="recent-complaints">
                <div className="section-header">
                    <h2>Plaintes Récentes</h2>
                    <button
                        className="view-all-btn"
                        onClick={() => navigate('/serviceman/complaints')}
                    >
                        Voir tout →
                    </button>
                </div>

                {complaints.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>Aucune plainte assignée pour le moment</p>
                    </div>
                ) : (
                    <div className="complaints-list">
                        {complaints.map((complaint) => (
                            <div
                                key={complaint._id}
                                className="complaint-card"
                                onClick={() => navigate(`/serviceman/complaints/${complaint._id}`)}
                            >
                                <div className="complaint-header">
                                    <h3>{complaint.subject}</h3>
                                    <span className={`status-badge ${complaint.status}`}>
                                        {complaint.status === 'pending' && '⏳ En attente'}
                                        {complaint.status === 'in process' && '🔧 En cours'}
                                        {complaint.status === 'resolved' && '✅ Résolu'}
                                    </span>
                                </div>
                                <p className="complaint-desc">{complaint.description}</p>
                                <div className="complaint-footer">
                                    <span className="department">
                                        📁 {complaint.department?.name || 'N/A'}
                                    </span>
                                    <span className="date">
                                        📅 {new Date(complaint.assignedAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Actions Rapides</h2>
                <div className="actions-grid">
                    <button
                        className="action-btn"
                        onClick={() => navigate('/serviceman/complaints')}
                    >
                        <span className="action-icon">📋</span>
                        <span>Voir mes plaintes</span>
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/serviceman/reports')}
                    >
                        <span className="action-icon">📝</span>
                        <span>Mes rapports</span>
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/serviceman/profile')}
                    >
                        <span className="action-icon">👤</span>
                        <span>Mon profil</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
