/**
 * BaseShareCard - Reusable base component for all shareable cards
 * This component handles the card structure, dimensions, and common styling
 */

import { CSSProperties, ReactNode } from 'react';

export interface BaseShareCardProps {
  id: string;
  children: ReactNode;
  width?: number;
  height?: number;
  containerStyle?: CSSProperties;
}

export function BaseShareCard({
  id,
  children,
  width = 700,
  height = 1100,
  containerStyle = {}
}: BaseShareCardProps) {
  return (
    <div
      id={id}
      style={{
        width: `${width}px`,
        maxWidth: `${width}px`,
        background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 40%, #e0e7ff 100%)',
        borderColor: 'var(--accent, #e879f9)',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 10px 15px -3px rgba(147,51,234,0.1), 0 4px 6px -2px rgba(147,51,234,0.05)',
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: '0 auto',
        boxSizing: 'border-box',
        ...containerStyle,
      }}
    >
      {children}
    </div>
  );
}
