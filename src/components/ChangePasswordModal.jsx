import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ChangePasswordModal({ onClose }) {
    const { changePassword } = useAuth();
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (newPwd.length < 4) {
            setError('A nova senha deve ter pelo menos 4 caracteres.');
            return;
        }
        if (newPwd !== confirmPwd) {
            setError('As senhas não coincidem.');
            return;
        }
        try {
            changePassword(currentPwd, newPwd);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '70dvh' }}>
                <div className="modal-handle" />
                <h2 className="modal-title">🔒 Alterar Senha</h2>

                {success ? (
                    <div style={{
                        textAlign: 'center', padding: 'var(--space-6)',
                        color: 'var(--success-500)', fontSize: '1rem', fontWeight: 600,
                    }}>
                        ✅ Senha alterada com sucesso!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-500)',
                                padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)',
                                fontSize: '0.8rem', fontWeight: 500, marginBottom: 'var(--space-4)', textAlign: 'center',
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="current-pwd">Senha atual</label>
                            <input id="current-pwd" type="password" placeholder="••••••••"
                                value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required autoFocus />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="new-pwd">Nova senha</label>
                            <input id="new-pwd" type="password" placeholder="••••••••"
                                value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={4} />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirm-pwd">Confirmar nova senha</label>
                            <input id="confirm-pwd" type="password" placeholder="••••••••"
                                value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required minLength={4} />
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                            <button type="button" className="btn btn-secondary btn-block" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary btn-block">Alterar Senha</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
