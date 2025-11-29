import React from 'react';

interface USDCLogoProps {
  className?: string;
  size?: number;
}

export const USDCLogo: React.FC<USDCLogoProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* USDC Logo - Blue diamond with dollar sign */}
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
        fill="#2775CA"
      />
      <path
        d="M12 6V18M10 8H14C15.1 8 16 8.9 16 10C16 11.1 15.1 12 14 12H10M10 12H14C15.1 12 16 12.9 16 14C16 15.1 15.1 16 14 16H10"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="10" r="1" fill="white" />
      <circle cx="12" cy="14" r="1" fill="white" />
    </svg>
  );
};

