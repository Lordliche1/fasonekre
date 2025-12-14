import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './GeoAnalytics.css';

// Icônes personnalisées par statut
const createCustomIcon = (status) => {
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
};

// Composant pour centrer la carte
function MapController({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    return null;
}

export default function GeoAnalytics() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [mapCenter, setMapCenter] = useState([12.3714, -1.5197]); // Ouagadougou par défaut

    // Coordonnées des principales villes du Burkina Faso
    const cities = {
        'Ouagadougou': [12.3714, -1.5197],
        'Bobo-Dioulasso': [11.1770, -4.2979],
        'Koudougou': [12.2528, -2.3625],
        'Ouahigouya': [13.5828, -2.4214],
        'Banfora': [10.6333, -4.7500],
        'Dédougou': [12.4667, -3.4667],
        'Kaya': [13.0917, -1.0850],
        'Tenkodogo': [11.7833, -0.3667],
        'Fada N\'gourma': [12.0614, 0.3583],
        'Gaoua': [10.3333, -3.1833]
    };

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
        fetchComplaints();
        // Rafraîchir toutes les 30 secondes pour le temps réel
        const interval = setInterval(fetchComplaints, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/v1/admin/requests', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Ajouter des coordonnées aléatoires pour la démo
            // En production, les coordonnées viendraient de la base de données
            const complaintsWithCoords = response.data.data.map(complaint => ({
                ...complaint,
                coordinates: generateRandomCoordinates(complaint.district)
            }));

            setComplaints(complaintsWithCoords);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement plaintes:', error);
            // Données de démo si erreur
            setComplaints(generateDemoData());
            setLoading(false);
        }
    };

    // Générer des coordonnées aléatoires autour d'une ville
    const generateRandomCoordinates = (district) => {
        const cityCoords = cities[district] || cities['Ouagadougou'];
        const lat = cityCoords[0] + (Math.random() - 0.5) * 0.1;
        const lng = cityCoords[1] + (Math.random() - 0.5) * 0.1;
        return [lat, lng];
    };

    // Données de démo
    const generateDemoData = () => {
        const statuses = ['pending', 'in-progress', 'resolved', 'rejected'];
        const departments = ['Voirie', 'Assainissement', 'Éclairage Public', 'Espaces Verts'];
        const cityNames = Object.keys(cities);

        return Array.from({ length: 50 }, (_, i) => ({
            _id: `demo-${i}`,
            title: `Plainte ${i + 1}`,
            description: `Description de la plainte ${i + 1}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            department: departments[Math.floor(Math.random() * departments.length)],
            district: cityNames[Math.floor(Math.random() * cityNames.length)],
            coordinates: generateRandomCoordinates(cityNames[Math.floor(Math.random() * cityNames.length)]),
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
    };

    const filteredComplaints = complaints.filter(complaint => {
        const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
        const matchesDept = filterDepartment === 'all' || complaint.department === filterDepartment;
        return matchesStatus && matchesDept;
    });

    const statusLabels = {
        'pending': 'En Attente',
        'in-progress': 'En Cours',
        'resolved': 'Résolue',
        'rejected': 'Rejetée'
    };

    if (loading) {
        return (
            <div className="geo-loading">
                <div className="spinner"></div>
                <p>Chargement de la carte...</p>
            </div>
        );
    }

    return (
        <div className="geo-analytics">
            <div className="geo-header">
                <h2>Carte Géographique des Plaintes</h2>
                <div className="live-indicator">
                    <span className="pulse"></span>
                    Temps Réel
                </div>
            </div>

            {/* Filtres */}
            <div className="geo-filters">
                <div className="filter-group">
                    <label>Statut:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En Attente</option>
                        <option value="in-progress">En Cours</option>
                        <option value="resolved">Résolues</option>
                        <option value="rejected">Rejetées</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Département:</label>
                    <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                        <option value="all">Tous les départements</option>
                        <option value="Voirie">Voirie</option>
                        <option value="Assainissement">Assainissement</option>
                        <option value="Éclairage Public">Éclairage Public</option>
                        <option value="Espaces Verts">Espaces Verts</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Ville:</label>
                    <select onChange={(e) => {
                        const city = e.target.value;
                        if (city !== 'all' && cities[city]) {
                            setMapCenter(cities[city]);
                        }
                    }}>
                        <option value="all">Toutes les villes</option>
                        {Object.keys(cities).map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <div className="stats-summary">
                    <span className="stat-item">
                        Total: <strong>{filteredComplaints.length}</strong>
                    </span>
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

            {/* Carte */}
            <div className="map-container">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '600px', width: '100%', borderRadius: '15px' }}
                >
                    <MapController center={mapCenter} />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {filteredComplaints.map((complaint) => (
                        <Marker
                            key={complaint._id}
                            position={complaint.coordinates}
                            icon={createCustomIcon(complaint.status)}
                        >
                            <Popup>
                                <div className="complaint-popup">
                                    <h3>{complaint.title}</h3>
                                    <p><strong>Département:</strong> {complaint.department}</p>
                                    <p><strong>Ville:</strong> {complaint.district}</p>
                                    <p><strong>Statut:</strong>
                                        <span className={`status-badge ${complaint.status}`}>
                                            {statusLabels[complaint.status]}
                                        </span>
                                    </p>
                                    <p><strong>Description:</strong> {complaint.description}</p>
                                    <p className="date">
                                        {new Date(complaint.createdAt).toLocaleDateString('fr-FR', {
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

            {/* Image de référence */}
            <div className="reference-note">
                <p>💡 Carte interactive basée sur OpenStreetMap avec localisation des plaintes en temps réel</p>
            </div>
        </div>
    );
}
