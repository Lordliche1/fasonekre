import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartmentDashboard.css';

export default function DepartmentComplaints() {
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
                '/api/v1/department/complaints',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComplaints(res.data.complaints || []);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    const filteredComplaints = complaints.filter(c => {
        if (filter === 'all') return true;
        if (filter === 'unassigned') return !c.assignedServiceMan;
        return c.status === filter;
    });

    if (loading) return <div className="loading-container"><div className="spinner-large"></div></div>;

    return (
        <div className="department-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>📋 Plaintes du Département</h1>
                    <p className="subtitle">Supervision globale des plaintes</p>
                </div>
            </div>

            <div className="filters-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tout</button>
                <button className={`filter-btn ${filter === 'unassigned' ? 'active' : ''}`} onClick={() => setFilter('unassigned')}>⚠️ Non Assignées</button>
                <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>⏳ En attente</button>
                <button className={`filter-btn ${filter === 'in process' ? 'active' : ''}`} onClick={() => setFilter('in process')}>🔧 En cours</button>
                <button className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`} onClick={() => setFilter('resolved')}>✅ Résolues</button>
            </div>

            <div className="complaints-list">
                {filteredComplaints.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <p>Aucune plainte trouvée.</p>
                    </div>
                ) : (
                    filteredComplaints.map((complaint) => (
                        <div key={complaint._id} className="complaint-card">
                            <div className="complaint-header">
                                <h3>{complaint.subject}</h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {!complaint.assignedServiceMan && <span className="status-badge busy">⚠️ Non Assigné</span>}
                                    <span className={`status-badge ${complaint.status}`}>{complaint.status}</span>
                                </div>
                            </div>
                            <p className="complaint-desc">{complaint.description}</p>
                            <div className="complaint-footer">
                                <span className="serviceman">
                                    🔧 {complaint.assignedServiceMan ? complaint.assignedServiceMan.name : 'En attente d\'attribution'}
                                </span>
                                <span className="date">DATA: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
