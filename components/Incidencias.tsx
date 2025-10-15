import React, { useState, useEffect } from 'react';
import { Incidencia, User, UserRole, Notification } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import Input from './common/Input';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface IncidenciasProps {
  user: User;
  incidencias: Incidencia[];
  onAddIncidencia: (incidencia: Omit<Incidencia, 'id' | 'fecha' | 'usuarioReporta'>) => Promise<void>;
  onUpdateIncidencia: (incidencia: Incidencia) => Promise<void>;
  onDeleteIncidencia: (id: string) => Promise<void>;
  addNotification: (message: string, type?: Notification['type']) => void;
}

const Incidencias: React.FC<IncidenciasProps> = ({ user, incidencias, onAddIncidencia, onUpdateIncidencia, onDeleteIncidencia, addNotification }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncidencia, setEditingIncidencia] = useState<Incidencia | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingIncidenciaId, setDeletingIncidenciaId] = useState<string | null>(null);

  const initialFormData = {
    tipo: 'Stock' as const,
    descripcion: '',
    estado: 'Pendiente' as const,
  };

  const [formState, setFormState] = useState<Omit<Incidencia, 'id' | 'fecha' | 'usuarioReporta'>>(initialFormData);

  useEffect(() => {
    if (isModalOpen) {
      if (editingIncidencia) {
        setFormState({
          tipo: editingIncidencia.tipo,
          descripcion: editingIncidencia.descripcion,
          estado: editingIncidencia.estado,
        });
      } else {
        setFormState(initialFormData);
      }
    }
  }, [editingIncidencia, isModalOpen]);

  const handleOpenModal = (incidencia: Incidencia | null) => {
    setEditingIncidencia(incidencia);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIncidencia(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (editingIncidencia) {
          await onUpdateIncidencia({
            ...editingIncidencia,
            ...formState,
          });
        } else {
          await onAddIncidencia(formState);
        }
        handleCloseModal();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocurrió un error al guardar la incidencia.';
        addNotification(message, 'error');
    }
  };
  
  const handleDeleteRequest = (id: string) => {
    setDeletingIncidenciaId(id);
    setIsConfirmDeleteOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!deletingIncidenciaId) return;
    try {
        await onDeleteIncidencia(deletingIncidenciaId);
        setIsConfirmDeleteOpen(false);
        setDeletingIncidenciaId(null);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Ocurrió un error al eliminar la incidencia.';
        addNotification(message, 'error');
        setIsConfirmDeleteOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-red-100 text-red-800';
      case 'En Revisión':
        return 'bg-yellow-100 text-yellow-800';
      case 'Solucionado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const canManage = user.role === UserRole.SuperUsuario || user.role === UserRole.Administrativo;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-gray">Gestión de Incidencias</h1>
        <Button onClick={() => handleOpenModal(null)}>Reportar Nueva Incidencia</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidencias.map((incidencia) => (
                <tr key={incidencia.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{incidencia.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incidencia.tipo}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-sm">{incidencia.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incidencia.fecha}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{incidencia.usuarioReporta}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(incidencia.estado)}`}>
                      {incidencia.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {canManage ? (
                      <>
                        <button onClick={() => handleOpenModal(incidencia)} className="text-primary hover:text-yellow-400 font-semibold">Editar</button>
                        <button onClick={() => handleDeleteRequest(incidencia.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingIncidencia ? 'Editar Incidencia' : 'Reportar Nueva Incidencia'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Incidencia</label>
            <select id="tipo" name="tipo" value={formState.tipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
              <option value="Entrada">Entrada</option>
              <option value="Creación de Pack">Creación de Pack</option>
              <option value="Salida">Salida</option>
              <option value="Stock">Stock</option>
            </select>
          </div>
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea id="descripcion" name="descripcion" value={formState.descripcion} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required></textarea>
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="estado" name="estado" value={formState.estado} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" disabled={!canManage}>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Solucionado">Solucionado</option>
            </select>
          </div>
          <div className="pt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button type="submit">{editingIncidencia ? 'Guardar Cambios' : 'Reportar Incidencia'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="Confirmar Eliminación">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">¿Eliminar Incidencia?</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que quieres eliminar esta incidencia? Esta acción es irreversible.
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

export default Incidencias;