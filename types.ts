// Fix: Implemented all necessary type definitions for the application.
export enum UserRole {
  SuperUsuario = 'SuperUsuario',
  Administrativo = 'Administrativo',
  Almacen = 'Almacen',
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  eanBotella: string;
  eanCaja: string;
}

export interface Pallet {
  id: string;
  productId: string;
  lote: string;
  sscc: string;
  cajasPorPalet: number;
  botellasPorCaja: number;
  fechaEntrada: string;
  estado: 'Disponible' | 'En Proceso' | 'Reservado' | 'Expedido';
}

export interface Entrada {
  id: string;
  albaranId: string;
  camionMatricula: string;
  transportista: string;
  conductor: string;
  fechaHora: string;
  numeroPalets: number;
  pallets: Pallet[];
  incidencia?: string;
  incidenciaImagenes?: string[];
  palletLabelImagenes?: string[];
}

export interface PackProducto {
  productId: string;
  lote: string;
  cantidad: number;
}

export interface Pack {
  id: string;
  pedidoCliente: string;
  productos: PackProducto[];
  fechaCreacion: string;
  estado: 'Creado' | 'En Proceso' | 'Expedido';
  etiquetaUrl: string;
}

export interface Salida {
  id: string;
  albaranSalidaId: string;
  cliente: string;
  fechaHora: string;
  packs: Pack[];
  conductor: string;
  camionMatricula: string;
  transportista: string;
}

export interface Incidencia {
  id: string;
  tipo: 'Entrada' | 'Creación de Pack' | 'Salida' | 'Stock';
  descripcion: string;
  fecha: string;
  estado: 'Pendiente' | 'En Revisión' | 'Solucionado';
  usuarioReporta: string;
}

export enum Page {
  Dashboard = 'Dashboard',
  Entradas = 'Entradas',
  Stock = 'Stock',
  CrearPack = 'CrearPack',
  GenerarEtiquetas = 'GenerarEtiquetas',
  Salidas = 'Salidas',
  Incidencias = 'Incidencias',
  Usuarios = 'Usuarios',
  Reportes = 'Reportes',
  Auditoria = 'Auditoria',
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: number;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entity: string;
  entityId: string | number;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}