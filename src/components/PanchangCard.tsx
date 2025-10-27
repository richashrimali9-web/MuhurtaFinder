/**
 * PanchangCard - Shareable Panchang Card Component
 * Built using reusable ShareableCard components
 */

import { PanchangData, getActionableInsights } from '../utils/panchangData';
import {
  BaseShareCard,
  CardHeader,
  CardFooter,
  CardSection,
  CardGrid,
} from './ShareableCard';

export interface PanchangCardProps {
  date: Date;
  city: string;
  panchang: PanchangData;
  cardId?: string;
}

export function PanchangCard({ date, city, panchang, cardId = 'panchang-share-card' }: PanchangCardProps) {
  const formattedDate = date?.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) || '--';

  const _score = Math.max(0, Math.min(100, Number(panchang?.qualityScore ?? 0)));
  const _radius = 15.9155;
  const _circumference = 2 * Math.PI * _radius;
  const _dash = `${(_score / 100) * _circumference} ${_circumference}`;
  const gradientId = `${cardId}-shareGrade`;
  const insights = getActionableInsights(panchang);

  return (
    <BaseShareCard
      id={cardId}
      width={700}
      height={1100}
      containerStyle={{
        padding: '0.6rem',
        height: '860px',
        justifyContent: 'space-between',
        background: 'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.03), transparent 12%), linear-gradient(180deg, #F4E1C1 0%, #E5C89A 100%)',
      }}
    >
      <CardHeader title="Astro Event Planner" subtitle="Daily Panchang Guide" />

      <CardSection title=" DATE">
        <p
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'bold',
            color: 'var(--color-card-foreground, #111827)',
            margin: 0,
            lineHeight: '1.3',
            textAlign: 'center',
          }}
        >
          {formattedDate}
        </p>
        <p
          style={{
            fontSize: '14px',
            color: '#111827',
            margin: '0.125rem 0 0 0',
            fontWeight: 800,
            textAlign: 'center',
            textShadow: '0 0 0 rgba(0,0,0,0.02)'
          }}
        >
           {city}
        </p>
      </CardSection>

      <div
        style={{
          padding: '0.75rem',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fce7f3 70%, #f3e8ff 100%)',
          border: '2px solid #c084fc',
          boxShadow: '0 4px 6px -1px rgba(147, 51, 234, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'bold',
              color: '#6d2878',
              margin: '0 0 0.375rem 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
             AUSPICIOUSNESS SCORE
          </p>
        </div>
        <div style={{ width: 96, height: 96, position: 'relative' }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }} role="img">
            <defs>
              <linearGradient id={gradientId} x1="0%" x2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
            <path d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831" fill="none" strokeOpacity="0.08" strokeWidth="4" stroke="#6b7280" />
            <path
              d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="4"
              strokeDasharray={_dash}
              strokeLinecap="round"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 800,
                color: _score >= 70 ? '#16a34a' : _score >= 50 ? '#d97706' : '#dc2626',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-0.06em)'
              }}
              aria-hidden="true"
            >
              {_score}%
            </div>
          </div>
        </div>
      </div>

      <CardGrid columns={2} gap="0.625rem">
        <div
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'center',
            border: '2px solid #fbbf24',
            boxShadow: '0 2px 6px rgba(251, 191, 36, 0.2)',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: '#92400e',
              margin: '0 0 0.375rem 0',
              fontWeight: '700',
            }}
          >
             Sunrise
          </p>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#92400e',
              margin: 0,
            }}
          >
            {panchang.sunrise || '—'}
          </p>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'center',
            border: '2px solid #f97316',
            boxShadow: '0 2px 6px rgba(249, 115, 22, 0.2)',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#7c2d12',
              margin: '0 0 0.375rem 0',
            }}
          >
             Sunset
          </p>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#7c2d12',
              margin: 0,
            }}
          >
            {panchang.sunset || '—'}
          </p>
        </div>
      </CardGrid>

      <div
        style={{
          textAlign: 'center',
          borderRadius: '0.5rem',
          padding: '0.625rem',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          border: '2px solid #60a5fa',
          boxShadow: '0 2px 4px rgba(96, 165, 250, 0.2)',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#0c4a6e',
            margin: '0 0 0.375rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
           MOON PHASE
        </p>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#0c4a6e',
            margin: 0,
          }}
        >
          {panchang.paksha || '—'}
        </p>
      </div>

      {/* Daily Suggestions */}
      <div
        style={{
          borderRadius: '0.625rem',
          padding: '0.875rem',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '2px solid #10b981',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            fontWeight: '700',
            color: '#065f46',
            margin: '0 0 0.75rem 0',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
           DAILY SUGGESTIONS 
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '0.25rem', alignItems: 'flex-start' }}>
          {/* Do's */}
          <div
            style={{
              width: 260,
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              border: '1px solid rgba(5, 150, 105, 0.12)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#059669',
                    margin: '0 0 0.4rem 0',
                    textAlign: 'center'
                  }}
                >
                  DO's
                </p>
              {insights.dos.length > 0 ? (
                <ul
                  style={{
                    fontSize: '10px',
                    color: '#065f46',
                    margin: 0,
                    paddingLeft: 0,
                    lineHeight: '1.35',
                    listStyleType: 'none',
                    textAlign: 'center'
                  }}
                >
                  {insights.dos.slice(0, 4).map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span style={{ color: '#059669', fontSize: '12px', lineHeight: 1 }}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '10px', color: '#888', margin: 0, fontStyle: 'italic', textAlign: 'center' }}>—</p>
              )}
            </div>
          </div>

          {/* Don'ts */}
          <div
            style={{
              width: 260,
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              border: '1px solid rgba(220, 38, 38, 0.12)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ paddingLeft: '0.5rem' }}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#dc2626',
                  margin: '0 0 0.4rem 0',
                  textAlign: 'left'
                }}
              >
                DON'Ts
              </p>
              {insights.donts.length > 0 ? (
                <ul
                  style={{
                    fontSize: '10px',
                    color: '#991b1b',
                    margin: 0,
                    paddingLeft: 0,
                    lineHeight: '1.35',
                    listStyleType: 'disc',
                    listStylePosition: 'inside'
                  }}
                >
                  {insights.donts.slice(0, 4).map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '3px' }}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '10px', color: '#888', margin: 0, fontStyle: 'italic' }}>—</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardFooter />
    </BaseShareCard>
  );
}
