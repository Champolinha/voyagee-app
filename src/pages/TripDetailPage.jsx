import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { formatDate, formatDateShort, getCountdown, getDestinationIcon, formatBRL, getCategoryInfo } from '../utils/helpers';
import DonutChart from '../components/DonutChart';
import { ArrowLeft, Edit2, MapPin, Calendar, CreditCard, ChevronRight, X, Plane, Timer, CheckCircle, PartyPopper, CalendarDays, CalendarRange, PlaneTakeoff } from 'lucide-react';

const COUNTDOWN_ICONS = {
    CheckCircle, Timer, PartyPopper, CalendarDays, CalendarRange, PlaneTakeoff
};

function CountdownIcon({ name, size = 14, className = "" }) {
    const Icon = COUNTDOWN_ICONS[name] || Timer;
    return <Icon size={size} className={className} />;
}
import Modal from '../components/Modal';

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
    const [showTripEdit, setShowTripEdit] = useState(false);
    const [editName, setEditName] = useState('');
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');

    if (!trip) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon"><MapPin size={48} /></div>
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
        return { label: info.label, value: val, icon: info.icon };
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

    const handleTripEditSave = (e) => {
        e.preventDefault();
        if (!editName.trim() || !editStart || !editEnd) return;
        updateTrip(tripId, { name: editName.trim(), start_date: editStart, end_date: editEnd });
        setShowTripEdit(false);
    };

    return (
        <div className="page-entrance">
            {/* Hero Header */}
            <div className="trip-detail-header">
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <button
                        className="trip-detail-back"
                        onClick={() => navigate('/')}
                        id="back-to-home"
                        aria-label="Voltar para a página inicial"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                    <div className="trip-detail-header-content">
                        <div className="trip-detail-title-group">
                            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Plane size={24} color="white" />
                            </div>
                            <div>
                                <h1 className="trip-detail-destination">{trip.name}</h1>
                                <p className="trip-detail-dates">{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</p>
                            </div>
                        </div>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                                setEditName(trip.name);
                                setEditStart(trip.start_date);
                                setEditEnd(trip.end_date);
                                setShowTripEdit(true);
                            }}
                            aria-label="Editar detalhes da viagem"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                            <Edit2 size={12} /> Editar
                        </button>
                    </div>
                    <div className="trip-detail-countdown" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CountdownIcon name={countdown.icon} size={14} />
                        {countdown.text}
                    </div>
                </div>
            </div>

            <div className="page-container" style={{ paddingTop: 0 }}>
                {/* Destinations Section */}
                <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700 }}>
                            <MapPin size={18} className="text-primary-500" /> Destinos
                        </h3>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setShowDestForm(true)}
                            aria-label="Adicionar novo destino"
                        >
                            + Destino
                        </button>
                    </div>

                    {(!trip.destinations || trip.destinations.length === 0) ? (
                        <p className="text-muted-small text-center py-4">
                            Nenhum destino adicionado ainda
                        </p>
                    ) : (
                        <div className="destinations-list">
                            {trip.destinations.map((d) => (
                                <div key={d.id} className="destination-item">
                                    <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-lg)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-500)', flexShrink: 0 }}>
                                        <MapPin size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{d.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                            {formatDateShort(d.arrival_date)} → {formatDateShort(d.departure_date)}
                                        </div>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => removeDestination(tripId, d.id)}
                                        aria-label={`Remover destino ${d.name}`}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* First Itinerary Activity Preview */}
                <div
                    className="card animate-fade-in-up stagger-1"
                    style={{ marginBottom: 'var(--space-4)', cursor: 'pointer' }}
                    onClick={() => navigate(`/trip/${tripId}/itinerary`)}
                    role="link"
                    tabIndex="0"
                    aria-label="Ver roteiro completo da viagem"
                    onKeyPress={(e) => e.key === 'Enter' && navigate(`/trip/${tripId}/itinerary`)}
                >
                    <div className="section-header" style={{ marginBottom: 'var(--space-2)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700 }}>
                            <Calendar size={18} className="text-primary-500" /> Próxima Atividade
                        </h3>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--primary-500)', fontWeight: 600 }}>
                            Ver roteiro <ChevronRight size={12} />
                        </span>
                    </div>
                    {firstActivity ? (
                        <div className="timeline-preview">
                            {firstActivity.time && <div className="timeline-time">{firstActivity.time}</div>}
                            <div className="timeline-title" style={{ fontWeight: 600, fontSize: '0.8rem' }}>{firstActivity.title}</div>
                            {firstActivity.location && <div className="timeline-location" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} className="text-primary-500" /> {firstActivity.location}</div>}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{formatDateShort(firstActivity.day_date)}</div>
                        </div>
                    ) : (
                        <p className="text-muted-small text-center py-4">
                            Nenhuma atividade no roteiro
                        </p>
                    )}
                </div>

                {/* Expense Chart Preview */}
                <div
                    className="card animate-fade-in-up stagger-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/trip/${tripId}/expenses`)}
                    role="link"
                    tabIndex="0"
                    aria-label="Ver detalhes das despesas da viagem"
                    onKeyPress={(e) => e.key === 'Enter' && navigate(`/trip/${tripId}/expenses`)}
                >
                    <div className="section-header" style={{ marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700 }}>
                            <CreditCard size={18} className="text-primary-500" /> Despesas
                        </h3>
                        {!trip.budget ? (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => { e.stopPropagation(); setBudgetVal(trip.budget || ''); setShowBudgetEdit(true); }}
                                aria-label="Definir orçamento"
                            >
                                + Orçamento
                            </button>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--primary-500)', fontWeight: 600 }}>
                                Ver detalhes <ChevronRight size={12} />
                            </span>
                        )}
                    </div>

                    {/* Budget bar */}
                    {trip.budget > 0 && (
                        <div className="budget-bar-container">
                            <div className="budget-bar-info">
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Orçamento: {formatBRL(trip.budget)}</span>
                                <span style={{ color: 'var(--text-tertiary)' }}>{((totalBRL / trip.budget) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="progress-bar-bg" style={{ height: 8 }}>
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${Math.min((totalBRL / trip.budget) * 100, 100)}%`,
                                        background: totalBRL > trip.budget ? 'var(--danger-500)' : 'var(--primary-500)',
                                        transition: 'width 0.6s ease',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {expenses.length > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
                            <DonutChart segments={chartSegments} centerLabel="Total" centerValue={formatBRL(totalBRL)} size={160} />
                        </div>
                    ) : (
                        <p className="text-muted-small text-center py-4">
                            Nenhuma despesa registrada
                        </p>
                    )}
                </div>
            </div>

            {/* Budget Edit Modal */}
            <Modal
                isOpen={showBudgetEdit}
                onClose={() => setShowBudgetEdit(false)}
                title={<><CreditCard size={24} className="text-primary-500" /> Orçamento da Viagem</>}
                size="small"
            >
                <div className="form-group">
                    <label className="form-label">Valor total em BRL (R$)</label>
                    <input type="number" step="0.01" min="0" placeholder="Ex: 5000.00" value={budgetVal} onChange={(e) => setBudgetVal(e.target.value)} autoFocus />
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary btn-block" onClick={() => setShowBudgetEdit(false)}>Cancelar</button>
                    <button className="btn btn-primary btn-block" onClick={handleBudgetSave}>Salvar</button>
                </div>
            </Modal>

            {/* Trip Edit Modal */}
            <Modal
                isOpen={showTripEdit}
                onClose={() => setShowTripEdit(false)}
                title={<><Edit2 size={24} className="text-primary-500" /> Editar Viagem</>}
            >
                <form onSubmit={handleTripEditSave}>
                    <div className="form-group">
                        <label className="form-label">Nome da viagem</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Início</label>
                            <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fim</label>
                            <input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} required min={editStart} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowTripEdit(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-block">Salvar Alterações</button>
                    </div>
                </form>
            </Modal>
            {/* Destination Add Modal */}
            <Modal
                isOpen={showDestForm}
                onClose={() => setShowDestForm(false)}
                title={<><MapPin size={24} className="text-primary-500" /> Adicionar Destino</>}
            >
                <form onSubmit={handleAddDest}>
                    <div className="form-group">
                        <label className="form-label">Nome do destino</label>
                        <input type="text" placeholder="Ex: Paris, França" value={destName} onChange={(e) => setDestName(e.target.value)} required autoFocus />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Chegada</label>
                            <input type="date" value={destArr} onChange={(e) => setDestArr(e.target.value)} min={trip.start_date} max={trip.end_date} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Partida</label>
                            <input type="date" value={destDep} onChange={(e) => setDestDep(e.target.value)} min={destArr || trip.start_date} max={trip.end_date} />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowDestForm(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary btn-block">Adicionar Destino</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
