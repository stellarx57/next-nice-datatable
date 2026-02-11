/**
 * Next Nice DataTable - Export Utilities
 * Functions for exporting data to various formats
 * 
 * @author Stellarx Team
 * @version 1.0.0
 */

import { DataTableColumn, ExportConfig, ExportFormat } from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get value from a row by column ID (supports nested paths like 'user.name')
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * Format a value for export
 */
export function formatValueForExport<T>(
  value: any,
  row: T,
  column: DataTableColumn<T>,
  rowIndex: number
): string {
  if (column.exportFormat) {
    return column.exportFormat(value, row, rowIndex);
  }
  
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Escape CSV special characters
 */
function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${baseName}_${timestamp}.${extension}`;
}

/**
 * Download a file
 */
function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Export data to CSV format
 */
export function exportToCsv<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  const exportableColumns = columns.filter(col => col.exportable !== false && !col.hidden);
  
  // Create header row
  const headers = exportableColumns.map(col => escapeCsvValue(col.label)).join(',');
  
  // Create data rows
  const rows = data.map((row, rowIndex) => {
    return exportableColumns
      .map(col => {
        const value = getNestedValue(row, col.id);
        const formatted = formatValueForExport(value, row, col, rowIndex);
        return escapeCsvValue(formatted);
      })
      .join(',');
  });
  
  // Combine
  const csvContent = config.includeHeaders !== false 
    ? [headers, ...rows].join('\n')
    : rows.join('\n');
  
  // Download
  const filename = generateFilename(config.filename || 'export', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
}

// ============================================================================
// EXCEL EXPORT
// ============================================================================

/**
 * Export data to Excel format (XLSX)
 * Uses a simple XML-based format compatible with Excel
 */
export function exportToExcel<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  const exportableColumns = columns.filter(col => col.exportable !== false && !col.hidden);
  
  // XML header
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  
  // Styles
  xml += '<Styles>\n';
  xml += '  <Style ss:ID="Header">\n';
  xml += '    <Font ss:Bold="1" ss:Size="12"/>\n';
  xml += '    <Interior ss:Color="#E8E8E8" ss:Pattern="Solid"/>\n';
  xml += '    <Alignment ss:Horizontal="Center"/>\n';
  xml += '  </Style>\n';
  xml += '  <Style ss:ID="Title">\n';
  xml += '    <Font ss:Bold="1" ss:Size="14"/>\n';
  xml += '  </Style>\n';
  xml += '</Styles>\n';
  
  // Worksheet
  xml += '<Worksheet ss:Name="Data">\n';
  xml += '<Table>\n';
  
  // Column widths
  exportableColumns.forEach(col => {
    const width = col.width || col.minWidth || 100;
    xml += `  <Column ss:Width="${width}"/>\n`;
  });
  
  // Title row (if configured)
  if (config.title) {
    xml += '  <Row>\n';
    xml += `    <Cell ss:StyleID="Title" ss:MergeAcross="${exportableColumns.length - 1}">`;
    xml += `<Data ss:Type="String">${escapeXml(config.title)}</Data></Cell>\n`;
    xml += '  </Row>\n';
    
    if (config.subtitle) {
      xml += '  <Row>\n';
      xml += `    <Cell ss:MergeAcross="${exportableColumns.length - 1}">`;
      xml += `<Data ss:Type="String">${escapeXml(config.subtitle)}</Data></Cell>\n`;
      xml += '  </Row>\n';
    }
    
    // Empty row
    xml += '  <Row></Row>\n';
  }
  
  // Header row
  if (config.includeHeaders !== false) {
    xml += '  <Row>\n';
    exportableColumns.forEach(col => {
      xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>\n`;
    });
    xml += '  </Row>\n';
  }
  
  // Data rows
  data.forEach((row, rowIndex) => {
    xml += '  <Row>\n';
    exportableColumns.forEach(col => {
      const value = getNestedValue(row, col.id);
      const formatted = formatValueForExport(value, row, col, rowIndex);
      const dataType = typeof value === 'number' ? 'Number' : 'String';
      xml += `    <Cell><Data ss:Type="${dataType}">${escapeXml(formatted)}</Data></Cell>\n`;
    });
    xml += '  </Row>\n';
  });
  
  xml += '</Table>\n';
  xml += '</Worksheet>\n';
  xml += '</Workbook>';
  
  // Download
  const filename = generateFilename(config.filename || 'export', 'xls');
  downloadFile(xml, filename, 'application/vnd.ms-excel');
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// PDF EXPORT
// ============================================================================

/**
 * Export data to PDF format
 * Creates a printable HTML page and uses browser's print functionality
 */
export function exportToPdf<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  const exportableColumns = columns.filter(col => col.exportable !== false && !col.hidden);
  const orientation = config.pdfOrientation || 'portrait';
  const pageSize = config.pdfPageSize || 'a4';
  
  // Create HTML content
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${config.title || 'Export'}</title>
  <style>
    @page {
      size: ${pageSize} ${orientation};
      margin: 1cm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 10pt;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    .header {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1976d2;
    }
    .title {
      font-size: 18pt;
      font-weight: bold;
      color: #1976d2;
      margin: 0 0 5px 0;
    }
    .subtitle {
      font-size: 10pt;
      color: #666;
      margin: 0;
    }
    .meta {
      font-size: 9pt;
      color: #888;
      margin-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background-color: #1976d2;
      color: white;
      font-weight: 600;
      text-align: left;
      padding: 10px 8px;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 9pt;
    }
    tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    tr:hover {
      background-color: #e3f2fd;
    }
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e0e0e0;
      font-size: 8pt;
      color: #888;
      text-align: center;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    ${config.title ? `<h1 class="title">${escapeHtml(config.title)}</h1>` : ''}
    ${config.subtitle ? `<p class="subtitle">${escapeHtml(config.subtitle)}</p>` : ''}
    ${config.customHeader ? `<div>${config.customHeader}</div>` : ''}
    <p class="meta">Generated: ${new Date().toLocaleString()} | Records: ${data.length}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        ${exportableColumns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map((row, rowIndex) => `
        <tr>
          ${exportableColumns.map(col => {
            const value = getNestedValue(row, col.id);
            const formatted = formatValueForExport(value, row, col, rowIndex);
            return `<td>${escapeHtml(formatted)}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    ${config.customFooter || `${config.title || 'Document'} - Page 1`}
  </div>
  
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 500);
    };
  </script>
</body>
</html>`;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================================
// WORD EXPORT
// ============================================================================

/**
 * Export data to Word format (DOCX via HTML)
 */
export function exportToWord<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  const exportableColumns = columns.filter(col => col.exportable !== false && !col.hidden);
  
  // Create HTML content that Word can interpret
  let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <title>${config.title || 'Export'}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Calibri', sans-serif;
      font-size: 11pt;
    }
    h1 {
      font-size: 18pt;
      color: #1976d2;
      margin-bottom: 5pt;
    }
    .subtitle {
      font-size: 11pt;
      color: #666;
      margin-bottom: 15pt;
    }
    .meta {
      font-size: 9pt;
      color: #888;
      margin-bottom: 20pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10pt;
    }
    th {
      background-color: #1976d2;
      color: white;
      font-weight: bold;
      text-align: left;
      padding: 8pt 6pt;
      font-size: 10pt;
      border: 1pt solid #1565c0;
    }
    td {
      padding: 6pt;
      border: 1pt solid #e0e0e0;
      font-size: 10pt;
    }
    tr:nth-child(even) td {
      background-color: #f5f5f5;
    }
    .footer {
      margin-top: 20pt;
      padding-top: 10pt;
      border-top: 1pt solid #e0e0e0;
      font-size: 9pt;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  ${config.title ? `<h1>${escapeHtml(config.title)}</h1>` : ''}
  ${config.subtitle ? `<p class="subtitle">${escapeHtml(config.subtitle)}</p>` : ''}
  ${config.customHeader ? `<div>${config.customHeader}</div>` : ''}
  <p class="meta">Generated: ${new Date().toLocaleString()} | Total Records: ${data.length}</p>
  
  <table>
    <thead>
      <tr>
        ${exportableColumns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map((row, rowIndex) => `
        <tr>
          ${exportableColumns.map(col => {
            const value = getNestedValue(row, col.id);
            const formatted = formatValueForExport(value, row, col, rowIndex);
            return `<td>${escapeHtml(formatted)}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <p class="footer">${config.customFooter || `${config.title || 'Document'}`}</p>
</body>
</html>`;

  // Download as .doc file
  const filename = generateFilename(config.filename || 'export', 'doc');
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  downloadFile(blob, filename, 'application/msword');
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export data to the specified format
 */
export function exportData<T>(
  format: ExportFormat,
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  switch (format) {
    case 'csv':
      exportToCsv(data, columns, config);
      break;
    case 'excel':
      exportToExcel(data, columns, config);
      break;
    case 'pdf':
      exportToPdf(data, columns, config);
      break;
    case 'word':
      exportToWord(data, columns, config);
      break;
    default:
      console.warn(`Unknown export format: ${format}`);
  }
}

/**
 * Get display name for export format
 */
export function getExportFormatLabel(format: ExportFormat): string {
  switch (format) {
    case 'csv':
      return 'CSV';
    case 'excel':
      return 'Excel';
    case 'pdf':
      return 'PDF';
    case 'word':
      return 'Word';
    default: {
      // Handle any future formats
      const unknownFormat: string = format;
      return unknownFormat.toUpperCase();
    }
  }
}

/**
 * Get file extension for export format
 */
export function getExportExtension(format: ExportFormat): string {
  switch (format) {
    case 'csv':
      return 'csv';
    case 'excel':
      return 'xls';
    case 'pdf':
      return 'pdf';
    case 'word':
      return 'doc';
    default: {
      // Handle any future formats
      const unknownFormat: string = format;
      return unknownFormat;
    }
  }
}

