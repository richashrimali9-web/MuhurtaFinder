/**
 * CardFooter - Reusable footer component for shareable cards
 */

import { CSSProperties } from 'react';

export interface CardFooterProps {
  brandName?: string;
  websiteUrl?: string;
  websiteDisplay?: string;
  emoji?: string;
  style?: CSSProperties;
}

export function CardFooter({
  brandName = 'Astro Event Planner',
  websiteUrl = 'https://astroeventplanner.com',
  websiteDisplay = 'astroeventplanner.com',
  emoji = '🙏',
  style = {},
}: CardFooterProps) {
  return (
    <div
      style={{
        textAlign: 'center',
        paddingTop: '0.5rem',
        borderTop: `2px solid var(--accent, #e879f9)`,
        ...style,
      }}
    >
      <p
        style={{
          fontSize: '0.7rem',
          fontWeight: '600',
          color: 'var(--accent-purple, #a855f7)',
          margin: '0 0 0.25rem 0',
        }}
      >
        {emoji} {brandName}
      </p>
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-gradient-start, #9333ea)',
          margin: 0,
          textDecoration: 'none',
          fontWeight: '600',
          display: 'inline-block',
          transition: 'color 0.2s',
        }}
      >
        🌐 {websiteDisplay}
      </a>
    </div>
  );
}
