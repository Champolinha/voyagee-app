import React, { useState, useEffect, useRef, useCallback } from 'react';

// Reverse geocode using Google Geocoder
async function reverseGeocode(lat, lng) {
    return new Promise((resolve) => {
        if (!window.google || !window.google.maps) {
            resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            return;
        }
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat, lng };
        geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK" && results[0]) {
                resolve(results[0].formatted_address);
            } else {
                resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
        });
    });
}

export default function LocationPicker({ value, onChange, onClose }) {
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const markerRef = useRef(null);
    const autocompleteInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    const [position, setPosition] = useState(value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : null);
    const [address, setAddress] = useState(value?.address || '');
    const [placeName, setPlaceName] = useState(value?.name || '');
    const [loading, setLoading] = useState(true);

    const defaultCenter = { lat: -15.7942, lng: -47.8822 }; // Brasília

    // Initialize Map
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 10;

        const initMap = async () => {
            if (!window.google || !window.google.maps || !window.google.maps.places) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(initMap, 500);
                    return;
                } else {
                    console.error("Google Maps SDK failed to load");
                    setLoading(false);
                    return;
                }
            }

            const mapOptions = {
                center: position || defaultCenter,
                zoom: position ? 15 : 4,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                gestureHandling: "greedy", // Better for mobile selection
                styles: [
                    {
                        "featureType": "poi",
                        "stylers": [{ "visibility": "off" }]
                    }
                ]
            };

            try {
                const map = new google.maps.Map(mapRef.current, mapOptions);
                googleMapRef.current = map;

                // Add initial marker if exists
                if (position) {
                    markerRef.current = new google.maps.Marker({
                        position,
                        map,
                        animation: google.maps.Animation.DROP
                    });
                }

                // Click listener for new marker
                map.addListener("click", async (e) => {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    const newPos = { lat, lng };

                    updateMarker(newPos);
                    const addr = await reverseGeocode(lat, lng);
                    setAddress(addr);
                    setPlaceName(''); // Clear specific place name on manual map click
                    setPosition(newPos);
                });

                // Autocomplete setup
                const autocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
                    fields: ["formatted_address", "geometry", "name"],
                    types: ["establishment", "geocode"]
                });
                autocompleteRef.current = autocomplete;

                autocomplete.addListener("place_changed", () => {
                    const place = autocomplete.getPlace();
                    if (!place.geometry || !place.geometry.location) return;

                    const newPos = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };

                    googleMapRef.current.setCenter(newPos);
                    googleMapRef.current.setZoom(17);
                    updateMarker(newPos);
                    setAddress(place.formatted_address || place.name);
                    setPlaceName(place.name || '');
                    setPosition(newPos);
                });

                setLoading(false);
            } catch (err) {
                console.error("Map creation error:", err);
                setLoading(false);
            }
        };

        initMap();

        // Cleanup
        return () => {
            if (googleMapRef.current) {
                // Remove listeners if needed, though usually GC handles it
            }
        };
    }, []);

    const updateMarker = (pos) => {
        if (markerRef.current) {
            markerRef.current.setPosition(pos);
        } else {
            markerRef.current = new google.maps.Marker({
                position: pos,
                map: googleMapRef.current,
                animation: google.maps.Animation.DROP
            });
        }
    };

    const handleConfirm = () => {
        if (position) {
            onChange({
                lat: position.lat,
                lng: position.lng,
                address,
                name: placeName || address.split(',')[0] // Use the specific placeName if available, otherwise fallback to first part of address
            });
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '95dvh', padding: 'var(--space-5)', borderRadius: '2.5rem' }}>
                <div className="modal-handle" />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0A1128' }}>
                        📍 Escolher Local
                    </h2>
                    <button className="icon-btn" onClick={onClose} style={{ background: 'rgba(0,0,0,0.05)', color: '#0A1128' }}>✕</button>
                </div>

                {/* Search box using Google Autocomplete */}
                <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                    <input
                        ref={autocompleteInputRef}
                        type="text"
                        placeholder="Buscar local... (ex: Torre Eiffel)"
                        className="glass-input"
                        style={{
                            paddingLeft: '3.5rem',
                            height: '56px',
                            background: 'rgba(255,255,255,0.7)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    />
                    <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>
                        🔍
                    </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: 'var(--space-2)', textAlign: 'center' }}>
                    Toque no mapa ou busque um local para marcar o ponto
                </p>

                {/* Map Container */}
                <div style={{
                    borderRadius: '2rem',
                    overflow: 'hidden',
                    height: 320,
                    marginBottom: 'var(--space-4)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    position: 'relative',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
                }}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(250,250,251,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                            <div className="spinner">🔄</div>
                        </div>
                    )}
                </div>

                {/* Selected address display */}
                {address && (
                    <div className="glass-card" style={{
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '1.5rem',
                        marginBottom: 'var(--space-4)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '10px',
                        border: '1px solid rgba(0,0,0,0.03)'
                    }}>
                        <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>📍</span>
                        <div style={{ flex: 1, color: '#0A1128', fontWeight: 700, lineHeight: '1.3' }}>
                            {placeName || address}
                        </div>
                    </div>
                )}

                {/* Modal Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary btn-block" style={{ height: '52px', borderRadius: '1.2rem' }} onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-primary btn-block"
                        onClick={handleConfirm}
                        disabled={!position}
                        style={{
                            height: '52px',
                            borderRadius: '1.2rem',
                            opacity: position ? 1 : 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        ✓ Confirmar Local
                    </button>
                </div>
            </div>
        </div>
    );
}

// Google Maps URL helper - prioritize name/search query to open the place card
export function getGoogleMapsUrl(lat, lng, query = '') {
    if (query) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
