/**
 * Format a date string to locale format
 */
export function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format date as short (e.g. "25 Fev")
 */
export function formatDateShort(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });
}

/**
 * Calculate days until trip or "in progress"
 */
export function getCountdown(startDate, endDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    if (now > end) {
        return { text: 'Viagem concluída', icon: 'CheckCircle', past: true };
    }
    if (now >= start && now <= end) {
        return { text: 'Em andamento!', icon: 'PlaneTakeoff', past: false };
    }

    const diffMs = start - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return { text: 'Amanhã!', icon: 'PartyPopper', past: false };
    if (diffDays <= 7) return { text: `Em ${diffDays} dias`, icon: 'Timer', past: false };
    if (diffDays <= 30) return { text: `Em ${diffDays} dias`, icon: 'CalendarDays', past: false };

    return { text: `Em ${diffDays} dias`, icon: 'CalendarRange', past: false };
}

/**
 * Format BRL currency
 */
export function formatBRL(amount) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount);
}

/**
 * Format any currency amount
 */
export function formatCurrency(amount, currency) {
    try {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    } catch {
        return `${currency} ${Number(amount).toFixed(2)}`;
    }
}

/**
 * Generate dates between start and end
 */
export function getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

/**
 * Get category info (icon name, emoji, label)
 */
export const EXPENSE_CATEGORIES = [
    { value: 'food', label: 'Alimentação', icon: 'Utensils', class: 'badge-food' },
    { value: 'transport', label: 'Transporte', icon: 'Car', class: 'badge-transport' },
    { value: 'tickets', label: 'Passagens', icon: 'Plane', class: 'badge-tickets' },
    { value: 'tour', label: 'Passeio', icon: 'MapPin', class: 'badge-tour' },
    { value: 'accommodation', label: 'Hospedagem', icon: 'Hotel', class: 'badge-accommodation' },
    { value: 'shopping', label: 'Compras', icon: 'ShoppingBag', class: 'badge-shopping' },
    { value: 'other', label: 'Outros', icon: 'Tag', class: 'badge-other' },
];

export function getCategoryInfo(value) {
    return EXPENSE_CATEGORIES.find((c) => c.value === value) || EXPENSE_CATEGORIES[5];
}

/**
 * Common currencies list
 */
export const CURRENCIES = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'JPY', name: 'Iene Japonês', symbol: '¥' },
    { code: 'CAD', name: 'Dólar Canadense', symbol: '$' },
    { code: 'AUD', name: 'Dólar Australiano', symbol: '$' },
    { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF' },
];

/**
 * Destination emoji helper
 */
const DESTINATION_ICONS = {
    paris: 'TowerControl', tokyo: 'TowerControl', london: 'Globe', new: 'Statue', roma: 'Church',
    rome: 'Church', barcelona: 'Palmtree', buenos: 'Music', santiago: 'Mountain',
    lima: 'Mountain', bogota: 'Mountain', cancun: 'Sun', praia: 'Sun',
    são: 'Building2', rio: 'Palmtree', salvador: 'Mask', lisboa: 'Globe',
    amsterdam: 'Wind', berlin: 'Building2', dubai: 'Building2', sydney: 'Waves',
};

export function getDestinationIcon(destination) {
    const lower = destination.toLowerCase();
    for (const [key, icon] of Object.entries(DESTINATION_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return 'Plane';
}

/**
 * Get dynamic image for destination
 */
export function getDestinationImage(destination) {
    if (!destination) return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80';

    const lower = destination.toLowerCase();
    if (lower.includes('paris')) return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80';
    if (lower.includes('tokyo') || lower.includes('tóquio')) return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80';
    if (lower.includes('new york') || lower.includes('nova york')) return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80';
    if (lower.includes('london') || lower.includes('londres')) return 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80';
    if (lower.includes('rio')) return 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80';
    if (lower.includes('roma') || lower.includes('rome')) return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80';

    const fallbacks = [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80',
        'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=600&q=80',
        'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=600&q=80'
    ];

    const hash = destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbacks[hash % fallbacks.length];
}

/**
 * Fetch real weather for destination
 */
export async function fetchRealWeather(destination) {
    if (!destination) return null;
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=pt`);
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) return null;

        const { latitude, longitude } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();

        if (!weatherData.current_weather) return null;

        const temp = Math.round(weatherData.current_weather.temperature);
        const code = weatherData.current_weather.weathercode;

        let condition = 'Sun';
        if (code === 0) condition = 'Sun';
        else if (code >= 1 && code <= 3) condition = 'CloudSun';
        else if (code >= 45 && code <= 48) condition = 'CloudFog';
        else if (code >= 51 && code <= 67) condition = 'CloudRain';
        else if (code >= 71 && code <= 77) condition = 'Snowflake';
        else if (code >= 80 && code <= 82) condition = 'CloudRainWind';
        else if (code >= 95 && code <= 99) condition = 'CloudLightning';

        return { temp, condition };
    } catch (e) {
        console.error("Weather fetch failed:", e);
        return null;
    }
}

/**
 * Translate internal category keys to Google Places API types
 */
const CATEGORY_MAP = {
    restaurant: 'restaurant',
    museum: 'museum',
    park: 'park',
    landmark: 'tourist_attraction',
    shopping: 'shopping_mall',
    cafe: 'cafe'
};

/**
 * Fetch nearby places using Google Places API and sort by rating
 */
export async function fetchNearbyPlaces(lat, lon, category = 'restaurant') {
    return new Promise((resolve) => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.error("Google Maps SDK not loaded");
            resolve([]);
            return;
        }

        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const center = new google.maps.LatLng(lat, lon);

        const googleType = CATEGORY_MAP[category] || 'point_of_interest';

        const request = {
            location: center,
            radius: '3000', // Slightly larger radius for better variety
            type: googleType,
        };

        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const places = results.map(place => {
                    let photoUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80';
                    if (place.photos && place.photos.length > 0) {
                        photoUrl = place.photos[0].getUrl({ maxWidth: 800 });
                    }

                    return {
                        id: place.place_id,
                        title: place.name,
                        type: category,
                        lat: place.geometry.location.lat(),
                        lon: place.geometry.location.lng(),
                        img: photoUrl,
                        rating: place.rating || 0,
                        user_ratings_total: place.user_ratings_total || 0,
                        vicinity: place.vicinity,
                        address: place.vicinity
                    };
                });

                // Sort by rating descending, then by number of ratings
                const sorted = places.sort((a, b) => {
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return b.user_ratings_total - a.user_ratings_total;
                });

                resolve(sorted);
            } else {
                console.warn("Google Places Search failed for type:", googleType, status);
                resolve([]);
            }
        });
    });
}
