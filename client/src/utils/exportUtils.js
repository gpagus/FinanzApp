import ExcelJS from 'exceljs';
import { formatearMoneda, formatearFechaHora, formatearFecha } from './formatters';
import { CATEGORIAS } from './constants';

export const exportarTransaccionesAExcel = async (data, usuario) => {
    const { cuenta, transacciones } = data;
    
    // Crear un nuevo workbook
    const workbook = new ExcelJS.Workbook();
    
    // Configurar propiedades del workbook
    workbook.creator = `${usuario.nombre} ${usuario.apellidos}`;
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // ========== HOJA DE RESUMEN ==========
    const worksheetResumen = workbook.addWorksheet('Resumen');
    
    // Configurar ancho de columnas para resumen
    worksheetResumen.columns = [
        { header: 'Concepto', key: 'concepto', width: 25 },
        { header: 'Valor', key: 'valor', width: 50 }
    ];
    
    // Datos de resumen
    const datosResumen = [
        { concepto: 'Cuenta', valor: cuenta.nombre },
        { concepto: 'Tipo de Cuenta', valor: cuenta.tipo },
        { concepto: 'Titular', valor: `${usuario.nombre} ${usuario.apellidos}` },
        { concepto: 'Balance Actual', valor: formatearMoneda(cuenta.balance) },
        { concepto: 'Fecha de Creación', valor: formatearFecha(cuenta.created_at) },
        { concepto: 'Total Transacciones', valor: transacciones.length },
        { concepto: 'Fecha de Exportación', valor: formatearFecha(new Date()) }
    ];
    
    // Agregar datos de resumen
    worksheetResumen.addRows(datosResumen);
    
    // Estilizar la hoja de resumen con colores de la app
    // ========== ESTILIZAR ENCABEZADOS DE RESUMEN ==========
    const headerRowResumen = worksheetResumen.getRow(1);
    for (let col = 1; col <= 2; col++) { // Solo 2 columnas (Concepto y Valor)
        const cell = headerRowResumen.getCell(col);
        cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF094F51' }
        };
    }

    // Estilizar filas de datos del resumen
    worksheetResumen.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            // Alternar colores de filas solo en las columnas con contenido
            if (rowNumber % 2 === 0) {
                for (let col = 1; col <= 2; col++) { // Solo 2 columnas
                    const cell = row.getCell(col);
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF6F9F9' } // --color-neutral-100
                    };
                }
            }
            
            // Estilizar columna de conceptos
            const conceptoCell = row.getCell('concepto');
            conceptoCell.font = { bold: true, color: { argb: 'FF094F51' } }; // aguazul
            
            // Alinear a la derecha si es el Balance Actual (valor monetario)
            const valorCell = row.getCell('valor');
            if (conceptoCell.value === 'Balance Actual') {
                valorCell.alignment = { horizontal: 'right' };
                valorCell.font = { bold: true, color: { argb: 'FF094F51' } };
            }
        }
        
        // Agregar bordes solo a las celdas con contenido
        for (let col = 1; col <= 2; col++) { // Solo 2 columnas
            const cell = row.getCell(col);
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE0EBEB' } }, // neutral-200
                left: { style: 'thin', color: { argb: 'FFE0EBEB' } },
                bottom: { style: 'thin', color: { argb: 'FFE0EBEB' } },
                right: { style: 'thin', color: { argb: 'FFE0EBEB' } }
            };
        }
    });
    
    // ========== HOJA DE TRANSACCIONES ==========
    const worksheetTransacciones = workbook.addWorksheet('Transacciones');
    
    // Configurar columnas para transacciones
    worksheetTransacciones.columns = [
        { header: 'Fecha', key: 'fecha', width: 12 },
        { header: 'Hora', key: 'hora', width: 8 },
        { header: 'Descripción', key: 'descripcion', width: 50 },
        { header: 'Categoría', key: 'categoria', width: 20 },
        { header: 'Tipo', key: 'tipo', width: 12 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Monto', key: 'monto', width: 19 },
        { header: 'Monto Formateado', key: 'montoFormateado', width: 19 },
        // { header: 'Balance Después', key: 'balanceDespues', width: 15 },
        { header: 'Cuenta Destino', key: 'cuentaDestino', width: 50 },
    ];
    
    // Preparar datos de transacciones
    const datosTransacciones = transacciones.map(transaccion => {
        const categoria = CATEGORIAS.find(cat => cat.value === transaccion.categoria_id);
        
        // Determinar el estado de la transacción
        let estado = 'Normal';
        if (transaccion.transaccion_rectificativa_id) {
            estado = 'Rectificada';
        } else if (transaccion.transaccion_original_id) {
            estado = 'Rectificativa';
        }
        
        // Helper para obtener el offset de zona horaria española
        const obtenerOffsetEspañol = (fecha) => {
            const año = fecha.getFullYear();
            const inicioVerano = new Date(año, 2, 31);
            inicioVerano.setDate(31 - inicioVerano.getDay());
            const finVerano = new Date(año, 9, 31);
            finVerano.setDate(31 - finVerano.getDay());
            return (fecha >= inicioVerano && fecha < finVerano) ? 2 : 1;
        };
        
        // Convertir fecha UTC a hora local española (mejorado)
        const fechaUTC = new Date(transaccion.fecha);
        const offset = obtenerOffsetEspañol(fechaUTC);
        const fechaLocal = new Date(fechaUTC.getTime() + (offset * 60 * 60 * 1000));
        
        return {
            fecha: formatearFecha(fechaLocal),
            hora: fechaLocal.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            descripcion: transaccion.descripcion,
            categoria: categoria?.label || 'Sin categoría',
            tipo: transaccion.tipo.charAt(0).toUpperCase() + transaccion.tipo.slice(1),
            estado: estado,
            monto: transaccion.monto,
            montoFormateado: formatearMoneda(transaccion.monto),
            nota: transaccion.nota || '',
            cuentaDestino: transaccion.cuenta_destino?.nombre || '',
        };
    });
    
    // Agregar datos de transacciones
    worksheetTransacciones.addRows(datosTransacciones);
    
    // Estilizar encabezados de transacciones con aguazul
    // ========== ESTILIZAR ENCABEZADOS DE TRANSACCIONES ==========
    const headerRowTransacciones = worksheetTransacciones.getRow(1);
    const numColumnas = worksheetTransacciones.columns.length;
    for (let col = 1; col <= numColumnas; col++) {
        const cell = headerRowTransacciones.getCell(col);
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF094F51' }
        };
    }

    // Estilizar filas de datos
    worksheetTransacciones.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            const numColumnas = worksheetTransacciones.columns.length;
            
            // Alternar colores de filas solo en las columnas con contenido
            if (rowNumber % 2 === 0) {
                for (let col = 1; col <= numColumnas; col++) {
                    const cell = row.getCell(col);
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF6F9F9' } // --color-neutral-100
                    };
                }
            }
            
            // Estilizar según el tipo de transacción with colors de la app
            const tipoCell = row.getCell('tipo');
            const montoCell = row.getCell('montoFormateado');
            const estadoCell = row.getCell('estado');
            
            // Alinear montos a la derecha
            montoCell.alignment = { horizontal: 'right' };
            
            // Estilizar según el estado (rectificadas/rectificativa)
            if (estadoCell.value === 'Rectificada') {
                estadoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE5E5E5' } // Gris para rectificadas
                };
                estadoCell.font = { color: { argb: 'FF757575' }, bold: true };
                // Aplicar opacidad al monto de transacciones rectificadas
                montoCell.font = { ...montoCell.font, color: { argb: 'FF9E9E9E' } };
            } else if (estadoCell.value === 'Rectificativa') {
                estadoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE3F2FD' } // Azul claro para rectificativas
                };
                estadoCell.font = { color: { argb: 'FF1976D2' }, bold: true };
            } else {
                estadoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE8F5E9' } // Verde claro para normales
                };
                estadoCell.font = { color: { argb: 'FF2E7D32' }, bold: true };
            }
            
            if (tipoCell.value === 'Gasto') {
                montoCell.font = { ...montoCell.font, color: { argb: 'FFF44336' }, bold: true }; // --color-error
                tipoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFEBEE' } // --color-error-100
                };
            } else if (tipoCell.value === 'Ingreso') {
                montoCell.font = { ...montoCell.font, color: { argb: 'FF03BD0A' }, bold: true }; // --color-success
                tipoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE8F5E9' } // --color-success-100
                };
            } else if (tipoCell.value === 'Transferencia') {
                montoCell.font = { ...montoCell.font, color: { argb: 'FF0E7B7F' }, bold: true }; // --color-aguazul-100
                tipoCell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE3F2FD' } // --color-info-100
                };
            }
            
            // Si es rectificada, sobrescribir el color del monto con opacidad
            if (estadoCell.value === 'Rectificada') {
                montoCell.font = { ...montoCell.font, color: { argb: 'FF9E9E9E' } };
            }
        }
        
        // Agregar bordes solo a las celdas con contenido
        const numColumnas = worksheetTransacciones.columns.length;
        for (let col = 1; col <= numColumnas; col++) {
            const cell = row.getCell(col);
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE0EBEB' } }, // --color-neutral-200
                left: { style: 'thin', color: { argb: 'FFE0EBEB' } },
                bottom: { style: 'thin', color: { argb: 'FFE0EBEB' } },
                right: { style: 'thin', color: { argb: 'FFE0EBEB' } }
            };
        }
    });
    
    // Generar nombre del archivo
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreArchivo = `${cuenta.nombre.replace(/\s+/g, '_')}_transacciones_${fechaActual}.xlsx`;
    
    // Generar buffer y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Crear enlace de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { nombreArchivo, totalRegistros: transacciones.length };
};