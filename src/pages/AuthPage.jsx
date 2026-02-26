import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
    const { login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                login(email, password);
            } else {
                if (!name.trim()) throw new Error('Informe seu nome.');
                signup(name.trim(), email.trim().toLowerCase(), password);
            }
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
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✈️</div>
                    <h1 className="auth-logo">Voyagee</h1>
                    <p className="auth-subtitle">Planeje suas viagens com facilidade</p>
                </div>

                <div className="auth-card card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-5)', textAlign: 'center' }}>
                        {isLogin ? 'Entrar na conta' : 'Criar conta'}
                    </h2>

                    {error && (
                        <div
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--danger-500)',
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                marginBottom: 'var(--space-4)',
                                textAlign: 'center',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group animate-fade-in-up">
                                <label htmlFor="auth-name" className="form-label">Nome</label>
                                <input
                                    id="auth-name"
                                    type="text"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="auth-email" className="form-label">E-mail</label>
                            <input
                                id="auth-email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="auth-password" className="form-label">Senha</label>
                            <input
                                id="auth-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={4}
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-lg"
                            disabled={loading}
                            id="auth-submit-btn"
                            style={{ marginTop: 'var(--space-2)' }}
                        >
                            {loading ? '...' : isLogin ? 'Entrar' : 'Criar conta'}
                        </button>
                    </form>

                    <p className="auth-toggle">
                        {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                        <span
                            className="auth-toggle-link"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            id="auth-toggle-link"
                        >
                            {isLogin ? 'Cadastre-se' : 'Entrar'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
