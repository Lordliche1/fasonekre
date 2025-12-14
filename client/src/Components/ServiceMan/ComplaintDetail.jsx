import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ComplaintDetail.css';

export default function ComplaintDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReportForm, setShowReportForm] = useState(false);

    // Form state
    const [reportData, setReportData] = useState({
        workDescription: '',
        materialsUsed: [{ name: '', quantity: '', unit: '' }],
        photosBefore: [],
        photosAfter: [],
        videos: [],
        audioNotes: []
    });

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `http://127.0.0.1:3000/api/v1/serviceman/complaints/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComplaint(res.data.complaint);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        setReportData({ ...reportData, [type]: files });
    };

    const addMaterial = () => {
        setReportData({
            ...reportData,
            materialsUsed: [...reportData.materialsUsed, { name: '', quantity: '', unit: '' }]
        });
    };

    const updateMaterial = (index, field, value) => {
        const updated = [...reportData.materialsUsed];
        updated[index][field] = value;
        setReportData({ ...reportData, materialsUsed: updated });
    };

    const removeMaterial = (index) => {
        const updated = reportData.materialsUsed.filter((_, i) => i !== index);
        setReportData({ ...reportData, materialsUsed: updated });
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Créer le rapport
            const reportPayload = {
                complaintId: id,
                workDescription: reportData.workDescription,
                materialsUsed: JSON.stringify(reportData.materialsUsed.filter(m => m.name))
            };

            const reportRes = await axios.post(
                'http://127.0.0.1:3000/api/v1/serviceman/reports',
                reportPayload,
                config
            );

            const reportId = reportRes.data.report._id;

            // 2. Upload médias si présents
            if (reportData.photosBefore.length || reportData.photosAfter.length ||
                reportData.videos.length || reportData.audioNotes.length) {

                const formData = new FormData();
                reportData.photosBefore.forEach(file => formData.append('photosBefore', file));
                reportData.photosAfter.forEach(file => formData.append('photosAfter', file));
                reportData.videos.forEach(file => formData.append('videos', file));
                reportData.audioNotes.forEach(file => formData.append('audioNotes', file));

                await axios.post(
                    `http://127.0.0.1:3000/api/v1/serviceman/reports/${reportId}/media`,
                    formData,
                    {
                        headers: {
                            ...config.headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
            }

            // 3. Terminer le rapport
            await axios.post(
                `http://127.0.0.1:3000/api/v1/serviceman/reports/${reportId}/complete`,
                {},
                config
            );

            alert('Rapport soumis avec succès !');
            navigate('/serviceman/reports');
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la soumission du rapport');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner-large"></div></div>;
    }

    if (!complaint) {
        return <div className="error-container">Plainte non trouvée</div>;
    }

    return (
        <div className="complaint-detail">
            <button className="back-btn" onClick={() => navigate('/serviceman/complaints')}>
                ← Retour
            </button>

            <div className="detail-header">
                <h1>{complaint.subject}</h1>
                <span className={`status-badge ${complaint.status}`}>
                    {complaint.status}
                </span>
            </div>

            <div className="detail-grid">
                {/* Informations */}
                <div className="detail-card">
                    <h2>📋 Informations</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Département</span>
                            <span className="value">{complaint.department?.name || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Assigné le</span>
                            <span className="value">
                                {new Date(complaint.assignedAt).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Citoyen</span>
                            <span className="value">{complaint.createdBy?.name || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Contact</span>
                            <span className="value">{complaint.createdBy?.phone || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="detail-card">
                    <h2>📝 Description</h2>
                    <p>{complaint.description}</p>
                </div>

                {/* Localisation */}
                {complaint.location && (
                    <div className="detail-card">
                        <h2>📍 Localisation</h2>
                        <p>{complaint.location.address || 'Adresse non disponible'}</p>
                        <p className="coordinates">
                            GPS: {complaint.location.coordinates[1]}, {complaint.location.coordinates[0]}
                        </p>
                    </div>
                )}

                {/* Médias de la plainte */}
                {complaint.media && (complaint.media.photos?.length > 0 || complaint.media.videos?.length > 0) && (
                    <div className="detail-card">
                        <h2>📷 Médias</h2>
                        <div className="media-grid">
                            {complaint.media.photos?.map((photo, idx) => (
                                <img
                                    key={idx}
                                    src={`http://127.0.0.1:3000${photo.url}`}
                                    alt="Photo plainte"
                                    className="media-thumb"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bouton Créer Rapport */}
            {!complaint.interventionReport && complaint.status !== 'resolved' && (
                <button
                    className="create-report-btn"
                    onClick={() => setShowReportForm(!showReportForm)}
                >
                    {showReportForm ? '❌ Annuler' : '📝 Créer Rapport d\'Intervention'}
                </button>
            )}

            {/* Formulaire de Rapport */}
            {showReportForm && (
                <form className="report-form" onSubmit={handleSubmitReport}>
                    <h2>📝 Rapport d'Intervention</h2>

                    <div className="form-group">
                        <label>Description du travail effectué *</label>
                        <textarea
                            value={reportData.workDescription}
                            onChange={(e) => setReportData({ ...reportData, workDescription: e.target.value })}
                            placeholder="Décrivez en détail le travail effectué..."
                            rows="5"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>📷 Photos AVANT</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, 'photosBefore')}
                        />
                    </div>

                    <div className="form-group">
                        <label>📷 Photos APRÈS</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileChange(e, 'photosAfter')}
                        />
                    </div>

                    <div className="form-group">
                        <label>🎥 Vidéos</label>
                        <input
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={(e) => handleFileChange(e, 'videos')}
                        />
                    </div>

                    <div className="form-group">
                        <label>🎤 Notes Audio</label>
                        <input
                            type="file"
                            accept="audio/*"
                            multiple
                            onChange={(e) => handleFileChange(e, 'audioNotes')}
                        />
                    </div>

                    <div className="form-group">
                        <label>🔧 Matériaux Utilisés</label>
                        {reportData.materialsUsed.map((material, idx) => (
                            <div key={idx} className="material-row">
                                <input
                                    type="text"
                                    placeholder="Nom"
                                    value={material.name}
                                    onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Quantité"
                                    value={material.quantity}
                                    onChange={(e) => updateMaterial(idx, 'quantity', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Unité"
                                    value={material.unit}
                                    onChange={(e) => updateMaterial(idx, 'unit', e.target.value)}
                                />
                                <button type="button" onClick={() => removeMaterial(idx)}>❌</button>
                            </div>
                        ))}
                        <button type="button" onClick={addMaterial} className="add-material-btn">
                            + Ajouter matériau
                        </button>
                    </div>

                    <button type="submit" className="submit-report-btn">
                        ✅ Soumettre le Rapport
                    </button>
                </form>
            )}
        </div>
    );
}
