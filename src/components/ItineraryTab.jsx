import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { getDateRange, formatDateShort, EXPENSE_CATEGORIES, CURRENCIES } from '../utils/helpers';
import LocationPicker, { getGoogleMapsUrl } from './LocationPicker';
import { Map, Plus, X, Calendar, Banknote, Edit2, MapPin, ExternalLink } from 'lucide-react';

export default function ItineraryTab({ trip }) {
    const { getTripItinerary, addItineraryItem, updateItineraryItem, deleteItineraryItem, addExpense } = useData();
    const items = getTripItinerary(trip.id);

    const [showForm, setShowForm] = useState(false);
    const [dayDate, setDayDate] = useState(trip.start_date);
    const [time, setTime] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [destination, setDestination] = useState('');

    // Expense integration state
    const [hasExpense, setHasExpense] = useState(false);
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCurrency, setExpenseCurrency] = useState('BRL');
    const [expenseCategory, setExpenseCategory] = useState('other');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [isLoadingRate, setIsLoadingRate] = useState(false);

    // Edit state
    const [editingItem, setEditingItem] = useState(null); // id of item being edited

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

    const fetchExchangeRate = async (currency) => {
        if (currency === 'BRL') {
            setExchangeRate(1);
            return 1;
        }
        setIsLoadingRate(true);
        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
            const data = await res.json();
            if (data?.rates?.BRL) {
                setExchangeRate(data.rates.BRL);
                return data.rates.BRL;
            }
        } catch (err) {
            console.error("Erro ao puxar cotação:", err);
        } finally {
            setIsLoadingRate(false);
        }
        return 1;
    };

    const handleCurrencyChange = (val) => {
        setExpenseCurrency(val);
        fetchExchangeRate(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !dayDate) return;

        const itData = {
            trip_id: trip.id, day_date: dayDate, time: time || null,
            title: title.trim(),
            location: selectedLocation?.address || null,
            place_name: selectedLocation?.name || null,
            lat: selectedLocation?.lat || null,
            lng: selectedLocation?.lng || null,
            description: description.trim() || null,
            destination: destination || null,
        };

        if (editingItem) {
            updateItineraryItem(editingItem, itData);
        } else {
            addItineraryItem(itData);

            // Add auto-expense if selected (only on creation for now to avoid complexity)
            if (hasExpense && expenseAmount) {
                let rate = exchangeRate;
                if (expenseCurrency !== 'BRL' && exchangeRate === 1) {
                    rate = await fetchExchangeRate(expenseCurrency);
                }
                addExpense({
                    trip_id: trip.id,
                    title: `Atividade: ${title.trim()}`,
                    original_amount: parseFloat(expenseAmount),
                    original_currency: expenseCurrency,
                    converted_amount_BRL: parseFloat(expenseAmount) * rate,
                    category: expenseCategory,
                });
            }
        }

        resetForm();
    };

    const resetForm = () => {
        setTitle(''); setTime(''); setDescription(''); setDestination('');
        setSelectedLocation(null); setEditingItem(null); setHasExpense(false);
        setExpenseAmount(''); setExpenseCurrency('BRL'); setExpenseCategory('other');
        setShowForm(false);
    };

    const handleEdit = (item) => {
        setEditingItem(item.id);
        setTitle(item.title || '');
        setTime(item.time || '');
        setDayDate(item.day_date);
        setDescription(item.description || '');
        setDestination(item.destination || '');
        setSelectedLocation(item.location ? { address: item.location, lat: item.lat, lng: item.lng, name: item.place_name } : null);
        setHasExpense(false); // Link expense only on creation or as a separate action
        setShowForm(true);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Calendar size={18} className="text-primary-500" />
                    <h3 className="section-title">Roteiro</h3>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }} id="add-itinerary-btn">
                    {showForm ? <><X size={14} /> Fechar</> : <><Plus size={14} /> Atividade</>}
                </button>
            </div>

            {showForm && (
                <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-5)', borderColor: 'var(--primary-200)' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {editingItem ? <><Edit2 size={14} /> Editar Atividade</> : <><Plus size={14} /> Nova Atividade</>}
                    </h4>
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
                                    <MapPin size={18} className="text-primary-500" style={{ flexShrink: 0 }} />
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
                                            <Edit2 size={12} />
                                        </button>
                                        <button type="button" className="btn btn-secondary btn-sm"
                                            onClick={() => setSelectedLocation(null)} style={{ fontSize: '0.7rem' }}>
                                            <X size={12} />
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
                                    <Map size={16} /> Abrir Mapa para Escolher Local
                                </button>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="it-desc" className="form-label">Descrição</label>
                            <textarea id="it-desc" placeholder="Detalhes extras..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 60 }} />
                        </div>

                        {!editingItem && (
                            <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--primary-200)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                    <input type="checkbox" checked={hasExpense} onChange={(e) => setHasExpense(e.target.checked)} />
                                    <Banknote size={14} /> Incluir como despesa?
                                </label>
                                {hasExpense && (
                                    <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-3)' }}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Valor</label>
                                                <input type="number" step="0.01" placeholder="0.00" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} required={hasExpense} />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Moeda</label>
                                                <select value={expenseCurrency} onChange={(e) => handleCurrencyChange(e.target.value)}>
                                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Categoria</label>
                                            <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                                                {EXPENSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                        {expenseCurrency !== 'BRL' && (
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                                                {isLoadingRate ? 'Consultando câmbio...' : `Câmbio: 1 ${expenseCurrency} = R$ ${exchangeRate.toFixed(2)}`}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-block" id="submit-itinerary-item">
                            {editingItem ? 'Salvar Alterações' : 'Adicionar ao Roteiro'}
                        </button>
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
                    <div className="empty-state-icon"><Map size={48} className="text-primary-400" /></div>
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
                                                    <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span className="badge badge-primary" style={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <MapPin size={8} /> {getDestLabel(item.destination)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Location with Google Maps link */}
                                                {item.location && (
                                                    <a
                                                        href={getGoogleMapsUrl(item.lat, item.lng, item.place_name || item.location)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="timeline-location-link"
                                                        title="Abrir no Google Maps"
                                                    >
                                                        <MapPin size={12} className="text-primary-500" />
                                                        <span className="location-address">{item.location}</span>
                                                        <span className="location-maps-badge">
                                                            <ExternalLink size={10} />
                                                        </span>
                                                    </a>
                                                )}

                                                {item.description && <div className="timeline-desc">{item.description}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                                <button className="delete-btn" onClick={() => handleEdit(item)} title="Editar" style={{ color: 'var(--primary-500)' }}><Edit2 size={14} /></button>
                                                <button className="delete-btn" onClick={() => deleteItineraryItem(item.id)} title="Remover"><X size={14} /></button>
                                            </div>
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
