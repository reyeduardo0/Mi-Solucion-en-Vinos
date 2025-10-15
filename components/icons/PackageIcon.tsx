
import React from 'react';
const PackageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.353-.026.715-.026 1.068 0 1.13.094 1.976 1.057 1.976 2.192V7.5m0 0h-5.828M15 7.5H9.172m-4.5 3.5c-1.218 0-2.218.9-2.45 2.134l-.328 1.972a2.45 2.45 0 002.45 2.822h12.316a2.45 2.45 0 002.45-2.822l-.328-1.972a2.45 2.45 0 00-2.45-2.134H4.672z" />
    </svg>
);
export default PackageIcon;
