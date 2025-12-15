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
                const response = await axios.get('/api/v1/auth/locations');
                const data = response.data.locations;
                setLocationsData(data);
                setRegions(data); // Initial regions list
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };
        fetchLocations();

    }, []);

    // OTPLess Callback Setup
    React.useEffect(() => {
        window.otpless = (otplessUser) => {
            console.log("OTPLess Callback:", otplessUser);
            if (otplessUser && otplessUser.token) {
                verifyOtplessToken(otplessUser.token, otplessUser);
            } else {
                console.error("Token Otpless manquant");
            }
        };
    }, [formData.email]); // Re-bind if email changes (though logic uses user object most times)

    const verifyOtplessToken = async (token, otplessUser) => {
        setLoading(true);
        try {
            // On envoie le token ET le numéro de téléphone (ou email) pour vérification
            // Le SDK renvoie souvent un objet structuré, on essaie d'extraire le phone
            // Structure typique: { token: "...", identities: [{ identityValue: "226...", ... }] }
            // Ou parfois directement accessible. On envoie tout ou partie.

            let phone = otplessUser.identities?.[0]?.identityValue || otplessUser.phone || otplessUser.mobile?.number;

            // Fallback si on ne trouve pas le phone dans l'objet user (dépend des versions SDK)
            // On envoie quand même pour que le backend tente de vérifier via API server-to-server

            const response = await axios.post('/api/v1/auth/otpless/verify-2fa', {
                email: formData.email, // L'email utilisé lors du login step 1
                token: token,
                phone: phone // Optionnel selon implémentation backend
            });

            if (response.data.token) {
                handleLoginSuccess(response.data);
            }
        } catch (error) {
            console.error("Erreur vérification Otpless:", error);
            alert("Échec de la vérification WhatsApp. Veuillez réessayer ou utiliser le code Email.");
        } finally {
            setLoading(false);
        }
    };

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

    const [requestingOtp, setRequestingOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [tempEmail, setTempEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // STEP 1: LOGIN (Request OTP)
            if (mode === 'login' && !requestingOtp) {
                const response = await axios.post('/api/v1/auth/universal-login', {
                    email: formData.email,
                    password: formData.password
                });

                // Si le backend demande un OTP (nouveau flux)
                if (response.data.requireOtp) {
                    setRequestingOtp(true);
                    setTempEmail(response.data.email);
                    setLoading(false);
                    return; // On arrête ici, l'UI va changer pour demander l'OTP
                }

                // Fallback (Ancien flux sans OTP, peu probable mais au cas où)
                if (response.data.token) {
                    handleLoginSuccess(response.data);
                }
            }
            // STEP 2: VERIFY OTP
            else if (mode === 'login' && requestingOtp) {
                const response = await axios.post('/api/v1/auth/verify-otp', {
                    email: tempEmail,
                    otp: otp
                });

                if (response.data.token) {
                    handleLoginSuccess(response.data);
                }
            }
            // REGISTER
            else {
                // ... (Register logic unchanged)
                if (!formData.region || !formData.province || !formData.commune) {
                    alert("Veuillez remplir tous les champs de localisation.");
                    setLoading(false); return;
                }
                const payload = { ...formData, role: 'user', age: 18, coordinates: formData.coordinates.length ? formData.coordinates : [12.3714, -1.5197] };
                const response = await axios.post('/api/v1/auth/register', payload);
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('userRole', 'citizen');
                    navigate('/user');
                }
            }
        } catch (error) {
            console.error('Erreur auth:', error);
            const msg = error.response?.data?.error || 'Erreur d\'authentification';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        if (data.redirectTo) navigate(data.redirectTo);
        else navigate('/user');
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

                    {mode === 'login' && requestingOtp ? (
                        <div className="form-group text-center">
                            <h3 style={{ marginBottom: '20px', color: '#333' }}>Vérification en deux étapes</h3>

                            <div className="otp-method-container bg-gray-50 p-4 rounded mb-4" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                                <label style={{ color: '#e67e22', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                                    Option A : Code Email
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Code à 6 chiffres"
                                    style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem', width: '100%', marginBottom: '5px' }}
                                />
                                <small className="form-text text-muted" style={{ display: 'block' }}>Envoyé à {tempEmail}</small>
                            </div>

                            <div className="divider" style={{ margin: '15px 0', textAlign: 'center', color: '#aaa' }}>
                                - OU -
                            </div>

                            <div className="otpless-method-container bg-green-50 p-4 rounded" style={{ border: '1px solid #d4edda', padding: '15px', borderRadius: '8px', backgroundColor: '#f0fff4' }}>
                                <label style={{ color: '#27ae60', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                                    Option B : WhatsApp (Recommandé)
                                </label>
                                {/* Conteneur pour le widget Otpless */}
                                <div id="otpless-login-page"></div>
                            </div>
                        </div>
                    ) : (
                        /* NORMAL MODE */
                        <>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="votre@email.com"
                                    required
                                    disabled={requestingOtp}
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
                        </>
                    )}

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
                            mode === 'login' ? (requestingOtp ? 'Vérifier le code' : 'Se connecter') : 'S\'inscrire'
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
