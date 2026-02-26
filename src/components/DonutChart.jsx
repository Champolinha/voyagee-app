import React from 'react';
import { formatBRL } from '../utils/helpers';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#64748b', '#ef4444', '#06b6d4'];

export default function DonutChart({ segments, centerLabel, centerValue, size = 220 }) {
    // Use a fixed internal viewBox to scale SVG easily
    const viewBoxSize = 200;
    const cx = viewBoxSize / 2;
    const cy = viewBoxSize / 2;
    const stroke = 20;
    const radius = (viewBoxSize - stroke) / 2 - 4; // Leaves a small padding
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((s, seg) => s + seg.value, 0);

    let offset = 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: size, aspectRatio: '1 / 1' }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} style={{ overflow: 'visible' }}>
                    {/* Background circle */}
                    <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--border-color)" strokeWidth={stroke} opacity={0.3} />
                    {total > 0 && segments.map((seg, i) => {
                        const pct = seg.value / total;
                        const dashLen = pct * circumference;
                        const dashOffset = -offset;
                        offset += dashLen;
                        return (
                            <circle
                                key={i}
                                cx={cx} cy={cy} r={radius}
                                fill="none"
                                stroke={COLORS[i % COLORS.length]}
                                strokeWidth={stroke}
                                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                                strokeDashoffset={dashOffset}
                                strokeLinecap="butt"
                                transform={`rotate(-90 ${cx} ${cy})`}
                                style={{ transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease' }}
                            />
                        );
                    })}
                </svg>
                {/* Center text */}
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                    padding: '0 15%', // Ensure it doesn't touch the donut borders
                }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {centerLabel}
                    </div>
                    {/* Text scales dynamically but won't exceed container */}
                    <div style={{
                        fontSize: centerValue.length > 12 ? '0.85rem' : '1.05rem',
                        fontWeight: 800, color: 'var(--text-primary)',
                        textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word',
                    }}>
                        {centerValue}
                    </div>
                </div>
            </div>

            {/* Legend */}
            {segments.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
                    {segments.map((seg, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span>{seg.label}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginLeft: 2 }}>{formatBRL(seg.value)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function BudgetBar({ spent, budget }) {
    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const remaining = Math.max(budget - spent, 0);
    const overBudget = spent > budget && budget > 0;

    return (
        <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Orçamento
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatBRL(budget)}
                </span>
            </div>

            {/* Progress bar */}
            <div style={{
                width: '100%', height: 10, borderRadius: 'var(--radius-full)',
                background: 'var(--bg-tertiary)', overflow: 'hidden', marginBottom: 'var(--space-2)',
            }}>
                <div style={{
                    height: '100%', borderRadius: 'var(--radius-full)',
                    width: `${pct}%`,
                    background: overBudget
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : 'linear-gradient(90deg, var(--primary-500), var(--accent-500))',
                    transition: 'width 0.6s ease',
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <span style={{ color: overBudget ? 'var(--danger-500)' : 'var(--text-secondary)', fontWeight: 600 }}>
                    Gasto: {formatBRL(spent)} ({pct.toFixed(0)}%)
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                    Resta: {formatBRL(remaining)}
                </span>
            </div>
        </div>
    );
}
