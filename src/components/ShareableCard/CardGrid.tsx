/**
 * CardGrid - Reusable grid component for card layouts
 */

import { CSSProperties, ReactNode } from 'react';

export interface CardGridProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
  style?: CSSProperties;
}

export function CardGrid({
  children,
  columns = 2,
  gap = '0.625rem',
  style = {},
}: CardGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface CardGridItemProps {
  label: string;
  value: string | number;
  labelColor?: string;
  valueColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  style?: CSSProperties;
}

export function CardGridItem({
  label,
  value,
  labelColor = 'var(--accent-purple, #a855f7)',
  valueColor = 'var(--color-card-foreground, #111827)',
  backgroundColor = 'rgba(255, 255, 255, 0.9)',
  borderColor = 'var(--accent-purple, #e9d5ff)',
  style = {},
}: CardGridItemProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        backgroundColor,
        padding: '0.5rem',
        borderRadius: '0.375rem',
        border: `1px solid ${borderColor}`,
        minHeight: '72px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        ...style,
      }}
    >
      <p
        style={{
          fontSize: '0.625rem',
          fontWeight: '700',
          color: labelColor,
          margin: '0 0 0.25rem 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '0.8rem',
          fontWeight: 'bold',
          color: valueColor,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
