import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RequestsManagement.css';

export default function RequestsManagement() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/v1/admin/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(response.data.complaints || []);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement requêtes:', error);
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { text: 'En Attente', class: 'status-pending' },
            'in-progress': { text: 'En Cours', class: 'status-progress' },
            resolved: { text: 'Résolu', class: 'status-resolved' },
            rejected: { text: 'Rejeté', class: 'status-rejected' }
        };
        return badges[status] || badges.pending;
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = (req.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
        const matchesDept = filterDepartment === 'all' || req.department?._id === filterDepartment;
        return matchesSearch && matchesStatus && matchesDept;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des requêtes...</p>
            </div>
        );
    }

    return (
        <div className="requests-management">
            <div className="page-header">
                <h2>📋 Gestion des Requêtes</h2>
                <div className="header-stats">
                    <div className="stat-card">
                        <span className="stat-value">{requests.length}</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-card pending">
                        <span className="stat-value">{requests.filter(r => r.status === 'pending').length}</span>
                        <span className="stat-label">En Attente</span>
                    </div>
                    <div className="stat-card progress">
                        <span className="stat-value">{requests.filter(r => r.status === 'in-progress').length}</span>
                        <span className="stat-label">En Cours</span>
                    </div>
                    <div className="stat-card resolved">
                        <span className="stat-value">{requests.filter(r => r.status === 'resolved').length}</span>
                        <span className="stat-label">Résolues</span>
                    </div>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Rechercher une requête..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En Attente</option>
                        <option value="in-progress">En Cours</option>
                        <option value="resolved">Résolu</option>
                        <option value="rejected">Rejeté</option>
                    </select>

                    <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                        <option value="all">Tous les départements</option>
                    </select>
                </div>
            </div>

            <div className="requests-table-container">
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Titre</th>
                            <th>Citoyen</th>
                            <th>Département</th>
                            <th>Localisation</th>
                            <th>Date</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-state">
                                    Aucune requête trouvée
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((request, index) => (
                                <tr key={request._id || index}>
                                    <td>#{request._id?.slice(-6) || index}</td>
                                    <td className="title-cell">
                                        <div className="request-title">{request.title || 'Sans titre'}</div>
                                        <div className="request-desc">{request.description?.substring(0, 50)}...</div>
                                    </td>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {request.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span>{request.user?.name || 'Anonyme'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="dept-badge">
                                            {request.department?.icon || '📁'} {request.department?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{request.location?.address || 'Non spécifié'}</td>
                                    <td>{new Date(request.createdAt).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(request.status).class}`}>
                                            {getStatusBadge(request.status).text}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon btn-view" title="Voir">👁️</button>
                                            <button className="btn-icon btn-edit" title="Modifier">✏️</button>
                                            <button className="btn-icon btn-delete" title="Supprimer">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
