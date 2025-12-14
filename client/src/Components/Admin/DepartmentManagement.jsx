import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartmentManagement.css';

export default function DepartmentManagement() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        color: '#3498db'
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:3000/api/v1/admin/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement départements:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            if (editingDept) {
                // Mise à jour
                await axios.put(
                    `http://127.0.0.1:3000/api/v1/admin/departments/${editingDept._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Création
                await axios.post(
                    'http://127.0.0.1:3000/api/v1/admin/departments',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // Réinitialiser et recharger
            setFormData({ name: '', description: '', icon: '', color: '#3498db' });
            setShowAddModal(false);
            setEditingDept(null);
            fetchDepartments();
        } catch (error) {
            console.error('Erreur sauvegarde département:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (dept) => {
        setEditingDept(dept);
        setFormData({
            name: dept.name,
            description: dept.description,
            icon: dept.icon,
            color: dept.color
        });
        setShowAddModal(true);
    };

    const handleDelete = async (deptId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://127.0.0.1:3000/api/v1/admin/departments/${deptId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchDepartments();
        } catch (error) {
            console.error('Erreur suppression département:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const iconOptions = ['🚧', '💧', '💡', '🌳', '🏗️', '🚮', '🏥', '🎓', '🚓', '🔧', '📋', '🏛️', '🌍'];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des départements...</p>
            </div>
        );
    }

    return (
        <div className="department-management">
            <div className="page-header">
                <h2>Gestion des Départements</h2>
                <button
                    className="btn-add"
                    onClick={() => {
                        setEditingDept(null);
                        setFormData({ name: '', description: '', icon: '', color: '#3498db' });
                        setShowAddModal(true);
                    }}
                >
                    ➕ Nouveau Département
                </button>
            </div>

            <div className="departments-grid">
                {departments.map((dept) => (
                    <div
                        key={dept._id}
                        className="department-card"
                        style={{ borderLeft: `5px solid ${dept.color}` }}
                    >
                        <div className="dept-header">
                            <div className="dept-icon" style={{ background: dept.color }}>
                                {dept.icon}
                            </div>
                            <div className="dept-info">
                                <h3>{dept.name}</h3>
                                <p>{dept.description}</p>
                            </div>
                        </div>

                        <div className="dept-stats">
                            <div className="stat-item">
                                <span className="stat-label">Services</span>
                                <span className="stat-value">{dept.servicesCount || 0}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Requêtes</span>
                                <span className="stat-value">{dept.requestsCount || 0}</span>
                            </div>
                        </div>

                        <div className="dept-actions">
                            <button
                                className="btn-edit"
                                onClick={() => handleEdit(dept)}
                            >
                                ✏️ Modifier
                            </button>
                            <button
                                className="btn-delete"
                                onClick={() => handleDelete(dept._id)}
                            >
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Ajout/Modification */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingDept ? 'Modifier le Département' : 'Nouveau Département'}</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowAddModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom du Département *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ex: Voirie et Réseaux Divers"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    placeholder="Description du département..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Icône *</label>
                                <div className="icon-selector">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, icon })}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Couleur *</label>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Annuler
                                </button>
                                <button type="submit" className="btn-save">
                                    {editingDept ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
