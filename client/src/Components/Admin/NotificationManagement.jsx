import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationManagement.css';

export default function NotificationManagement() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        department: ''
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/v1/admin/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications || []);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
            setLoading(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:3000/api/v1/admin/notifications',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowCreateModal(false);
            setFormData({ title: '', message: '', type: 'info', target: 'all', department: '' });
            fetchNotifications();
            alert('Notification envoyée avec succès !');
        } catch (error) {
            console.error('Erreur envoi notification:', error);
            alert('Erreur lors de l\'envoi');
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            info: '💡',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || '💡';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des notifications...</p>
            </div>
        );
    }

    return (
        <div className="notification-management">
            <div className="page-header">
                <h2>🔔 Gestion des Notifications</h2>
                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    ➕ Nouvelle Notification
                </button>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon">📨</div>
                    <div className="stat-content">
                        <div className="stat-value">{notifications.length}</div>
                        <div className="stat-label">Total Envoyées</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-value">1,234</div>
                        <div className="stat-label">Destinataires</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📖</div>
                    <div className="stat-content">
                        <div className="stat-value">87%</div>
                        <div className="stat-label">Taux de Lecture</div>
                    </div>
                </div>
            </div>

            <div className="notifications-list">
                <h3>Historique des Notifications</h3>
                <div className="notifications-grid">
                    {notifications.length === 0 ? (
                        <div className="empty-state">
                            Aucune notification envoyée
                        </div>
                    ) : (
                        notifications.map((notif, index) => (
                            <div key={notif._id || index} className={`notification-card ${notif.type}`}>
                                <div className="notif-header">
                                    <span className="notif-icon">{getTypeIcon(notif.type)}</span>
                                    <span className="notif-date">
                                        {new Date(notif.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <h4>{notif.title}</h4>
                                <p>{notif.message}</p>
                                <div className="notif-footer">
                                    <span className="notif-target">
                                        👥 {notif.target === 'all' ? 'Tous' : notif.department?.name}
                                    </span>
                                    <span className="notif-status">✅ Envoyée</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nouvelle Notification</h3>
                            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSendNotification}>
                            <div className="form-group">
                                <label>Titre *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Titre de la notification"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Contenu de la notification"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="info">💡 Information</option>
                                        <option value="success">✅ Succès</option>
                                        <option value="warning">⚠️ Avertissement</option>
                                        <option value="error">❌ Erreur</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Cible</label>
                                    <select
                                        value={formData.target}
                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    >
                                        <option value="all">Tous les utilisateurs</option>
                                        <option value="citizens">Citoyens</option>
                                        <option value="officers">Responsables</option>
                                        <option value="department">Département spécifique</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-save">
                                    📤 Envoyer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
