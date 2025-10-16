import React from 'react';
import { AuditLog } from '../types';
import Card from './common/Card';

interface AuditLogViewerProps {
    logs: AuditLog[];
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {

    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString('es-ES', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-6">Registro de Auditoría</h1>

            <Card>
                <div className="overflow-x-auto">
                    {logs.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Entidad</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimestamp(log.timestamp)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.userName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.userRole}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.entity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.entityId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Mobile Card View */}
                            <div className="space-y-4 md:hidden">
                                {logs.map((log) => (
                                    <div key={log.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-dark-gray">{log.action} - {log.entity}</p>
                                                <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-sm text-gray-700 space-y-1">
                                            <p><span className="font-semibold">Usuario:</span> {log.userName} ({log.userRole})</p>
                                            <p><span className="font-semibold">ID Entidad:</span> <span className="font-mono">{log.entityId}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No hay registros de auditoría para mostrar.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AuditLogViewer;