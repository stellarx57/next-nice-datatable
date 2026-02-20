/**
 * Next Nice DataTable - Export Utilities
 * Functions for exporting data to CSV, Excel (XLSX), PDF, and Word formats.
 *
 * Security hardening in this file:
 *  - getNestedValue: blocks prototype-pollution keys (__proto__, constructor, prototype)
 *  - escapeHtml: null/undefined safe; always converts to string first
 *  - escapeXml: null/undefined safe
 *  - customHeader / customFooter: HTML-escaped by default; raw HTML only allowed
 *    when ExportConfig.allowUnsafeHtml === true (opt-in, trusted source only)
 *  - <title> in PDF/Word HTML: always escaped
 *
 * @author Stellarx Team
 * @version 2.0.0
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataTableColumn, ExportConfig, ExportFormat } from './types';

// ============================================================================
// SECURITY-HARDENED UTILITIES
// ============================================================================

/** Keys that must never be traversed to prevent prototype-pollution attacks. */
const BANNED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Safely read a (possibly nested) property from an object.
 * Supports dot-notation paths, e.g. 'user.address.city'.
 * Returns undefined – never throws – for any invalid / banned path segment.
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (BANNED_KEYS.has(part)) return undefined;
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Escape a value for safe insertion into HTML.
 * Handles null / undefined by returning an empty string.
 */
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Use the browser DOM to perform the escaping – fastest and most correct
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Escape a value for safe insertion into XML / SpreadsheetML.
 */
function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Resolve customHeader / customFooter based on the `allowUnsafeHtml` flag.
 * When allowUnsafeHtml is false (default), the string is HTML-escaped so it
 * renders as plain text.  When true it is passed through as-is – only use this
 * when the value comes from a fully trusted, server-controlled source.
 */
function resolveHtmlContent(value: string | undefined, allowUnsafe: boolean): string {
  if (!value) return '';
  return allowUnsafe ? value : escapeHtml(value);
}

// ============================================================================
// FORMAT VALUE FOR EXPORT
// ============================================================================

export function formatValueForExport<T>(
  value: unknown,
  row: T,
  column: DataTableColumn<T>,
  rowIndex: number
): string {
  if (column.exportFormat) {
    return column.exportFormat(value, row, rowIndex);
  }
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// ============================================================================
// FILENAME HELPERS
// ============================================================================

export function generateFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${baseName}_${timestamp}.${extension}`;
}

// ============================================================================
// FILE DOWNLOAD HELPER
// ============================================================================

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

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCsv<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  const exportableColumns = columns.filter(col => col.exportable !== false && !col.hidden);

  const headers = exportableColumns.map(col => escapeCsvValue(col.label)).join(',');

  const rows = data.map((row, rowIndex) =>
    exportableColumns
      .map(col => {
        const value = getNestedValue(row as Record<string, unknown>, col.id);
        const formatted = formatValueForExport(value, row, col, rowIndex);
        return escapeCsvValue(formatted);
      })
      .join(',')
  );

  const csvContent = config.includeHeaders !== false
    ? [headers, ...rows].join('\n')
    : rows.join('\n');

  const filename = generateFilename(config.filename || 'export', 'csv');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
}

// ============================================================================
// EXCEL EXPORT – uses the xlsx package for proper .xlsx files
// ============================================================================

export function exportToExcel<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  const exportableColumns = columns.filter(col => col.exportable !== false && !col.hidden);

  const rows: unknown[][] = data.map((row, rowIndex) =>
    exportableColumns.map(col => {
      const value = getNestedValue(row as Record<string, unknown>, col.id);
      // Keep numbers as numbers so Excel treats them numerically
      if (typeof value === 'number' && !col.exportFormat) return value;
      return formatValueForExport(value, row, col, rowIndex);
    })
  );

  const sheetData: unknown[][] = [];

  // Optional title rows
  if (config.title) {
    sheetData.push([config.title]);
    if (config.subtitle) sheetData.push([config.subtitle]);
    sheetData.push([]); // blank row
  }

  // Headers
  if (config.includeHeaders !== false) {
    sheetData.push(exportableColumns.map(col => col.label));
  }

  // Data
  sheetData.push(...rows);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Bold + background the title row if present
  if (config.title) {
    const titleCellRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
    if (!ws[titleCellRef]) ws[titleCellRef] = {};
    ws[titleCellRef].s = { font: { bold: true, sz: 14 } };
  }

  // Set column widths
  ws['!cols'] = exportableColumns.map(col => ({
    wch: Math.max(col.label.length, 12),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  const filename = generateFilename(config.filename || 'export', 'xlsx');
  XLSX.writeFile(wb, filename);
}

// ============================================================================
// PDF EXPORT – uses jsPDF + jspdf-autotable for proper vector PDF files
// ============================================================================

export function exportToPdf<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  const exportableColumns = columns.filter(col => col.exportable !== false && !col.hidden);
  const orientation = config.pdfOrientation || 'portrait';
  const pageSize = config.pdfPageSize || 'a4';
  const allowUnsafe = config.allowUnsafeHtml === true;

  const doc = new jsPDF({ orientation, format: pageSize, unit: 'mm' });

  // ---- Header text above the table ----
  let cursorY = 15;

  if (config.title) {
    doc.setFontSize(16);
    doc.setTextColor(25, 118, 210);
    doc.text(config.title, 14, cursorY);
    cursorY += 8;
  }

  if (config.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(config.subtitle, 14, cursorY);
    cursorY += 6;
  }

  if (config.customHeader) {
    // When allowUnsafe is false the raw string is plain text, so it is safe to
    // pass directly to jsPDF (which never interprets HTML).
    // When allowUnsafe is true the caller promises the value is trusted HTML;
    // jsPDF still receives plain text so we strip tags in that case.
    const headerText = allowUnsafe
      ? config.customHeader.replace(/<[^>]*>/g, '')
      : config.customHeader;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(headerText, 14, cursorY);
    cursorY += 6;
  }

  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    `Generated: ${new Date().toLocaleString()}  |  Records: ${data.length}`,
    14,
    cursorY
  );
  cursorY += 4;

  // ---- Table ----
  const headers = exportableColumns.map(col => col.label);
  const bodyRows = data.map((row, rowIndex) =>
    exportableColumns.map(col => {
      const value = getNestedValue(row as Record<string, unknown>, col.id);
      return formatValueForExport(value, row, col, rowIndex);
    })
  );

  autoTable(doc, {
    head: config.includeHeaders !== false ? [headers] : [],
    body: bodyRows,
    startY: cursorY,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { top: 10, right: 14, bottom: 14, left: 14 },
    tableLineColor: [224, 224, 224],
    tableLineWidth: 0.1,
  });

  // ---- Footer on every page ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = (doc.internal.pageSize as { height: number }).height
      ?? (doc.internal.pageSize as { getHeight: () => number }).getHeight();
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);

    const footerText = config.customFooter
      ? (allowUnsafe
        ? config.customFooter.replace(/<[^>]*>/g, '')
        : config.customFooter)
      : `${config.title || 'Document'}  –  Page ${i} of ${pageCount}`;

    doc.text(footerText, 14, pageHeight - 8);
    // Right-aligned page indicator when a custom footer is provided
    if (config.customFooter) {
      const pageLabel = `Page ${i} / ${pageCount}`;
      const textWidth = doc.getTextWidth(pageLabel);
      const pageWidth = (doc.internal.pageSize as { width: number }).width
        ?? (doc.internal.pageSize as { getWidth: () => number }).getWidth();
      doc.text(pageLabel, pageWidth - 14 - textWidth, pageHeight - 8);
    }
  }

  const filename = generateFilename(config.filename || 'export', 'pdf');
  doc.save(filename);
}

// ============================================================================
// WORD EXPORT – HTML-in-DOC trick, security-hardened
// ============================================================================

export function exportToWord<T>(
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  const exportableColumns = columns.filter(col => col.exportable !== false && !col.hidden);
  const allowUnsafe = config.allowUnsafeHtml === true;

  const customHeaderHtml = config.customHeader
    ? `<div class="custom-header">${resolveHtmlContent(config.customHeader, allowUnsafe)}</div>`
    : '';

  const customFooterHtml = config.customFooter
    ? `<p class="footer">${resolveHtmlContent(config.customFooter, allowUnsafe)}</p>`
    : `<p class="footer">${escapeHtml(config.title || 'Document')}</p>`;

  const tableRows = data.map((row, rowIndex) => {
    const cells = exportableColumns
      .map(col => {
        const value = getNestedValue(row as Record<string, unknown>, col.id);
        const formatted = formatValueForExport(value, row, col, rowIndex);
        return `<td>${escapeHtml(formatted)}</td>`;
      })
      .join('');
    return `<tr>${cells}</tr>`;
  }).join('\n');

  const headerRow = config.includeHeaders !== false
    ? `<tr>${exportableColumns.map(col => `<th>${escapeHtml(col.label)}</th>`).join('')}</tr>`
    : '';

  const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(config.title || 'Export')}</title>
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
    body { font-family: Calibri, sans-serif; font-size: 11pt; margin: 2cm; }
    h1 { font-size: 18pt; color: #1976d2; margin-bottom: 4pt; }
    .subtitle { font-size: 11pt; color: #666; margin-bottom: 12pt; }
    .custom-header { font-size: 10pt; margin-bottom: 8pt; }
    .meta { font-size: 9pt; color: #888; margin-bottom: 18pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 8pt; }
    th {
      background-color: #1976d2; color: white; font-weight: bold;
      text-align: left; padding: 7pt 5pt; font-size: 10pt;
      border: 1pt solid #1565c0;
    }
    td { padding: 5pt; border: 1pt solid #e0e0e0; font-size: 10pt; }
    tr:nth-child(even) td { background-color: #f5f5f5; }
    .footer {
      margin-top: 18pt; padding-top: 8pt; border-top: 1pt solid #e0e0e0;
      font-size: 9pt; color: #888; text-align: center;
    }
  </style>
</head>
<body>
  ${config.title ? `<h1>${escapeHtml(config.title)}</h1>` : ''}
  ${config.subtitle ? `<p class="subtitle">${escapeHtml(config.subtitle)}</p>` : ''}
  ${customHeaderHtml}
  <p class="meta">Generated: ${escapeHtml(new Date().toLocaleString())} | Total Records: ${data.length}</p>
  <table>
    <thead>${headerRow}</thead>
    <tbody>${tableRows}</tbody>
  </table>
  ${customFooterHtml}
</body>
</html>`;

  const filename = generateFilename(config.filename || 'export', 'doc');
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  downloadFile(blob, filename, 'application/msword');
}

// ============================================================================
// MAIN DISPATCH
// ============================================================================

export function exportData<T>(
  format: ExportFormat,
  data: T[],
  columns: DataTableColumn<T>[],
  config: ExportConfig
): void {
  switch (format) {
    case 'csv':   return exportToCsv(data, columns, config);
    case 'excel': return exportToExcel(data, columns, config);
    case 'pdf':   return exportToPdf(data, columns, config);
    case 'word':  return exportToWord(data, columns, config);
    default: {
      const exhaustive: never = format;
      console.warn(`Unknown export format: ${exhaustive}`);
    }
  }
}

export function getExportFormatLabel(format: ExportFormat): string {
  switch (format) {
    case 'csv':   return 'CSV';
    case 'excel': return 'Excel (.xlsx)';
    case 'pdf':   return 'PDF';
    case 'word':  return 'Word (.doc)';
    default: {
      const exhaustive: never = format;
      return String(exhaustive).toUpperCase();
    }
  }
}
