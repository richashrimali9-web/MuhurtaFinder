/**
 * PanchangCard - Shareable Panchang Card Component
 * Built using reusable ShareableCard components
 */

import { PanchangData } from '../utils/panchangData';
import {
  BaseShareCard,
  CardHeader,
  CardFooter,
  CardSection,
  CardGrid,
  CardGridItem,
} from './ShareableCard';

export interface PanchangCardProps {
  date: Date;
  city: string;
  panchang: PanchangData;
  cardId?: string;
}

export function PanchangCard({ date, city, panchang, cardId = 'panchang-share-card' }: PanchangCardProps) {
  const formattedDate = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Prepare circular progress metrics (SVG circle uses radius ~15.9155 so circumference ~100)
  const _score = Math.max(0, Math.min(100, Number(panchang.qualityScore ?? 0)));
  const _radius = 15.9155;
  const _circumference = 2 * Math.PI * _radius; // ~= 100
  const _dash = `${(_score / 100) * _circumference} ${_circumference}`;
  const gradientId = `${cardId}-shareGrade`;

  return (
    <BaseShareCard id={cardId} width={700} height={1100}>
      {/* Header */}
      <CardHeader title="Astro Event Planner" subtitle="Daily Panchang Guide" />

      {/* Date Section */}
      <CardSection title="📅 DATE">
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
            fontSize: 'var(--text-sm)',
            color: 'var(--accent, #e879f9)',
            margin: '0.125rem 0 0 0',
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          📍 {city}
        </p>
      </CardSection>

      {/* Panchang Details Grid */}
      <div
        style={{
          padding: '0.75rem',
          background:
            'linear-gradient(135deg, var(--pastel-yellow, #fef3c7) 0%, var(--pastel-yellow-dark, #fde68a) 30%, var(--pastel-4, #fce7f3) 70%, var(--pastel-1, #f3e8ff) 100%)',
          borderRadius: '0.625rem',
          border: '2px solid var(--accent-purple, #e9d5ff)',
        }}
      >
        <CardGrid columns={2} gap="0.625rem">
          <CardGridItem label="TITHI" value={panchang.tithi} />
          <CardGridItem label="NAKSHATRA" value={panchang.nakshatra} />
          <CardGridItem label="YOGA" value={panchang.yoga} />
          <CardGridItem label="KARANA" value={panchang.karana} />
        </CardGrid>
      </div>

      {/* Quality Score (circular ring) */}
      <div
        style={{
          textAlign: 'center',
          borderRadius: '0.625rem',
          padding: '0.75rem',
          background: 'linear-gradient(135deg, var(--pastel-4, #f3e8ff) 0%, var(--pastel-1, #e9d5ff) 100%)',
          border: '2px solid var(--accent-purple, #c084fc)',
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
              color: 'var(--accent-purple, #6d2878)',
              margin: '0 0 0.375rem 0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            ⭐ AUSPICIOUSNESS SCORE
          </p>
        </div>
        <div style={{ width: 96, height: 96, position: 'relative' }}>
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }} role="img" aria-labelledby={`${cardId}-grade-title ${cardId}-grade-desc`}>
            <title id={`${cardId}-grade-title`}>Auspiciousness score</title>
            <desc id={`${cardId}-grade-desc`}>Shows the daily auspiciousness as a circular progress indicating {panchang.qualityScore}%</desc>
            <defs>
              <linearGradient id={gradientId} x1="0%" x2="100%">
                <stop offset="0%" stopColor="var(--chart-1, #f59e0b)" />
                <stop offset="50%" stopColor="var(--chart-5, #f97316)" />
                <stop offset="100%" stopColor="var(--chart-2, #60a5fa)" />
              </linearGradient>
            </defs>
            <path d="M18 2.0845a15.9155 15.9155 0 1 1 0 31.831a15.9155 15.9155 0 1 1 0-31.831" fill="none" strokeOpacity="0.08" strokeWidth="4" stroke="var(--muted-foreground, #6b7280)" />
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
                color: _score >= 70 ? 'var(--chart-4, #16a34a)' : _score >= 50 ? 'var(--chart-5, #d97706)' : 'var(--destructive, #dc2626)',
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

      {/* Sun Timings */}
      <CardGrid columns={2} gap="0.625rem">
        <div
          style={{
            background: 'linear-gradient(135deg, var(--pastel-yellow, #fef3c7) 0%, var(--pastel-yellow-dark, #fde68a) 100%)',
            borderRadius: '0.5rem',
            padding: '0.625rem',
            textAlign: 'center',
            border: '2px solid var(--accent-yellow, #fbbf24)',
            boxShadow: '0 2px 4px rgba(251, 191, 36, 0.2)',
          }}
        >
          <p
            style={{
              fontSize: 'var(--text-xs-2)',
              color: 'var(--accent-yellow-foreground, #92400e)',
              margin: '0 0 0.25rem 0',
              fontWeight: '700',
            }}
          >
            🌅 Sunrise
          </p>
          <p
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'bold',
              color: 'var(--accent-yellow-foreground, #92400e)',
              margin: 0,
            }}
          >
            {panchang.sunrise}
          </p>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, var(--pastel-orange, #fed7aa) 0%, var(--pastel-orange-dark, #fdba74) 100%)',
            borderRadius: '0.5rem',
            padding: '0.625rem',
            textAlign: 'center',
            border: '2px solid var(--accent-orange, #f97316)',
            boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)',
          }}
        >
          <p
            style={{
              fontSize: 'var(--text-xs-2)',
              fontWeight: '700',
              color: 'var(--accent-orange-foreground, #7c2d12)',
              margin: '0 0 0.25rem 0',
            }}
          >
            🌅 Sunset
          </p>
          <p
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'bold',
              color: 'var(--accent-orange-foreground, #7c2d12)',
              margin: 0,
            }}
          >
            {panchang.sunset}
          </p>
        </div>
      </CardGrid>

      {/* Moon Phase */}
      <div
        style={{
          textAlign: 'center',
          borderRadius: '0.5rem',
          padding: '0.625rem',
          background: 'linear-gradient(135deg, var(--pastel-blue, #dbeafe) 0%, var(--pastel-blue-dark, #bfdbfe) 100%)',
          border: '2px solid var(--accent-blue, #60a5fa)',
          boxShadow: '0 2px 4px rgba(96, 165, 250, 0.2)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--text-xs-2)',
            fontWeight: '700',
            color: 'var(--accent-blue-foreground, #0c4a6e)',
            margin: '0 0 0.25rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          🌙 MOON PHASE
        </p>
        <p
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'bold',
            color: 'var(--accent-blue-foreground, #0c4a6e)',
            margin: 0,
          }}
        >
          {panchang.paksha}
        </p>
      </div>

      {/* Daily Suggestions */}
      <div
        style={{
          borderRadius: '0.5rem',
          padding: '0.625rem',
          background: 'linear-gradient(135deg, var(--pastel-green, #ecfdf5) 0%, var(--pastel-green-dark, #d1fae5) 100%)',
          border: '2px solid var(--chart-4, #10b981)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--text-xs-2)',
            fontWeight: 'bold',
            color: 'var(--chart-4-foreground, #065f46)',
            margin: '0 0 0.375rem 0',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          ✨ DAILY SUGGESTIONS ✨
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {/* Do's */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '0.375rem',
              padding: '0.4rem',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-xxs)',
                fontWeight: 'bold',
                color: 'var(--chart-4, #059669)',
                margin: '0 0 0.2rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              ✅ DO's
            </p>
            <ul
              style={{
                fontSize: 'var(--text-xxs)',
                color: 'var(--chart-4-foreground, #065f46)',
                margin: 0,
                paddingLeft: '0.9rem',
                lineHeight: '1.2',
              }}
            >
              <li>Start new ventures</li>
              <li>Worship & prayers</li>
              <li>Important meetings</li>
            </ul>
          </div>

          {/* Don'ts */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '0.375rem',
              padding: '0.4rem',
            }}
          >
            <p
              style={{
                fontSize: 'var(--text-xxs)',
                fontWeight: 'bold',
                color: 'var(--destructive, #dc2626)',
                margin: '0 0 0.2rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              ❌ DON'Ts
            </p>
            <ul
              style={{
                fontSize: 'var(--text-xxs)',
                color: 'var(--destructive-foreground, #991b1b)',
                margin: 0,
                paddingLeft: '0.9rem',
                lineHeight: '1.2',
              }}
            >
              <li>Avoid conflicts</li>
              <li>No major purchases</li>
              <li>Skip risky decisions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <CardFooter />
    </BaseShareCard>
  );
}
