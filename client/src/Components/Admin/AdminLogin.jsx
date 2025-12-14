import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';
import loginBg from '../../assets/login-bg.png';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Tentative de connexion avec:', formData.email);
            const response = await axios.post('/api/v1/auth/universal-login', formData);

            console.log('Réponse:', response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userRole', response.data.role || 'admin');
                localStorage.setItem('userName', response.data.user?.name || 'Admin');
                navigate('/admin/dashboard');
            }
        } catch (err) {
            console.error('Erreur de connexion:', err);
            setError(err.response?.data?.msg || err.response?.data?.message || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            {/* Left Side - Illustration */}
            <div className="login-left" style={{ backgroundImage: `url(${loginBg})` }}>
                <div className="illustration-content">
                    <div className="brand-section">
                        <h1>FASONEKRE</h1>
                        <p className="brand-tagline">
                            Plateforme municipale intelligente pour la gestion des plaintes citoyennes.
                            FASONEKRE facilite la communication entre les citoyens et les services municipaux
                            pour une ville plus réactive et efficace.
                        </p>
                    </div>

                    <div className="services-icons">
                        <div className="service-icon">
                            <div className="icon-circle">🚧</div>
                            <span>Routes</span>
                        </div>
                        <div className="service-icon">
                            <div className="icon-circle">💧</div>
                            <span>Eau</span>
                        </div>
                        <div className="service-icon">
                            <div className="icon-circle">💡</div>
                            <span>Électricité</span>
                        </div>
                        <div className="service-icon">
                            <div className="icon-circle">🚰</div>
                            <span>Assainissement</span>
                        </div>
                    </div>

                    <div className="illustration-image">
                        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                            {/* Person sitting with phone */}
                            <ellipse cx="100" cy="250" rx="40" ry="10" fill="#4a5568" opacity="0.3" />
                            <path d="M 80 180 Q 80 200 90 220 L 90 250" stroke="#2d3748" strokeWidth="8" fill="none" />
                            <circle cx="90" cy="170" r="25" fill="#4a5568" />
                            <rect x="85" y="200" width="30" height="15" rx="5" fill="#6366f1" />

                            {/* Person standing */}
                            <ellipse cx="200" cy="250" rx="40" ry="10" fill="#4a5568" opacity="0.3" />
                            <path d="M 200 180 L 200 250" stroke="#2d3748" strokeWidth="8" />
                            <circle cx="200" cy="160" r="25" fill="#4a5568" />

                            {/* Street lamp */}
                            <line x1="280" y1="100" x2="280" y2="250" stroke="#4a5568" strokeWidth="6" />
                            <circle cx="280" cy="90" r="15" fill="#fbbf24" />
                            <path d="M 265 90 Q 280 70 295 90" fill="none" stroke="#4a5568" strokeWidth="3" />

                            {/* Buildings background */}
                            <rect x="20" y="80" width="60" height="100" fill="#cbd5e0" opacity="0.5" />
                            <rect x="320" y="60" width="60" height="120" fill="#cbd5e0" opacity="0.5" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-right">
                <div className="login-form-container">
                    <div className="login-header">
                        <h2>Connexion</h2>
                        <p className="welcome-text">Bienvenue, Administrateur</p>
                        <p className="signin-text">Veuillez vous connecter à votre compte.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="admin@admin.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••••"
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>

                        <p className="help-text">
                            Si vous ne pouvez pas vous connecter, <a href="#" className="help-link">cliquez ici</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
