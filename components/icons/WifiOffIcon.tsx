
import React from 'react';

const WifiOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c.918-.918 2.025-1.63 3.22-2.12M15.68 13.43a5.21 5.21 0 01-2.152 1.608M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
    </svg>
);
export default WifiOffIcon;
