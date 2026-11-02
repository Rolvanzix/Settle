import React from 'react';

interface SettleLogoProps {
  className?: string;
  size?: number;
}

export const SettleLogo: React.FC<SettleLogoProps> = ({ className = 'w-7 h-7', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Hexagon with rounded look */}
      <path
        d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z"
        stroke="#F5A623"
        strokeWidth="11"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner subtle glow center */}
      <circle cx="50" cy="50" r="14" fill="#F5A623" fillOpacity="0.2" />
    </svg>
  );
};
