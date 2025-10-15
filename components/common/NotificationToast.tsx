import React from 'react';
import { Notification } from '../../types';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import InfoIcon from '../icons/InfoIcon';
import XCircleIcon from '../icons/XCircleIcon';

interface NotificationToastProps {
    notification: Notification;
    onClose: (id: number) => void;
}

const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    info: <InfoIcon className="h-6 w-6 text-blue-500" />,
    error: <XCircleIcon className="h-6 w-6 text-red-500" />,
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    
    return (
        <div 
            className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-in-right"
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {icons[notification.type]}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">
                            Notificación
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            {notification.message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => onClose(notification.id)}
                            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default NotificationToast;