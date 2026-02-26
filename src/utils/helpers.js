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
        return { text: 'Viagem concluída', emoji: '✅', past: true };
    }
    if (now >= start && now <= end) {
        return { text: 'Em andamento!', emoji: '🛫', past: false };
    }

    const diffMs = start - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return { text: 'Amanhã!', emoji: '🎉', past: false };
    if (diffDays <= 7) return { text: `Em ${diffDays} dias`, emoji: '⏳', past: false };
    if (diffDays <= 30) return { text: `Em ${diffDays} dias`, emoji: '📅', past: false };

    return { text: `Em ${diffDays} dias`, emoji: '🗓️', past: false };
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
 * Get category info (icon, label)
 */
export const EXPENSE_CATEGORIES = [
    { value: 'food', label: 'Alimentação', icon: '🍽️', class: 'badge-food' },
    { value: 'transport', label: 'Transporte', icon: '🚗', class: 'badge-transport' },
    { value: 'tickets', label: 'Passagens', icon: '✈️', class: 'badge-tickets' },
    { value: 'tour', label: 'Passeio', icon: '🎭', class: 'badge-tour' },
    { value: 'accommodation', label: 'Hospedagem', icon: '🏨', class: 'badge-accommodation' },
    { value: 'shopping', label: 'Compras', icon: '🛍️', class: 'badge-shopping' },
    { value: 'other', label: 'Outros', icon: '📌', class: 'badge-other' },
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
const DESTINATION_EMOJIS = {
    paris: '🗼', tokyo: '🗼', london: '🇬🇧', new: '🗽', roma: '🏛️',
    rome: '🏛️', barcelona: '🇪🇸', buenos: '🇦🇷', santiago: '🇨🇱',
    lima: '🇵🇪', bogota: '🇨🇴', cancun: '🏖️', praia: '🏖️',
    são: '🌆', rio: '🌴', salvador: '🎭', lisboa: '🇵🇹',
    amsterdam: '🇳🇱', berlin: '🇩🇪', dubai: '🏙️', sydney: '🇦🇺',
};

export function getDestinationEmoji(destination) {
    const lower = destination.toLowerCase();
    for (const [key, emoji] of Object.entries(DESTINATION_EMOJIS)) {
        if (lower.includes(key)) return emoji;
    }
    return '✈️';
}
