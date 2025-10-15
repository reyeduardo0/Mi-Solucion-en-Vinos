import React from 'react';
import { Page } from '../types';
import { mockPallets, mockIncidencias, mockEntradas, mockSalidas, mockPacks } from '../data/mockData';
import Card from './common/Card';
import Button from './common/Button';
import TruckIcon from './icons/TruckIcon';
import PackageIcon from './icons/PackageIcon';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
    setCurrentPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
    const totalPallets = mockPallets.length;
    const totalBotellas = mockPallets.reduce((sum, p) => sum + (p.cajasPorPalet * p.botellasPorCaja), 0);
    const incidenciasPendientes = mockIncidencias.filter(i => i.estado === 'Pendiente').length;
    const packsCreados = mockPacks.filter(p => p.estado === 'Creado').length;
    const packsEnProceso = mockPacks.filter(p => p.estado === 'En Proceso').length;


    const chartData = [
      { name: 'Entradas', value: mockEntradas.length, fill: '#4CAF50' },
      { name: 'Salidas', value: mockSalidas.length, fill: '#F44336' },
      { name: 'Incidencias', value: mockIncidencias.length, fill: '#FFC107' },
    ];
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-6">Dashboard</h1>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Acceso Rápido</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={() => setCurrentPage(Page.Entradas)}><TruckIcon className="w-5 h-5"/> Nueva Entrada</Button>
                    <Button onClick={() => setCurrentPage(Page.CrearPack)}><PackageIcon className="w-5 h-5"/> Crear Pack</Button>
                    <Button onClick={() => setCurrentPage(Page.Salidas)}><ArrowUpRightIcon className="w-5 h-5"/> Nueva Salida</Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                    <h4 className="font-bold text-lg">Stock Total (Palets)</h4>
                    <p className="text-4xl font-extrabold">{totalPallets}</p>
                </Card>
                <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                    <h4 className="font-bold text-lg">Stock Total (Botellas)</h4>
                    <p className="text-4xl font-extrabold">{totalBotellas.toLocaleString('es-ES')}</p>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white">
                    <h4 className="font-bold text-lg">Packs Creados</h4>
                    <p className="text-4xl font-extrabold">{packsCreados}</p>
                </Card>
                <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                    <h4 className="font-bold text-lg">Packs en Proceso</h4>
                    <p className="text-4xl font-extrabold">{packsEnProceso}</p>
                </Card>
                <Card className={`bg-gradient-to-br text-white ${incidenciasPendientes > 0 ? 'from-yellow-400 to-yellow-600' : 'from-gray-400 to-gray-600'}`}>
                    <h4 className="font-bold text-lg">Incidencias Pendientes</h4>
                    <p className="text-4xl font-extrabold">{incidenciasPendientes}</p>
                </Card>
                <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                    <h4 className="font-bold text-lg">Salidas (Este Mes)</h4>
                    <p className="text-4xl font-extrabold">{mockSalidas.length}</p>
                </Card>
            </div>

            {/* Chart and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Resumen de Movimientos" className="lg:col-span-2">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Total" />
                          </BarChart>
                      </ResponsiveContainer>
                    </div>
                </Card>
                <Card title="Últimas Entradas">
                    <ul className="space-y-3">
                        {mockEntradas.slice(0, 4).map(e => (
                            <li key={e.id} className="text-sm border-b pb-2 last:border-0">
                                <p className="font-semibold">{e.albaranId}</p>
                                <p className="text-gray-500">{e.transportista} - {e.pallets.length} palets</p>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;