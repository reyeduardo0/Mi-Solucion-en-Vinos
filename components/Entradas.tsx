import React, { useState, useMemo } from 'react';
import { mockProducts } from '../data/mockData';
import { Entrada, User, UserRole, Pallet, Notification } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import Input from './common/Input';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface EntradasProps {
    user: User;
    entradas: Entrada[];
    onAddEntrada: (entrada: Omit<Entrada, 'id' | 'pallets'>) => Promise<void>;
    onUpdateEntrada: (entrada: Entrada) => Promise<void>;
    onDeleteEntrada: (id: string) => Promise<void>;
    addNotification: (message: string, type?: Notification['type']) => void;
}

const toTitleCase = (str: string) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

const Entradas: React.FC<EntradasProps> = ({ user, entradas, onAddEntrada, onUpdateEntrada, onDeleteEntrada, addNotification }) => {
    // Modal and form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntrada, setEditingEntrada] = useState<Entrada | null>(null);
    const [viewingEntrada, setViewingEntrada] = useState<Entrada | null>(null);
    const [viewingPallet, setViewingPallet] = useState<Pallet | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [deletingEntradaId, setDeletingEntradaId] = useState<string | null>(null);
    const [formState, setFormState] = useState<Omit<Entrada, 'id' | 'pallets'>>({
        albaranId: '', camionMatricula: '', transportista: '', conductor: '',
        fechaHora: '', numeroPalets: 0, incidencia: '',
        incidenciaImagenes: [], palletLabelImagenes: [],
    });
    const [estado, setEstado] = useState<'Correcto' | 'Incidencia'>('Correcto');

    // Pagination and Filtering states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filterAlbaran, setFilterAlbaran] = useState('');
    const [filterStatus, setFilterStatus] = useState<'Todos' | 'Correcto' | 'Incidencia'>('Todos');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const filteredAndSortedEntradas = useMemo(() => {
        let filtered = [...entradas]
            .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

        if (filterAlbaran) {
            filtered = filtered.filter(e => e.albaranId.toLowerCase().includes(filterAlbaran.toLowerCase()));
        }
        if (filterStatus !== 'Todos') {
            filtered = filtered.filter(e => filterStatus === 'Correcto' ? !e.incidencia : !!e.incidencia);
        }
        if (filterStartDate) {
            filtered = filtered.filter(e => new Date(e.fechaHora) >= new Date(filterStartDate));
        }
        if (filterEndDate) {
            const endDate = new Date(filterEndDate);
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(e => new Date(e.fechaHora) <= endDate);
        }
        return filtered;
    }, [entradas, filterAlbaran, filterStatus, filterStartDate, filterEndDate]);

    const paginatedEntradas = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredAndSortedEntradas.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredAndSortedEntradas, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedEntradas.length / itemsPerPage);

    const handleResetFilters = () => {
        setFilterAlbaran('');
        setFilterStatus('Todos');
        setFilterStartDate('');
        setFilterEndDate('');
        setCurrentPage(1);
    };

    // Reset page to 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [filterAlbaran, filterStatus, filterStartDate, filterEndDate]);
    
    // --- Modal and Form Logic (mostly unchanged) ---
    const initialFormData = useMemo(() => ({
        albaranId: '', camionMatricula: '', transportista: '', conductor: '',
        fechaHora: new Date().toISOString().slice(0, 16), numeroPalets: 0, incidencia: '',
        incidenciaImagenes: [], palletLabelImagenes: [],
    }), []);

    React.useEffect(() => {
        if (editingEntrada && isModalOpen) {
            setFormState({
                albaranId: editingEntrada.albaranId,
                camionMatricula: editingEntrada.camionMatricula,
                transportista: editingEntrada.transportista,
                conductor: editingEntrada.conductor,
                fechaHora: editingEntrada.fechaHora,
                numeroPalets: editingEntrada.numeroPalets,
                incidencia: editingEntrada.incidencia || '',
                incidenciaImagenes: editingEntrada.incidenciaImagenes || [],
                palletLabelImagenes: editingEntrada.palletLabelImagenes || [],
            });
            setEstado(editingEntrada.incidencia ? 'Incidencia' : 'Correcto');
        } else {
            setFormState(initialFormData);
            setEstado('Correcto');
        }
    }, [editingEntrada, isModalOpen, initialFormData]);

    const handleOpenModal = (entrada: Entrada | null) => {
        setEditingEntrada(entrada);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingEntrada(null); setViewingEntrada(null); };
    const handleViewDetails = (entrada: Entrada) => { setViewingEntrada(entrada); };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        let finalValue: string | number = value;

        if (type === 'number') {
            finalValue = parseInt(value, 10) || 0;
        } else if (typeof value === 'string') {
            switch (name) {
                case 'albaranId':
                case 'camionMatricula':
                    finalValue = value.toUpperCase();
                    break;
                case 'transportista':
                case 'conductor':
                    finalValue = toTitleCase(value);
                    break;
                default:
                    finalValue = value;
            }
        }
        
        setFormState(prev => ({ ...prev, [name]: finalValue as any }));
    };

    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEstado = e.target.value as 'Correcto' | 'Incidencia';
        setEstado(newEstado);
        if (newEstado === 'Correcto') setFormState(prev => ({ ...prev, incidencia: '', incidenciaImagenes: [] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submissionData = { ...formState };
            if (estado === 'Correcto') { submissionData.incidencia = ''; submissionData.incidenciaImagenes = []; }
            if (editingEntrada) {
                await onUpdateEntrada({ ...editingEntrada, ...submissionData });
            } else {
                await onAddEntrada(submissionData);
            }
            handleCloseModal();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrió un error al guardar la entrada.';
            addNotification(message, 'error');
        }
    };

    const handleDeleteRequest = (id: string) => { setDeletingEntradaId(id); setIsConfirmDeleteOpen(true); };
    
    const handleConfirmDelete = async () => {
        if (!deletingEntradaId) return;
        try {
            await onDeleteEntrada(deletingEntradaId);
            setIsConfirmDeleteOpen(false);
            setDeletingEntradaId(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ocurrió un error al eliminar la entrada.';
            addNotification(message, 'error');
            setIsConfirmDeleteOpen(false); // Also close modal on error
        }
    };

    const getProductName = (productId: string) => mockProducts.find(p => p.id === productId)?.name || 'Desconocido';
    const canDelete = user.role === UserRole.SuperUsuario || user.role === UserRole.Administrativo;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark-gray">Gestión de Entradas</h1>
                <Button onClick={() => handleOpenModal(null)}>Registrar Nueva Entrada</Button>
            </div>

            <Card title="Filtros de Búsqueda" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <Input id="filterAlbaran" label="Filtrar por Albarán" type="text" value={filterAlbaran} onChange={e => setFilterAlbaran(e.target.value)} placeholder="Ej: ALB-E-2025..."/>
                    <div>
                        <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Estado</label>
                        <select id="filterStatus" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="Todos">Todos</option>
                            <option value="Correcto">Correcto</option>
                            <option value="Incidencia">Incidencia</option>
                        </select>
                    </div>
                    <Input id="filterStartDate" label="Fecha Desde" type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
                    <div className="flex gap-2">
                        <Input id="filterEndDate" label="Fecha Hasta" type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
                        <Button variant="secondary" onClick={handleResetFilters} className="h-10 mt-auto" title="Limpiar filtros">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Albarán</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transportista</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Palets</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedEntradas.length > 0 ? paginatedEntradas.map((entrada) => (
                                <tr key={entrada.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entrada.albaranId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entrada.fechaHora).toLocaleString('es-ES')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrada.transportista}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{entrada.numeroPalets}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {entrada.incidencia ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Incidencia</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Correcto</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleViewDetails(entrada)} className="text-blue-600 hover:text-blue-800">Ver</button>
                                        <button onClick={() => handleOpenModal(entrada)} className="text-primary hover:text-yellow-400">Editar</button>
                                        {canDelete && (<button onClick={() => handleDeleteRequest(entrada.id)} className="text-red-600 hover:text-red-800">Eliminar</button>)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">
                                        No se encontraron entradas que coincidan con los filtros aplicados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t">
                        <span className="text-sm text-gray-700">
                            Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
                        </span>
                        <div className="flex gap-2">
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="secondary">
                                <ChevronLeftIcon className="w-4 h-4" /> Anterior
                            </Button>
                            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="secondary">
                                Siguiente <ChevronRightIcon className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEntrada ? 'Editar Entrada' : 'Registrar Nueva Entrada'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="albaranId" name="albaranId" label="Nº Albarán" type="text" value={formState.albaranId} onChange={handleChange} required style={{ textTransform: 'uppercase' }} />
                        <Input id="camionMatricula" name="camionMatricula" label="Matrícula Camión" type="text" value={formState.camionMatricula} onChange={handleChange} required style={{ textTransform: 'uppercase' }} />
                        <Input id="transportista" name="transportista" label="Transportista" type="text" value={formState.transportista} onChange={handleChange} required />
                        <Input id="conductor" name="conductor" label="Conductor" type="text" value={formState.conductor} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input id="fechaHora" name="fechaHora" label="Fecha y Hora" type="datetime-local" value={formState.fechaHora} onChange={handleChange} required />
                       <Input id="numeroPalets" name="numeroPalets" label="Número de Palets" type="number" value={formState.numeroPalets} onChange={handleChange} required />
                    </div>
                    <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado de la Entrada</label>
                        <select id="estado" value={estado} onChange={handleEstadoChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            <option value="Correcto">Correcto</option>
                            <option value="Incidencia">Incidencia</option>
                        </select>
                    </div>
                    {estado === 'Incidencia' && (
                        <div className="space-y-4 p-4 border border-yellow-300 rounded-md bg-yellow-50">
                            <h4 className="font-semibold text-yellow-800">Detalles de la Incidencia</h4>
                            <textarea id="incidencia" name="incidencia" value={formState.incidencia} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Describa el problema..."></textarea>
                        </div>
                    )}
                    <div className="pt-6 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                        <Button type="submit">{editingEntrada ? 'Guardar Cambios' : 'Registrar Entrada'}</Button>
                    </div>
                </form>
            </Modal>
            
            {viewingEntrada && (
                <Modal isOpen={!!viewingEntrada} onClose={handleCloseModal} title={`Detalles de Entrada: ${viewingEntrada.albaranId}`}>
                    {/* View details content remains the same */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-dark-gray">Información General</h4>
                            <p><strong>Conductor:</strong> {viewingEntrada.conductor}</p>
                            <p><strong>Fecha y Hora:</strong> {new Date(viewingEntrada.fechaHora).toLocaleString('es-ES')}</p>
                            <p><strong>Número de Palets:</strong> {viewingEntrada.numeroPalets}</p>
                            {viewingEntrada.incidencia && 
                                <div className="mt-2 p-3 rounded-md bg-yellow-50 border border-yellow-200">
                                    <p className="font-bold text-yellow-800">Incidencia Reportada:</p>
                                    <p className="text-yellow-700">{viewingEntrada.incidencia}</p>
                                </div>
                            }
                        </div>
                        <div>
                            <h4 className="font-semibold text-dark-gray mt-4 border-t pt-2">Palets Registrados ({viewingEntrada.pallets.length})</h4>
                            {viewingEntrada.pallets.length > 0 ? (
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    {viewingEntrada.pallets.map((pallet, index) => (
                                        <li key={index}>
                                            <button onClick={() => setViewingPallet(pallet)} className="text-blue-600 hover:underline font-semibold">{pallet.id}</button>
                                            <span className="text-gray-600"> ({getProductName(pallet.productId)}) - Lote: {pallet.lote}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-500 mt-2">No hay palets detallados para esta entrada.</p>}
                        </div>
                    </div>
                </Modal>
            )}

            {viewingPallet && (
                 <Modal isOpen={!!viewingPallet} onClose={() => setViewingPallet(null)} title={`Detalles del Palet: ${viewingPallet.id}`}>
                    <div className="space-y-2 text-sm">
                       <p><strong>Producto:</strong> <span className="text-gray-700">{getProductName(viewingPallet.productId)}</span></p>
                       <p><strong>Lote:</strong> <span className="text-gray-700">{viewingPallet.lote}</span></p>
                       <p><strong>SSCC:</strong> <span className="text-gray-700">{viewingPallet.sscc}</span></p>
                       <p><strong>Cajas por Palet:</strong> <span className="text-gray-700">{viewingPallet.cajasPorPalet}</span></p>
                       <p><strong>Botellas por Caja:</strong> <span className="text-gray-700">{viewingPallet.botellasPorCaja}</span></p>
                       <p><strong>Total Botellas:</strong> <span className="text-gray-700 font-bold">{(viewingPallet.cajasPorPalet * viewingPallet.botellasPorCaja).toLocaleString('es-ES')}</span></p>
                       <p><strong>Fecha de Entrada:</strong> <span className="text-gray-700">{viewingPallet.fechaEntrada}</span></p>
                       <p><strong>Estado:</strong> <span className="text-gray-700">{viewingPallet.estado}</span></p>
                    </div>
                 </Modal>
            )}

            <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Eliminación">
                {/* Delete confirmation content remains the same */}
                 <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">¿Eliminar Entrada?</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            ¿Estás seguro de que quieres eliminar esta entrada? Esta acción es irreversible.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>Cancelar</Button>
                        <Button type="button" variant="danger" onClick={handleConfirmDelete}>Sí, Eliminar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Entradas;