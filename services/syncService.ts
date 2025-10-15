import { supabase } from './supabaseClient';
import { mockUsers, mockProducts, mockEntradas, mockPacks, mockSalidas, mockIncidencias, mockPallets } from '../data/mockData';
import { Pallet } from '../types';

/**
 * Sincroniza todos los datos de prueba locales con la base de datos de Supabase.
 * Utiliza 'upsert' para crear nuevos registros o actualizar los existentes.
 * @param logCallback Una función para recibir mensajes de estado durante el proceso.
 */
export async function syncAllData(logCallback: (message: string) => void) {
    try {
        // 1. Usuarios (tabla 'profiles')
        logCallback('Sincronizando Usuarios...');
        const usersToSync = mockUsers.map(u => ({ id: u.id, name: u.name, email: u.email, password: u.password, role: u.role }));
        const { error: userError } = await supabase.from('profiles').upsert(usersToSync, { onConflict: 'id' });
        if (userError) throw new Error(`Usuarios: ${userError.message}`);
        logCallback(`✅ Usuarios sincronizados: ${mockUsers.length} registros.`);

        // 2. Productos
        logCallback('Sincronizando Productos...');
        const productsToSync = mockProducts.map(p => ({ id: p.id, name: p.name, ean_botella: p.eanBotella, ean_caja: p.eanCaja }));
        const { error: productError } = await supabase.from('products').upsert(productsToSync, { onConflict: 'id' });
        if (productError) throw new Error(`Productos: ${productError.message}`);
        logCallback(`✅ Productos sincronizados: ${mockProducts.length} registros.`);

        // 3. Entradas (solo los registros principales)
        logCallback('Sincronizando Entradas...');
        const entradasToSync = mockEntradas.map(e => ({
            id: e.id,
            albaran_id: e.albaranId,
            camion_matricula: e.camionMatricula,
            transportista: e.transportista,
            conductor: e.conductor,
            fecha_hora: e.fechaHora,
            numero_palets: e.numeroPalets,
            incidencia: e.incidencia,
            incidencia_imagenes: e.incidenciaImagenes,
            pallet_label_imagenes: e.palletLabelImagenes,
        }));
        const { error: entradaError } = await supabase.from('entradas').upsert(entradasToSync, { onConflict: 'id' });
        if (entradaError) throw new Error(`Entradas: ${entradaError.message}`);
        logCallback(`✅ Entradas sincronizadas: ${mockEntradas.length} registros.`);

        // 4. Pallets
        logCallback('Sincronizando Pallets...');
        const palletMap = new Map<string, Pallet & { entrada_id?: string }>();
        mockPallets.forEach(p => palletMap.set(p.id, p));
        mockEntradas.forEach(entrada => {
            entrada.pallets.forEach(pallet => {
                if (palletMap.has(pallet.id)) {
                    palletMap.set(pallet.id, { ...palletMap.get(pallet.id)!, entrada_id: entrada.id });
                }
            });
        });
        const allPallets = Array.from(palletMap.values());
        const palletsToSync = allPallets.map(p => ({
            id: p.id,
            entrada_id: p.entrada_id || null,
            product_id: p.productId,
            lote: p.lote,
            sscc: p.sscc,
            cajas_por_palet: p.cajasPorPalet,
            botellas_por_caja: p.botellasPorCaja,
            fecha_entrada: p.fechaEntrada,
            estado: p.estado,
        }));
        const { error: palletError } = await supabase.from('pallets').upsert(palletsToSync, { onConflict: 'id' });
        if (palletError) throw new Error(`Pallets: ${palletError.message}`);
        logCallback(`✅ Pallets sincronizados: ${allPallets.length} registros.`);
        
        // 5. Packs (solo los registros principales)
        logCallback('Sincronizando Packs...');
        const packsToSync = mockPacks.map(p => ({
            id: p.id,
            pedido_cliente: p.pedidoCliente,
            fecha_creacion: p.fechaCreacion,
            estado: p.estado,
            etiqueta_url: p.etiquetaUrl,
        }));
        const { error: packError } = await supabase.from('packs').upsert(packsToSync, { onConflict: 'id' });
        if (packError) throw new Error(`Packs: ${packError.message}`);
        logCallback(`✅ Packs sincronizados: ${mockPacks.length} registros.`);

        // 6. Contenido de Packs (tabla intermedia)
        logCallback('Sincronizando contenido de Packs...');
        const packProductosToSync = mockPacks.flatMap(pack => 
            pack.productos.map(prod => ({
                pack_id: pack.id,
                product_id: prod.productId,
                lote: prod.lote,
                cantidad: prod.cantidad,
            }))
        );
        const { error: packProdError } = await supabase.from('pack_productos').upsert(packProductosToSync, { onConflict: 'pack_id,product_id,lote' });
        if (packProdError) throw new Error(`Contenido de Packs: ${packProdError.message}`);
        logCallback(`✅ Contenido de Packs sincronizado: ${packProductosToSync.length} registros.`);

        // 7. Salidas (solo los registros principales)
        logCallback('Sincronizando Salidas...');
        const salidasToSync = mockSalidas.map(s => ({
            id: s.id,
            albaran_salida_id: s.albaranSalidaId,
            cliente: s.cliente,
            fecha_hora: s.fechaHora,
            conductor: s.conductor,
            camion_matricula: s.camionMatricula,
            transportista: s.transportista,
        }));
        const { error: salidaError } = await supabase.from('salidas').upsert(salidasToSync, { onConflict: 'id' });
        if (salidaError) throw new Error(`Salidas: ${salidaError.message}`);
        logCallback(`✅ Salidas sincronizadas: ${mockSalidas.length} registros.`);

        // 8. Packs de Salidas (tabla intermedia)
        logCallback('Sincronizando packs de Salidas...');
        const salidaPacksToSync = mockSalidas.flatMap(salida => 
            salida.packs.map(pack => ({
                salida_id: salida.id,
                pack_id: pack.id,
            }))
        );
        const { error: salidaPackError } = await supabase.from('salida_packs').upsert(salidaPacksToSync, { onConflict: 'salida_id,pack_id' });
        if (salidaPackError) throw new Error(`Packs de Salidas: ${salidaPackError.message}`);
        logCallback(`✅ Packs de Salidas sincronizados: ${salidaPacksToSync.length} registros.`);

        // 9. Incidencias
        logCallback('Sincronizando Incidencias...');
        const incidenciasToSync = mockIncidencias.map(i => ({
            id: i.id,
            tipo: i.tipo,
            descripcion: i.descripcion,
            fecha: i.fecha,
            estado: i.estado,
            usuario_reporta: i.usuarioReporta, 
        }));
        const { error: incidenciaError } = await supabase.from('incidencias').upsert(incidenciasToSync, { onConflict: 'id' });
        if (incidenciaError) throw new Error(`Incidencias: ${incidenciaError.message}`);
        logCallback(`✅ Incidencias sincronizadas: ${mockIncidencias.length} registros.`);

        logCallback('🎉 ¡Sincronización completada con éxito!');
        return { success: true };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logCallback(`❌ Error durante la sincronización: ${errorMessage}`);
        console.error("Detalle del error de sincronización:", error);
        return { success: false, error: errorMessage };
    }
}