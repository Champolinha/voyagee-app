import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { formatDate, getDestinationEmoji, getCountdown, getDestinationImage, fetchRealWeather, fetchNearbyPlaces } from '../utils/helpers';

export default function HomePage() {
    const { currentUser } = useAuth();
    const { trips, addTrip, deleteTrip } = useData();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [tripName, setTripName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tripToDelete, setTripToDelete] = useState(null);

    const handleCreateTrip = (e) => {
        e.preventDefault();
        if (!tripName.trim() || !startDate || !endDate) return;
        const trip = addTrip({ name: tripName.trim(), start_date: startDate, end_date: endDate, destinations: [] });
        setShowModal(false);
        setTripName('');
        setStartDate('');
        setEndDate('');
        navigate(`/trip/${trip.id}`);
    };

    const handleDeleteClick = (e, tripId) => {
        e.preventDefault();
        e.stopPropagation();
        setTripToDelete(tripId);
    };

    const confirmDelete = () => {
        if (tripToDelete) {
            deleteTrip(tripToDelete);
            setTripToDelete(null);
        }
    };

    const sortedTrips = [...trips].sort((a, b) => {
        const now = new Date().toISOString().split('T')[0];
        const aF = a.start_date >= now, bF = b.start_date >= now;
        if (aF && !bF) return -1;
        if (!aF && bF) return 1;
        return a.start_date.localeCompare(b.start_date);
    });

    const [nextActivityWeather, setNextActivityWeather] = useState({ temp: '--', condition: '☀️' });

    useEffect(() => {
        if (sortedTrips.length > 0) {
            const destName = sortedTrips[0].destinations?.[0]?.name || sortedTrips[0].name;
            if (destName) {
                fetchRealWeather(destName).then(weather => {
                    if (weather) setNextActivityWeather(weather);
                });
            }
        }
    }, [sortedTrips]);

    const [explorePlaces, setExplorePlaces] = useState([
        { id: 'mock1', title: 'Buscando por perto...', img: '/loading_places.png', distance: '' },
    ]);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const places = await fetchNearbyPlaces(latitude, longitude, 'restaurant');
                    if (places && places.length > 0) {
                        setExplorePlaces(places);
                    } else {
                        setExplorePlaces([
                            { id: 1, title: 'Restaurante Central', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', distance: '1.2 km' },
                            { id: 2, title: 'Pizzaria Premium', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', distance: '850 m' },
                            { id: 3, title: 'Bistrô do Chef', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80', distance: '2.5 km' },
                        ]);
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setExplorePlaces([
                        { id: 1, title: 'Restaurante Central', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', distance: '1.2 km' },
                        { id: 2, title: 'Pizzaria Premium', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', distance: '850 m' },
                        { id: 3, title: 'Bistrô do Chef', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80', distance: '2.5 km' },
                    ]);
                }
            );
        }
    }, []);

    return (
        <div className="home-layout">
            <header className="home-header">
                <div className="header-text-group">
                    <p className="home-welcome">Bem-vindo de volta</p>
                    <h1 className="home-title">Olá, {currentUser?.name?.split(' ')[0] || 'User'}</h1>
                </div>
                <div className="home-logo-container" onClick={() => navigate('/settings')} style={{ overflow: 'hidden', borderRadius: '50%' }}>
                    <img src="/app-logo.png" alt="Perfil" className="header-logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            </header>

            <main className="home-main hide-scrollbar">
                {sortedTrips.length > 0 && (
                    <section className="home-section animate-fade-in-up stagger-1">
                        <div className="next-activity-card glass-card ethereal-shadow card-interactive" onClick={() => navigate(`/trip/${sortedTrips[0].id}`)}>
                            <div className="glass-card-bg"></div>
                            <div className="nac-header">
                                <div>
                                    <span className="badge badge-accent">PRÓXIMA VIAGEM</span>
                                    <h2 className="nac-title">{sortedTrips[0].name}</h2>
                                </div>
                                <div className="weather-pill glass-pill border-frost">
                                    <span className="weather-temp">{nextActivityWeather.temp}°</span>
                                    <span>{nextActivityWeather.condition}</span>
                                </div>
                            </div>

                            <div className="nac-info">
                                <div className="nac-info-item">
                                    <span className="nac-info-label">QUANDO</span>
                                    <p className="nac-info-value">{formatDate(sortedTrips[0].start_date)}</p>
                                </div>
                                <div className="nac-info-divider"></div>
                                <div className="nac-info-item">
                                    <span className="nac-info-label">DESTINO</span>
                                    <p className="nac-info-value">{sortedTrips[0].destinations?.[0]?.name || 'Agendado'}</p>
                                </div>
                            </div>

                            <div className="nac-image-container">
                                <img src={getDestinationImage(sortedTrips[0].destinations?.[0]?.name || sortedTrips[0].name)} alt="Destination" className="nac-image" />
                                <div className="nac-image-overlay"></div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="home-section animate-fade-in-up stagger-2">
                    <div className="section-header-compact">
                        <h3 className="section-title-compact">Gastronomia por perto</h3>
                        <button className="text-btn" onClick={() => navigate('/explore')}>VER TUDO</button>
                    </div>

                    <div className="explore-list hide-scrollbar">
                        {explorePlaces.map(item => (
                            <div key={item.id} className="explore-card group card-interactive" onClick={() => navigate('/explore', { state: { selectedPlaceId: item.id } })}>
                                <div className="explore-image-wrapper">
                                    <img alt={item.title} className="explore-image group-active:scale-95" src={item.img} />
                                </div>
                                <p className="explore-title text-ellipsis overflow-hidden whitespace-nowrap px-1">{item.title}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="home-section animate-fade-in-up stagger-3">
                    <div className="section-header-compact">
                        <h3 className="section-title-compact">Minhas Viagens</h3>
                        <span className="text-muted-small">{trips.length} Ativas</span>
                    </div>

                    {sortedTrips.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }}>🌍</div>
                            <h3 className="empty-state-title">Nenhuma viagem ainda</h3>
                            <p className="empty-state-text">Toque no botão + para criar sua primeira viagem com a SwayTrip</p>
                        </div>
                    ) : (
                        <div className="trips-list">
                            {sortedTrips.map((trip, idx) => {
                                const countdown = getCountdown(trip.start_date, trip.end_date);
                                const emoji = trip.destinations?.length > 0 ? getDestinationEmoji(trip.destinations[0].name) : '✈️';
                                return (
                                    <div key={trip.id} className="trip-list-item card-interactive group" onClick={() => navigate(`/trip/${trip.id}`)}>
                                        <div className="trip-list-img-wrapper shadow-md">
                                            <div className="trip-list-emoji">{emoji}</div>
                                        </div>
                                        <div className="trip-list-content">
                                            <h4 className="trip-list-name group-active:text-accent">{trip.name}</h4>
                                            <p className="trip-list-dates">{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</p>
                                        </div>
                                        <div className="trip-list-action">
                                            <p className={`trip-countdown-badge ${countdown.past ? 'past' : ''}`}>
                                                {countdown.past ? 'CONCLUÍDO' : countdown.text.toUpperCase()}
                                            </p>
                                        </div>
                                        <button className="delete-btn-subtle" onClick={(e) => handleDeleteClick(e, trip.id)} title="Excluir">
                                            🗑️
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {/* Decorator Blur Backgrounds */}
            <div className="bg-decorator decorator-top-left"></div>
            <div className="bg-decorator decorator-center-right"></div>

            <button className="fab glass-fab group" onClick={() => setShowModal(true)} title="Nova viagem">
                <div className="fab-inner group-hover-scale">+</div>
            </button>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h2 className="modal-title">🌎 Nova Viagem</h2>
                        <form onSubmit={handleCreateTrip}>
                            <div className="form-group">
                                <label htmlFor="trip-name" className="form-label">Nome da viagem *</label>
                                <input id="trip-name" type="text" placeholder="Ex: Europa 2026" value={tripName} onChange={(e) => setTripName(e.target.value)} required autoFocus />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="trip-start" className="form-label">Ida</label>
                                    <input id="trip-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="trip-end" className="form-label">Volta</label>
                                    <input id="trip-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required min={startDate} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary btn-block" id="submit-new-trip">Criar Viagem</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {tripToDelete && (
                <div className="modal-overlay" onClick={() => setTripToDelete(null)} style={{ zIndex: 1000 }}>
                    <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()} style={{ minHeight: 'auto', padding: 'var(--space-5) var(--space-4)' }}>
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>⚠️</div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                                Excluir viagem?
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Esta ação não pode ser desfeita. Todo o roteiro associado a esta viagem também será apagado permanentemente.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button className="btn btn-secondary btn-block" onClick={() => setTripToDelete(null)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary btn-block" onClick={confirmDelete} style={{ background: 'var(--danger-500)', borderColor: 'var(--danger-600)' }}>
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
