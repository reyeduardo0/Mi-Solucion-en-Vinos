
import React from 'react';

const WineGlassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v2h16V4c0-1.1-.9-2-2-2zM4 8v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8H4zm6 10H8v-5h2v5zm4 0h-2v-5h2v5z" />
  </svg>
);

export default WineGlassIcon;
