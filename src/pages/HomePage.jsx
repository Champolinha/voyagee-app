import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { formatDate, getDestinationEmoji, getCountdown } from '../utils/helpers';

export default function HomePage() {
    const { currentUser } = useAuth();
    const { trips, addTrip, deleteTrip } = useData();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [tripName, setTripName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [firstDest, setFirstDest] = useState('');
    const [tripToDelete, setTripToDelete] = useState(null);

    const handleCreateTrip = (e) => {
        e.preventDefault();
        if (!tripName.trim() || !startDate || !endDate) return;
        const destinations = firstDest.trim()
            ? [{ id: crypto.randomUUID?.() || Date.now().toString(), name: firstDest.trim(), arrival_date: startDate, departure_date: endDate }]
            : [];
        const trip = addTrip({ name: tripName.trim(), start_date: startDate, end_date: endDate, destinations });
        setShowModal(false);
        setTripName('');
        setStartDate('');
        setEndDate('');
        setFirstDest('');
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

    return (
        <div>
            <div className="app-bar">
                <h1 className="app-bar-title">Voyagee</h1>
            </div>

            <div className="page-container" style={{ paddingTop: 0 }}>
                <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                        Olá, {currentUser?.name?.split(' ')[0]}! 👋
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                        {trips.length > 0
                            ? `Você tem ${trips.length} viage${trips.length === 1 ? 'm' : 'ns'} planejada${trips.length === 1 ? '' : 's'}.`
                            : 'Comece a planejar sua próxima aventura!'}
                    </p>
                </div>

                {sortedTrips.length === 0 ? (
                    <div className="empty-state animate-fade-in-up stagger-2">
                        <div className="empty-state-icon">🌍</div>
                        <h3 className="empty-state-title">Nenhuma viagem ainda</h3>
                        <p className="empty-state-text">Toque no botão + para criar sua primeira viagem</p>
                    </div>
                ) : (
                    <div>
                        <div className="section-header animate-fade-in-up stagger-1">
                            <h3 className="section-title">Minhas Viagens</h3>
                            <span className="badge badge-primary">{trips.length}</span>
                        </div>
                        {sortedTrips.map((trip, idx) => {
                            const countdown = getCountdown(trip.start_date, trip.end_date);
                            const destNames = (trip.destinations || []).map((d) => d.name).join(', ');
                            const emoji = trip.destinations?.length > 0 ? getDestinationEmoji(trip.destinations[0].name) : '✈️';
                            return (
                                <div key={trip.id} className={`card card-interactive trip-card animate-fade-in-up stagger-${Math.min(idx + 2, 5)}`}
                                    onClick={() => navigate(`/trip/${trip.id}`)} id={`trip-card-${trip.id}`}>
                                    <div className="trip-card-icon">{emoji}</div>
                                    <div className="trip-card-body">
                                        <div className="trip-card-destination">{trip.name}</div>
                                        {destNames && <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 1 }}>📍 {destNames}</div>}
                                        <div className="trip-card-dates">{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</div>
                                        <div style={{ marginTop: 4 }}>
                                            <span className="badge badge-accent" style={countdown.past ? { opacity: 0.6 } : {}}>{countdown.emoji} {countdown.text}</span>
                                        </div>
                                    </div>
                                    <button className="delete-btn" onClick={(e) => handleDeleteClick(e, trip.id)} title="Excluir">🗑️</button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <button className="fab" onClick={() => setShowModal(true)} id="create-trip-fab" title="Nova viagem">+</button>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-handle" />
                        <h2 className="modal-title">🌎 Nova Viagem</h2>
                        <form onSubmit={handleCreateTrip}>
                            <div className="form-group">
                                <label htmlFor="trip-name" className="form-label">Nome da viagem *</label>
                                <input id="trip-name" type="text" placeholder="Ex: Europa 2026" value={tripName} onChange={(e) => setTripName(e.target.value)} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label htmlFor="trip-first-dest" className="form-label">Primeiro destino</label>
                                <input id="trip-first-dest" type="text" placeholder="Ex: Paris, França" value={firstDest} onChange={(e) => setFirstDest(e.target.value)} />
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
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ minHeight: 'auto', padding: 'var(--space-5) var(--space-4)' }}>
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>⚠️</div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                                Excluir viagem?
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Esta ação não pode ser desfeita. Todo o roteiro e despesas associados a esta viagem também serão apagados permanentemente.
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
