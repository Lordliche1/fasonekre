import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Bienvenue sur FASONEKRE",
            subtitle: "Votre voix compte",
            description: "Plateforme citoyenne de gestion des plaintes municipales au Burkina Faso",
            icon: "🏛️",
            color: "#27ae60"
        },
        {
            title: "Signalez les Problèmes",
            subtitle: "En temps réel",
            description: "Déposez vos plaintes avec photos, vidéos et géolocalisation GPS",
            icon: "📍",
            color: "#e67e22"
        },
        {
            title: "Suivi Transparent",
            subtitle: "Restez informé",
            description: "Suivez l'évolution de vos plaintes et recevez des notifications",
            icon: "📊",
            color: "#3498db"
        }
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/auth');
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const skipToAuth = () => {
        navigate('/auth');
    };

    return (
        <div className="landing-page">
            {/* Header avec logo */}
            <div className="landing-header">
                <div className="logo-container">
                    <img src="/logo.png" alt="FASONEKRE" className="logo-image" />
                    <h1 className="logo-text">FASONEKRE</h1>
                </div>
                <button className="skip-btn" onClick={skipToAuth}>
                    Passer →
                </button>
            </div>

            {/* Slides */}
            <div className="slides-container">
                <div
                    className="slides-wrapper"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div key={index} className="slide">
                            <div className="slide-icon" style={{ color: slide.color }}>
                                {slide.icon}
                            </div>
                            <h2 className="slide-title">{slide.title}</h2>
                            <p className="slide-subtitle" style={{ color: slide.color }}>
                                {slide.subtitle}
                            </p>
                            <p className="slide-description">{slide.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Indicateurs */}
            <div className="slide-indicators">
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                        style={{
                            backgroundColor: index === currentSlide ? slides[currentSlide].color : '#ddd'
                        }}
                    />
                ))}
            </div>

            {/* Navigation */}
            <div className="landing-footer">
                {currentSlide > 0 && (
                    <button className="nav-btn secondary" onClick={prevSlide}>
                        ← Précédent
                    </button>
                )}
                <button
                    className="nav-btn primary"
                    onClick={nextSlide}
                    style={{ backgroundColor: slides[currentSlide].color }}
                >
                    {currentSlide === slides.length - 1 ? 'Get Started' : 'Suivant →'}
                </button>
            </div>
        </div>
    );
}
