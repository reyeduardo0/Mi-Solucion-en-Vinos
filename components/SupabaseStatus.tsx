
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import WifiIcon from './icons/WifiIcon';
import WifiOffIcon from './icons/WifiOffIcon';

type Status = 'connecting' | 'connected' | 'error';

const SupabaseStatus: React.FC = () => {
    const [status, setStatus] = useState<Status>('connecting');

    useEffect(() => {
        const checkConnection = async () => {
            // Una consulta ligera para verificar si la conexión y las claves son válidas.
            // Solo necesitamos el conteo, no los datos.
            const { error } = await supabase
                .from('products') // Usando una tabla que asumimos existe según types.ts
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error("Error de conexión con Supabase:", error.message);
                setStatus('error');
            } else {
                setStatus('connected');
            }
        };

        // No intentar conectar si el usuario no ha configurado sus credenciales
        if (supabase.supabaseUrl.includes('TU_SUPABASE_URL')) {
             setStatus('error');
             return;
        }

        checkConnection();
    }, []);

    const statusInfo = {
        connecting: {
            color: 'text-gray-400',
            icon: <WifiIcon className="h-5 w-5 animate-pulse" />,
            text: 'Conectando...',
            tooltip: 'Intentando conectar con Supabase.'
        },
        connected: {
            color: 'text-green-500',
            icon: <WifiIcon className="h-5 w-5" />,
            text: 'Conectado',
            tooltip: 'Conexión con Supabase establecida correctamente.'
        },
        error: {
            color: 'text-red-500',
            icon: <WifiOffIcon className="h-5 w-5" />,
            text: 'Error de Conexión',
            tooltip: 'No se pudo conectar a Supabase. Verifica tus credenciales y la configuración de las tablas.'
        }
    };

    const currentStatus = statusInfo[status];

    return (
        <div className="group relative flex items-center gap-2 cursor-help" title={currentStatus.tooltip}>
            <span className={currentStatus.color}>
                {currentStatus.icon}
            </span>
            <span className={`font-semibold text-sm ${currentStatus.color}`}>
                {status !== 'connecting' ? currentStatus.text : ''}
            </span>
            <div className="absolute bottom-full mb-2 hidden w-64 group-hover:block bg-dark-gray text-white text-xs rounded py-1 px-2 text-center z-10">
                {currentStatus.tooltip}
            </div>
        </div>
    );
};

export default SupabaseStatus;
