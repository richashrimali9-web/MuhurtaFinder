/**
 * CardHeader - Reusable header component for shareable cards
 */

import { CSSProperties } from 'react';

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  style?: CSSProperties;
}

export function CardHeader({
  title,
  subtitle,
  emoji = '✨',
  backgroundColor = 'linear-gradient(135deg, var(--pastel-1, #faf5ff) 0%, var(--pastel-4, #f3e8ff) 100%)',
  titleColor = 'linear-gradient(135deg, var(--text-gradient-start, #9333ea) 0%, var(--text-gradient-end, #c026d3) 100%)',
  subtitleColor = 'var(--accent-purple, #7c3aed)',
  style = {},
}: CardHeaderProps) {
  return (
    <div
      style={{
        textAlign: 'center',
  paddingBottom: '0.75rem',
  borderBottom: '3px solid var(--accent, #e879f9)',
  background: backgroundColor,
        padding: '1rem',
        borderTopLeftRadius: '0.5rem',
        borderTopRightRadius: '0.5rem',
        marginTop: '-1.5rem',
        marginLeft: '-1.5rem',
        marginRight: '-1.5rem',
        marginBottom: '0.5rem',
        ...style,
      }}
    >
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          background: titleColor,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0,
          letterSpacing: '0.5px',
        }}
      >
        {emoji} {title} {emoji}
      </h1>
      {subtitle && (
        <p
            style={{
          fontSize: '0.8rem',
          marginTop: '0.25rem',
          color: subtitleColor,
          margin: '0.25rem 0 0 0',
          fontWeight: '500',
          letterSpacing: '0.3px',
        }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
