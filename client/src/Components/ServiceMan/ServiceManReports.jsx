import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServiceManDashboard.css';

export default function ServiceManReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Pour l'instant on simule car l'endpoint GET reports n'est pas encore confirmé dans le backend plan
        // On va supposer qu'on filtre les plaintes 'resolved' qui ont un rapport
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'http://localhost:3000/api/v1/serviceman/complaints',
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Filtrer celles qui ont un rapport d'intervention
            const completedWithReports = res.data.complaints.filter(c => c.interventionReport);
            setReports(completedWithReports);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner-large"></div></div>;

    return (
        <div className="serviceman-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>📝 Mes Rapports</h1>
                    <p className="subtitle">Historique des interventions clôturées</p>
                </div>
            </div>

            <div className="complaints-list">
                {reports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <p>Aucun rapport d'intervention archivé.</p>
                    </div>
                ) : (
                    reports.map((complaint) => (
                        <div key={complaint._id} className="complaint-card" style={{ borderColor: '#4caf50' }}>
                            <div className="complaint-header">
                                <h3>Rapport: {complaint.subject}</h3>
                                <span className="status-badge resolved">✅ Clôturé</span>
                            </div>
                            <div className="report-preview" style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                                <p><strong>Travail :</strong> {complaint.interventionReport.workDescription?.substring(0, 100)}...</p>
                            </div>
                            <div className="complaint-footer">
                                <span className="date">
                                    📅 {new Date(complaint.updatedAt).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
