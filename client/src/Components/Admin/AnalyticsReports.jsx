import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnalyticsReports.css';

export default function AnalyticsReports() {
    const [stats, setStats] = useState({
        totalRequests: 0,
        resolvedRequests: 0,
        pendingRequests: 0,
        avgResponseTime: 0,
        departmentStats: [],
        monthlyData: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    useEffect(() => {
        fetchAnalytics();
    }, [selectedPeriod]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/v1/admin/analytics?period=${selectedPeriod}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data.stats || {});
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement analytics:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement des statistiques...</p>
            </div>
        );
    }

    return (
        <div className="analytics-reports">
            <div className="page-header">
                <h2>📊 Rapports Analytiques</h2>
                <div className="period-selector">
                    <button
                        className={selectedPeriod === 'week' ? 'active' : ''}
                        onClick={() => setSelectedPeriod('week')}
                    >
                        Semaine
                    </button>
                    <button
                        className={selectedPeriod === 'month' ? 'active' : ''}
                        onClick={() => setSelectedPeriod('month')}
                    >
                        Mois
                    </button>
                    <button
                        className={selectedPeriod === 'year' ? 'active' : ''}
                        onClick={() => setSelectedPeriod('year')}
                    >
                        Année
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card total">
                    <div className="kpi-icon">📋</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.totalRequests || 0}</div>
                        <div className="kpi-label">Total Requêtes</div>
                    </div>
                </div>

                <div className="kpi-card resolved">
                    <div className="kpi-icon">✅</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.resolvedRequests || 0}</div>
                        <div className="kpi-label">Résolues</div>
                    </div>
                </div>

                <div className="kpi-card pending">
                    <div className="kpi-icon">⏳</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.pendingRequests || 0}</div>
                        <div className="kpi-label">En Attente</div>
                    </div>
                </div>

                <div className="kpi-card time">
                    <div className="kpi-icon">⏱️</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{stats.avgResponseTime || 0}h</div>
                        <div className="kpi-label">Temps Moyen</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3>📈 Évolution Mensuelle</h3>
                    <div className="chart-placeholder">
                        <div className="bar-chart">
                            {[65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 70].map((height, index) => (
                                <div key={index} className="bar-container">
                                    <div className="bar" style={{ height: `${height}%` }}></div>
                                    <span className="bar-label">{index + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>🎯 Répartition par Statut</h3>
                    <div className="chart-placeholder">
                        <div className="donut-chart">
                            <div className="donut-center">
                                <div className="donut-value">100%</div>
                                <div className="donut-label">Total</div>
                            </div>
                        </div>
                        <div className="donut-legend">
                            <div className="legend-item">
                                <span className="legend-color resolved"></span>
                                <span>Résolues (45%)</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color pending"></span>
                                <span>En Attente (30%)</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color progress"></span>
                                <span>En Cours (25%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Performance */}
            <div className="department-performance">
                <h3>🏢 Performance par Département</h3>
                <div className="performance-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Département</th>
                                <th>Requêtes</th>
                                <th>Résolues</th>
                                <th>Taux de Résolution</th>
                                <th>Temps Moyen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>🚧 Voirie</td>
                                <td>156</td>
                                <td>142</td>
                                <td><span className="rate-badge high">91%</span></td>
                                <td>24h</td>
                            </tr>
                            <tr>
                                <td>💧 Eau</td>
                                <td>98</td>
                                <td>85</td>
                                <td><span className="rate-badge medium">87%</span></td>
                                <td>36h</td>
                            </tr>
                            <tr>
                                <td>💡 Électricité</td>
                                <td>124</td>
                                <td>108</td>
                                <td><span className="rate-badge high">87%</span></td>
                                <td>18h</td>
                            </tr>
                            <tr>
                                <td>🚰 Assainissement</td>
                                <td>67</td>
                                <td>52</td>
                                <td><span className="rate-badge medium">78%</span></td>
                                <td>48h</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Button */}
            <div className="export-section">
                <button className="btn-export">
                    📥 Exporter le Rapport (PDF)
                </button>
                <button className="btn-export">
                    📊 Exporter les Données (Excel)
                </button>
            </div>
        </div>
    );
}
