import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServicesManagement.css';

export default function ServicesManagement() {
    const [services, setServices] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [filterDepartment, setFilterDepartment] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        description: '',
        icon: '⚙️',
        isActive: true
    });

    const iconOptions = ['⚙️', '🔧', '🛠️', '🔨', '💡', '💧', '🚧', '🌳', '🚮', '🏥', '🎓', '🚓'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Fetch departments
            const deptRes = await axios.get('http://localhost:3000/api/v1/admin/departments', config);
            setDepartments(deptRes.data.data || []);

            // Fetch services
            const servicesRes = await axios.get('http://localhost:3000/api/v1/admin/services', config);
            setServices(servicesRes.data.services || []);

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

            if (editingService) {
                // Update
                await axios.patch(
                    `http://localhost:3000/api/v1/admin/services/${editingService._id}`,
                    formData,
                    config
                );
            } else {
                // Create
                await axios.post(
                    'http://localhost:3000/api/v1/admin/services',
                    formData,
                    config
                );
            }

            setFormData({ name: '', department: '', description: '', icon: '⚙️', isActive: true });
            setShowAddModal(false);
            setEditingService(null);
            fetchData();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            department: service.department?._id || service.department,
            description: service.description || '',
            icon: service.icon || '⚙️',
            isActive: service.isActive !== false
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:3000/api/v1/admin/services/${id}`,
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
                `http://localhost:3000/api/v1/admin/services/${id}`,
                { isActive: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            console.error('Erreur changement statut:', error);
        }
    };

    const getFilteredServices = () => {
        if (!filterDepartment) return services;
        return services.filter(s =>
            (s.department?._id || s.department) === filterDepartment
        );
    };

    const getDepartmentName = (deptId) => {
        const dept = departments.find(d => d._id === deptId);
        return dept ? dept.name : 'N/A';
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
        <div className="services-management">
            <div className="page-header">
                <h2>Gestion des Services</h2>
                <button
                    className="btn-add"
                    onClick={() => {
                        setEditingService(null);
                        setFormData({ name: '', department: '', description: '', icon: '⚙️', isActive: true });
                        setShowAddModal(true);
                    }}
                >
                    ➕ Nouveau Service
                </button>
            </div>

            {/* Filter */}
            <div className="filter-section">
                <label>Filtrer par département :</label>
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Tous les départements</option>
                    {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                            {dept.icon} {dept.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Services Grid */}
            <div className="services-grid">
                {getFilteredServices().length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <p>Aucun service trouvé</p>
                    </div>
                ) : (
                    getFilteredServices().map((service) => (
                        <div key={service._id} className="service-card">
                            <div className="service-header">
                                <div className="service-icon">{service.icon || '⚙️'}</div>
                                <div className="service-info">
                                    <h3>{service.name}</h3>
                                    <p className="service-dept">
                                        {service.department?.icon} {service.department?.name || getDepartmentName(service.department)}
                                    </p>
                                </div>
                                <span className={`status-badge ${service.isActive !== false ? 'active' : 'inactive'}`}>
                                    {service.isActive !== false ? '✅' : '⏸️'}
                                </span>
                            </div>

                            {service.description && (
                                <p className="service-description">{service.description}</p>
                            )}

                            <div className="service-actions">
                                <button
                                    className="btn-icon btn-edit"
                                    onClick={() => handleEdit(service)}
                                    title="Modifier"
                                >
                                    ✏️ Modifier
                                </button>
                                <button
                                    className="btn-icon btn-toggle"
                                    onClick={() => toggleStatus(service._id, service.isActive !== false)}
                                    title={service.isActive !== false ? 'Désactiver' : 'Activer'}
                                >
                                    {service.isActive !== false ? '⏸️ Désactiver' : '▶️ Activer'}
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    onClick={() => handleDelete(service._id)}
                                    title="Supprimer"
                                >
                                    🗑️ Supprimer
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Ajout/Modification */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingService ? 'Modifier le Service' : 'Nouveau Service'}</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom du Service *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ex: Réparation de routes"
                                />
                            </div>

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
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description du service..."
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
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span>Service actif</span>
                                </label>
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
                                    {editingService ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
