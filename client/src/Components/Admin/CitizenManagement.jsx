import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CitizenManagement.css';

export default function CitizenManagement() {
    const [citizens, setCitizens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        countryCode: '+226',
        countryName: 'Burkina Faso',
        phone: '',
        image: null
    });

    useEffect(() => {
        fetchCitizens();
    }, []);

    const fetchCitizens = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/v1/admin/citizens', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCitizens(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement citoyens:', error);
            setLoading(false);
        }
    };

    const countries = [
        { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
        { code: '+33', name: 'France', flag: '🇫🇷' },
        { code: '+1', name: 'USA', flag: '🇺🇸' },
        { code: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
        { code: '+223', name: 'Mali', flag: '🇲🇱' },
        { code: '+228', name: 'Togo', flag: '🇹🇬' },
        { code: '+221', name: 'Sénégal', flag: '🇸🇳' }
    ];

    const handleAddCitizen = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const dataToSend = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.countryCode + formData.phone
            };

            // Note: Si le backend supporte l'image, il faudrait utiliser FormData. 
            // Pour l'instant on garde JSON comme le contrôleur createCitizen simple qu'on vient de faire.
            // Si le user veut uploader une image, il faudra adapter le backend (multer) plus tard.

            await axios.post(
                'http://localhost:3000/api/v1/admin/citizens',
                dataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                countryCode: '+226',
                countryName: 'Burkina Faso',
                phone: '',
                image: null
            });
            fetchCitizens(); // Refresh list
            alert('Citoyen créé avec succès !');
        } catch (error) {
            console.error('Erreur création citoyen:', error);
            alert(error.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/api/v1/admin/citizens/${id}/status`,
                { isActive: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Mettre à jour la liste localement pour éviter un rechargement
            setCitizens(citizens.map(c =>
                c._id === id ? { ...c, isActive: newStatus } : c
            ));
        } catch (error) {
            console.error('Erreur changement statut:', error);
            alert('Erreur lors du changement de statut');
        }
    };

    const filteredCitizens = citizens.filter(citizen => {
        const matchesSearch = (citizen.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (citizen.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (citizen.phone || '').includes(searchTerm);

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && citizen.isActive !== false) ||
            (filterStatus === 'blocked' && citizen.isActive === false);

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="citizen-management">
            <div className="page-header">
                <h2>Gestion des Citoyens</h2>
                <div className="header-actions">
                    <div className="header-stats">
                        <span className="stat-badge">Total: {citizens.length}</span>
                        <span className="stat-badge active">
                            Actifs: {citizens.filter(c => c.isActive !== false).length}
                        </span>
                        <span className="stat-badge blocked">
                            Bloqués: {citizens.filter(c => c.isActive === false).length}
                        </span>
                    </div>
                    <button
                        className="btn-add-citizen"
                        onClick={() => setShowAddModal(true)}
                    >
                        ➕ Nouveau Citoyen
                    </button>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par nom, email ou téléphone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-buttons">
                    <button
                        className={filterStatus === 'all' ? 'active' : ''}
                        onClick={() => setFilterStatus('all')}
                    >
                        Tous
                    </button>
                    <button
                        className={filterStatus === 'active' ? 'active' : ''}
                        onClick={() => setFilterStatus('active')}
                    >
                        Actifs
                    </button>
                    <button
                        className={filterStatus === 'blocked' ? 'active' : ''}
                        onClick={() => setFilterStatus('blocked')}
                    >
                        Bloqués
                    </button>
                </div>
            </div>

            <div className="citizens-table">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Statut</th>
                            <th>Inscription</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCitizens.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    Aucun citoyen trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredCitizens.map((citizen) => (
                                <tr key={citizen._id}>
                                    <td>
                                        <div className="citizen-name">
                                            <div className="avatar">{citizen.name.charAt(0).toUpperCase()}</div>
                                            <span>{citizen.name}</span>
                                        </div>
                                    </td>
                                    <td>{citizen.email}</td>
                                    <td>{citizen.phone}</td>
                                    <td>
                                        <span className={`status-badge ${citizen.isActive !== false ? 'active' : 'blocked'}`}>
                                            {citizen.isActive !== false ? 'Actif' : 'Bloqué'}
                                        </span>
                                    </td>
                                    <td>{new Date(citizen.createdAt).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {citizen.isActive !== false ? (
                                                <button
                                                    className="btn-block"
                                                    onClick={() => handleStatusChange(citizen._id, false)}
                                                    title="Bloquer"
                                                >
                                                    🚫
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-activate"
                                                    onClick={() => handleStatusChange(citizen._id, true)}
                                                    title="Activer"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Nouveau Citoyen */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content add-citizen-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Nouveau Citoyen</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddCitizen} className="add-citizen-form">
                            <div className="form-section">
                                <h4>Informations Personnelles</h4>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nom Complet *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Jean Ouedraogo"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Ex: jean@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Mot de passe *</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="*******"
                                            required
                                        />
                                    </div>

                                    {/* Numéro de téléphone unifié */}
                                    <div className="form-group phone-group-container">
                                        <label>Numéro de Téléphone *</label>
                                        <div className="phone-input-group">
                                            <select
                                                className="country-select"
                                                value={formData.countryCode}
                                                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                            >
                                                {countries.map(country => (
                                                    <option key={country.code} value={country.code}>
                                                        {country.flag} {country.code}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="tel"
                                                className="phone-number-input"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="70 00 00 00"
                                                required
                                            />
                                        </div>
                                    </div>
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
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
