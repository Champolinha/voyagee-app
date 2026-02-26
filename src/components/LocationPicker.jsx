import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon (Leaflet + bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Reverse geocode using Nominatim (OpenStreetMap)
async function reverseGeocode(lat, lng) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=pt-BR`,
            { headers: { 'User-Agent': 'Voyagee-TravelApp/1.0' } }
        );
        const data = await res.json();
        return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
}

// Forward geocode (search by name)
async function forwardGeocode(query) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=pt-BR`,
            { headers: { 'User-Agent': 'Voyagee-TravelApp/1.0' } }
        );
        return await res.json();
    } catch {
        return [];
    }
}

// Component to handle clicks on the map
function MapClickHandler({ onLocationSelect }) {
    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            const address = await reverseGeocode(lat, lng);
            onLocationSelect({ lat, lng, address });
        },
    });
    return null;
}

// Component to fly to a position
function FlyTo({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 15, { duration: 1.2 });
    }, [position, map]);
    return null;
}

export default function LocationPicker({ value, onChange, onClose }) {
    const [position, setPosition] = useState(value?.lat ? [value.lat, value.lng] : null);
    const [address, setAddress] = useState(value?.address || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [flyTarget, setFlyTarget] = useState(null);
    const searchTimeout = useRef(null);

    // Default center: approximate world center, or user's coords
    const defaultCenter = [-15.79, -47.88]; // Brasília as default
    const defaultZoom = position ? 15 : 4;

    const handleLocationSelect = useCallback(({ lat, lng, address: addr }) => {
        setPosition([lat, lng]);
        setAddress(addr);
        setSearchResults([]);
    }, []);

    const handleSearch = useCallback(async (query) => {
        if (!query.trim()) { setSearchResults([]); return; }
        setSearching(true);
        const results = await forwardGeocode(query);
        setSearchResults(results);
        setSearching(false);
    }, []);

    const handleSearchInput = (val) => {
        setSearchQuery(val);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => handleSearch(val), 500);
    };

    const selectSearchResult = async (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setPosition([lat, lng]);
        setAddress(result.display_name);
        setSearchQuery('');
        setSearchResults([]);
        setFlyTarget([lat, lng]);
    };

    const handleConfirm = () => {
        if (position) {
            onChange({ lat: position[0], lng: position[1], address });
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92dvh', padding: 'var(--space-4)' }}>
                <div className="modal-handle" />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>📍 Escolher Local</h2>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
                </div>

                {/* Search bar */}
                <div style={{ position: 'relative', marginBottom: 'var(--space-3)', zIndex: 1000 }}>
                    <input
                        type="text"
                        placeholder="Buscar local... (ex: Torre Eiffel)"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        style={{ paddingLeft: 'var(--space-8)' }}
                    />
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>
                        🔍
                    </span>

                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
                            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                            maxHeight: 200, overflowY: 'auto', marginTop: 4,
                        }}>
                            {searchResults.map((r, i) => (
                                <button key={i} onClick={() => selectSearchResult(r)} style={{
                                    width: '100%', textAlign: 'left', padding: 'var(--space-3) var(--space-4)',
                                    fontSize: '0.8rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)',
                                    background: 'transparent', cursor: 'pointer', display: 'block',
                                    transition: 'background var(--transition-fast)',
                                }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-tertiary)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: 2 }}>
                                        {r.display_name.split(',')[0]}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {r.display_name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {searching && (
                        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                            Buscando...
                        </div>
                    )}
                </div>

                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                    Toque no mapa ou busque um local para marcar o ponto
                </p>

                {/* Map */}
                <div style={{
                    borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                    height: 300, marginBottom: 'var(--space-3)',
                    border: '1px solid var(--border-color)',
                    position: 'relative', zIndex: 1,
                }}>
                    <MapContainer
                        center={position || defaultCenter}
                        zoom={defaultZoom}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <MapClickHandler onLocationSelect={handleLocationSelect} />
                        {flyTarget && <FlyTo position={flyTarget} />}
                        {position && <Marker position={position} icon={customIcon} />}
                    </MapContainer>
                </div>

                {/* Selected address */}
                {address && (
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--space-3)', fontSize: '0.8rem',
                        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)',
                    }}>
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>📍</span>
                        <div style={{ flex: 1, wordBreak: 'break-word', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {address}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary btn-block" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-primary btn-block"
                        onClick={handleConfirm}
                        disabled={!position}
                        style={!position ? { opacity: 0.5 } : {}}
                    >
                        ✓ Confirmar Local
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper: build Google Maps URL from coordinates
export function getGoogleMapsUrl(lat, lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
