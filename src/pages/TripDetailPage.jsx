import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { formatDate, formatDateShort, getCountdown, getDestinationEmoji, formatBRL, getCategoryInfo } from '../utils/helpers';
import DonutChart from '../components/DonutChart';

export default function TripDetailPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { getTrip, updateTrip, addDestination, removeDestination, getTripItinerary, getTripExpenses, getTripTotalBRL } = useData();
    const trip = getTrip(tripId);

    const [showDestForm, setShowDestForm] = useState(false);
    const [destName, setDestName] = useState('');
    const [destArr, setDestArr] = useState('');
    const [destDep, setDestDep] = useState('');
    const [showBudgetEdit, setShowBudgetEdit] = useState(false);
    const [budgetVal, setBudgetVal] = useState('');

    if (!trip) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3 className="empty-state-title">Viagem não encontrada</h3>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>Voltar</button>
                </div>
            </div>
        );
    }

    const countdown = getCountdown(trip.start_date, trip.end_date);
    const itinerary = getTripItinerary(tripId);
    const expenses = getTripExpenses(tripId);
    const totalBRL = getTripTotalBRL(tripId);
    const firstActivity = itinerary.length > 0 ? itinerary[0] : null;

    // Expense chart data
    const catTotals = {};
    expenses.forEach((e) => {
        const cat = e.category || 'other';
        catTotals[cat] = (catTotals[cat] || 0) + (Number(e.converted_amount_BRL) || 0);
    });
    const chartSegments = Object.entries(catTotals).map(([cat, val]) => {
        const info = getCategoryInfo(cat);
        return { label: `${info.icon} ${info.label}`, value: val };
    });

    const handleAddDest = (e) => {
        e.preventDefault();
        if (!destName.trim()) return;
        addDestination(tripId, { name: destName.trim(), arrival_date: destArr || trip.start_date, departure_date: destDep || trip.end_date });
        setDestName(''); setDestArr(''); setDestDep(''); setShowDestForm(false);
    };

    const handleBudgetSave = () => {
        updateTrip(tripId, { budget: parseFloat(budgetVal) || 0 });
        setShowBudgetEdit(false);
    };

    return (
        <div>
            {/* Hero Header */}
            <div className="trip-detail-header">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <button className="trip-detail-back" onClick={() => navigate('/')} id="back-to-home">← Voltar</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ fontSize: '2rem' }}>{trip.destinations?.length > 0 ? getDestinationEmoji(trip.destinations[0].name) : '✈️'}</span>
                        <div>
                            <h1 className="trip-detail-destination">{trip.name}</h1>
                            <p className="trip-detail-dates">{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</p>
                        </div>
                    </div>
                    <div className="trip-detail-countdown">{countdown.emoji} {countdown.text}</div>
                </div>
            </div>

            <div className="page-container" style={{ paddingTop: 0 }}>
                {/* Destinations Section */}
                <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>📍 Destinos</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowDestForm(!showDestForm)}>
                            {showDestForm ? '✕' : '+ Destino'}
                        </button>
                    </div>

                    {showDestForm && (
                        <form onSubmit={handleAddDest} style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                            <div className="form-group" style={{ marginBottom: 'var(--space-2)' }}>
                                <input type="text" placeholder="Nome do destino" value={destName} onChange={(e) => setDestName(e.target.value)} required />
                            </div>
                            <div className="form-row" style={{ marginBottom: 'var(--space-2)' }}>
                                <input type="date" value={destArr} onChange={(e) => setDestArr(e.target.value)} min={trip.start_date} max={trip.end_date} />
                                <input type="date" value={destDep} onChange={(e) => setDestDep(e.target.value)} min={destArr || trip.start_date} max={trip.end_date} />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block btn-sm">Adicionar</button>
                        </form>
                    )}

                    {(!trip.destinations || trip.destinations.length === 0) ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-3)' }}>
                            Nenhum destino adicionado ainda
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {trip.destinations.map((d) => (
                                <div key={d.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)',
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>{getDestinationEmoji(d.name)}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{d.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                            {formatDateShort(d.arrival_date)} → {formatDateShort(d.departure_date)}
                                        </div>
                                    </div>
                                    <button className="delete-btn" onClick={() => removeDestination(tripId, d.id)}>✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* First Itinerary Activity Preview */}
                <div className="card animate-fade-in-up stagger-1" style={{ marginBottom: 'var(--space-4)', cursor: 'pointer' }}
                    onClick={() => navigate(`/trip/${tripId}/itinerary`)}>
                    <div className="section-header" style={{ marginBottom: 'var(--space-2)' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>📅 Próxima Atividade</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary-500)', fontWeight: 600 }}>Ver roteiro →</span>
                    </div>
                    {firstActivity ? (
                        <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                            {firstActivity.time && <div className="timeline-time">{firstActivity.time}</div>}
                            <div className="timeline-title">{firstActivity.title}</div>
                            {firstActivity.location && <div className="timeline-location">📍 {firstActivity.location}</div>}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{formatDateShort(firstActivity.day_date)}</div>
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-3)' }}>
                            Nenhuma atividade no roteiro
                        </p>
                    )}
                </div>

                {/* Expense Chart Preview */}
                <div className="card animate-fade-in-up stagger-2" style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/trip/${tripId}/expenses`)}>
                    <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>💳 Despesas</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary-500)', fontWeight: 600 }}>Ver detalhes →</span>
                    </div>

                    {/* Budget bar */}
                    {trip.budget > 0 && (
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 4 }}>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Orçamento: {formatBRL(trip.budget)}</span>
                                <span style={{ color: 'var(--text-tertiary)' }}>{((totalBRL / trip.budget) * 100).toFixed(0)}%</span>
                            </div>
                            <div style={{ width: '100%', height: 8, borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: 'var(--radius-full)', width: `${Math.min((totalBRL / trip.budget) * 100, 100)}%`,
                                    background: totalBRL > trip.budget ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
                                    transition: 'width 0.6s ease',
                                }} />
                            </div>
                        </div>
                    )}

                    {!trip.budget && (
                        <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                            <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setBudgetVal(trip.budget || ''); setShowBudgetEdit(true); }}>
                                Definir orçamento
                            </button>
                        </div>
                    )}

                    {expenses.length > 0 ? (
                        <DonutChart segments={chartSegments} centerLabel="Total" centerValue={formatBRL(totalBRL)} size={160} />
                    ) : (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-3)' }}>
                            Nenhuma despesa registrada
                        </p>
                    )}
                </div>
            </div>

            {/* Budget Edit Modal */}
            {showBudgetEdit && (
                <div className="modal-overlay" onClick={() => setShowBudgetEdit(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '40dvh' }}>
                        <div className="modal-handle" />
                        <h2 className="modal-title">💰 Orçamento da Viagem</h2>
                        <div className="form-group">
                            <label className="form-label">Valor total em BRL (R$)</label>
                            <input type="number" step="0.01" min="0" placeholder="Ex: 5000.00" value={budgetVal} onChange={(e) => setBudgetVal(e.target.value)} autoFocus />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button className="btn btn-secondary btn-block" onClick={() => setShowBudgetEdit(false)}>Cancelar</button>
                            <button className="btn btn-primary btn-block" onClick={handleBudgetSave}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
