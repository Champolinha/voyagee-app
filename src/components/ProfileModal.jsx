import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CURRENCIES } from '../utils/helpers';
import { User, AlertTriangle, X, Check } from 'lucide-react';

export default function ProfileModal({ onClose }) {
    const { currentUser, updateProfile } = useAuth();
    const [form, setForm] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        birthdate: currentUser?.birthdate || '',
        nationality: currentUser?.nationality || '',
        passport: currentUser?.passport || '',
        preferred_currency: currentUser?.preferred_currency || 'BRL',
        emergency_contact_name: currentUser?.emergency_contact_name || '',
        emergency_contact_phone: currentUser?.emergency_contact_phone || '',
    });
    const [saved, setSaved] = useState(false);

    const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfile(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85dvh' }}>
                <div className="modal-handle" />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
                    <h2 className="modal-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={24} className="text-primary-500" /> Meu Perfil
                    </h2>
                    <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Avatar */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%', margin: '0 auto var(--space-2)',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem', color: 'white', fontWeight: 800,
                    }}>
                        {(form.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{currentUser?.email}</div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="profile-name">Nome completo *</label>
                        <input id="profile-name" type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="Seu nome completo" />
                    </div>

                    {/* Phone + Birthdate */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-phone">Telefone</label>
                            <input id="profile-phone" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+55 11 99999-9999" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-birthdate">Data de nasc.</label>
                            <input id="profile-birthdate" type="date" value={form.birthdate} onChange={(e) => handleChange('birthdate', e.target.value)} />
                        </div>
                    </div>

                    {/* Nationality + Passport */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-nationality">Nacionalidade</label>
                            <input id="profile-nationality" type="text" value={form.nationality} onChange={(e) => handleChange('nationality', e.target.value)} placeholder="Brasileiro(a)" />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="profile-passport">Nº Passaporte</label>
                            <input id="profile-passport" type="text" value={form.passport} onChange={(e) => handleChange('passport', e.target.value)} placeholder="AB123456" />
                        </div>
                    </div>

                    {/* Preferred Currency */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="profile-currency">Moeda preferida</label>
                        <select id="profile-currency" value={form.preferred_currency} onChange={(e) => handleChange('preferred_currency', e.target.value)}>
                            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                        </select>
                    </div>

                    {/* Emergency Contact */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <AlertTriangle size={16} className="text-warning-500" /> Contato de emergência
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="profile-emerg-name">Nome</label>
                                <input id="profile-emerg-name" type="text" value={form.emergency_contact_name} onChange={(e) => handleChange('emergency_contact_name', e.target.value)} placeholder="Nome do contato" />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="profile-emerg-phone">Telefone</label>
                                <input id="profile-emerg-phone" type="tel" value={form.emergency_contact_phone} onChange={(e) => handleChange('emergency_contact_phone', e.target.value)} placeholder="+55 11 99999-9999" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg" id="profile-save-btn" style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {saved ? <><Check size={18} /> Salvo!</> : 'Salvar Perfil'}
                    </button>
                </form>
            </div>
        </div>
    );
}
