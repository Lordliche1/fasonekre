import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuration des icônes Leaflet
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function GeolocationCapture({ onLocationCapture }) {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [address, setAddress] = useState('');

    // Capturer la position automatiquement au montage
    useEffect(() => {
        captureLocation();
    }, []);

    const captureLocation = () => {
        setLoading(true);
        setError(null);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const coords = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    };

                    setPosition(coords);

                    // Reverse geocoding pour obtenir l'adresse
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
                        );
                        const data = await response.json();
                        const addr = data.display_name || 'Adresse non disponible';
                        setAddress(addr);

                        onLocationCapture({
                            ...coords,
                            address: addr
                        });
                    } catch (err) {
                        console.error('Erreur geocoding:', err);
                        onLocationCapture(coords);
                    }

                    setLoading(false);
                },
                (err) => {
                    setError(err.message);
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setError("Géolocalisation non supportée par votre navigateur");
            setLoading(false);
        }
    };

    return (
        <div className="geolocation-capture border-2 rounded-xl p-4 my-4">
            <h3 className="text-xl font-bold mb-3">📍 Localisation</h3>

            {loading && (
                <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p>Capture de votre position GPS...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
                    <p className="font-bold">❌ Erreur</p>
                    <p>{error}</p>
                    <button
                        onClick={captureLocation}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Réessayer
                    </button>
                </div>
            )}

            {position && !loading && (
                <div>
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-3">
                        <p className="font-bold">✅ Position capturée avec succès</p>
                        <p className="text-sm mt-1">
                            Précision: ±{Math.round(position.accuracy)}m
                        </p>
                        {address && (
                            <p className="text-sm mt-1">
                                <strong>Adresse:</strong> {address}
                            </p>
                        )}
                    </div>

                    <MapContainer
                        center={[position.latitude, position.longitude]}
                        zoom={16}
                        style={{ height: '300px', width: '100%', borderRadius: '10px' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker position={[position.latitude, position.longitude]}>
                            <Popup>
                                Votre position<br />
                                {address}
                            </Popup>
                        </Marker>
                    </MapContainer>

                    <button
                        onClick={captureLocation}
                        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                    >
                        🔄 Recapturer la position
                    </button>
                </div>
            )}
        </div>
    );
}
