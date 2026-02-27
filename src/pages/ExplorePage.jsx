import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchNearbyPlaces } from '../utils/helpers';
import { Loader2, Compass, Globe, ArrowLeft, Utensils, Coffee, Landmark, Trees, TowerControl, ShoppingBag, MapPin } from 'lucide-react';

const ICON_MAP = {
    restaurant: Utensils,
    cafe: Coffee,
    museum: Landmark,
    park: Trees,
    landmark: TowerControl,
    shopping: ShoppingBag,
    location: MapPin
};

function CategoryIcon({ id, size = 18, className = "" }) {
    const Icon = ICON_MAP[id] || ICON_MAP.location;
    return <Icon size={size} className={className} />;
}

export default function ExplorePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const preSelectedPlaceId = location.state?.selectedPlaceId;

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [activeFilter, setActiveFilter] = useState('restaurant');

    const fetchIdRef = useRef(0);

    const categories = [
        { id: 'restaurant', label: 'Gastronomia', icon: 'restaurant', color: '#ea580c' },
        { id: 'cafe', label: 'Cafés', icon: 'cafe', color: '#92400e' },
        { id: 'museum', label: 'Cultura', icon: 'museum', color: '#7c3aed' },
        { id: 'park', label: 'Parques', icon: 'park', color: '#15803d' },
        { id: 'landmark', label: 'Pontos Turísticos', icon: 'landmark', color: '#1d4ed8' },
        { id: 'shopping', label: 'Compras', icon: 'shopping', color: '#be185d' },
    ];

    // 1. Fetch location once and store in state
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => {
                    setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
                },
                (err) => {
                    console.error("Geo error:", err);
                    setLoading(false);
                }
            );
        } else {
            console.warn("Geolocation not available");
            setLoading(false);
        }
    }, []);

    // 2. Fetch places when coords or filter changes
    useEffect(() => {
        if (!coords) return;

        const loadData = async () => {
            const currentFetchId = ++fetchIdRef.current;
            setLoading(true);
            setPlaces([]);

            // Wait until Google Maps is definitely available
            let checkRetry = 0;
            while ((!window.google || !window.google.maps) && checkRetry < 10) {
                await new Promise(res => setTimeout(res, 500));
                checkRetry++;
            }

            try {
                const results = await fetchNearbyPlaces(coords.lat, coords.lng, activeFilter);

                // Only update state if this is still the active request
                if (currentFetchId === fetchIdRef.current) {
                    setPlaces(results || []);
                    if (preSelectedPlaceId) {
                        const found = results.find(p => p.id === preSelectedPlaceId);
                        if (found) setSelectedPlace(found);
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error("Explore fetch error:", err);
                if (currentFetchId === fetchIdRef.current) setLoading(false);
            }
        };

        loadData();
    }, [activeFilter, coords, preSelectedPlaceId]);

    const handleFilterClick = (id) => {
        if (id !== activeFilter) {
            setActiveFilter(id);
        }
    };

    return (
        <div className="home-layout" style={{ display: 'flex', flexDirection: 'column' }}>
            <header className="home-header" style={{ paddingBottom: 'var(--space-2)', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <button className="icon-btn" onClick={() => navigate(-1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="home-welcome" style={{ marginBottom: 0 }}>Arredores</p>
                        <h1 className="home-title" style={{ fontSize: '1.4rem' }}>Explorar</h1>
                    </div>
                </div>
            </header>

            {/* Category Nav - Fixed Glass Style and Interaction */}
            <div className="hide-scrollbar" style={{
                padding: '0 var(--space-6)',
                marginBottom: 'var(--space-4)',
                overflowX: 'auto',
                display: 'flex',
                gap: '8px',
                position: 'relative',
                zIndex: 100
            }}>
                <div className="glass-pill border-frost" style={{
                    flexDirection: 'row',
                    display: 'inline-flex',
                    padding: '4px',
                    gap: '4px',
                    borderRadius: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.45)',
                    whiteSpace: 'nowrap'
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`text-btn ${activeFilter === cat.id ? 'bg-white shadow-sm' : ''}`}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '1rem',
                                color: activeFilter === cat.id ? cat.color : '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: 'none',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                background: activeFilter === cat.id ? 'white' : 'transparent',
                                pointerEvents: 'auto'
                            }}
                            onClick={() => handleFilterClick(cat.id)}>
                            <CategoryIcon id={cat.icon} size={18} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <main className="home-main hide-scrollbar" style={{ zIndex: 10 }}>
                {loading ? (
                    <div className="empty-state">
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                            <Loader2 size={48} className="text-primary-500 spinner" />
                        </div>
                        <h3 className="empty-state-title">Buscando locais...</h3>
                        <p className="empty-state-text">Localizando os melhores pontos perto de você</p>
                    </div>
                ) : places.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Compass size={48} className="text-primary-400" /></div>
                        <h3 className="empty-state-title">Nenhum local encontrado</h3>
                        <p className="empty-state-text">Não conseguimos achar locais próximos nesta categoria.</p>
                    </div>
                ) : (
                    <section className="home-section" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-4)',
                        paddingBottom: 'var(--space-8)'
                    }}>
                        {places.map((item, idx) => (
                            <div key={item.id} className={`group card-interactive animate-fade-in-up stagger-${Math.min(idx + 1, 5)}`}
                                onClick={() => setSelectedPlace(item)}
                                style={{
                                    minWidth: '0',
                                    background: 'var(--bg-card)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    borderRadius: '2.5rem',
                                    padding: '8px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer'
                                }}>
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    position: 'relative',
                                    borderRadius: '2.1rem',
                                    overflow: 'hidden',
                                    marginBottom: '10px'
                                }}>
                                    <img alt={item.title} className="explore-image group-active:scale-95" src={item.img}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }} />
                                    {item.rating > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'var(--bg-secondary)',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            boxShadow: 'var(--shadow-sm)',
                                            color: '#f59e0b'
                                        }}>
                                            <span>★</span>
                                            <span>{item.rating}</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: '0 8px 8px 8px' }}>
                                    <p style={{
                                        fontSize: '0.85rem',
                                        textAlign: 'left',
                                        fontWeight: 800,
                                        color: '#0A1128',
                                        lineHeight: '1.25',
                                        marginBottom: '4px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>{item.title}</p>
                                    <p style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--text-secondary)',
                                        margin: 0,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        📍 {item.vicinity || 'Perto de você'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>
                )}
            </main>

            {/* Decorator Blur Backgrounds */}
            <div className="bg-decorator decorator-top-left"></div>
            <div className="bg-decorator decorator-center-right" style={{ top: '60%' }}></div>

            {/* Place Details Modal */}
            {selectedPlace && (
                <div className="modal-overlay" onClick={() => setSelectedPlace(null)} style={{ zIndex: 1000, pointerEvents: 'auto' }}>
                    <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                            <img src={selectedPlace.img} alt={selectedPlace.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="nac-image-overlay"></div>
                            <button className="icon-btn" onClick={() => setSelectedPlace(null)} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(255,255,255,0.8)', color: '#0A1128', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ padding: 'var(--space-6)' }}>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)', color: currentCat?.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CategoryIcon id={currentCat?.icon} size={14} /> {currentCat?.label}
                            </span>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A1128', marginBottom: 'var(--space-2)' }}>
                                {selectedPlace.title}
                            </h2>

                            {selectedPlace.rating && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: 'var(--space-2)' }}>
                                    <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>★</span>
                                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{selectedPlace.rating}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({selectedPlace.user_ratings_total} avaliações no Google)</span>
                                </div>
                            )}

                            {selectedPlace.vicinity && (
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'start', gap: '4px', lineHeight: '1.4' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginTop: '2px', color: '#4F46E5' }}>location_on</span>
                                    {selectedPlace.vicinity}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <button className="btn btn-primary btn-block" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedPlace.title} ${selectedPlace.lat},${selectedPlace.lon}`)}`, '_blank')}>
                                    <Globe size={18} /> Ver no Google Maps
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
