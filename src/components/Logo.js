import React from 'react';

const Logo = ({ size = 'medium', showText = true }) => {
  const sizeClasses = {
    small: 'w-10 h-8',
    medium: 'w-15 h-12',
    large: 'w-20 h-16'
  };

  const textSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center">
        <img 
          src="/golden-chopsticks-logo.png" 
          alt="Golden Chopsticks Logo" 
          className={`${sizeClasses[size]} object-contain filter drop-shadow-2xl`}
        />
      </div>

      {showText && (
        <div className="hidden sm:block">
          <h1 className={`${textSizes[size]} font-bold text-gradient`}>
            Golden Chopsticks
          </h1>
          <p className="text-xs text-light-gold/80">West Kelowna, BC</p>
        </div>
      )}
    </div>
  );
};

export default Logo;