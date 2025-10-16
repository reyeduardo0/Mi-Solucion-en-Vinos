import React, { useState, useEffect } from 'react';
import { Salida, User, UserRole, Pack, Notification } from '../types';
import { mockProducts } from '../data/mockData';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import Input from './common/Input';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface SalidasProps {
    user: User;
    salidas: Salida[];
    onAddSalida: (salida: Omit<Salida, 'id' | 'packs'>) => Promise<void>;
    onUpdateSalida: (salida: Salida) => Promise<void>;
    onDeleteSalida: (id: string) => Promise<void>;
    addNotification: (message: string, type?: Notification['type']) => void;
}

const toTitleCase = (str: string) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

const Salidas: React.FC<SalidasProps> = ({ user, salidas, onAddSalida, onUpdateSalida, onDeleteSalida, addNotification }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSalida, setEditingSalida] = useState<Salida | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [deletingSalidaId, setDeletingSalidaId] = useState<string | null>(null);
    const [expandedSalidaId, setExpandedSalidaId] = useState<string | null>(null);

    const initialFormData = {
        albaranSalidaId: '',
        cliente: '',
        fechaHora: '',
        transportista: '',
        camionMatricula: '',
        conductor: '',
    };
    const [formState, setFormState] = useState<Omit<Salida, 'id' | 'packs'>>(initialFormData);

    useEffect(() => {
        if (isModalOpen) {
            if (editingSalida) {
                setFormState({
                    albaranSalidaId: editingSalida.albaranSalidaId,
                    cliente: editingSalida.cliente,
                    fechaHora: editingSalida.fechaHora,
                    transportista: editingSalida.transportista,
                    camionMatricula: editingSalida.camionMatricula,
                    conductor: editingSalida.conductor,
                });
            } else {
                setFormState(initialFormData);
            }
        }
    }, [editingSalida, isModalOpen]);

    const handleOpenModal = (salida: Salida | null) => {
        setEditingSalida(salida);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSalida(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let finalValue = value;

        switch (name) {
            case 'albaranSalidaId':
            case 'camionMatricula':
                finalValue = value.toUpperCase();
                break;
            case 'cliente':
            case 'transportista':
            case 'conductor':
                finalValue = toTitleCase(value);
                break;
            default:
                finalValue = value;
        }
        
        setFormState(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingSalida) {
                await onUpdateSalida({
                    ...editingSalida,
                    ...formState,
                });
            } else {
                await onAddSalida(formState);
            }
            handleCloseModal();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrió un error al guardar la salida.';
            addNotification(message, 'error');
        }
    };

    const handleDeleteRequest = (id: string) => {
        setDeletingSalidaId(id);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingSalidaId) return;
        try {
            await onDeleteSalida(deletingSalidaId);
            setIsConfirmDeleteOpen(false);
            setDeletingSalidaId(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrió un error al eliminar la salida.';
            addNotification(message, 'error');
            setIsConfirmDeleteOpen(false);
        }
    };

    const handlePrintCMR = (salida: Salida) => {
        const cmrUrl = `https://via.placeholder.com/800x1100.png?text=CMR+Albaran+${salida.albaranSalidaId}`;
        window.open(cmrUrl, '_blank');
        addNotification(`Generando CMR para la salida ${salida.albaranSalidaId}.`, 'success');
    };

    const handleToggleExpand = (salidaId: string) => {
        setExpandedSalidaId(prevId => (prevId === salidaId ? null : salidaId));
    };

    const getProductName = (productId: string) => {
        return mockProducts.find(p => p.id === productId)?.name || 'Desconocido';
    };

    const canManage = user.role === UserRole.SuperUsuario || user.role === UserRole.Administrativo;

    const renderPackDetails = (salida: Salida) => (
        <div className="p-4 bg-light-gray">
            <h4 className="text-md font-semibold text-dark-gray mb-2">Detalle de Packs</h4>
            {salida.packs.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300 shadow-inner rounded-lg">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Pedido Cliente</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Producto</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Lote</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {salida.packs.flatMap((pack: Pack) =>
                                pack.productos.map((producto, index) => (
                                    <tr key={`${pack.id}-${producto.lote}-${index}`} className="border-b last:border-0">
                                        {index === 0 && (
                                            <td rowSpan={pack.productos.length} className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 border-r align-top">
                                                {pack.pedidoCliente}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{getProductName(producto.productId)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{producto.lote}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{producto.cantidad.toLocaleString('es-ES')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">No hay packs asociados a esta salida.</p>
            )}
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark-gray">Gestión de Salidas</h1>
                {canManage && <Button onClick={() => handleOpenModal(null)}>Nueva Salida</Button>}
            </div>

            <Card>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-2 py-3 w-12"></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Albarán Salida</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transportista</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Packs</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {salidas.map((salida) => (
                                <React.Fragment key={salida.id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-2 py-4">
                                            <button onClick={() => handleToggleExpand(salida.id)} className="p-1 rounded-full hover:bg-gray-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${expandedSalidaId === salida.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{salida.albaranSalidaId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salida.cliente}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salida.transportista}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salida.fechaHora}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{salida.packs.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handlePrintCMR(salida)} className="text-green-600 hover:text-green-800">Imprimir CMR</button>
                                            {canManage && (
                                                <>
                                                    <button onClick={() => handleOpenModal(salida)} className="text-primary hover:text-yellow-400">Editar</button>
                                                    <button onClick={() => handleDeleteRequest(salida.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedSalidaId === salida.id && (
                                        <tr>
                                            <td colSpan={7} className="p-0">
                                                {renderPackDetails(salida)}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="space-y-4 md:hidden">
                    {salidas.map((salida) => (
                        <div key={salida.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-dark-gray">{salida.albaranSalidaId}</p>
                                    <p className="text-xs text-gray-500">{salida.cliente}</p>
                                </div>
                                <button onClick={() => handleToggleExpand(salida.id)} className="p-1 rounded-full hover:bg-gray-200 text-gray-600">
                                    <span className="text-xs font-semibold mr-1">Detalles</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`inline-block h-5 w-5 transition-transform duration-200 ${expandedSalidaId === salida.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-3 text-sm text-gray-700 space-y-1">
                                <p><span className="font-semibold">Fecha:</span> {salida.fechaHora}</p>
                                <p><span className="font-semibold">Transportista:</span> {salida.transportista}</p>
                                <p><span className="font-semibold">Nº Packs:</span> {salida.packs.length}</p>
                            </div>
                            {expandedSalidaId === salida.id && (
                                <div className="mt-3 pt-3 border-t">
                                    {renderPackDetails(salida)}
                                </div>
                            )}
                             <div className="mt-4 pt-3 border-t flex justify-end items-center gap-3 flex-wrap">
                                 <button onClick={() => handlePrintCMR(salida)} className="text-sm text-green-600 hover:text-green-800 font-medium">Imprimir CMR</button>
                                 {canManage && (
                                    <>
                                        <button onClick={() => handleOpenModal(salida)} className="text-sm text-primary hover:text-yellow-400 font-medium">Editar</button>
                                        <button onClick={() => handleDeleteRequest(salida.id)} className="text-sm text-red-600 hover:text-red-800 font-medium">Eliminar</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSalida ? "Editar Salida" : "Nueva Salida"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="albaranSalidaId" name="albaranSalidaId" label="Nº Albarán Salida" type="text" value={formState.albaranSalidaId} onChange={handleChange} required style={{ textTransform: 'uppercase' }}/>
                        <Input id="cliente" name="cliente" label="Cliente" type="text" value={formState.cliente} onChange={handleChange} required />
                        <Input id="transportista" name="transportista" label="Transportista" type="text" value={formState.transportista} onChange={handleChange} required />
                        <Input id="camionMatricula" name="camionMatricula" label="Matrícula Camión" type="text" value={formState.camionMatricula} onChange={handleChange} required style={{ textTransform: 'uppercase' }}/>
                        <Input id="conductor" name="conductor" label="Conductor" type="text" value={formState.conductor} onChange={handleChange} required />
                        <Input id="fechaHora" name="fechaHora" label="Fecha y Hora" type="datetime-local" value={formState.fechaHora} onChange={handleChange} required />
                    </div>
                    <div className="pt-6 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                        <Button type="submit">{editingSalida ? 'Guardar Cambios' : 'Crear Salida'}</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Eliminación">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">¿Eliminar Salida?</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            ¿Estás seguro de que quieres eliminar esta salida? Esta acción es irreversible.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="button" variant="danger" onClick={handleConfirmDelete}>
                            Sí, Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Salidas;