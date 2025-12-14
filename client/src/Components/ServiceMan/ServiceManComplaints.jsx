import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ServiceManDashboard.css'; // Réutiliser le CSS du dashboard pour la cohérence

export default function ServiceManComplaints() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                '/api/v1/serviceman/complaints',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComplaints(res.data.complaints);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
    });

    if (loading) return <div className="loading-container"><div className="spinner-large"></div></div>;

    return (
        <div className="serviceman-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>📋 Mes Plaintes</h1>
                    <p className="subtitle">Gérez vos interventions assignées</p>
                </div>
            </div>

            {/* Filtres */}
            <div className="filters-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Tout
                </button>
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    ⏳ En attente
                </button>
                <button
                    className={`filter-btn ${filter === 'in process' ? 'active' : ''}`}
                    onClick={() => setFilter('in process')}
                >
                    🔧 En cours
                </button>
                <button
                    className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
                    onClick={() => setFilter('resolved')}
                >
                    ✅ Terminées
                </button>
            </div>

            <div className="complaints-list">
                {filteredComplaints.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>Aucune plainte trouvée pour ce filtre.</p>
                    </div>
                ) : (
                    filteredComplaints.map((complaint) => (
                        <div
                            key={complaint._id}
                            className="complaint-card"
                            onClick={() => navigate(`/serviceman/complaints/${complaint._id}`)}
                            style={{ cursor: 'pointer' }}
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
                    ))
                )}
            </div>
        </div>
    );
}
