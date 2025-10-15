import React from 'react';

const TicketIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m-5.25 0h5.25m-5.25 0h5.25M3 13.5v-3c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v3c0 .621-.504 1.125-1.125 1.125h-1.5A1.125 1.125 0 013 13.5zM21 13.5v-3c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125v3c0 .621.504 1.125 1.125 1.125h1.5c.621 0 1.125-.504 1.125-1.125z" />
    </svg>
);

export default TicketIcon;
