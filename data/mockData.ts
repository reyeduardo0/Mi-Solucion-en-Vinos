import { User, UserRole, Product, Pallet, Entrada, Pack, Salida, Incidencia } from '../types';

export const mockUsers: User[] = [
  { id: 1, name: 'Admin User', email: 'reyeduardo0@gmail.com', password: 'Er1414**', role: UserRole.SuperUsuario },
  { id: 2, name: 'Juan Almacén', email: 'juan@vinos.com', password: 'password', role: UserRole.Almacen },
  { id: 3, name: 'Ana Oficina', email: 'ana@vinos.com', password: 'password', role: UserRole.Administrativo },
];

export const mockProducts: Product[] = [
  { id: 'PROD001', name: 'ALMA ATLANTICA ALBARIÑO', eanBotella: '8410013000017', eanCaja: '18410013000014' },
  { id: 'PROD002', name: 'MARQUÉS DE RISCAL RESERVA', eanBotella: '8410013000024', eanCaja: '18410013000021' },
  { id: 'PROD003', name: 'PROTOS CRIANZA', eanBotella: '8410013000031', eanCaja: '18410013000038' },
];

export const mockPallets: Pallet[] = [
  { id: 'PAL047', productId: 'PROD001', lote: 'PTAM132515', sscc: '00(384100)130000140001', cajasPorPalet: 95, botellasPorCaja: 6, fechaEntrada: '2025-10-13', estado: 'Disponible' },
  { id: 'PAL013', productId: 'PROD001', lote: 'PTAM132516', sscc: '00(384100)130000140002', cajasPorPalet: 95, botellasPorCaja: 6, fechaEntrada: '2025-10-13', estado: 'Disponible' },
  { id: 'PAL088', productId: 'PROD002', lote: 'MDRM201801', sscc: '00(384100)130000210001', cajasPorPalet: 80, botellasPorCaja: 6, fechaEntrada: '2025-10-14', estado: 'Disponible' },
  { id: 'PAL092', productId: 'PROD003', lote: 'PCRZ201905', sscc: '00(384100)130000380001', cajasPorPalet: 100, botellasPorCaja: 6, fechaEntrada: '2025-10-15', estado: 'En Proceso' },
];

export const mockEntradas: Entrada[] = [
    { id: 'ENT001', albaranId: 'ALB-E-20251013', camionMatricula: '1234-ABC', transportista: 'Transportes Rápidos', conductor: 'Carlos Ruiz', fechaHora: '2025-10-13 09:15:00', numeroPalets: 2, pallets: [mockPallets[0], mockPallets[1]], palletLabelImagenes: ['https://via.placeholder.com/300x200.png?text=Etiqueta+Palet+1']},
    { id: 'ENT002', albaranId: 'ALB-E-20251014', camionMatricula: '5678-DEF', transportista: 'Logística Segura', conductor: 'Elena Gómez', fechaHora: '2025-10-14 11:30:00', numeroPalets: 1, pallets: [mockPallets[2]]},
    { id: 'ENT003', albaranId: 'ALB-E-20251015', camionMatricula: '9012-GHI', transportista: 'Transportes Rápidos', conductor: 'Carlos Ruiz', fechaHora: '2025-10-15 08:00:00', numeroPalets: 1, pallets: [mockPallets[3]], incidencia: 'Un palet con cajas dañadas.', incidenciaImagenes: ['https://via.placeholder.com/300x200.png?text=Caja+Dañada+1', 'https://via.placeholder.com/300x200.png?text=Caja+Dañada+2']},
];

export const mockPacks: Pack[] = [
    { id: 'PACK001', pedidoCliente: 'PED-C-101', productos: [{productId: 'PROD001', lote: 'PTAM132515', cantidad: 120}], fechaCreacion: '2025-10-16 14:00:00', estado: 'Expedido', etiquetaUrl: '#' },
    { id: 'PACK002', pedidoCliente: 'PED-C-102', productos: [{productId: 'PROD002', lote: 'MDRM201801', cantidad: 60}], fechaCreacion: '2025-10-17 10:00:00', estado: 'Creado', etiquetaUrl: '#' },
];

export const mockSalidas: Salida[] = [
    { id: 'SAL001', albaranSalidaId: 'ALB-S-20251016', cliente: 'Distribuidora del Sur', fechaHora: '2025-10-16 16:30:00', packs: [mockPacks[0]], conductor: 'Luis Pérez', camionMatricula: '4321-CBA', transportista: 'Logística Segura' },
];

export const mockIncidencias: Incidencia[] = [
    { id: 'INC001', tipo: 'Entrada', descripcion: 'Palet PAL092 llegó con 5 cajas rotas en la parte superior. Se adjuntan fotos.', fecha: '2025-10-15', estado: 'Pendiente', usuarioReporta: 'Juan Almacén'},
    { id: 'INC002', tipo: 'Creación de Pack', descripcion: 'Falta de material de embalaje (cartón separador) para pedido PED-C-103.', fecha: '2025-10-18', estado: 'En Revisión', usuarioReporta: 'Juan Almacén'},
    { id: 'INC003', tipo: 'Stock', descripcion: 'Se ha detectado una discrepancia en el conteo del lote PTAM132515.', fecha: '2025-10-20', estado: 'Solucionado', usuarioReporta: 'Ana Oficina'},
];