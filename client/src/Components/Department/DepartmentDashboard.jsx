import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DepartmentDashboard.css';

export default function DepartmentDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [servicemen, setServicemen] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        total: 0
    });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Utiliser les nouvelles routes department
            const complaintsRes = await axios.get('/api/v1/department/complaints', config);
            const complaintsData = complaintsRes.data.complaints || [];

            // Récupérer les ServiceMen
            const servicemenRes = await axios.get('/api/v1/department/servicemen', config);
            setServicemen(servicemenRes.data.servicemen || []);

            setComplaints(complaintsData.slice(0, 10));

            // Calculer stats
            setStats({
                pending: complaintsData.filter(c => c.status === 'pending').length,
                assigned: complaintsData.filter(c => c.assignedServiceMan).length,
                inProgress: complaintsData.filter(c => c.status === 'in process').length,
                resolved: complaintsData.filter(c => c.status === 'resolved').length,
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

    const handleAssignClick = (complaint) => {
        setSelectedComplaint(complaint);
        setShowAssignModal(true);
    };

    const handleAssign = async (servicemanId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `/api/v1/department/complaints/${selectedComplaint._id}/assign`,
                { servicemanId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('ServiceMan assigné avec succès !');
            setShowAssignModal(false);
            fetchData();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'assignation');
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
        <div className="department-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard Département 👮</h1>
                    <p className="subtitle">Gérez vos plaintes et votre équipe</p>
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
                <div className="stat-card assigned">
                    <div className="stat-icon">👤</div>
                    <div className="stat-content">
                        <h3>{stats.assigned}</h3>
                        <p>Assignées</p>
                    </div>
                </div>
                <div className="stat-card in-progress">
                    <div className="stat-icon">🔧</div>
                    <div className="stat-content">
                        <h3>{stats.inProgress}</h3>
                        <p>En cours</p>
                    </div>
                </div>
                <div className="stat-card resolved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.resolved}</h3>
                        <p>Résolues</p>
                    </div>
                </div>
            </div>

            {/* Plaintes en attente d'assignation */}
            <div className="section">
                <div className="section-header">
                    <h2>Plaintes en Attente d'Assignation</h2>
                    <button
                        className="view-all-btn"
                        onClick={() => navigate('/department/complaints')}
                    >
                        Voir tout →
                    </button>
                </div>

                {complaints.filter(c => !c.assignedServiceMan).length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">✅</div>
                        <p>Toutes les plaintes sont assignées !</p>
                    </div>
                ) : (
                    <div className="complaints-grid">
                        {complaints
                            .filter(c => !c.assignedServiceMan)
                            .slice(0, 6)
                            .map((complaint) => (
                                <div key={complaint._id} className="complaint-card">
                                    <div className="complaint-header">
                                        <h3>{complaint.subject}</h3>
                                        <span className={`status-badge ${complaint.status}`}>
                                            {complaint.status}
                                        </span>
                                    </div>
                                    <p className="complaint-desc">{complaint.description}</p>
                                    <div className="complaint-footer">
                                        <span className="date">
                                            📅 {new Date(complaint.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                        {complaint.location && (
                                            <span className="location">📍 GPS</span>
                                        )}
                                    </div>
                                    <button
                                        className="assign-btn"
                                        onClick={() => handleAssignClick(complaint)}
                                    >
                                        👤 Assigner un ServiceMan
                                    </button>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Plaintes en cours */}
            <div className="section">
                <h2>Interventions en Cours</h2>
                <div className="complaints-list">
                    {complaints
                        .filter(c => c.status === 'in process')
                        .slice(0, 5)
                        .map((complaint) => (
                            <div key={complaint._id} className="complaint-row">
                                <div className="complaint-info">
                                    <h4>{complaint.subject}</h4>
                                    <p>{complaint.description}</p>
                                </div>
                                <div className="complaint-meta">
                                    {complaint.assignedServiceMan && (
                                        <span className="serviceman">
                                            🔧 ServiceMan assigné
                                        </span>
                                    )}
                                    <span className={`status-badge ${complaint.status}`}>
                                        En cours
                                    </span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Actions Rapides</h2>
                <div className="actions-grid">
                    <button
                        className="action-btn"
                        onClick={() => navigate('/department/complaints')}
                    >
                        <span className="action-icon">📋</span>
                        <span>Toutes les plaintes</span>
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/department/servicemen')}
                    >
                        <span className="action-icon">👥</span>
                        <span>Gérer l'équipe</span>
                    </button>
                    <button
                        className="action-btn"
                        onClick={() => navigate('/department/stats')}
                    >
                        <span className="action-icon">📈</span>
                        <span>Statistiques</span>
                    </button>
                </div>
            </div>

            {/* Modal d'assignation */}
            {showAssignModal && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Assigner un ServiceMan</h2>
                        <p className="modal-subtitle">
                            Plainte : <strong>{selectedComplaint?.subject}</strong>
                        </p>

                        <div className="servicemen-list">
                            <div className="serviceman-item available">
                                <div className="serviceman-info">
                                    <div className="serviceman-avatar">🔧</div>
                                    <div>
                                        <h4>ServiceMan 1</h4>
                                        <p>Spécialisation : Voirie</p>
                                        <span className="status-indicator">✅ Disponible</span>
                                    </div>
                                </div>
                                <button
                                    className="select-btn"
                                    onClick={() => handleAssign('serviceman1')}
                                >
                                    Sélectionner
                                </button>
                            </div>

                            <div className="serviceman-item busy">
                                <div className="serviceman-info">
                                    <div className="serviceman-avatar">🔧</div>
                                    <div>
                                        <h4>ServiceMan 2</h4>
                                        <p>Spécialisation : Électricité</p>
                                        <span className="status-indicator">🔴 Occupé</span>
                                    </div>
                                </div>
                                <button className="select-btn" disabled>
                                    Occupé
                                </button>
                            </div>

                            <div className="empty-state-modal">
                                <p>💡 Créez des ServiceMen dans "Gérer l'équipe"</p>
                            </div>
                        </div>

                        <button
                            className="close-modal-btn"
                            onClick={() => setShowAssignModal(false)}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
