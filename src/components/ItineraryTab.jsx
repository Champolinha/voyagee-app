import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { getDateRange, formatDateShort } from '../utils/helpers';
import LocationPicker, { getGoogleMapsUrl } from './LocationPicker';

export default function ItineraryTab({ trip }) {
    const { getTripItinerary, addItineraryItem, deleteItineraryItem } = useData();
    const items = getTripItinerary(trip.id);

    const [showForm, setShowForm] = useState(false);
    const [dayDate, setDayDate] = useState(trip.start_date);
    const [time, setTime] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [destination, setDestination] = useState('');

    // Map location state
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null); // { lat, lng, address }

    const dateRange = getDateRange(trip.start_date, trip.end_date);
    const destinations = trip.destinations || [];

    // Group by date
    const grouped = {};
    dateRange.forEach((d) => (grouped[d] = []));
    items.forEach((item) => {
        if (!grouped[item.day_date]) grouped[item.day_date] = [];
        grouped[item.day_date].push(item);
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !dayDate) return;
        addItineraryItem({
            trip_id: trip.id, day_date: dayDate, time: time || null,
            title: title.trim(),
            location: selectedLocation?.address || null,
            lat: selectedLocation?.lat || null,
            lng: selectedLocation?.lng || null,
            description: description.trim() || null,
            destination: destination || null,
        });
        setTitle(''); setTime(''); setDescription('');
        setSelectedLocation(null);
        setShowForm(false);
    };

    const formatDayHeader = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        const dayNum = dateRange.indexOf(dateStr) + 1;
        const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        return `Dia ${dayNum} — ${formatDateShort(dateStr)} (${weekday})`;
    };

    const getDestLabel = (destName) => {
        if (!destName) return null;
        const d = destinations.find((dd) => dd.name === destName);
        return d ? d.name : destName;
    };

    return (
        <div className="animate-fade-in-up">
            <div className="section-header">
                <h3 className="section-title">📅 Roteiro</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)} id="add-itinerary-btn">
                    {showForm ? '✕ Fechar' : '+ Atividade'}
                </button>
            </div>

            {showForm && (
                <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-5)', borderColor: 'var(--primary-200)' }}>
                    <form onSubmit={handleSubmit}>
                        {destinations.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Destino</label>
                                <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                                    <option value="">— Geral —</option>
                                    {destinations.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="it-date" className="form-label">Data</label>
                            <select id="it-date" value={dayDate} onChange={(e) => setDayDate(e.target.value)}>
                                {dateRange.map((d, i) => <option key={d} value={d}>Dia {i + 1} — {formatDateShort(d)}</option>)}
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="it-time" className="form-label">Horário</label>
                                <input id="it-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="it-title" className="form-label">Título *</label>
                                <input id="it-title" type="text" placeholder="Ex: Museu do Louvre" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                        </div>

                        {/* Map-based location picker */}
                        <div className="form-group">
                            <label className="form-label">Local (mapa)</label>
                            {selectedLocation ? (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                    padding: 'var(--space-3)', background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--primary-200)',
                                }}>
                                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📍</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                                            {selectedLocation.address}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                            {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                                        <button type="button" className="btn btn-secondary btn-sm"
                                            onClick={() => setShowMapPicker(true)} style={{ fontSize: '0.7rem' }}>
                                            ✏️
                                        </button>
                                        <button type="button" className="btn btn-secondary btn-sm"
                                            onClick={() => setSelectedLocation(null)} style={{ fontSize: '0.7rem' }}>
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" className="btn btn-secondary btn-block"
                                    onClick={() => setShowMapPicker(true)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: 'var(--space-2)', padding: 'var(--space-3)',
                                    }}>
                                    🗺️ Abrir Mapa para Escolher Local
                                </button>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="it-desc" className="form-label">Descrição</label>
                            <textarea id="it-desc" placeholder="Detalhes extras..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 60 }} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" id="submit-itinerary-item">Adicionar ao Roteiro</button>
                    </form>
                </div>
            )}

            {/* Map picker modal */}
            {showMapPicker && (
                <LocationPicker
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    onClose={() => setShowMapPicker(false)}
                />
            )}

            {/* Timeline */}
            {items.length === 0 && !showForm ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🗺️</div>
                    <h3 className="empty-state-title">Sem atividades</h3>
                    <p className="empty-state-text">Adicione atividades ao seu roteiro diário</p>
                </div>
            ) : (
                dateRange.map((dateStr) => {
                    const dayItems = grouped[dateStr] || [];
                    if (dayItems.length === 0) return null;
                    return (
                        <div key={dateStr} className="timeline-date-group">
                            <div className="timeline-date-label">{formatDayHeader(dateStr)}</div>
                            {dayItems.map((item, idx) => (
                                <div key={item.id} className="timeline-item">
                                    <div className="timeline-line">
                                        <div className="timeline-dot" />
                                        {idx < dayItems.length - 1 && <div className="timeline-connector" />}
                                    </div>
                                    <div className="timeline-card" style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                {item.time && <div className="timeline-time">{item.time}</div>}
                                                <div className="timeline-title">{item.title}</div>
                                                {item.destination && (
                                                    <div style={{ marginTop: 2 }}>
                                                        <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>📍 {getDestLabel(item.destination)}</span>
                                                    </div>
                                                )}

                                                {/* Location with Google Maps link */}
                                                {item.location && (
                                                    <a
                                                        href={item.lat && item.lng ? getGoogleMapsUrl(item.lat, item.lng) : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="timeline-location-link"
                                                        title="Abrir no Google Maps"
                                                    >
                                                        <span className="location-pin-icon">📍</span>
                                                        <span className="location-address">{item.location}</span>
                                                        <span className="location-maps-badge">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                                <polyline points="15 3 21 3 21 9" />
                                                                <line x1="10" y1="14" x2="21" y2="3" />
                                                            </svg>
                                                        </span>
                                                    </a>
                                                )}

                                                {item.description && <div className="timeline-desc">{item.description}</div>}
                                            </div>
                                            <button className="delete-btn" onClick={() => deleteItineraryItem(item.id)} title="Remover">✕</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })
            )}
        </div>
    );
}
