import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthPage.css';

export default function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [userType, setUserType] = useState('citizen'); // 'citizen', 'officer', 'admin'
    const [loading, setLoading] = useState(false);

    // Locations Data
    const [locationsData, setLocationsData] = useState([]);
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [communes, setCommunes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        region: '',
        province: '',
        commune: '',
        coordinates: [] // [lat, long] of selected commune
    });

    // Fetch locations on mount
    React.useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:3000/api/v1/auth/locations');
                const data = response.data.locations;
                setLocationsData(data);
                setRegions(data); // Initial regions list
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };
        fetchLocations();
    }, []);

    const userTypes = [
        {
            id: 'citizen',
            label: 'Citoyen',
            icon: '👤',
            color: '#27ae60',
            description: 'Signaler des incidents et plaintes'
        },
        {
            id: 'officer',
            label: 'Chef de Département',
            icon: '👮',
            color: '#e67e22',
            description: 'Gérer un département municipal'
        },
        {
            id: 'serviceman',
            label: 'Employé/Technicien',
            icon: '🔧',
            color: '#3498db',
            description: 'Résoudre les incidents sur terrain'
        },
        {
            id: 'admin',
            label: 'Administration',
            icon: '👔',
            color: '#9b59b6',
            description: 'Gérer toute la plateforme'
        }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegionChange = (e) => {
        const regionName = e.target.value;
        const selectedRegion = regions.find(r => r.name === regionName);

        setFormData({
            ...formData,
            region: regionName,
            province: '',
            commune: '',
            coordinates: []
        });

        setProvinces(selectedRegion ? selectedRegion.provinces : []);
        setCommunes([]);
    };

    const handleProvinceChange = (e) => {
        const provinceName = e.target.value;
        const selectedProvince = provinces.find(p => p.name === provinceName);

        setFormData({
            ...formData,
            province: provinceName,
            commune: '',
            coordinates: []
        });

        setCommunes(selectedProvince ? selectedProvince.communes : []);
    };

    const handleCommuneChange = (e) => {
        const communeName = e.target.value;
        const selectedCommune = communes.find(c => c.name === communeName);

        setFormData({
            ...formData,
            commune: communeName,
            coordinates: selectedCommune ? selectedCommune.coordinates : []
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Login mode uses Universal Auth
            if (mode === 'login') {
                const response = await axios.post('http://127.0.0.1:3000/api/v1/auth/universal-login', {
                    email: formData.email,
                    password: formData.password
                });

                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    const detectedRole = response.data.role;
                    localStorage.setItem('userRole', detectedRole);

                    // Redirect based on backend response or detected role
                    if (response.data.redirectTo) {
                        navigate(response.data.redirectTo);
                    } else {
                        // Fallback
                        if (detectedRole === 'admin') navigate('/admin');
                        else if (detectedRole === 'officer') navigate('/department');
                        else if (detectedRole === 'serviceman') navigate('/serviceman');
                        else navigate('/user');
                    }
                }
            }
            // Register mode (Citizen only for now)
            else {
                // Ensure required fields are present
                if (!formData.region || !formData.province || !formData.commune) {
                    alert("Veuillez remplir tous les champs de localisation (Région, Province, Commune).");
                    setLoading(false);
                    return;
                }

                const payload = { ...formData, role: 'user', age: 18 }; // Default age 18 if not asked
                if (!payload.coordinates || payload.coordinates.length === 0) {
                    // Fallback coordinates if missing for some reason
                    payload.coordinates = [12.3714, -1.5197];
                }

                const response = await axios.post('http://127.0.0.1:3000/api/v1/auth/register', payload);

                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('userRole', 'citizen');
                    navigate('/user');
                }
            }
        } catch (error) {
            console.error('Erreur auth:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Erreur d\'authentification';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Header */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src="/logo.png" alt="FASONEKRE" className="auth-logo-image" />
                        <h1>FASONEKRE</h1>
                    </div>
                    <p className="auth-tagline">Votre voix compte</p>
                </div>

                {/* Mode Toggle */}
                <div className="mode-toggle">
                    <button
                        className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => setMode('login')}
                    >
                        Connexion
                    </button>
                    <button
                        className={`mode-btn ${mode === 'register' ? 'active' : ''}`}
                        onClick={() => setMode('register')}
                    >
                        Inscription
                    </button>
                </div>

                {/* User Type Selection - Visible only in Register mode */}
                {mode === 'register' && (
                    <div className="user-type-selection">
                        {userTypes
                            .filter(t => t.id === 'citizen') // Only citizens can self-register
                            .map((type) => (
                                <div
                                    key={type.id}
                                    className={`user-type-card ${userType === type.id ? 'active' : ''}`}
                                    onClick={() => setUserType(type.id)}
                                    style={{
                                        borderColor: userType === type.id ? type.color : '#ddd'
                                    }}
                                >
                                    <div className="user-type-icon" style={{ color: type.color }}>
                                        {type.icon}
                                    </div>
                                    <p className="user-type-label">{type.label}</p>
                                    {userType === type.id && (
                                        <div className="check-mark" style={{ backgroundColor: type.color }}>
                                            ✓
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Nom complet</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Votre nom complet"
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {mode === 'register' && (
                        <>
                            <div className="form-group">
                                <label>Téléphone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+226 XX XX XX XX"
                                    required
                                />
                            </div>

                            {userType === 'citizen' && (
                                <>
                                    <div className="form-group">
                                        <label>Région</label>
                                        <select
                                            name="region"
                                            value={formData.region}
                                            onChange={handleRegionChange}
                                            required
                                        >
                                            <option value="">Sélectionner une région</option>
                                            {regions.map((reg) => (
                                                <option key={reg.name} value={reg.name}>
                                                    {reg.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Province</label>
                                        <select
                                            name="province"
                                            value={formData.province}
                                            onChange={handleProvinceChange}
                                            disabled={!formData.region}
                                            required
                                        >
                                            <option value="">Sélectionner une province</option>
                                            {provinces.map((prov) => (
                                                <option key={prov.name} value={prov.name}>
                                                    {prov.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Commune</label>
                                        <select
                                            name="commune"
                                            value={formData.commune}
                                            onChange={handleCommuneChange}
                                            disabled={!formData.province}
                                            required
                                        >
                                            <option value="">Sélectionner une commune</option>
                                            {communes.map((com) => (
                                                <option key={com.name} value={com.name}>
                                                    {com.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                        style={{
                            backgroundColor: userTypes.find(t => t.id === userType).color
                        }}
                    >
                        {loading ? (
                            <div className="spinner"></div>
                        ) : (
                            mode === 'login' ? 'Se connecter' : 'S\'inscrire'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    {mode === 'login' ? (
                        <p>
                            Pas encore de compte ?{' '}
                            <span onClick={() => setMode('register')}>S'inscrire</span>
                        </p>
                    ) : (
                        <p>
                            Déjà un compte ?{' '}
                            <span onClick={() => setMode('login')}>Se connecter</span>
                        </p>
                    )}
                </div>

                {/* Quick Login (Dev) */}
                <div className="quick-login">
                    <p className="quick-login-title">Accès rapide (Dev)</p>
                    <div className="quick-login-buttons">
                        <button
                            onClick={() => {
                                setFormData({ ...formData, email: 'admin@admin.com', password: 'password123' });
                                setMode('login');
                            }}
                        >
                            Admin
                        </button>
                        <button
                            onClick={() => {
                                setFormData({ ...formData, email: 'test@test.com', password: 'password' });
                                setMode('login');
                            }}
                        >
                            Citoyen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
