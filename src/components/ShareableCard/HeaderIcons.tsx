import React from 'react';

// Simple SVG Diya icon
export const DiyaIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="24" rx="10" ry="5" fill="#FFB300" />
    <path d="M16 24C16 18 22 18 22 24" stroke="#FF9800" strokeWidth="2" fill="none" />
    <path d="M16 24C16 18 10 18 10 24" stroke="#FF9800" strokeWidth="2" fill="none" />
    <circle cx="16" cy="16" r="3" fill="#FFD54F" />
    <path d="M16 13C16 10 18 10 18 13" stroke="#FF9800" strokeWidth="1.5" fill="none" />
  </svg>
);

// Simple SVG Om icon
export const OmIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="28" fontFamily="sans-serif" fill="#8E24AA">ॐ</text>
  </svg>
);

// Simple SVG Ganesha icon (placeholder, can be replaced)
export const GaneshaIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="16" fill="#F8BBD0" />
    <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontFamily="sans-serif" fill="#AD1457">ग</text>
  </svg>
);
