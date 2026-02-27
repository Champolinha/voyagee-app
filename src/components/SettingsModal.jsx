import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Settings, User, LogOut, ChevronRight } from 'lucide-react';

export default function SettingsModal({ onClose, onProfileClick }) {
    const { theme, toggleTheme } = useTheme();
    const { currentUser, logout } = useAuth();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '65dvh' }}>
                <div className="modal-handle" />
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={20} className="text-primary-500" /> Ajustes
                </h2>

                {/* Profile */}
                <button className="settings-item" onClick={onProfileClick} id="settings-profile-btn">
                    <div className="settings-item-icon">
                        <User size={20} className="text-secondary" />
                    </div>
                    <div className="settings-item-body">
                        <div className="settings-item-label">{currentUser?.name || 'Perfil'}</div>
                        <div className="settings-item-sub">{currentUser?.email}</div>
                    </div>
                    <ChevronRight size={16} className="text-tertiary" />
                </button>

                {/* Logout */}
                <button className="settings-item" onClick={logout} id="settings-logout-btn"
                    style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)' }}>
                    <div className="settings-item-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-500)' }}>
                        <LogOut size={20} />
                    </div>
                    <div className="settings-item-body">
                        <div className="settings-item-label" style={{ color: 'var(--danger-500)' }}>Sair da conta</div>
                        <div className="settings-item-sub">Encerrar sessão</div>
                    </div>
                </button>
            </div>
        </div>
    );
}
