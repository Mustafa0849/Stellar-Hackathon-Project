import React from 'react';

interface StellarLogoProps {
  className?: string;
  size?: number;
}

export const StellarLogo: React.FC<StellarLogoProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stellar Logo - Simplified version */}
      <circle cx="12" cy="12" r="10" fill="url(#stellarGradient)" />
      <path
        d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z"
        fill="white"
        fillOpacity="0.9"
      />
      <defs>
        <linearGradient id="stellarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7D00FF" />
          <stop offset="100%" stopColor="#00D9FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

