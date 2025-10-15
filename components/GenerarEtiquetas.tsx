import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { mockPacks, mockPallets, mockProducts } from '../data/mockData';
import SearchIcon from './icons/SearchIcon';
import TicketIcon from './icons/TicketIcon';
import QrCodeIcon from './icons/QrCodeIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';

interface GenerarEtiquetasProps {
    addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const getProductName = (productId: string) => {
    return mockProducts.find(p => p.id === productId)?.name || 'Desconocido';
};

interface SearchResult {
    id: string;
    type: 'Pack' | 'Pallet';
    description: string;
    labelUrl: string;
}


const GenerarEtiquetas: React.FC<GenerarEtiquetasProps> = ({ addNotification }) => {
    // State for Reprinting
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    // State for Generic Label
    const [genericTitle, setGenericTitle] = useState('Título de Etiqueta');
    const [genericLine1, setGenericLine1] = useState('Información adicional línea 1');
    const [genericLine2, setGenericLine2] = useState('Línea 2');
    const [genericQrContent, setGenericQrContent] = useState('https://misolucionenvinos.com');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            addNotification('Por favor, ingrese un término de búsqueda.', 'error');
            return;
        }

        const term = searchTerm.toLowerCase();
        const foundPacks = mockPacks
            .filter(p => 
                p.id.toLowerCase().includes(term) || 
                p.pedidoCliente.toLowerCase().includes(term) ||
                p.productos.some(prod => getProductName(prod.productId).toLowerCase().includes(term))
            )
            .map(p => ({
                id: p.id,
                type: 'Pack' as const,
                description: `Pedido: ${p.pedidoCliente} | Contiene: ${p.productos.map(prod => getProductName(prod.productId)).join(', ')}`,
                labelUrl: `https://via.placeholder.com/400x200.png?text=Etiqueta+${p.pedidoCliente}`
            }));

        const foundPallets = mockPallets
            .filter(p => p.id.toLowerCase().includes(term))
            .map(p => ({
                id: p.id,
                type: 'Pallet' as const,
                description: `Producto: ${getProductName(p.productId)}`,
                labelUrl: `https://via.placeholder.com/400x200.png?text=Etiqueta+Pallet+${p.id}`
            }));

        const results = [...foundPacks, ...foundPallets];
        setSearchResults(results);

        if (results.length === 0) {
            addNotification(`No se encontraron resultados para "${searchTerm}".`, 'info');
        }
    };
    
    const handleReprint = (result: SearchResult) => {
        window.open(result.labelUrl, '_blank');
        addNotification(`Etiqueta para ${result.type} ${result.id} generada.`, 'success');
    };

    const handleGenerateGenericLabel = () => {
         if (!genericTitle.trim() || !genericQrContent.trim()) {
            addNotification('El título y el contenido del QR son obligatorios.', 'error');
            return;
        }

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(genericQrContent)}&size=150x150&qzone=1`;
        
        const labelWindow = window.open('', '_blank');
        if (!labelWindow) {
            addNotification('No se pudo abrir la ventana. Por favor, deshabilite el bloqueador de pop-ups.', 'error');
            return;
        }

        const htmlContent = `
            <html>
            <head>
                <title>Etiqueta Genérica: ${genericTitle}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f0f0; }
                    .label { width: 400px; height: 250px; border: 2px solid #333; background: white; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                    .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                    .header h1 { font-size: 24px; margin: 0; font-weight: bold; }
                    .content { display: flex; justify-content: space-between; align-items: center; flex-grow: 1; padding-top: 10px; }
                    .text-info { display: flex; flex-direction: column; justify-content: center; max-width: 220px; }
                    .text-info p { margin: 2px 0; font-size: 16px; }
                    .qr-code { text-align: right; }
                    .qr-code img { max-width: 150px; max-height: 150px; }
                    .print-button { position: fixed; top: 1rem; right: 1rem; font-size: 16px; padding: 10px 20px; background-color: #FFD700; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
                    @media print { .print-button { display: none; } body { background-color: white; } .label { border: 2px solid #000; box-shadow: none; } }
                </style>
            </head>
            <body>
                <button class="print-button" onclick="window.print()">Imprimir Etiqueta</button>
                <div class="label">
                    <div class="header"><h1>${genericTitle}</h1></div>
                    <div class="content">
                        <div class="text-info">
                            ${genericLine1 ? `<p>${genericLine1}</p>` : ''}
                            ${genericLine2 ? `<p>${genericLine2}</p>` : ''}
                        </div>
                        <div class="qr-code">
                            <img src="${qrUrl}" alt="Código QR" />
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        labelWindow.document.write(htmlContent);
        labelWindow.document.close();
    };

    const handleDownloadQr = async () => {
        if (!genericQrContent.trim()) {
            addNotification('No hay contenido para generar un código QR.', 'error');
            return;
        }

        try {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(genericQrContent)}&size=512x512&format=png`;
            const response = await fetch(qrUrl);
            if (!response.ok) {
                throw new Error('La respuesta de la red no fue correcta');
            }
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'codigo_qr.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            
            addNotification('Código QR descargado con éxito.', 'success');

        } catch (error) {
            console.error("Error al descargar el código QR:", error);
            addNotification('Hubo un error al descargar el código QR.', 'error');
        }
    };


    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-6">Generación y Reimpresión de Etiquetas</h1>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Reimprimir Etiqueta */}
                <Card title="Reimprimir Etiqueta Existente">
                    <p className="text-sm text-gray-600 mb-4">
                        Busca un pack o pallet por su identificador para volver a generar su etiqueta.
                    </p>
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <Input
                            id="searchTerm"
                            label="Buscar por ID, Pedido, Pallet o Producto"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Ej: PACK001, ALMA ATLANTICA, PAL047"
                        />
                        <Button type="submit" className="h-10 mt-auto"><SearchIcon className="w-5 h-5"/></Button>
                    </form>

                    <div className="mt-6 h-80 overflow-y-auto pr-2">
                        <h4 className="font-semibold text-dark-gray mb-2">Resultados de la Búsqueda</h4>
                        {searchResults.length > 0 ? (
                            <ul className="space-y-2">
                                {searchResults.map(result => (
                                    <li key={result.id} className="flex items-center justify-between p-3 bg-light-gray rounded-lg">
                                        <div>
                                            <span className={`text-xs font-bold py-1 px-2 rounded-full mr-2 ${result.type === 'Pack' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{result.type}</span>
                                            <span className="font-mono text-sm font-semibold">{result.id}</span>
                                            <p className="text-xs text-gray-500">{result.description}</p>
                                        </div>
                                        <Button variant="secondary" onClick={() => handleReprint(result)}>
                                            <TicketIcon className="w-4 h-4" /> Reimprimir
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p>No hay resultados para mostrar.</p>
                                <p className="text-xs">Realice una búsqueda para comenzar.</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Generar Etiqueta Genérica */}
                <Card title="Generar Etiqueta Genérica con QR">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-dark-gray">Contenido de la Etiqueta</h4>
                             <Input id="genericTitle" label="Título (centrado)" value={genericTitle} onChange={e => setGenericTitle(e.target.value)} />
                             <Input id="genericLine1" label="Línea de texto 1" value={genericLine1} onChange={e => setGenericLine1(e.target.value)} />
                             <Input id="genericLine2" label="Línea de texto 2" value={genericLine2} onChange={e => setGenericLine2(e.target.value)} />
                             <div>
                                <label htmlFor="genericQrContent" className="block text-sm font-medium text-gray-700 mb-1">Contenido para Código QR</label>
                                <textarea id="genericQrContent" value={genericQrContent} onChange={e => setGenericQrContent(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="URL, número de serie, datos JSON..."></textarea>
                             </div>
                             <Button onClick={handleGenerateGenericLabel} className="w-full">
                                <QrCodeIcon className="w-5 h-5"/> Generar Etiqueta
                            </Button>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-dark-gray mb-4">Vista Previa</h4>
                            <div className="aspect-[400/250] w-full">
                                <div className="w-full h-full border-2 border-dashed border-gray-300 bg-white p-3 flex flex-col justify-between text-xs">
                                    <div className="text-center border-b border-gray-200 pb-1">
                                        <h5 className="font-bold text-sm break-words">{genericTitle || "..."}</h5>
                                    </div>
                                    <div className="flex justify-between items-center flex-grow pt-1">
                                        <div className="text-gray-700 max-w-[55%] break-words">
                                            {genericLine1 && <p>{genericLine1}</p>}
                                            {genericLine2 && <p>{genericLine2}</p>}
                                        </div>
                                        <div className="w-[100px] h-[100px] flex items-center justify-center bg-gray-100">
                                            {genericQrContent ? (
                                                <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(genericQrContent)}&size=100x100&qzone=0&margin=0`} alt="Vista previa QR" />
                                            ) : (
                                                <span className="text-gray-400 text-center text-[10px]">QR</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleDownloadQr}
                                className="w-full mt-4"
                                disabled={!genericQrContent.trim()}
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                                Descargar Código QR
                            </Button>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default GenerarEtiquetas;