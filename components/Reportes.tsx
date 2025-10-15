import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Pallet, Pack, Entrada, Salida, Incidencia } from '../types';
import { mockProducts } from '../data/mockData';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';

interface ReportesProps {
    pallets: Pallet[];
    packs: Pack[];
    entradas: Entrada[];
    salidas: Salida[];
    incidencias: Incidencia[];
    addNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const Reportes: React.FC<ReportesProps> = ({ pallets, packs, entradas, salidas, incidencias, addNotification }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [incidenciaStatus, setIncidenciaStatus] = useState<'Todas' | Incidencia['estado']>('Todas');

    const getProductName = (productId: string) => {
        return mockProducts.find(p => p.id === productId)?.name || 'Desconocido';
    };

    const handleExportInventoryExcel = () => {
        addNotification(`Generando reporte de Inventario en formato Excel...`, 'info');

        const palletHeaders = ['ID Palet', 'Producto', 'Lote', 'SSCC', 'Cajas/Palet', 'Botellas/Caja', 'Fecha Entrada', 'Estado'];
        const palletRows = pallets.map(p => [
            `"${p.id}"`,
            `"${getProductName(p.productId)}"`,
            `"${p.lote}"`,
            `"${p.sscc}"`,
            p.cajasPorPalet,
            p.botellasPorCaja,
            `"${p.fechaEntrada}"`,
            `"${p.estado}"`
        ].join(','));
        
        const packHeaders = ['ID Pack', 'Pedido Cliente', 'Fecha Creación', 'Estado', 'Producto', 'Lote', 'Cantidad Botellas'];
        const packRows = packs.flatMap(pack => 
            pack.productos.map(prod => [
                `"${pack.id}"`,
                `"${pack.pedidoCliente}"`,
                `"${pack.fechaCreacion}"`,
                `"${pack.estado}"`,
                `"${getProductName(prod.productId)}"`,
                `"${prod.lote}"`,
                prod.cantidad
            ].join(','))
        );

        let csvContent = "";
        csvContent += "INVENTARIO DE PALLETS\r\n";
        csvContent += palletHeaders.join(',') + "\r\n";
        csvContent += palletRows.join('\r\n');
        csvContent += "\r\n\r\nINVENTARIO DE PACKS\r\n";
        csvContent += packHeaders.join(',') + "\r\n";
        csvContent += packRows.join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "reporte_inventario.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportInventoryPdf = () => {
        addNotification(`Generando reporte de Inventario en formato PDF...`, 'info');

        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            addNotification('No se pudo abrir la ventana para el reporte. Por favor, deshabilite el bloqueador de pop-ups.', 'error');
            return;
        }

        const htmlContent = `
            <html>
            <head>
                <title>Reporte de Inventario</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 2rem; font-size: 14px; }
                    h1, h2 { color: #333333; border-bottom: 2px solid #333333; padding-bottom: 5px; }
                    h1 { font-size: 24px; }
                    h2 { font-size: 18px; margin-top: 2rem; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                    th, td { border: 1px solid #dddddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .no-print { position: fixed; top: 1rem; right: 1rem; }
                    .no-print button { font-size: 16px; padding: 10px 20px; background-color: #FFD700; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
                    ul { padding-left: 20px; margin: 0; }
                    @media print {
                        .no-print { display: none; }
                        body { margin: 0; font-size: 12px; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <button onclick="window.print()">Imprimir o Guardar como PDF</button>
                </div>
                <h1>Reporte de Inventario Actual</h1>
                <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
                
                <h2>Inventario de Pallets (${pallets.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID Palet</th>
                            <th>Producto</th>
                            <th>Lote</th>
                            <th>Fecha Entrada</th>
                            <th>Cajas</th>
                            <th>Total Botellas</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pallets.map(p => `
                            <tr>
                                <td>${p.id}</td>
                                <td>${getProductName(p.productId)}</td>
                                <td>${p.lote}</td>
                                <td>${p.fechaEntrada}</td>
                                <td>${p.cajasPorPalet}</td>
                                <td>${(p.cajasPorPalet * p.botellasPorCaja).toLocaleString('es-ES')}</td>
                                <td>${p.estado}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
    
                <h2>Inventario de Packs (${packs.length})</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID Pack</th>
                            <th>Pedido Cliente</th>
                            <th>Fecha Creación</th>
                            <th>Estado</th>
                            <th>Contenido</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${packs.map(pack => `
                            <tr>
                                <td>${pack.id}</td>
                                <td>${pack.pedidoCliente}</td>
                                <td>${pack.fechaCreacion}</td>
                                <td>${pack.estado}</td>
                                <td>
                                    <ul>
                                    ${pack.productos.map(prod => `
                                        <li>${getProductName(prod.productId)} - Lote: ${prod.lote} (${prod.cantidad.toLocaleString('es-ES')} botellas)</li>
                                    `).join('')}
                                    </ul>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
        reportWindow.focus();
    };

    const handleExportMovementsPdf = () => {
        if (!startDate || !endDate) {
            addNotification('Por favor, seleccione un rango de fechas.', 'error');
            return;
        }
        addNotification(`Generando reporte de Movimientos en formato PDF...`, 'info');
    
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    
        const filteredEntradas = entradas.filter(e => {
            const entryDate = new Date(e.fechaHora);
            return entryDate >= start && entryDate <= end;
        });
        const filteredSalidas = salidas.filter(s => {
            const exitDate = new Date(s.fechaHora);
            return exitDate >= start && exitDate <= end;
        });
    
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            addNotification('No se pudo abrir la ventana para el reporte. Por favor, deshabilite el bloqueador de pop-ups.', 'error');
            return;
        }
    
        const htmlContent = `
            <html><head><title>Reporte de Movimientos</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;margin:2rem;font-size:14px}h1,h2{color:#333;border-bottom:2px solid #333;padding-bottom:5px}h1{font-size:24px}h2{font-size:18px;margin-top:2rem}table{width:100%;border-collapse:collapse;margin-bottom:2rem}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f5f5f5;font-weight:700}.no-print{position:fixed;top:1rem;right:1rem}.no-print button{font-size:16px;padding:10px 20px;background-color:#FFD700;border:none;border-radius:5px;cursor:pointer;font-weight:700}@media print{.no-print{display:none}body{margin:0;font-size:12px}}</style></head>
            <body>
                <div class="no-print"><button onclick="window.print()">Imprimir o Guardar como PDF</button></div>
                <h1>Reporte de Movimientos</h1>
                <p>Periodo: ${startDate} a ${endDate}</p>
                <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
                
                <h2>Entradas (${filteredEntradas.length})</h2>
                ${filteredEntradas.length > 0 ? `
                <table><thead><tr><th>Albarán</th><th>Fecha y Hora</th><th>Transportista</th><th>Matrícula</th><th># Palets</th></tr></thead>
                <tbody>${filteredEntradas.map(e => `<tr><td>${e.albaranId}</td><td>${e.fechaHora}</td><td>${e.transportista}</td><td>${e.camionMatricula}</td><td>${e.numeroPalets}</td></tr>`).join('')}</tbody>
                </table>` : `<p>No se encontraron entradas en este periodo.</p>`}
                
                <h2>Salidas (${filteredSalidas.length})</h2>
                ${filteredSalidas.length > 0 ? `
                <table><thead><tr><th>Albarán</th><th>Fecha y Hora</th><th>Cliente</th><th>Transportista</th><th># Packs</th></tr></thead>
                <tbody>${filteredSalidas.map(s => `<tr><td>${s.albaranSalidaId}</td><td>${s.fechaHora}</td><td>${s.cliente}</td><td>${s.transportista}</td><td>${s.packs.length}</td></tr>`).join('')}</tbody>
                </table>` : `<p>No se encontraron salidas en este periodo.</p>`}
            </body></html>`;
        
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
        reportWindow.focus();
    };

    const handleExportMovementsExcel = () => {
        if (!startDate || !endDate) {
            addNotification('Por favor, seleccione un rango de fechas.', 'error');
            return;
        }
        addNotification(`Generando reporte de Movimientos en formato Excel...`, 'info');
    
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
    
        const filteredEntradas = entradas.filter(e => new Date(e.fechaHora) >= start && new Date(e.fechaHora) <= end);
        const filteredSalidas = salidas.filter(s => new Date(s.fechaHora) >= start && new Date(s.fechaHora) <= end);
    
        const entradaHeaders = ['Albaran', 'Fecha y Hora', 'Transportista', 'Matricula', 'Conductor', '# Palets'];
        const entradaRows = filteredEntradas.map(e => [`"${e.albaranId}"`,`"${e.fechaHora}"`,`"${e.transportista}"`,`"${e.camionMatricula}"`,`"${e.conductor}"`,e.numeroPalets].join(','));
        
        const salidaHeaders = ['Albaran Salida', 'Fecha y Hora', 'Cliente', 'Transportista', 'Matricula', 'Conductor', '# Packs'];
        const salidaRows = filteredSalidas.map(s => [`"${s.albaranSalidaId}"`,`"${s.fechaHora}"`,`"${s.cliente}"`,`"${s.transportista}"`,`"${s.camionMatricula}"`,`"${s.conductor}"`,s.packs.length].join(','));
    
        let csvContent = `REPORTE DE MOVIMIENTOS (${startDate} a ${endDate})\r\n\r\nENTRADAS\r\n`;
        csvContent += entradaHeaders.join(',') + "\r\n" + entradaRows.join('\r\n');
        csvContent += "\r\n\r\nSALIDAS\r\n";
        csvContent += salidaHeaders.join(',') + "\r\n" + salidaRows.join('\r\n');
    
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_movimientos_${startDate}_a_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportIncidencesPdf = () => {
        addNotification(`Generando reporte de Incidencias en formato PDF...`, 'info');
    
        const filteredIncidencias = incidencias.filter(i => incidenciaStatus === 'Todas' || i.estado === incidenciaStatus);
    
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            addNotification('No se pudo abrir la ventana para el reporte. Por favor, deshabilite el bloqueador de pop-ups.', 'error');
            return;
        }
        
        const htmlContent = `
            <html><head><title>Reporte de Incidencias</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;margin:2rem;font-size:14px}h1,h2{color:#333;border-bottom:2px solid #333;padding-bottom:5px}h1{font-size:24px}h2{font-size:18px;margin-top:2rem}table{width:100%;border-collapse:collapse;margin-bottom:2rem}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f5f5f5;font-weight:700}.no-print{position:fixed;top:1rem;right:1rem}.no-print button{font-size:16px;padding:10px 20px;background-color:#FFD700;border:none;border-radius:5px;cursor:pointer;font-weight:700}@media print{.no-print{display:none}body{margin:0;font-size:12px}}</style></head>
            <body>
                <div class="no-print"><button onclick="window.print()">Imprimir o Guardar como PDF</button></div>
                <h1>Reporte de Incidencias</h1>
                <p>Filtro de Estado: ${incidenciaStatus}</p>
                <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
                
                <h2>Incidencias (${filteredIncidencias.length})</h2>
                ${filteredIncidencias.length > 0 ? `
                <table><thead><tr><th>ID</th><th>Tipo</th><th>Descripción</th><th>Fecha</th><th>Reporta</th><th>Estado</th></tr></thead>
                <tbody>${filteredIncidencias.map(i => `<tr><td>${i.id}</td><td>${i.tipo}</td><td>${i.descripcion}</td><td>${i.fecha}</td><td>${i.usuarioReporta}</td><td>${i.estado}</td></tr>`).join('')}</tbody>
                </table>` : `<p>No se encontraron incidencias con el filtro seleccionado.</p>`}
            </body></html>`;
        
        reportWindow.document.write(htmlContent);
        reportWindow.document.close();
        reportWindow.focus();
    };

    const handleExportIncidencesExcel = () => {
        addNotification(`Generando reporte de Incidencias en formato Excel...`, 'info');
    
        const filteredIncidencias = incidencias.filter(i => incidenciaStatus === 'Todas' || i.estado === incidenciaStatus);
        
        const headers = ['ID', 'Tipo', 'Descripcion', 'Fecha', 'Reporta', 'Estado'];
        const rows = filteredIncidencias.map(i => [`"${i.id}"`,`"${i.tipo}"`,`"${i.descripcion.replace(/"/g, '""')}"`,`"${i.fecha}"`,`"${i.usuarioReporta}"`,`"${i.estado}"`].join(','));
    
        let csvContent = `REPORTE DE INCIDENCIAS (Estado: ${incidenciaStatus})\r\n\r\n`;
        csvContent += headers.join(',') + "\r\n" + rows.join('\r\n');
    
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_incidencias_${incidenciaStatus}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const stockByProductData = mockProducts.map(product => {
        const totalBotellas = pallets
            .filter(p => p.productId === product.id && p.estado === 'Disponible')
            .reduce((sum, p) => sum + (p.cajasPorPalet * p.botellasPorCaja), 0);
        return { name: product.name, botellas: totalBotellas };
    });
    
    const incidenciasByStatusData = [
        { name: 'Pendiente', value: incidencias.filter(i => i.estado === 'Pendiente').length },
        { name: 'En Revisión', value: incidencias.filter(i => i.estado === 'En Revisión').length },
        { name: 'Solucionado', value: incidencias.filter(i => i.estado === 'Solucionado').length },
    ];

    const COLORS = ['#FF8042', '#FFBB28', '#00C49F'];

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-gray mb-6">Reportes y Estadísticas</h1>

            <h2 className="text-2xl font-semibold text-dark-gray mt-8 mb-4">Generación de Reportes</h2>
            <div className="space-y-6">
                <Card title="Reporte de Inventario Actual">
                    <p className="text-sm text-gray-600 mb-4">
                        Obtén una instantánea completa de tu stock, detallando todos los pallets y packs disponibles y sus estados actuales.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={handleExportInventoryPdf}>
                            <DocumentArrowDownIcon className="w-5 h-5" /> Generar PDF
                        </Button>
                        <Button variant="secondary" onClick={handleExportInventoryExcel}>
                             <DocumentArrowDownIcon className="w-5 h-5" /> Generar Excel
                        </Button>
                    </div>
                </Card>

                <Card title="Reporte de Movimientos">
                    <p className="text-sm text-gray-600 mb-4">
                        Analiza todas las entradas y salidas de mercancía dentro de un rango de fechas específico.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <Input
                            id="startDate"
                            label="Fecha de Inicio"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                         <Input
                            id="endDate"
                            label="Fecha de Fin"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={handleExportMovementsPdf}>
                            <DocumentArrowDownIcon className="w-5 h-5" /> Generar PDF
                        </Button>
                        <Button variant="secondary" onClick={handleExportMovementsExcel}>
                            <DocumentArrowDownIcon className="w-5 h-5" /> Generar Excel
                        </Button>
                    </div>
                </Card>

                <Card title="Reporte de Incidencias">
                    <p className="text-sm text-gray-600 mb-4">
                        Filtra y visualiza todas las incidencias reportadas por su estado para un seguimiento efectivo.
                    </p>
                     <div className="max-w-xs mb-4">
                        <label htmlFor="incidenciaStatus" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Estado</label>
                        <select
                            id="incidenciaStatus"
                            value={incidenciaStatus}
                            onChange={(e) => setIncidenciaStatus(e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                            <option value="Todas">Todas</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Revisión">En Revisión</option>
                            <option value="Solucionado">Solucionado</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={handleExportIncidencesPdf}>
                            <DocumentArrowDownIcon className="w-5 h-5" /> Generar PDF
                        </Button>
                        <Button variant="secondary" onClick={handleExportIncidencesExcel}>
                            <DocumentArrowDownIcon className="w-5 h-5" /> Generar Excel
                        </Button>
                    </div>
                </Card>
            </div>

            <h2 className="text-2xl font-semibold text-dark-gray mt-12 mb-4">Estadísticas Visuales</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card title="Stock Disponible por Producto (en Botellas)">
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stockByProductData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="botellas" fill="#FFC107" name="Total Botellas"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Estado de Incidencias">
                     <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={incidenciasByStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {incidenciasByStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Reportes;