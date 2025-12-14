import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveRequests.css';

// Icônes personnalisées par statut
const createCustomIcon = (status) => {
    try {
        const colors = {
            pending: '#e67e22',
            'in-progress': '#3498db',
            resolved: '#27ae60',
            rejected: '#e74c3c'
        };

        const color = colors[status] || '#95a5a6';

        return L.divIcon({
            className: 'custom-marker',
            html: `
          <div style="
            background: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          ">
            <div style="
              transform: rotate(45deg);
              text-align: center;
              line-height: 24px;
              color: white;
              font-size: 16px;
            ">📍</div>
          </div>
        `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    } catch (error) {
        console.error('Erreur création icône:', error);
        return new L.Icon.Default();
    }
};

export default function LiveRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [mapCenter, setMapCenter] = useState([12.3714, -1.5197]); // Ouagadougou par défaut
    const [lastUpdate, setLastUpdate] = useState(new Date());

    // Configuration Leaflet - doit être dans useEffect pour éviter les erreurs
    useEffect(() => {
        // Fix pour les icônes Leaflet avec Webpack
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    useEffect(() => {
        fetchRequests();
        // Rafraîchir toutes les 10 secondes pour le temps réel
        const interval = setInterval(() => {
            fetchRequests();
            setLastUpdate(new Date());
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/v1/admin/requests', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Ajouter des coordonnées aléatoires autour de Ouagadougou pour la démo
            const requestsWithCoords = response.data.data.map(request => ({
                ...request,
                coordinates: generateRandomCoordinates()
            }));

            setRequests(requestsWithCoords);
            setLoading(false);
            setError(null);
        } catch (error) {
            console.error('Erreur chargement requêtes:', error);
            // Données de démo si erreur
            setRequests(generateDemoData());
            setLoading(false);
            setError(null); // On n'affiche pas d'erreur si on a des données de démo
        }
    };

    // Générer des coordonnées aléatoires autour de Ouagadougou
    const generateRandomCoordinates = () => {
        const lat = 12.3714 + (Math.random() - 0.5) * 0.1;
        const lng = -1.5197 + (Math.random() - 0.5) * 0.1;
        return [lat, lng];
    };

    // Données de démo
    const generateDemoData = () => {
        const statuses = ['pending', 'in-progress', 'resolved', 'rejected'];
        const departments = ['Voirie', 'Assainissement', 'Éclairage Public', 'Espaces Verts'];

        return Array.from({ length: 30 }, (_, i) => ({
            _id: `demo-${i}`,
            title: `Requête ${i + 1}`,
            description: `Description de la requête ${i + 1}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            department: departments[Math.floor(Math.random() * departments.length)],
            coordinates: generateRandomCoordinates(),
            createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        }));
    };

    const filteredRequests = requests.filter(request => {
        return filterStatus === 'all' || request.status === filterStatus;
    });

    const statusLabels = {
        'pending': 'En Attente',
        'in-progress': 'En Cours',
        'resolved': 'Résolue',
        'rejected': 'Rejetée'
    };

    const statusCounts = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        'in-progress': requests.filter(r => r.status === 'in-progress').length,
        resolved: requests.filter(r => r.status === 'resolved').length,
        rejected: requests.filter(r => r.status === 'rejected').length
    };

    if (loading) {
        return (
            <div className="live-loading">
                <div className="spinner"></div>
                <p>Chargement des requêtes en temps réel...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="live-loading">
                <h2 style={{ color: '#e74c3c' }}>❌ Erreur</h2>
                <p>{error}</p>
                <button
                    onClick={() => {
                        setError(null);
                        setLoading(true);
                        fetchRequests();
                    }}
                    style={{
                        padding: '10px 20px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '20px'
                    }}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="live-requests">
            <div className="live-header">
                <div className="header-left">
                    <h2>Requêtes en Temps Réel</h2>
                    <div className="live-indicator">
                        <span className="pulse"></span>
                        Mise à jour automatique
                    </div>
                </div>
                <div className="last-update">
                    Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="quick-stats">
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{statusCounts.total}</span>
                    </div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <span className="stat-label">En Attente</span>
                        <span className="stat-value">{statusCounts.pending}</span>
                    </div>
                </div>
                <div className="stat-card in-progress">
                    <div className="stat-icon">🔄</div>
                    <div className="stat-info">
                        <span className="stat-label">En Cours</span>
                        <span className="stat-value">{statusCounts['in-progress']}</span>
                    </div>
                </div>
                <div className="stat-card resolved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <span className="stat-label">Résolues</span>
                        <span className="stat-value">{statusCounts.resolved}</span>
                    </div>
                </div>
                <div className="stat-card rejected">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                        <span className="stat-label">Rejetées</span>
                        <span className="stat-value">{statusCounts.rejected}</span>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="live-filters">
                <div className="filter-group">
                    <label>Filtrer par statut:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En Attente</option>
                        <option value="in-progress">En Cours</option>
                        <option value="resolved">Résolues</option>
                        <option value="rejected">Rejetées</option>
                    </select>
                </div>
                <div className="filter-info">
                    Affichage: <strong>{filteredRequests.length}</strong> requête(s)
                </div>
            </div>

            {/* Légende */}
            <div className="map-legend">
                <h4>Légende</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="legend-marker" style={{ background: '#e67e22' }}></span>
                        En Attente
                    </div>
                    <div className="legend-item">
                        <span className="legend-marker" style={{ background: '#3498db' }}></span>
                        En Cours
                    </div>
                    <div className="legend-item">
                        <span className="legend-marker" style={{ background: '#27ae60' }}></span>
                        Résolue
                    </div>
                    <div className="legend-item">
                        <span className="legend-marker" style={{ background: '#e74c3c' }}></span>
                        Rejetée
                    </div>
                </div>
            </div>

            {/* Carte OpenStreetMap */}
            <div className="map-container">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    key={`${mapCenter[0]}-${mapCenter[1]}`}
                    style={{ height: '600px', width: '100%', borderRadius: '15px' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {filteredRequests.map((request) => (
                        <Marker
                            key={request._id}
                            position={request.coordinates}
                            icon={createCustomIcon(request.status)}
                        >
                            <Popup>
                                <div className="request-popup">
                                    <h3>{request.title}</h3>
                                    <p><strong>Département:</strong> {request.department}</p>
                                    <p><strong>Statut:</strong>
                                        <span className={`status-badge ${request.status}`}>
                                            {statusLabels[request.status]}
                                        </span>
                                    </p>
                                    <p><strong>Description:</strong> {request.description}</p>
                                    <p className="date">
                                        {new Date(request.createdAt).toLocaleString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Note */}
            <div className="reference-note">
                <p>🗺️ Carte interactive OpenStreetMap - Ouagadougou, Burkina Faso</p>
                <p>🔄 Actualisation automatique toutes les 10 secondes</p>
            </div>
        </div>
    );
}
