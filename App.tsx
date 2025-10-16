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
import { User, Page, UserRole, Entrada, Pallet, Pack, Salida, Incidencia, AuditLog, Notification, PackProducto } from './types';
import { mockUsers, mockEntradas, mockPallets, mockPacks, mockSalidas, mockIncidencias } from './data/mockData';
import { getAuditLogsFromStorage, saveAuditLogsToStorage } from './services/auditLogService';
import { supabase } from './services/supabaseClient';

const mapToCamelCase = (data: any[]) => {
    if (!data) return [];
    return data.map(item => {
        const newItem: { [key: string]: any } = {};
        for (const key in item) {
            const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
            newItem[camelKey] = item[key];
        }
        return newItem;
    });
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Data state
    const [users, setUsers] = useState<User[]>([]);
    const [entradas, setEntradas] = useState<Entrada[]>([]);
    const [pallets, setPallets] = useState<Pallet[]>([]);
    const [packs, setPacks] = useState<Pack[]>([]);
    const [salidas, setSalidas] = useState<Salida[]>([]);
    const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

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

    useEffect(() => {
        const fetchData = async () => {
            addNotification('Sincronizando datos con Supabase...', 'info');

            const [usersRes, entradasRes, palletsRes, packsRes, packProductosRes, salidasRes, salidaPacksRes, incidenciasRes] = await Promise.all([
                supabase.from('profiles').select('*').order('id'),
                supabase.from('entradas').select('*').order('fecha_hora', { ascending: false }),
                supabase.from('pallets').select('*'),
                supabase.from('packs').select('*').order('fecha_creacion', { ascending: false }),
                supabase.from('pack_productos').select('*'),
                supabase.from('salidas').select('*').order('fecha_hora', { ascending: false }),
                supabase.from('salida_packs').select('*'),
                supabase.from('incidencias').select('*').order('fecha', { ascending: false })
            ]);

            let hasError = false;

            // Process Users
            if (usersRes.error) { hasError = true; console.error('Users Error:', usersRes.error); setUsers(mockUsers); } 
            else { setUsers(usersRes.data || []); }

            // Process Pallets
            let appPallets: Pallet[] = [];
            if (palletsRes.error) { hasError = true; console.error('Pallets Error:', palletsRes.error); setPallets(mockPallets); appPallets = mockPallets; } 
            else { appPallets = mapToCamelCase(palletsRes.data) as Pallet[]; setPallets(appPallets); }

            // Process Entradas and associate pallets
            if (entradasRes.error) { hasError = true; console.error('Entradas Error:', entradasRes.error); setEntradas(mockEntradas); } 
            else {
                const appEntradas = mapToCamelCase(entradasRes.data) as Entrada[];
                appEntradas.forEach(entrada => {
                    entrada.pallets = appPallets.filter(p => (p as any).entradaId === entrada.id);
                });
                setEntradas(appEntradas);
            }

            // Process Pack Productos
            let appPackProductos: any[] = [];
            if (packProductosRes.error) { hasError = true; console.error('Pack Productos Error:', packProductosRes.error); } 
            else { appPackProductos = mapToCamelCase(packProductosRes.data); }

            // Process Packs and associate products
            const appPacksFromDb = packsRes.data ? mapToCamelCase(packsRes.data) as Pack[] : [];
            if (packsRes.error) { hasError = true; console.error('Packs Error:', packsRes.error); setPacks(mockPacks); } 
            else {
                appPacksFromDb.forEach(pack => {
                    pack.productos = appPackProductos
                        .filter(pp => pp.packId === pack.id)
                        .map(pp => ({ productId: pp.productId, lote: pp.lote, cantidad: pp.cantidad }));
                });
                setPacks(appPacksFromDb);
            }
            
            // Process Salida Packs
            let appSalidaPacks: any[] = [];
            if (salidaPacksRes.error) { hasError = true; console.error('Salida Packs Error:', salidaPacksRes.error); }
            else { appSalidaPacks = mapToCamelCase(salidaPacksRes.data); }

            // Process Salidas and associate packs
            if (salidasRes.error) { hasError = true; console.error('Salidas Error:', salidasRes.error); setSalidas(mockSalidas); } 
            else {
                const appSalidas = mapToCamelCase(salidasRes.data) as Salida[];
                appSalidas.forEach(salida => {
                    const associatedPackIds = appSalidaPacks.filter(sp => sp.salidaId === salida.id).map(sp => sp.packId);
                    salida.packs = appPacksFromDb.filter(p => associatedPackIds.includes(p.id));
                });
                setSalidas(appSalidas);
            }
            
            // Process Incidencias
            if (incidenciasRes.error) { hasError = true; console.error('Incidencias Error:', incidenciasRes.error); setIncidencias(mockIncidencias); } 
            else { setIncidencias(mapToCamelCase(incidenciasRes.data) as Incidencia[]); }

            if (hasError) {
                addNotification('Error al cargar algunos datos. Se usaron datos locales de respaldo.', 'error');
            } else {
                addNotification('Datos sincronizados correctamente.', 'success');
            }
        };


        fetchData();
        setAuditLogs(getAuditLogsFromStorage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleLogin = async (email: string, password: string): Promise<boolean> => {
        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .eq('password', password) // Insecure, but matches current app logic
            .single();

        if (error || !user) {
            console.error('Login error:', error?.message);
            return false;
        }

        setCurrentUser(user as User);
        addAuditLog('LOGIN', 'User', user.id);
        addNotification(`Bienvenido, ${user.name}!`, 'success');
        return true;
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
        const newId = `ENT${Date.now()}`;
        const newEntrada: Entrada = { ...entrada, id: newId, pallets: [] };

        const { error } = await supabase.from('entradas').insert([{ 
            id: newEntrada.id,
            albaran_id: newEntrada.albaranId,
            camion_matricula: newEntrada.camionMatricula,
            transportista: newEntrada.transportista,
            conductor: newEntrada.conductor,
            fecha_hora: newEntrada.fechaHora,
            numero_palets: newEntrada.numeroPalets,
            incidencia: newEntrada.incidencia,
            incidencia_imagenes: newEntrada.incidenciaImagenes,
            pallet_label_imagenes: newEntrada.palletLabelImagenes,
        }]);

        if (error) throw new Error(`Error al registrar entrada: ${error.message}`);

        setEntradas(prev => [newEntrada, ...prev]);
        addAuditLog('CREATE', 'Entrada', newEntrada.id);
        addNotification('Entrada registrada con éxito.', 'success');
    };

    const handleUpdateEntrada = async (updatedEntrada: Entrada): Promise<void> => {
        const { pallets, ...updateData } = updatedEntrada;
        const { error } = await supabase.from('entradas').update({
            albaran_id: updateData.albaranId,
            camion_matricula: updateData.camionMatricula,
            transportista: updateData.transportista,
            conductor: updateData.conductor,
            fecha_hora: updateData.fechaHora,
            numero_palets: updateData.numeroPalets,
            incidencia: updateData.incidencia,
            incidencia_imagenes: updateData.incidenciaImagenes,
            pallet_label_imagenes: updateData.palletLabelImagenes,
        }).eq('id', updateData.id);

        if (error) throw new Error(`Error al actualizar entrada: ${error.message}`);
        
        setEntradas(prev => prev.map(e => e.id === updatedEntrada.id ? updatedEntrada : e));
        addAuditLog('UPDATE', 'Entrada', updatedEntrada.id);
        addNotification(`Entrada ${updatedEntrada.albaranId} actualizada.`, 'success');
    };
    
    const handleDeleteEntrada = async (id: string): Promise<void> => {
        const { error } = await supabase.from('entradas').delete().eq('id', id);

        if (error) throw new Error(`Error al eliminar entrada: ${error.message}`);

        setEntradas(prev => prev.filter(e => e.id !== id));
        addAuditLog('DELETE', 'Entrada', id);
        addNotification('Entrada eliminada.', 'success');
    };

    const handleAddPack = async (pack: Omit<Pack, 'id' | 'fechaCreacion' | 'estado' | 'etiquetaUrl'>) => {
        const newPack: Pack = {
            ...pack,
            id: `PACK${Date.now()}`,
            fechaCreacion: new Date().toISOString(),
            estado: 'Creado',
            etiquetaUrl: `https://via.placeholder.com/400x200.png?text=Etiqueta+${pack.pedidoCliente}`,
        };
    
        const { error: packError } = await supabase.from('packs').insert([{
            id: newPack.id,
            pedido_cliente: newPack.pedidoCliente,
            fecha_creacion: newPack.fechaCreacion,
            estado: newPack.estado,
            etiqueta_url: newPack.etiquetaUrl,
        }]);
    
        if (packError) throw new Error(`Error al crear el pack: ${packError.message}`);
    
        if (newPack.productos.length > 0) {
            const packProductosToInsert = newPack.productos.map(p => ({
                pack_id: newPack.id,
                product_id: p.productId,
                lote: p.lote,
                cantidad: p.cantidad,
            }));
            const { error: packProductosError } = await supabase.from('pack_productos').insert(packProductosToInsert);
            if (packProductosError) {
                await supabase.from('packs').delete().eq('id', newPack.id); // Attempt rollback
                throw new Error(`Error al añadir productos al pack: ${packProductosError.message}`);
            }
        }
    
        setPacks(prev => [newPack, ...prev]);
        addAuditLog('CREATE', 'Pack', newPack.id);
        addNotification('Pack creado con éxito.', 'success');
    };
    
    const handleAddSalida = async (salida: Omit<Salida, 'id' | 'packs'>): Promise<void> => {
        const newId = `SAL${Date.now()}`;
        const newSalida: Salida = { ...salida, id: newId, packs: [] };
        
        const { error } = await supabase.from('salidas').insert([{
            id: newSalida.id,
            albaran_salida_id: newSalida.albaranSalidaId,
            cliente: newSalida.cliente,
            fecha_hora: newSalida.fechaHora,
            conductor: newSalida.conductor,
            camion_matricula: newSalida.camionMatricula,
            transportista: newSalida.transportista,
        }]);

        if (error) throw new Error(`Error al registrar salida: ${error.message}`);

        setSalidas(prev => [newSalida, ...prev]);
        addAuditLog('CREATE', 'Salida', newSalida.id);
        addNotification('Salida registrada con éxito.', 'success');
    };

    const handleUpdateSalida = async (updatedSalida: Salida): Promise<void> => {
        const { packs, ...updateData } = updatedSalida;
        const { error } = await supabase.from('salidas').update({
            albaran_salida_id: updateData.albaranSalidaId,
            cliente: updateData.cliente,
            fecha_hora: updateData.fechaHora,
            conductor: updateData.conductor,
            camion_matricula: updateData.camionMatricula,
            transportista: updateData.transportista,
        }).eq('id', updateData.id);

        if (error) throw new Error(`Error al actualizar salida: ${error.message}`);

        setSalidas(prev => prev.map(s => s.id === updatedSalida.id ? updatedSalida : s));
        addAuditLog('UPDATE', 'Salida', updatedSalida.id);
        addNotification(`Salida ${updatedSalida.albaranSalidaId} actualizada.`, 'success');
    };

    const handleDeleteSalida = async (id: string): Promise<void> => {
        const { error } = await supabase.from('salidas').delete().eq('id', id);
        
        if (error) throw new Error(`Error al eliminar salida: ${error.message}`);
        
        setSalidas(prev => prev.filter(s => s.id !== id));
        addAuditLog('DELETE', 'Salida', id);
        addNotification('Salida eliminada.', 'success');
    };

    const handleAddIncidencia = async (incidencia: Omit<Incidencia, 'id' | 'fecha' | 'usuarioReporta'>): Promise<void> => {
        if (!currentUser) throw new Error("Usuario no autenticado.");

        const newIncidencia: Incidencia = {
            ...incidencia,
            id: `INC${Date.now()}`,
            fecha: new Date().toISOString(),
            usuarioReporta: currentUser.name,
        };

        const { error } = await supabase.from('incidencias').insert([{
            id: newIncidencia.id,
            tipo: newIncidencia.tipo,
            descripcion: newIncidencia.descripcion,
            fecha: newIncidencia.fecha,
            estado: newIncidencia.estado,
            usuario_reporta: newIncidencia.usuarioReporta,
        }]);

        if (error) throw new Error(`Error al reportar incidencia: ${error.message}`);

        setIncidencias(prev => [newIncidencia, ...prev]);
        addAuditLog('CREATE', 'Incidencia', newIncidencia.id);
        addNotification('Incidencia reportada con éxito.', 'success');
    };

    const handleUpdateIncidencia = async (updatedIncidencia: Incidencia): Promise<void> => {
        const { error } = await supabase.from('incidencias').update({
            tipo: updatedIncidencia.tipo,
            descripcion: updatedIncidencia.descripcion,
            estado: updatedIncidencia.estado,
        }).eq('id', updatedIncidencia.id);

        if (error) throw new Error(`Error al actualizar incidencia: ${error.message}`);

        setIncidencias(prev => prev.map(i => i.id === updatedIncidencia.id ? updatedIncidencia : i));
        addAuditLog('UPDATE', 'Incidencia', updatedIncidencia.id);
        addNotification(`Incidencia ${updatedIncidencia.id} actualizada.`, 'success');
    };

    const handleDeleteIncidencia = async (id: string): Promise<void> => {
        const { error } = await supabase.from('incidencias').delete().eq('id', id);
        
        if (error) throw new Error(`Error al eliminar incidencia: ${error.message}`);

        setIncidencias(prev => prev.filter(i => i.id !== id));
        addAuditLog('DELETE', 'Incidencia', id);
        addNotification('Incidencia eliminada.', 'success');
    };
    
    const handleAddUser = async (user: Omit<User, 'id'>) => {
        const { error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
        });

        if (authError) {
            addNotification(`Error al crear usuario en Supabase Auth: ${authError.message}`, 'error');
            return;
        }

        const { data: maxIdUser, error: maxIdError } = await supabase
            .from('profiles')
            .select('id')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        if (maxIdError && maxIdError.code !== 'PGRST116') {
            addNotification(`Error al preparar la creación de perfil: ${maxIdError.message}`, 'error');
            return;
        }

        const newId = (maxIdUser?.id || 0) + 1;
        const userWithId = { ...user, id: newId };

        const { data, error } = await supabase
            .from('profiles')
            .insert([userWithId])
            .select()
            .single();

        if (error) {
            addNotification(`Error al crear perfil de usuario: ${error.message}`, 'error');
            return;
        }

        if (data) {
            setUsers(prev => [data as User, ...prev]);
            addAuditLog('CREATE', 'User', data.id);
            addNotification('Usuario creado con éxito en Supabase Auth y en perfiles.', 'success');
        }
    };
    
    const handleUpdateUser = async (updatedUser: User) => {
        const { id, ...updateData } = updatedUser;

        if ('password' in updateData && !updateData.password) {
            delete (updateData as Partial<User>).password;
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            addNotification(`Error al actualizar usuario: ${error.message}`, 'error');
            return;
        }

        if (data) {
            setUsers(prev => prev.map(u => (u.id === id ? (data as User) : u)));
            addAuditLog('UPDATE', 'User', id);
            addNotification(`Usuario ${data.name} actualizado.`, 'success');
        }
    };
    
    const handleDeleteUser = async (userId: number) => {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            addNotification(`Error al eliminar usuario: ${error.message}`, 'error');
            return;
        }

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
        const handleRegister = async (user: Omit<User, 'id'>): Promise<boolean> => {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: user.email,
                password: user.password,
            });

            if (authError || !authData.user) {
                addNotification(`Error en el registro: ${authError?.message || 'No se pudo crear el usuario en Auth.'}`, 'error');
                return false;
            }
            
            const { data: maxIdUser, error: maxIdError } = await supabase
                .from('profiles')
                .select('id')
                .order('id', { ascending: false })
                .limit(1)
                .single();

            if (maxIdError && maxIdError.code !== 'PGRST116') {
                addNotification(`Error al preparar registro de perfil: ${maxIdError.message}`, 'error');
                return false;
            }
            
            const newId = (maxIdUser?.id || 0) + 1;
            const userWithId = { ...user, id: newId };

            const { data: newUser, error: insertError } = await supabase
                .from('profiles')
                .insert([userWithId])
                .select()
                .single();

            if (insertError || !newUser) {
                addNotification(`Error al crear perfil: ${insertError?.message || 'No se pudo crear el perfil de usuario.'}`, 'error');
                return false;
            }
            
            setUsers(prev => [newUser as User, ...prev]);
            addNotification('Usuario registrado con éxito. Ahora puedes iniciar sesión.', 'success');
            return true;
        };

        return <Login onLogin={handleLogin} onRegister={handleRegister} />;
    }

    return (
        <div className="relative min-h-screen md:flex bg-light-gray">
            <Sidebar 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                user={currentUser} 
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
             {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={currentUser} onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-gray p-4 md:p-6">
                    {renderPage()}
                </main>
            </div>
            <NotificationContainer notifications={notifications} onClose={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
        </div>
    );
};

export default App;