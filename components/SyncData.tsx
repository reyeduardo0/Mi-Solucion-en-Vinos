import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import { syncAllData } from '../services/syncService';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

const SyncData: React.FC = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSync = async () => {
        setIsSyncing(true);
        setLogs([]);
        setSyncStatus('idle');

        const logCallback = (message: string) => {
            setLogs(prev => [...prev, message]);
        };
        
        logCallback('Iniciando el proceso de sincronización...');
        const result = await syncAllData(logCallback);

        setSyncStatus(result.success ? 'success' : 'error');
        setIsSyncing(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-6">Sincronización con la Base de Datos</h1>
            <Card>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-dark-gray">Poblar Base de Datos</h2>
                        <p className="text-gray-600 mt-2 mb-4">
                            Usa esta herramienta para enviar todos los datos de demostración (mock data) a tus tablas de Supabase. El proceso utilizará la lógica "upsert": creará registros que no existan y actualizará los que ya existan según su ID.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            Es seguro ejecutar este proceso varias veces. Asegúrate de que todas las tablas y columnas necesarias estén creadas en Supabase para evitar errores.
                        </p>
                        <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200 flex items-start gap-3 mb-6">
                             <AlertTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-yellow-800">Importante</h3>
                                <p className="text-yellow-700 text-sm">
                                    Esta acción sobrescribirá cualquier dato en Supabase que tenga el mismo ID que los datos de demostración. Procede con precaución si tienes datos reales en tus tablas.
                                </p>
                            </div>
                        </div>
                        <Button onClick={handleSync} disabled={isSyncing} className="w-full md:w-auto">
                            <CloudArrowUpIcon className={`w-5 h-5 ${isSyncing ? 'animate-bounce' : ''}`} />
                            {isSyncing ? 'Sincronizando...' : 'Iniciar Sincronización'}
                        </Button>
                    </div>

                    <div className="flex-1">
                         <h2 className="text-xl font-semibold text-dark-gray mb-4">Registro de Sincronización</h2>
                         <div className="bg-dark text-white rounded-lg p-4 h-96 font-mono text-sm overflow-y-auto">
                            {logs.length > 0 ? (
                                logs.map((log, index) => (
                                    <div key={index} className={`flex items-start ${log.startsWith('❌') ? 'text-red-400' : (log.startsWith('🎉') ? 'text-green-400 font-bold' : 'text-gray-300')}`}>
                                        <span className="mr-2 text-gray-500">{`[${index + 1}]`}</span>
                                        <p className="flex-1 break-words">{log}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Esperando para iniciar la sincronización...</p>
                            )}
                         </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SyncData;
