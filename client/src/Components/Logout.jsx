import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        // Nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');

        // Rediriger vers la page de login admin
        navigate('/admin/login');
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontSize: '1.2rem',
            color: '#6b7280'
        }}>
            Déconnexion en cours...
        </div>
    );
}
