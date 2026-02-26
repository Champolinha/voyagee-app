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

                {/* Theme Toggle */}
                <button className="settings-item" onClick={toggleTheme} id="settings-theme-btn">
                    <div className="settings-item-icon">{theme === 'dark' ? '☀️' : '🌙'}</div>
                    <div className="settings-item-body">
                        <div className="settings-item-label">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</div>
                        <div className="settings-item-sub">Alternar aparência</div>
                    </div>
                    <div style={{
                        width: 44, height: 24, borderRadius: 'var(--radius-full)', padding: 2,
                        background: theme === 'dark' ? 'var(--primary-500)' : 'var(--border-color)',
                        transition: 'background var(--transition-fast)', display: 'flex',
                        alignItems: 'center',
                        justifyContent: theme === 'dark' ? 'flex-end' : 'flex-start',
                    }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: '50%', background: 'white',
                            boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition-fast)',
                        }} />
                    </div>
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
