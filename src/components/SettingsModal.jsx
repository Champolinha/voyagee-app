import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsModal({ onClose, onProfileClick, onPasswordClick }) {
    const { theme, toggleTheme } = useTheme();
    const { currentUser, logout } = useAuth();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '65dvh' }}>
                <div className="modal-handle" />
                <h2 className="modal-title">⚙️ Ajustes</h2>

                {/* Profile */}
                <button className="settings-item" onClick={onProfileClick} id="settings-profile-btn">
                    <div className="settings-item-icon">👤</div>
                    <div className="settings-item-body">
                        <div className="settings-item-label">{currentUser?.name || 'Perfil'}</div>
                        <div className="settings-item-sub">{currentUser?.email}</div>
                    </div>
                    <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                </button>

                {/* Change Password */}
                <button className="settings-item" onClick={onPasswordClick} id="settings-password-btn">
                    <div className="settings-item-icon">🔒</div>
                    <div className="settings-item-body">
                        <div className="settings-item-label">Alterar Senha</div>
                        <div className="settings-item-sub">Atualizar credenciais</div>
                    </div>
                    <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                </button>


                {/* Logout */}
                <button className="settings-item" onClick={logout} id="settings-logout-btn"
                    style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)' }}>
                    <div className="settings-item-icon">🚪</div>
                    <div className="settings-item-body">
                        <div className="settings-item-label" style={{ color: 'var(--danger-500)' }}>Sair da conta</div>
                        <div className="settings-item-sub">Encerrar sessão</div>
                    </div>
                </button>
            </div>
        </div>
    );
}
