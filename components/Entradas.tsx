import React, { useState, useEffect } from 'react';
import { mockProducts } from '../data/mockData';
import { Entrada, User, UserRole, Pallet } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import Input from './common/Input';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface EntradasProps {
    user: User;
    entradas: Entrada[];
    onAddEntrada: (entrada: Omit<Entrada, 'id' | 'pallets'>) => void;
    onUpdateEntrada: (entrada: Entrada) => void;
    onDeleteEntrada: (id: string) => void;
}

const Entradas: React.FC<EntradasProps> = ({ user, entradas, onAddEntrada, onUpdateEntrada, onDeleteEntrada }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntrada, setEditingEntrada] = useState<Entrada | null>(null);
    const [viewingEntrada, setViewingEntrada] = useState<Entrada | null>(null);
    const [viewingPallet, setViewingPallet] = useState<Pallet | null>(null);
    const [estado, setEstado] = useState<'Correcto' | 'Incidencia'>('Correcto');
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [deletingEntradaId, setDeletingEntradaId] = useState<string | null>(null);

    const initialFormData = {
        albaranId: '',
        camionMatricula: '',
        transportista: '',
        conductor: '',
        fechaHora: '',
        numeroPalets: 0,
        incidencia: '',
        incidenciaImagenes: [],
        palletLabelImagenes: [],
    };

    const [formState, setFormState] = useState<Omit<Entrada, 'id' | 'pallets'>>(initialFormData);
    
    useEffect(() => {
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
    }, [editingEntrada, isModalOpen]);

    const handleOpenModal = (entrada: Entrada | null) => {
        setEditingEntrada(entrada);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEntrada(null);
        setViewingEntrada(null);
    };
    
    const handleViewDetails = (entrada: Entrada) => {
        setViewingEntrada(entrada);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value 
        }));
    };
    
    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEstado = e.target.value as 'Correcto' | 'Incidencia';
        setEstado(newEstado);
        if (newEstado === 'Correcto') {
            setFormState(prev => ({ ...prev, incidencia: '', incidenciaImagenes: [] }));
        }
    };

    const handleDeleteImage = (type: 'pallet' | 'incidencia', indexToDelete: number) => {
        if (type === 'pallet') {
            setFormState(prev => ({
                ...prev,
                palletLabelImagenes: prev.palletLabelImagenes?.filter((_, index) => index !== indexToDelete)
            }));
        } else {
            setFormState(prev => ({
                ...prev,
                incidenciaImagenes: prev.incidenciaImagenes?.filter((_, index) => index !== indexToDelete)
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submissionData = { ...formState };
        if (estado === 'Correcto') {
            submissionData.incidencia = '';
            submissionData.incidenciaImagenes = [];
        }

        if (editingEntrada) {
            const updatedEntrada: Entrada = { 
                ...editingEntrada, 
                ...submissionData,
            };
            onUpdateEntrada(updatedEntrada);
        } else {
            onAddEntrada(submissionData);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (id: string) => {
        setDeletingEntradaId(id);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingEntradaId) {
            onDeleteEntrada(deletingEntradaId);
        }
        setIsConfirmDeleteOpen(false);
        setDeletingEntradaId(null);
    };

    const getProductName = (productId: string) => {
        return mockProducts.find(p => p.id === productId)?.name || 'Desconocido';
    };

    const canDelete = user.role === UserRole.SuperUsuario || user.role === UserRole.Administrativo;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark-gray">Gestión de Entradas</h1>
                <Button onClick={() => handleOpenModal(null)}>Registrar Nueva Entrada</Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Albarán</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matrícula Camión</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transportista</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Palets</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {entradas.map((entrada) => (
                                <tr key={entrada.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entrada.albaranId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrada.camionMatricula}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrada.transportista}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrada.fechaHora}</td>
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
                                        {canDelete && (
                                          <button onClick={() => handleDeleteRequest(entrada.id)} className="text-red-600 hover:text-red-800">Eliminar</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingEntrada ? 'Editar Entrada' : 'Registrar Nueva Entrada'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="albaranId" name="albaranId" label="Nº Albarán" type="text" value={formState.albaranId} onChange={handleChange} required />
                        <Input id="camionMatricula" name="camionMatricula" label="Matrícula Camión" type="text" value={formState.camionMatricula} onChange={handleChange} required />
                        <Input id="transportista" name="transportista" label="Transportista" type="text" value={formState.transportista} onChange={handleChange} required />
                        <Input id="conductor" name="conductor" label="Conductor" type="text" value={formState.conductor} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input id="fechaHora" name="fechaHora" label="Fecha y Hora" type="datetime-local" value={formState.fechaHora} onChange={handleChange} required />
                       <Input id="numeroPalets" name="numeroPalets" label="Número de Palets" type="number" value={formState.numeroPalets} onChange={handleChange} required />
                    </div>

                    <div className="space-y-4 p-4 border border-gray-200 rounded-md">
                        <h4 className="font-semibold text-dark-gray">Etiquetas de Palet</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar Imágenes de Etiquetas (Opcional)</label>
                            <input type="file" multiple className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-dark hover:file:bg-yellow-300" />
                        </div>
                        {formState.palletLabelImagenes && formState.palletLabelImagenes.length > 0 && (
                            <div>
                                <h5 className="font-semibold text-dark-gray text-sm">Imágenes Actuales:</h5>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {formState.palletLabelImagenes.map((imgUrl, index) => (
                                        <div key={index} className="relative">
                                            <img src={imgUrl} alt={`Etiqueta ${index + 1}`} className="w-24 h-24 object-cover rounded-md border" />
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteImage('pallet', index)}
                                                className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold hover:bg-red-800 transition-transform duration-200 ease-in-out transform hover:scale-110"
                                                aria-label="Eliminar imagen"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            <div>
                                <label htmlFor="incidencia" className="block text-sm font-medium text-gray-700 mb-1">Descripción de la Incidencia</label>
                                <textarea id="incidencia" name="incidencia" value={formState.incidencia} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Describa el problema..."></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar Imágenes de Evidencia (Opcional)</label>
                                <input type="file" multiple className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-dark hover:file:bg-yellow-300" />
                            </div>
                            {formState.incidenciaImagenes && formState.incidenciaImagenes.length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-dark-gray text-sm">Imágenes de Evidencia Actuales:</h5>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {formState.incidenciaImagenes.map((imgUrl, index) => (
                                             <div key={index} className="relative">
                                                <img src={imgUrl} alt={`Incidencia ${index + 1}`} className="w-24 h-24 object-cover rounded-md border" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteImage('incidencia', index)}
                                                    className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold hover:bg-red-800 transition-transform duration-200 ease-in-out transform hover:scale-110"
                                                    aria-label="Eliminar imagen de incidencia"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-dark-gray">Información General</h4>
                            <p><strong>Conductor:</strong> {viewingEntrada.conductor}</p>
                            <p><strong>Fecha y Hora:</strong> {viewingEntrada.fechaHora}</p>
                            <p><strong>Número de Palets:</strong> {viewingEntrada.numeroPalets}</p>
                            {viewingEntrada.palletLabelImagenes && viewingEntrada.palletLabelImagenes.length > 0 && (
                                <div className="mt-2">
                                    <h5 className="font-semibold text-dark-gray text-sm">Imágenes de Etiquetas de Palet:</h5>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {viewingEntrada.palletLabelImagenes.map((imgUrl, index) => (
                                            <a key={index} href={imgUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={imgUrl} alt={`Etiqueta ${index + 1}`} className="w-24 h-24 object-cover rounded-md border hover:ring-2 hover:ring-primary" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {viewingEntrada.incidencia && 
                                <div className="mt-2 p-3 rounded-md bg-yellow-50 border border-yellow-200">
                                    <p className="font-bold text-yellow-800">Incidencia Reportada:</p>
                                    <p className="text-yellow-700">{viewingEntrada.incidencia}</p>
                                    {viewingEntrada.incidenciaImagenes && viewingEntrada.incidenciaImagenes.length > 0 && (
                                        <div className="mt-2">
                                            <h5 className="font-semibold text-dark-gray text-sm">Imágenes de Evidencia:</h5>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {viewingEntrada.incidenciaImagenes.map((imgUrl, index) => (
                                                    <a key={index} href={imgUrl} target="_blank" rel="noopener noreferrer">
                                                        <img  src={imgUrl} alt={`Incidencia ${index + 1}`} className="w-24 h-24 object-cover rounded-md border hover:ring-2 hover:ring-primary" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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

export default Entradas;