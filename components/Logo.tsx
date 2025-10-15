import React from 'react';
import WineGlassIcon from './icons/WineGlassIcon';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <WineGlassIcon className="h-8 w-8 text-primary" />
      <span className="ml-2 text-xl font-bold text-white">MiSoluciónVinos</span>
    </div>
  );
};

export default Logo;
