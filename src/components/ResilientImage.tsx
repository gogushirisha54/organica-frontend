import React, { useState } from 'react';
import { Sprout } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
  fallbackTitle?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  objectPosition = 'center center',
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EAE6DF] text-[#4E584D] p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sprout className="w-8 h-8 mb-2 text-[#1F472B] opacity-75" strokeWidth={1.5} />
        <span className="font-display text-base font-medium text-[#181D18] max-w-[20ch] text-balance">
          {fallbackTitle || alt}
        </span>
        <span className="text-xs text-[#5A6258] mt-1">
          Certified Organic Harvest
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      style={{ objectPosition }}
      className={className}
      loading="lazy"
    />
  );
};
