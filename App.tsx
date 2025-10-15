// Fix: Implemented the main App component with state management and routing.
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Entradas from './components/Entradas';
import Stock from './components/Stock';
import CrearPack from './components/CrearPack';
import Salidas from './components/Salidas';
import Incidencias from './components/Incidencias';
import Usuarios from './components/Usuarios';
import Reportes from './components/Reportes';
import AuditLogViewer from './components/AuditLog';
import NotificationContainer from './components/NotificationContainer';
import GenerarEtiquetas from './components/GenerarEtiquetas';
import SyncData from './components/SyncData';
import { User, Page, UserRole, Entrada, Pallet, Pack, Salida, Incidencia, AuditLog, Notification } from './types';
import { mockUsers, mockEntradas, mockPallets, mockPacks, mockSalidas, mockIncidencias } from './data/mockData';
import { getAuditLogsFromStorage, saveAuditLogsToStorage } from './services/auditLogService';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
    
    // Data state
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [entradas, setEntradas] = useState<Entrada[]>(mockEntradas);
    const [pallets, setPallets] = useState<Pallet[]>(mockPallets);
    const [packs, setPacks] = useState<Pack[]>(mockPacks);
    const [salidas, setSalidas] = useState<Salida[]>(mockSalidas);
    const [incidencias, setIncidencias] = useState<Incidencia[]>(mockIncidencias);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        setAuditLogs(getAuditLogsFromStorage());
    }, []);

    const addAuditLog = (action: AuditLog['action'], entity: string, entityId: string | number) => {
        if (!currentUser) return;
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            action,
            entity,
            entityId,
        };
        const updatedLogs = [newLog, ...auditLogs];
        setAuditLogs(updatedLogs);
        saveAuditLogsToStorage(updatedLogs);
    };
    
    const addNotification = (message: string, type: Notification['type'] = 'info') => {
        const newNotification: Notification = {
            id: Date.now(),
            message,
            type,
        };
        setNotifications(prev => [...prev, newNotification]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
    };

    const handleLogin = (email: string, password: string): boolean => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            addAuditLog('LOGIN', 'User', user.id);
            addNotification(`Bienvenido, ${user.name}!`, 'success');
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        if (currentUser) {
             addAuditLog('LOGOUT', 'User', currentUser.id);
        }
        setCurrentUser(null);
        setCurrentPage(Page.Dashboard);
        addNotification('Has cerrado sesión.', 'info');
    };
    
    const handleAddEntrada = async (entrada: Omit<Entrada, 'id' | 'pallets'>): Promise<void> => {
        if (Math.random() < 0.2) {
            throw new Error('Error de red: No se pudo registrar la entrada.');
        }
        const newEntrada: Entrada = {
            ...entrada,
            id: `ENT${Date.now()}`,
            pallets: [], // In a real app, you'd add pallets here
        };
        setEntradas(prev => [newEntrada, ...prev]);
        addAuditLog('CREATE', 'Entrada', newEntrada.id);
        addNotification('Entrada registrada con éxito.', 'success');
    };

    const handleUpdateEntrada = async (updatedEntrada: Entrada): Promise<void> => {
        if (Math.random() < 0.2) {
            throw new Error('Error de base de datos: La entrada no pudo ser actualizada.');
        }
        setEntradas(prev => prev.map(e => e.id === updatedEntrada.id ? updatedEntrada : e));
        addAuditLog('UPDATE', 'Entrada', updatedEntrada.id);
        addNotification(`Entrada ${updatedEntrada.albaranId} actualizada.`, 'success');
    };
    
    const handleDeleteEntrada = async (id: string): Promise<void> => {
        if (Math.random() < 0.2) {
            throw new Error('Error de permisos: No tienes autorización para eliminar esta entrada.');
        }
        setEntradas(prev => prev.filter(e => e.id !== id));
        addAuditLog('DELETE', 'Entrada', id);
        addNotification('Entrada eliminada.', 'success');
    };

    const handleAddPack = (pack: Omit<Pack, 'id' | 'fechaCreacion' | 'estado' | 'etiquetaUrl'>) => {
        const newPack: Pack = {
            ...pack,
            id: `PACK${Date.now()}`,
            fechaCreacion: new Date().toLocaleString('es-ES'),
            estado: 'Creado',
            etiquetaUrl: '#',
        };
        setPacks(prev => [newPack, ...prev]);
        addAuditLog('CREATE', 'Pack', newPack.id);
        addNotification('Pack creado con éxito.', 'success');
    };
    
    const handleAddSalida = async (salida: Omit<Salida, 'id' | 'packs'>): Promise<void> => {
        if (Math.random() < 0.2) {
            throw new Error('Error de red: No se pudo registrar la salida.');
        }
        const newSalida: Salida = {
            ...salida,
            id: `SAL${Date.now()}`,
            packs: [], // In real app, associate packs
        };
        setSalidas(prev => [newSalida, ...prev]);
        addAuditLog('CREATE', 'Salida', newSalida.id);
        addNotification('Salida registrada con éxito.', 'success');
    };

    const handleUpdateSalida = async (updatedSalida: Salida): Promise<void> => {
        if (Math.random() < 0.2) {
            throw new Error('Error de base de datos: La salida no pudo ser actualizada.');
        }
        setSalidas(prev => prev.map(s => s.id === updatedSalida.id ? updatedSalida : s));
        addAuditLog('UPDATE', 'Salida', updatedSalida.id);
        addNotification(`Salida ${updatedSalida.albaranSalidaId} actualizada.`, 'success');
    };

    const handleDeleteSalida = async (id: string): Promise<void> => {
        if (Math.random() < 0.2) {
            throw new Error('Error de permisos: No tienes autorización para eliminar esta salida.');
        }
        setSalidas(prev => prev.filter(s => s.id !== id));
        addAuditLog('DELETE', 'Salida', id);
        addNotification('Salida eliminada.', 'success');
    };

    const handleAddIncidencia = async (incidencia: Omit<Incidencia, 'id' | 'fecha' | 'usuarioReporta'>): Promise<void> => {
        if (!currentUser) return;
        if (Math.random() < 0.2) {
            throw new Error('Error de red: No se pudo reportar la incidencia.');
        }
        const newIncidencia: Incidencia = {
            ...incidencia,
            id: `INC${Date.now()}`,
            fecha: new Date().toLocaleDateString('es-ES'),
            usuarioReporta: currentUser.name,
        };
        setIncidencias(prev => [newIncidencia, ...prev]);
        addAuditLog('CREATE', 'Incidencia', newIncidencia.id);
        addNotification('Incidencia reportada con éxito.', 'success');
    };

    const handleUpdateIncidencia = async (updatedIncidencia: Incidencia): Promise<void> => {
        if (Math.random() < 0.2) {
            throw new Error('Error de base de datos: La incidencia no pudo ser actualizada.');
        }
        setIncidencias(prev => prev.map(i => i.id === updatedIncidencia.id ? updatedIncidencia : i));
        addAuditLog('UPDATE', 'Incidencia', updatedIncidencia.id);
        addNotification(`Incidencia ${updatedIncidencia.id} actualizada.`, 'success');
    };

    const handleDeleteIncidencia = async (id: string): Promise<void> => {
        if (Math.random() < 0.2) {
            throw new Error('Error de permisos: No tienes autorización para eliminar esta incidencia.');
        }
        setIncidencias(prev => prev.filter(i => i.id !== id));
        addAuditLog('DELETE', 'Incidencia', id);
        addNotification('Incidencia eliminada.', 'success');
    };
    
    const handleAddUser = (user: Omit<User, 'id'>) => {
        const newUser: User = {
            ...user,
            id: Date.now(),
        };
        setUsers(prev => [newUser, ...prev]);
        addAuditLog('CREATE', 'User', newUser.id);
        addNotification('Usuario creado con éxito.', 'success');
    };
    
    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        addAuditLog('UPDATE', 'User', updatedUser.id);
        addNotification(`Usuario ${updatedUser.name} actualizado.`, 'success');
    };
    
    const handleDeleteUser = (userId: number) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addAuditLog('DELETE', 'User', userId);
        addNotification('Usuario eliminado.', 'success');
    };
    
    const renderPage = () => {
        if (!currentUser) return null;
        switch (currentPage) {
            case Page.Dashboard:
                return <Dashboard setCurrentPage={setCurrentPage} />;
            case Page.Entradas:
                return <Entradas user={currentUser} entradas={entradas} onAddEntrada={handleAddEntrada} onUpdateEntrada={handleUpdateEntrada} onDeleteEntrada={handleDeleteEntrada} addNotification={addNotification} />;
            case Page.Stock:
                return <Stock pallets={pallets} packs={packs} />;
            case Page.CrearPack:
                return <CrearPack onAddPack={handleAddPack} />;
            case Page.GenerarEtiquetas:
                if (currentUser.role !== UserRole.SuperUsuario && currentUser.role !== UserRole.Almacen) {
                    setCurrentPage(Page.Dashboard);
                    return <Dashboard setCurrentPage={setCurrentPage} />;
                }
                return <GenerarEtiquetas addNotification={addNotification} />;
            case Page.Salidas:
                return <Salidas user={currentUser} salidas={salidas} onAddSalida={handleAddSalida} onUpdateSalida={handleUpdateSalida} onDeleteSalida={handleDeleteSalida} addNotification={addNotification} />;
            case Page.Incidencias:
                return <Incidencias user={currentUser} incidencias={incidencias} onAddIncidencia={handleAddIncidencia} onUpdateIncidencia={handleUpdateIncidencia} onDeleteIncidencia={handleDeleteIncidencia} addNotification={addNotification}/>;
            case Page.Usuarios:
                 if (currentUser.role !== UserRole.SuperUsuario) {
                    setCurrentPage(Page.Dashboard);
                    return <Dashboard setCurrentPage={setCurrentPage} />;
                 }
                return <Usuarios users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />;
            case Page.Reportes:
                return <Reportes 
                    pallets={pallets}
                    packs={packs}
                    entradas={entradas}
                    salidas={salidas}
                    incidencias={incidencias}
                    addNotification={addNotification}
                />;
            case Page.Auditoria:
                if (currentUser.role !== UserRole.SuperUsuario && currentUser.role !== UserRole.Administrativo) {
                    setCurrentPage(Page.Dashboard);
                    return <Dashboard setCurrentPage={setCurrentPage} />;
                }
                return <AuditLogViewer logs={auditLogs} />;
            case Page.Sincronizacion:
                if (currentUser.role !== UserRole.SuperUsuario) {
                    setCurrentPage(Page.Dashboard);
                    return <Dashboard setCurrentPage={setCurrentPage} />;
                }
                return <SyncData />;
            default:
                return <Dashboard setCurrentPage={setCurrentPage} />;
        }
    };

    if (!currentUser) {
        const handleRegister = (user: Omit<User, 'id'>): boolean => {
            const newUser: User = {
                ...user,
                id: Date.now(),
            };
            if (users.some(u => u.email === newUser.email)) {
                addNotification('El correo electrónico ya está registrado.', 'error');
                return false;
            }
            setUsers(prev => [newUser, ...prev]);
            addNotification('Usuario creado con éxito. Ahora puedes iniciar sesión.', 'success');
            return true;
        };

        return <Login onLogin={handleLogin} onRegister={handleRegister} />;
    }

    return (
        <div className="flex h-screen bg-light-gray">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} user={currentUser} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={currentUser} onLogout={handleLogout} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-gray p-6">
                    {renderPage()}
                </main>
            </div>
            <NotificationContainer notifications={notifications} onClose={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
        </div>
    );
};

export default App;