import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { mockProducts, mockPallets } from '../data/mockData';
import { Pack } from '../types';

interface PackItem {
    productId: string;
    lote: string;
    cantidad: number;
}

interface CrearPackProps {
    onAddPack: (pack: Omit<Pack, 'id' | 'fechaCreacion' | 'estado' | 'etiquetaUrl'>) => void;
}

const CrearPack: React.FC<CrearPackProps> = ({ onAddPack }) => {
    const [pedidoCliente, setPedidoCliente] = useState('');
    const [packItems, setPackItems] = useState<PackItem[]>([]);
    
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedLote, setSelectedLote] = useState<string>('');
    const [cantidad, setCantidad] = useState<number | ''>('');

    const availableLotes = useMemo(() => {
        if (!selectedProductId) return [];
        const lotes = mockPallets
            .filter(p => p.productId === selectedProductId && p.estado === 'Disponible')
            .map(p => p.lote);
        return [...new Set(lotes)]; // Remove duplicates
    }, [selectedProductId]);

    const resetProductInput = () => {
        setSelectedProductId('');
        setSelectedLote('');
        setCantidad('');
    };

    const handleAddProduct = () => {
        if (!selectedProductId || !selectedLote || !cantidad || cantidad <= 0) {
            alert('Por favor, complete todos los campos para añadir un producto.');
            return;
        }

        setPackItems(prev => [...prev, { productId: selectedProductId, lote: selectedLote, cantidad: Number(cantidad) }]);
        
        resetProductInput();
    };
    
    const handleRemoveItem = (index: number) => {
        setPackItems(prev => prev.filter((_, i) => i !== index));
    };

    const getProductName = (productId: string) => {
        return mockProducts.find(p => p.id === productId)?.name || 'Desconocido';
    };

    const resetForm = () => {
        setPedidoCliente('');
        setPackItems([]);
        resetProductInput();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pedidoCliente || packItems.length === 0) {
            alert('Debe indicar un número de pedido y añadir al menos un producto al pack.');
            return;
        }
        
        const newPackData = {
            pedidoCliente,
            productos: packItems,
        };
        
        onAddPack(newPackData);

        alert('Pack creado con éxito. La etiqueta se ha generado.');

        const labelUrl = `https://via.placeholder.com/400x200.png?text=Etiqueta+${pedidoCliente}`;
        window.open(labelUrl, '_blank');

        resetForm();
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-6">Creación de Packs</h1>

            <Card>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input 
                        id="pedidoCliente" 
                        label="Orden de Pedido del Cliente" 
                        type="text" 
                        placeholder="PED-C-123" 
                        value={pedidoCliente}
                        onChange={(e) => setPedidoCliente(e.target.value)}
                        required
                    />

                    {/* Section to add products */}
                    <div className="space-y-4 p-4 border border-gray-200 rounded-md">
                        <h3 className="text-lg font-semibold text-dark-gray">Añadir Producto al Pack</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label htmlFor="producto" className="block text-sm font-medium text-gray-700 mb-1">Producto de Origen</label>
                                <select 
                                    id="producto" 
                                    value={selectedProductId}
                                    onChange={(e) => {
                                        setSelectedProductId(e.target.value);
                                        setSelectedLote(''); // Reset lote on product change
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {mockProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="lote" className="block text-sm font-medium text-gray-700 mb-1">Lote de Origen</label>
                                <select 
                                    id="lote" 
                                    value={selectedLote}
                                    onChange={(e) => setSelectedLote(e.target.value)}
                                    disabled={!selectedProductId || availableLotes.length === 0}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:bg-gray-100"
                                >
                                    <option value="">Seleccionar lote...</option>
                                    {availableLotes.map(lote => <option key={lote} value={lote}>{lote}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Input 
                                  id="unidades" 
                                  label="Unidades" 
                                  type="number" 
                                  placeholder="120" 
                                  value={cantidad}
                                  onChange={(e) => setCantidad(e.target.value === '' ? '' : Number(e.target.value))}
                                />
                                <Button type="button" onClick={handleAddProduct} className="h-10">Añadir</Button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Section to display added products */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Productos del Pack</h3>
                        {packItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">Aún no se han añadido productos al pack.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {packItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getProductName(item.productId)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lote}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cantidad.toLocaleString('es-ES')}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-800 font-semibold">Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 pt-4">Componentes y Evidencias</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Input id="componentes" label="Componentes Adicionales (Opcional)" type="text" placeholder="Cartón, etiquetas especiales..." />
                       <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cargar Imagen del Pack (Opcional)</label>
                            <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-dark hover:file:bg-yellow-300" />
                       </div>
                    </div>
                    
                    <div className="pt-6 flex justify-end gap-3">
                        <Button type="button" variant="secondary">Cancelar</Button>
                        <Button type="submit">Crear Pack y Generar Etiqueta</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CrearPack;