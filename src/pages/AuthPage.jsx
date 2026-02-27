import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, ArrowRight } from 'lucide-react';

export default function AuthPage() {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Por favor, informe seu nome.');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setError('Por favor, informe um e-mail válido.');
            return;
        }

        setLoading(true);

        try {
            signup(name.trim(), email.trim().toLowerCase());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="animate-fade-in-up">
                <div style={{ textAlign: 'center' }}>
                    <img
                        src="/app-logo.png"
                        alt="Voyagee Logo"
                        style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            margin: '0 auto 1.5rem',
                            display: 'block',
                            boxShadow: '0 8px 32px rgba(var(--primary-rgb), 0.2)'
                        }}
                    />
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
                        Voyagee
                    </h1>
                    <p className="auth-subtitle" style={{ marginBottom: '2.5rem' }}>
                        Planeje suas viagens com facilidade e offline
                    </p>
                </div>

                <div className="auth-card card" style={{ padding: 'var(--space-6)', maxWidth: '400px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                        Comece sua jornada
                    </h2>

                    {error && (
                        <div
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--danger-500)',
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                marginBottom: 'var(--space-5)',
                                textAlign: 'center',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="auth-name" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={14} className="text-secondary" /> Como quer ser chamado?
                            </label>
                            <input
                                id="auth-name"
                                type="text"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label htmlFor="auth-email" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Mail size={14} className="text-secondary" /> Seu melhor e-mail
                            </label>
                            <input
                                id="auth-email"
                                type="email"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={loading}
                            id="auth-submit-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: 'var(--space-4)'
                            }}
                        >
                            {loading ? (
                                <svg className="animate-spin" style={{ width: '20px', height: '20px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    <span>Começar Agora</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ marginTop: 'var(--space-6)', fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.5 }}>
                        Seus dados são salvos apenas localmente em seu dispositivo para garantir total privacidade.
                    </p>
                </div>
            </div>
        </div>
    );
}
