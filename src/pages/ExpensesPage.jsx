import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import ExpenseTab from '../components/ExpenseTab';
import { CreditCard, Search, ArrowLeft } from 'lucide-react';

export default function ExpensesPage() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const { getTrip } = useData();
    const trip = getTrip(tripId);

    if (!trip) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-state-icon"><Search size={48} className="text-primary-400" /></div>
                    <h3 className="empty-state-title">Selecione uma viagem</h3>
                    <p className="empty-state-text">Vá para o Início e selecione uma viagem</p>
                    <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => navigate('/')}>Ir para Início</button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="trip-detail-header" style={{ paddingBottom: 'var(--space-4)' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <button className="trip-detail-back" onClick={() => navigate(`/trip/${tripId}`)} id="back-to-trip" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowLeft size={16} /> {trip.name}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <CreditCard size={28} color="white" />
                        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>Despesas</h1>
                    </div>
                </div>
            </div>
            <div className="page-container" style={{ paddingTop: 0 }}>
                <ExpenseTab trip={trip} />
            </div>
        </div>
    );
}
