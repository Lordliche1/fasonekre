import React, { useState } from 'react';
import './SettingsPage.css';

export default function SettingsPage({ type = 'app' }) {
    const [settings, setSettings] = useState({
        appName: 'FASONEKRE',
        appLogo: '',
        primaryColor: '#667eea',
        language: 'fr',
        timezone: 'Africa/Ouagadougou',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        autoAssign: true,
        maxResponseTime: 48
    });

    const handleSave = () => {
        alert('Paramètres sauvegardés avec succès !');
    };

    // App Settings
    if (type === 'app') {
        return (
            <div className="settings-page">
                <div className="page-header">
                    <h2>⚙️ Paramètres Application</h2>
                    <button className="btn-save" onClick={handleSave}>
                        💾 Sauvegarder
                    </button>
                </div>

                <div className="settings-sections">
                    <div className="settings-card">
                        <h3>🏢 Informations Générales</h3>
                        <div className="form-group">
                            <label>Nom de l'Application</label>
                            <input
                                type="text"
                                value={settings.appName}
                                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Logo de l'Application</label>
                            <input type="file" accept="image/*" />
                            <small>Format recommandé : PNG, 512x512px</small>
                        </div>
                    </div>

                    <div className="settings-card">
                        <h3>🎨 Apparence</h3>
                        <div className="form-group">
                            <label>Couleur Principale</label>
                            <div className="color-picker">
                                <input
                                    type="color"
                                    value={settings.primaryColor}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                />
                                <span>{settings.primaryColor}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Thème</label>
                            <select>
                                <option value="light">Clair</option>
                                <option value="dark">Sombre</option>
                                <option value="auto">Automatique</option>
                            </select>
                        </div>
                    </div>

                    <div className="settings-card">
                        <h3>🌍 Localisation</h3>
                        <div className="form-group">
                            <label>Langue par Défaut</label>
                            <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}>
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Fuseau Horaire</label>
                            <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                                <option value="Africa/Ouagadougou">Ouagadougou (GMT+0)</option>
                                <option value="Africa/Abidjan">Abidjan (GMT+0)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Notification Settings
    if (type === 'notifications') {
        return (
            <div className="settings-page">
                <div className="page-header">
                    <h2>🔔 Configuration Notifications</h2>
                    <button className="btn-save" onClick={handleSave}>
                        💾 Sauvegarder
                    </button>
                </div>

                <div className="settings-sections">
                    <div className="settings-card">
                        <h3>📧 Notifications Email</h3>
                        <div className="toggle-group">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                />
                                <span className="toggle-slider"></span>
                                <span>Activer les notifications par email</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>Serveur SMTP</label>
                            <input type="text" placeholder="smtp.example.com" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Port</label>
                                <input type="number" placeholder="587" />
                            </div>
                            <div className="form-group">
                                <label>Email Expéditeur</label>
                                <input type="email" placeholder="noreply@fasonekre.bf" />
                            </div>
                        </div>
                    </div>

                    <div className="settings-card">
                        <h3>📱 Notifications Push</h3>
                        <div className="toggle-group">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings.pushNotifications}
                                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                                />
                                <span className="toggle-slider"></span>
                                <span>Activer les notifications push</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>Clé API Firebase</label>
                            <input type="text" placeholder="AIza..." />
                        </div>
                    </div>

                    <div className="settings-card">
                        <h3>💬 Notifications SMS</h3>
                        <div className="toggle-group">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={settings.smsNotifications}
                                    onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                                />
                                <span className="toggle-slider"></span>
                                <span>Activer les notifications SMS</span>
                            </label>
                        </div>
                        <div className="form-group">
                            <label>Fournisseur SMS</label>
                            <select>
                                <option value="twilio">Twilio</option>
                                <option value="nexmo">Nexmo</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Panel/System Settings
    return (
        <div className="settings-page">
            <div className="page-header">
                <h2>🖥️ Paramètres Système</h2>
                <button className="btn-save" onClick={handleSave}>
                    💾 Sauvegarder
                </button>
            </div>

            <div className="settings-sections">
                <div className="settings-card">
                    <h3>🔐 Sécurité</h3>
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                            <span>Authentification à deux facteurs (2FA)</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Durée de Session (minutes)</label>
                        <input type="number" defaultValue="60" />
                    </div>
                    <div className="form-group">
                        <label>Tentatives de Connexion Max</label>
                        <input type="number" defaultValue="5" />
                    </div>
                </div>

                <div className="settings-card">
                    <h3>⚡ Performance</h3>
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <input type="checkbox" checked={settings.autoAssign} onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })} />
                            <span className="toggle-slider"></span>
                            <span>Assignation Automatique des Requêtes</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Temps de Réponse Maximum (heures)</label>
                        <input
                            type="number"
                            value={settings.maxResponseTime}
                            onChange={(e) => setSettings({ ...settings, maxResponseTime: e.target.value })}
                        />
                    </div>
                </div>

                <div className="settings-card">
                    <h3>💾 Sauvegarde</h3>
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                            <span>Sauvegarde Automatique Quotidienne</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Heure de Sauvegarde</label>
                        <input type="time" defaultValue="02:00" />
                    </div>
                    <button className="btn-backup">
                        💾 Créer une Sauvegarde Maintenant
                    </button>
                </div>

                <div className="settings-card danger">
                    <h3>⚠️ Zone Dangereuse</h3>
                    <p>Ces actions sont irréversibles. Procédez avec prudence.</p>
                    <button className="btn-danger">
                        🗑️ Supprimer Toutes les Données
                    </button>
                    <button className="btn-danger">
                        🔄 Réinitialiser aux Paramètres d'Usine
                    </button>
                </div>
            </div>
        </div>
    );
}
