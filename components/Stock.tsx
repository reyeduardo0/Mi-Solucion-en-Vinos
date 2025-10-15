import React, { useState } from 'react';
import { Pallet, Pack } from '../types';
import { mockProducts } from '../data/mockData';
import Card from './common/Card';

interface StockProps {
    pallets: Pallet[];
    packs: Pack[];
}

const Stock: React.FC<StockProps> = ({ pallets, packs }) => {
    const [activeTab, setActiveTab] = useState<'pallets' | 'packs'>('pallets');
    const [expandedPackId, setExpandedPackId] = useState<string | null>(null);

    const getProductName = (productId: string) => {
        return mockProducts.find(p => p.id === productId)?.name || 'Desconocido';
    };

    const handleToggleExpand = (packId: string) => {
        setExpandedPackId(prevId => (prevId === packId ? null : packId));
    };

    const getStatusColor = (status: 'Creado' | 'En Proceso' | 'Expedido') => {
        switch (status) {
            case 'Creado': return 'bg-blue-100 text-blue-800';
            case 'En Proceso': return 'bg-yellow-100 text-yellow-800';
            case 'Expedido': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-6">Gestión de Stock</h1>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('pallets')}
                        className={`${
                            activeTab === 'pallets'
                                ? 'border-primary text-dark-gray'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Inventario de Pallets ({pallets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('packs')}
                        className={`${
                            activeTab === 'packs'
                                ? 'border-primary text-dark-gray'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Inventario de Packs ({packs.length})
                    </button>
                </nav>
            </div>

            <Card>
                {activeTab === 'pallets' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Palet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Entrada</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cajas/Palet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Botellas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pallets.map((pallet) => (
                                    <tr key={pallet.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pallet.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getProductName(pallet.productId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pallet.lote}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pallet.fechaEntrada}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{pallet.cajasPorPalet}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{(pallet.cajasPorPalet * pallet.botellasPorCaja).toLocaleString('es-ES')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                pallet.estado === 'Disponible' ? 'bg-green-100 text-green-800' :
                                                pallet.estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' :
                                                pallet.estado === 'Reservado' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`
                                            }>
                                                {pallet.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === 'packs' && (
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-3 w-12"></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pack</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {packs.map((pack) => (
                                    <React.Fragment key={pack.id}>
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-2 py-4">
                                                <button onClick={() => handleToggleExpand(pack.id)} className="p-1 rounded-full hover:bg-gray-200">
                                                     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${expandedPackId === pack.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pack.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pack.pedidoCliente}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pack.fechaCreacion}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pack.estado)}`}>
                                                    {pack.estado}
                                                </span>
                                            </td>
                                        </tr>
                                        {expandedPackId === pack.id && (
                                            <tr>
                                                <td colSpan={5} className="p-0">
                                                    <div className="p-4 bg-light-gray">
                                                        <h4 className="text-md font-semibold text-dark-gray mb-2">Contenido del Pack</h4>
                                                        {pack.productos.length > 0 ? (
                                                            <table className="min-w-full divide-y divide-gray-300 shadow-inner rounded-lg">
                                                                <thead className="bg-gray-200">
                                                                    <tr>
                                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Producto</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Lote</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Cantidad (Botellas)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white">
                                                                    {pack.productos.map((producto, index) => (
                                                                        <tr key={`${pack.id}-${producto.lote}-${index}`} className="border-b last:border-0">
                                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{getProductName(producto.productId)}</td>
                                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{producto.lote}</td>
                                                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{producto.cantidad.toLocaleString('es-ES')}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic">Este pack no tiene productos detallados.</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Stock;