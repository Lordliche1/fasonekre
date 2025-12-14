import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './InChargeManagement.css';

export default function InChargeManagement() {
    const location = useLocation();
    const initialTab = location.pathname.includes('/inactive') ? 'inactive' : 'active';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [inCharges, setInCharges] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingInCharge, setEditingInCharge] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        level: 2,
        password: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch departments
            const deptRes = await axios.get('http://127.0.0.1:3000/api/v1/admin/departments', config);
            setDepartments(deptRes.data.data || []);

            // Fetch in-charges (officers)
            const inChargeRes = await axios.get('http://127.0.0.1:3000/api/v1/admin/officers', config);
            console.log('Officers response:', inChargeRes.data);
            setInCharges(inChargeRes.data.data || []);

            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement données:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingInCharge) {
                // Update
                await axios.patch(
                    `http://127.0.0.1:3000/api/v1/admin/officers/${editingInCharge._id}`,
                    formData,
                    config
                );
            } else {
                // Create
                await axios.post(
                    'http://127.0.0.1:3000/api/v1/admin/officers',
                    formData,
                    config
                );
            }

            setFormData({ name: '', email: '', phone: '', department: '', level: 2, password: '' });
            setShowAddModal(false);
            setEditingInCharge(null);
            fetchData();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la sauvegarde';
            alert(errorMsg);
        }
    };

    const handleEdit = (inCharge) => {
        setEditingInCharge(inCharge);
        setFormData({
            name: inCharge.name,
            email: inCharge.email,
            phone: inCharge.phone || '',
            department: inCharge.department?._id || inCharge.department || '',
            level: inCharge.level || 2,
            password: ''
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce responsable ?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://127.0.0.1:3000/api/v1/admin/officers/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://127.0.0.1:3000/api/v1/admin/officers/${id}/toggle-status`,
                { isActive: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            console.error('Erreur changement statut:', error);
        }
    };

    const getFilteredInCharges = () => {
        if (activeTab === 'active') {
            return inCharges.filter(ic => ic.isActive !== false);
        } else if (activeTab === 'inactive') {
            return inCharges.filter(ic => ic.isActive === false);
        } else {
            // Sub in-charges (level 1)
            return inCharges.filter(ic => ic.level === 1);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="incharge-management">
            <div className="page-header">
                <h2>Gestion des Responsables</h2>
                <button
                    className="btn-add"
                    onClick={() => {
                        setEditingInCharge(null);
                        setFormData({ name: '', email: '', phone: '', department: '', level: 2, password: '' });
                        setShowAddModal(true);
                    }}
                >
                    ➕ Nouveau Responsable
                </button>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    👮 Responsables Actifs
                </button>
                <button
                    className={`tab ${activeTab === 'inactive' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inactive')}
                >
                    ⏸️ Responsables Inactifs
                </button>
                <button
                    className={`tab ${activeTab === 'sub' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sub')}
                >
                    👤 Sous-Responsables
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="incharge-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Département</th>
                            <th>Niveau</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getFilteredInCharges().length === 0 ? (
                            <tr>
                                <td colSpan="7" className="empty-state">
                                    Aucun responsable trouvé
                                </td>
                            </tr>
                        ) : (
                            getFilteredInCharges().map((inCharge) => (
                                <tr key={inCharge._id}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {inCharge.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{inCharge.name}</span>
                                        </div>
                                    </td>
                                    <td>{inCharge.email}</td>
                                    <td>{inCharge.phone || 'N/A'}</td>
                                    <td>
                                        {inCharge.department?.name || inCharge.department || 'N/A'}
                                    </td>
                                    <td>
                                        <span className={`level-badge level-${inCharge.level}`}>
                                            Niveau {inCharge.level}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${inCharge.isActive !== false ? 'active' : 'inactive'}`}>
                                            {inCharge.isActive !== false ? '✅ Actif' : '⏸️ Inactif'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon btn-edit"
                                                onClick={() => handleEdit(inCharge)}
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-icon btn-toggle"
                                                onClick={() => toggleStatus(inCharge._id, inCharge.isActive !== false)}
                                                title={inCharge.isActive !== false ? 'Désactiver' : 'Activer'}
                                            >
                                                {inCharge.isActive !== false ? '⏸️' : '▶️'}
                                            </button>
                                            <button
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(inCharge._id)}
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Ajout/Modification */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingInCharge ? 'Modifier le Responsable' : 'Nouveau Responsable'}</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Nom complet *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Ex: Marie Dupont"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Téléphone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+226 XX XX XX XX"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Mot de passe {!editingInCharge && '*'}</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingInCharge}
                                        placeholder={editingInCharge ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Département *</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    >
                                        <option value="">Sélectionner un département</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.icon} {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Niveau *</label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value={1}>Niveau 1 (Sous-Responsable)</option>
                                        <option value={2}>Niveau 2 (Responsable)</option>
                                        <option value={3}>Niveau 3 (Chef de Département)</option>
                                    </select>
                                </div>
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
                                    {editingInCharge ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
