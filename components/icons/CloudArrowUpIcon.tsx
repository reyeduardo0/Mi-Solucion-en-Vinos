import React from 'react';

const CloudArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M17.25 12c0 2.485-2.015 4.5-4.5 4.5s-4.5-2.015-4.5-4.5c0-2.036 1.343-3.753 3.187-4.321C11.956 7.02 12 6.948 12 6.875c0-.074.044-.145.187-.206C13.657 6.247 15 5.236 15 4.125 15 2.95 13.94 2 12.75 2S10.5 2.95 10.5 4.125c0 1.11.343 2.122 1.313 2.55.143.061.187.132.187.206 0 .073-.044.145-.187.206C9.843 7.497 8.5 9.214 8.5 10.875c0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5z" />
    </svg>
);

export default CloudArrowUpIcon;