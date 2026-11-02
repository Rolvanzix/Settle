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
      {/* Outer Hexagon with rounded look matching reference */}
      <path
        d="M50 8 L86 28.5 L86 71.5 L50 92 L14 71.5 L14 28.5 Z"
        stroke="#F9B91D"
        strokeWidth="12"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner subtle glow center */}
      <circle cx="50" cy="50" r="12" fill="#F9B91D" fillOpacity="0.25" />
    </svg>
  );
};
