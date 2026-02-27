import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { formatBRL, formatCurrency, getCategoryInfo, EXPENSE_CATEGORIES, CURRENCIES } from '../utils/helpers';
import DonutChart, { BudgetBar } from './DonutChart';
import { Wallet, CreditCard, Banknote, Plus, X, Utensils, Car, Plane, Map, Hotel, ShoppingBag, Tag } from 'lucide-react';

const ICON_MAP = {
    Utensils, Car, Plane, Map, Hotel, ShoppingBag, Tag
};

function CategoryIcon({ iconName, size = 18, className = "" }) {
    const Icon = ICON_MAP[iconName] || Tag;
    return <Icon size={size} className={className} />;
}

export default function ExpenseTab({ trip }) {
    const { getTripExpenses, getTripTotalBRL, addExpense, deleteExpense, updateTrip } = useData();
    const expenses = getTripExpenses(trip.id);
    const totalBRL = getTripTotalBRL(trip.id);

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [originalAmount, setOriginalAmount] = useState('');
    const [originalCurrency, setOriginalCurrency] = useState('BRL');
    const [convertedBRL, setConvertedBRL] = useState('');
    const [category, setCategory] = useState('food');
    const [showBudgetEdit, setShowBudgetEdit] = useState(false);
    const [budgetVal, setBudgetVal] = useState('');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [isLoadingRate, setIsLoadingRate] = useState(false);

    useEffect(() => {
        if (!originalAmount || isNaN(parseFloat(originalAmount))) {
            setConvertedBRL('');
            return;
        }
        if (originalCurrency === 'BRL') {
            setConvertedBRL(originalAmount);
        } else if (exchangeRate !== 1 && exchangeRate > 0) {
            setConvertedBRL((parseFloat(originalAmount) * exchangeRate).toFixed(2));
        }
    }, [originalAmount, exchangeRate, originalCurrency]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !originalAmount || !convertedBRL) return;
        addExpense({
            trip_id: trip.id, title: title.trim(),
            original_amount: parseFloat(originalAmount), original_currency: originalCurrency,
            converted_amount_BRL: parseFloat(convertedBRL), category,
        });
        setTitle(''); setOriginalAmount(''); setConvertedBRL('');
        setOriginalCurrency('BRL'); setCategory('food'); setShowForm(false);
        setExchangeRate(1);
    };

    const handleCurrencyChange = async (val) => {
        setOriginalCurrency(val);
        if (val === 'BRL') {
            setExchangeRate(1);
            return;
        }
        setIsLoadingRate(true);
        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${val}`);
            const data = await res.json();
            if (data?.rates?.BRL) {
                setExchangeRate(data.rates.BRL);
            }
        } catch (err) {
            console.error("Erro ao puxar cotação:", err);
        } finally {
            setIsLoadingRate(false);
        }
    };

    const handleBudgetSave = () => {
        updateTrip(trip.id, { budget: parseFloat(budgetVal) || 0 });
        setShowBudgetEdit(false);
    };

    // Chart data
    const catTotals = {};
    expenses.forEach((exp) => {
        const cat = exp.category || 'other';
        catTotals[cat] = (catTotals[cat] || 0) + (Number(exp.converted_amount_BRL) || 0);
    });
    const chartSegments = Object.entries(catTotals).map(([cat, val]) => {
        const info = getCategoryInfo(cat);
        return { label: `${info.emoji} ${info.label}`, value: val };
    });

    return (
        <div className="animate-fade-in-up">
            {/* Total Card */}
            <div className="card expense-total-card">
                <div className="expense-total-label">Total Gasto</div>
                <div className="expense-total-amount">{formatBRL(totalBRL)}</div>
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.75rem', opacity: 0.7 }}>
                    {expenses.length} despesa{expenses.length !== 1 ? 's' : ''} registrada{expenses.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Budget */}
            {trip.budget > 0 ? (
                <div onClick={() => { setBudgetVal(trip.budget || ''); setShowBudgetEdit(true); }} style={{ cursor: 'pointer' }}>
                    <BudgetBar spent={totalBRL} budget={trip.budget} />
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>Defina um orçamento para acompanhar seus gastos</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setBudgetVal(''); setShowBudgetEdit(true); }}>
                        <Banknote size={14} /> Definir Orçamento
                    </button>
                </div>
            )}

            {/* Donut Chart */}
            {expenses.length > 0 && (
                <div className="card animate-fade-in-up stagger-1" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-5)' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', marginBottom: 'var(--space-3)' }}>Gastos por Categoria</h3>
                    <DonutChart segments={chartSegments} centerLabel="Total" centerValue={formatBRL(totalBRL)} />
                </div>
            )}

            {/* Add Expense */}
            <div className="section-header stagger-2 animate-fade-in-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <CreditCard size={18} className="text-primary-500" />
                    <h3 className="section-title">Despesas</h3>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)} id="add-expense-btn">
                    {showForm ? (
                        <><X size={14} /> Fechar</>
                    ) : (
                        <><Plus size={14} /> Despesa</>
                    )}
                </button>
            </div>

            {showForm && (
                <div className="card animate-fade-in-up" style={{ marginBottom: 'var(--space-4)', borderColor: 'var(--primary-200)' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="exp-title" className="form-label">Descrição *</label>
                            <input id="exp-title" type="text" placeholder="Ex: Jantar no restaurante" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
                        </div>
                        <div className="form-group">
                            <label htmlFor="exp-cat" className="form-label">Categoria</label>
                            <select id="exp-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                                {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="exp-cur" className="form-label">Moeda</label>
                                <select id="exp-cur" value={originalCurrency} onChange={(e) => handleCurrencyChange(e.target.value)}>
                                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="exp-amt" className="form-label">Valor ({originalCurrency}) *</label>
                                <input id="exp-amt" type="number" step="0.01" min="0" placeholder="0.00" value={originalAmount} onChange={(e) => setOriginalAmount(e.target.value)} required />
                            </div>
                        </div>
                        {originalCurrency !== 'BRL' && (
                            <div className="form-group animate-fade-in-up">
                                <label htmlFor="exp-brl" className="form-label">
                                    Valor em BRL (R$) *
                                    {isLoadingRate && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--primary-500)', fontWeight: 500 }}>Carregando cotação ⏳...</span>}
                                </label>
                                <input id="exp-brl" type="number" step="0.01" min="0" placeholder="Equivalente em Reais" value={convertedBRL} onChange={(e) => setConvertedBRL(e.target.value)} required />
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                                    {!isLoadingRate && exchangeRate !== 1 ? `Cotação via API (1 ${originalCurrency} = R$ ${exchangeRate.toFixed(2)}). Você pode alterar se necessário.` : "Informe o valor equivalente em Reais"}
                                </p>
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary btn-block" id="submit-expense">Adicionar Despesa</button>
                    </form>
                </div>
            )}

            {/* Expense List */}
            {expenses.length === 0 && !showForm ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><Wallet size={48} className="text-primary-400" /></div>
                    <h3 className="empty-state-title">Sem despesas</h3>
                    <p className="empty-state-text">Registre seus gastos para acompanhar o orçamento</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    {expenses.map((expense) => {
                        const catInfo = getCategoryInfo(expense.category);
                        const isBRL = expense.original_currency === 'BRL';
                        return (
                            <div key={expense.id} className="expense-item">
                                <div className={`expense-cat-icon ${catInfo.class}`}>
                                    <CategoryIcon iconName={catInfo.icon} size={20} />
                                </div>
                                <div className="expense-item-body">
                                    <div className="expense-item-title">{expense.title}</div>
                                    <div className="expense-item-category"><span className={`badge ${catInfo.class}`}>{catInfo.label}</span></div>
                                </div>
                                <div className="expense-item-amounts">
                                    <div className="expense-brl">{formatBRL(expense.converted_amount_BRL)}</div>
                                    {!isBRL && <div className="expense-original">{formatCurrency(expense.original_amount, expense.original_currency)}</div>}
                                </div>
                                <button className="delete-btn" onClick={() => deleteExpense(expense.id)} title="Remover"><X size={16} /></button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Budget Edit Modal */}
            {showBudgetEdit && (
                <div className="modal-overlay" onClick={() => setShowBudgetEdit(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '40dvh' }}>
                        <div className="modal-handle" />
                        <h2 className="modal-title"><Banknote size={24} className="text-primary-500" /> Orçamento da Viagem</h2>
                        <div className="form-group">
                            <label className="form-label">Valor total em BRL (R$)</label>
                            <input type="number" step="0.01" min="0" placeholder="Ex: 5000.00" value={budgetVal} onChange={(e) => setBudgetVal(e.target.value)} autoFocus />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button className="btn btn-secondary btn-block" onClick={() => setShowBudgetEdit(false)}>Cancelar</button>
                            <button className="btn btn-primary btn-block" onClick={handleBudgetSave}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
