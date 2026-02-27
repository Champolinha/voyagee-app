import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav({ selectedTripId, onSettingsClick }) {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    const isHome = path === '/';
    const isExplore = path === '/explore';
    const isItinerary = path.includes('/itinerary');
    const isExpenses = path.includes('/expenses');

    const handleNav = (target) => {
        if (target === 'home') {
            navigate('/');
        } else if (target === 'explore') {
            navigate('/explore');
        } else if (target === 'itinerary') {
            if (selectedTripId) navigate(`/trip/${selectedTripId}/itinerary`);
            else navigate('/');
        } else if (target === 'expenses') {
            if (selectedTripId) navigate(`/trip/${selectedTripId}/expenses`);
            else navigate('/');
        }
    };

    return (
        <div className="bottom-nav">
            <button className={`bottom-nav-item ${isHome ? 'active' : ''}`} onClick={() => handleNav('home')}>
                <span className="nav-icon">🏠</span><span>Início</span><span className="nav-indicator" />
            </button>
            <button className={`bottom-nav-item ${isExplore ? 'active' : ''}`} onClick={() => handleNav('explore')}>
                <span className="nav-icon">🧭</span><span>Explorar</span><span className="nav-indicator" />
            </button>
            <button className={`bottom-nav-item ${isItinerary ? 'active' : ''}`} onClick={() => handleNav('itinerary')} id="nav-itinerary" style={!selectedTripId ? { opacity: 0.4 } : {}}>
                <span className="nav-icon">📅</span><span>Roteiro</span><span className="nav-indicator" />
            </button>
            <button className={`bottom-nav-item ${isExpenses ? 'active' : ''}`} onClick={() => handleNav('expenses')} id="nav-expenses" style={!selectedTripId ? { opacity: 0.4 } : {}}>
                <span className="nav-icon">💳</span><span>Despesas</span><span className="nav-indicator" />
            </button>
            <button className="bottom-nav-item" onClick={onSettingsClick} id="nav-settings">
                <span className="nav-icon">⚙️</span><span>Ajustes</span><span className="nav-indicator" />
            </button>
        </div>
    );
}
