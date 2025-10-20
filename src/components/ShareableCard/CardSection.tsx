/**
 * CardSection - Reusable section component for card content
 */

import { CSSProperties, ReactNode } from 'react';

export interface CardSectionProps {
  children: ReactNode;
  title?: string;
  emoji?: string;
  backgroundColor?: string;
  borderColor?: string;
  padding?: string;
  style?: CSSProperties;
}

export function CardSection({
  children,
  title,
  emoji,
  backgroundColor = 'var(--pastel-1, #faf5ff)',
  borderColor = 'var(--accent-purple, #e9d5ff)',
  padding = '0.625rem',
  style = {},
}: CardSectionProps) {
  return (
    <div
      style={{
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '0.5rem',
        padding,
        ...style,
      }}
    >
      {title && (
        <p
            style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            color: 'var(--accent-purple, #7c3aed)',
            margin: '0 0 0.375rem 0',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {emoji && `${emoji} `}
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
