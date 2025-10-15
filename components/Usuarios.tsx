// Fix: Implemented the Usuarios component to display and manage users.
import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Modal from './common/Modal';
import Input from './common/Input';
import { User, UserRole } from '../types';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface UsuariosProps {
    users: User[];
    onAddUser: (user: Omit<User, 'id'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: number) => void;
}

const Usuarios: React.FC<UsuariosProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);


    const initialFormData = {
        name: '',
        email: '',
        password: '',
        role: UserRole.Almacen,
    };
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (editingUser) {
            setFormData({
                name: editingUser.name,
                email: editingUser.email,
                password: '', // Password field is cleared for security
                role: editingUser.role,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [editingUser, isModalOpen]);

    const handleOpenModal = (user: User | null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };
    
    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setDeletingUserId(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            onUpdateUser({
                ...editingUser,
                ...formData,
                password: formData.password ? formData.password : editingUser.password,
            });
        } else {
            if (!formData.password) {
                alert('La contraseña es obligatoria para nuevos usuarios.');
                return;
            }
            onAddUser(formData);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (userId: number) => {
        setDeletingUserId(userId);
        setIsConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (deletingUserId !== null) {
            onDeleteUser(deletingUserId);
        }
        handleCloseConfirmModal();
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case UserRole.SuperUsuario:
                return 'bg-purple-100 text-purple-800';
            case UserRole.Administrativo:
                return 'bg-blue-100 text-blue-800';
            case UserRole.Almacen:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark-gray">Gestión de Usuarios</h1>
                <Button onClick={() => handleOpenModal(null)}>Añadir Usuario</Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleOpenModal(user)} className="text-primary hover:text-yellow-400 font-semibold">Editar</button>
                                        <button onClick={() => handleDeleteRequest(user.id)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="name" name="name" label="Nombre Completo" type="text" value={formData.name} onChange={handleChange} required />
                    <Input id="email" name="email" label="Correo Electrónico" type="email" value={formData.email} onChange={handleChange} required />
                    <Input id="password" name="password" label="Contraseña" type="password" placeholder={editingUser ? 'Dejar en blanco para no cambiar' : ''} onChange={handleChange} required={!editingUser} />
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol de Usuario</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                            {Object.values(UserRole).map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-6 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
                        <Button type="submit">{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isConfirmModalOpen} onClose={handleCloseConfirmModal} title="Confirmar Eliminación">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">¿Eliminar Usuario?</h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            ¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseConfirmModal}>
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

export default Usuarios;