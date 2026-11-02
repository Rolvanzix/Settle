import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackGradient?: string;
  fallbackIcon?: React.ReactNode;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Settle photo',
  className = '',
  fallbackGradient = 'from-amber-600/30 via-slate-900 to-[#16161C]',
  fallbackIcon,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`bg-gradient-to-br ${fallbackGradient} flex items-center justify-center relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-black/20" />
        {fallbackIcon && (
          <div className="relative z-10 opacity-70">
            {fallbackIcon}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-900/60 animate-pulse" />
      )}
    </div>
  );
};
