import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Calendar, CreditCard, Settings } from 'lucide-react';

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
        } else if (target === 'expenses') {
            if (selectedTripId) navigate(`/trip/${selectedTripId}/expenses`);
        }
    };

    return (
        <div className="bottom-nav">
            <button className={`bottom-nav-item ${isHome ? 'active' : ''}`} onClick={() => handleNav('home')}>
                <Home size={22} className="nav-icon" />
                <span>Início</span>
                <span className="nav-indicator" />
            </button>
            <button className={`bottom-nav-item ${isExplore ? 'active' : ''}`} onClick={() => handleNav('explore')}>
                <Compass size={22} className="nav-icon" />
                <span>Explorar</span>
                <span className="nav-indicator" />
            </button>
            <button
                className={`bottom-nav-item ${isItinerary ? 'active' : ''}`}
                onClick={() => handleNav('itinerary')}
                id="nav-itinerary"
                style={!selectedTripId ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                disabled={!selectedTripId}
            >
                <Calendar size={22} className="nav-icon" />
                <span>Roteiro</span>
                <span className="nav-indicator" />
            </button>
            <button
                className={`bottom-nav-item ${isExpenses ? 'active' : ''}`}
                onClick={() => handleNav('expenses')}
                id="nav-expenses"
                style={!selectedTripId ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                disabled={!selectedTripId}
            >
                <CreditCard size={22} className="nav-icon" />
                <span>Despesas</span>
                <span className="nav-indicator" />
            </button>
            <button className="bottom-nav-item" onClick={onSettingsClick} id="nav-settings">
                <Settings size={22} className="nav-icon" />
                <span>Ajustes</span>
                <span className="nav-indicator" />
            </button>
        </div>
    );
}
