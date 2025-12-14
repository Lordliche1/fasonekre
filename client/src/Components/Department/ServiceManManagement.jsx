import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartmentDashboard.css'; // On réutilise le CSS existant pour l'instant

export default function ServiceManManagement() {
    const [servicemen, setServicemen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: ''
    });

    useEffect(() => {
        fetchServicemen();
    }, []);

    const fetchServicemen = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'http://127.0.0.1:3000/api/v1/department/servicemen',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setServicemen(res.data.servicemen || []);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://127.0.0.1:3000/api/v1/department/servicemen',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('ServiceMan créé avec succès !');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', phone: '', specialization: '' });
            fetchServicemen();
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce technicien ?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://127.0.0.1:3000/api/v1/department/servicemen/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchServicemen();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la suppression');
        }
    };

    if (loading) return <div className="loading-container"><div className="spinner-large"></div></div>;

    return (
        <div className="department-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>👥 Gestion de l'Équipe</h1>
                    <p className="subtitle">Gérez les techniciens de votre département</p>
                </div>
                <button className="create-btn" onClick={() => setShowModal(true)}>
                    + Nouveau Technicien
                </button>
            </div>

            <div className="servicemen-grid">
                {servicemen.map((man) => (
                    <div key={man._id} className={`serviceman-card ${man.status}`}>
                        <div className="card-header">
                            <div className="avatar">🔧</div>
                            <div className="info">
                                <h3>{man.name}</h3>
                                <p className="specialization">{man.specialization || 'Général'}</p>
                            </div>
                            <span className={`status-badge ${man.status}`}>
                                {man.status === 'available' ? '✅' : man.status === 'busy' ? '🔴' : '⚫'}
                            </span>
                        </div>
                        <div className="card-body">
                            <p>📧 {man.email}</p>
                            <p>📱 {man.phone || 'Non renseigné'}</p>
                            <div className="stats-mini">
                                <span>Total Interventions: {man.stats?.totalInterventions || 0}</span>
                            </div>
                        </div>
                        <div className="card-actions">
                            <button className="delete-btn" onClick={() => handleDelete(man._id)}>
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Nouveau Technicien</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom complet</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Mot de passe</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Téléphone</label>
                                <input name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Spécialisation</label>
                                <input name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="Ex: Plomberie, Voirie..." />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Annuler</button>
                                <button type="submit" className="submit-btn">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
