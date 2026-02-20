# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-02-20

### Breaking changes

- **Package renamed** from `next_nice_datatable` to `next-nice-datatable`.  
  Update your `package.json` dependency and all import statements:
  ```diff
  - import { DataTable } from 'next_nice_datatable';
  + import { DataTable } from 'next-nice-datatable';
  ```
- `DataTableColumn.format` and `exportFormat` value parameter type changed from `any` to `unknown`. Custom format functions that use the value directly will need a cast (e.g. `String(value)`) if TypeScript complains.
- `DataTableProps` generic constraint changed from `Record<string, any>` to `Record<string, unknown>`.

### Security

- **Prototype-pollution fix** — `getNestedValue` now blocks `__proto__`, `constructor`, and `prototype` path segments. Malicious dot-notation paths can no longer traverse the object prototype chain.
- **XSS fix (exports)** — `customHeader`, `customFooter`, and document `<title>` values in PDF and Word exports are now HTML-escaped by default. Previously they were inserted as raw HTML, allowing script injection.
- **Null-safe `escapeHtml`** — passing `null` or `undefined` now returns an empty string instead of the literal text `"null"` or `"undefined"`.
- **New `allowUnsafeHtml` flag** on `ExportConfig` — opt-in raw HTML passthrough for `customHeader` / `customFooter` when the value is from a trusted, server-controlled source. Defaults to `false`.

### Bug fixes

- **Debounce leak fixed** — the client-side filter and server-side search inputs previously created a new `setTimeout` on every keystroke without cancelling the previous one, causing stale calls and memory leaks. Both now use `useRef` to track and clear the active timer. Outstanding timers are also cleared on component unmount via `useEffect`.
- **Top-level shorthand props ignored** — `showAdd`, `showView`, `showEdit`, `showDelete`, `addEnabled`, `viewEnabled`, `editEnabled`, `deleteEnabled`, and `deleteLabel` declared at the `DataTableProps` level were accepted by TypeScript but silently ignored by the component. They are now correctly merged with the `actionButtons` object.
- **`showRefresh`, `showColumnVisibility`, `showDensityToggle` shorthand props** were similarly ignored and are now correctly merged with `toolbarConfig`.

### New features

#### Real file exports (replaces browser print / XML tricks)
- **Excel** now uses the `xlsx` package and produces real `.xlsx` files. Numbers are stored as numbers, column widths are set, and an optional title row is bold.
- **PDF** now uses `jsPDF` + `jspdf-autotable` and produces a proper vector PDF with a styled table (blue header row, alternating body rows), document heading, generated-date line, and per-page footer with page numbers.

#### Full toolbar customisation via `ToolbarConfig`
- `refreshLabel` — tooltip / aria-label on the Refresh icon button
- `densityLabel` — tooltip on the Density icon button
- `columnVisibilityLabel` — tooltip on the Columns icon button
- `advancedSearchLabel` — text on the Advanced Search button
- `columnMenuTitle` — heading inside the column-toggle dropdown menu

#### Full action-button customisation via `ActionButtonConfig`
- `addLabel`, `viewLabel`, `editLabel`, `deleteLabel` — button text (already existed; now also respected when passed as top-level shorthand)
- `addTooltip`, `viewTooltip`, `editTooltip`, `deleteTooltip` — override the auto-generated tooltip text
- `addColor`, `viewColor`, `editColor`, `deleteColor` — MUI colour prop per button (`'primary'`, `'secondary'`, `'success'`, `'error'`, `'warning'`, `'info'`, `'inherit'`)

#### Export button label
- `ExportConfig.buttonLabel` — renames the Export button (default: `"Export"`)

#### Select-all scope
- `SelectionConfig.selectAllScope: 'page' | 'all'`  
  `'page'` (default) — the header checkbox selects only rows on the current page.  
  `'all'` — the header checkbox selects every row that survives the current client-side filter, across all pages.

#### Column header tooltips
- `DataTableColumn.tooltip` was already in the type definition but not rendered. It now wraps the column header in a MUI `Tooltip`.

#### Additional utility exports
- `exportToCsv`, `exportToExcel`, `exportToPdf`, `exportToWord` — exported individually so consumers can trigger programmatic exports without going through the UI
- `formatValueForExport`, `generateFilename` — exported for custom export pipelines

### Internal improvements

- All `any` casts removed from `useDataTable.ts` and `DataTable.tsx`; row access uses `Record<string, unknown>`.
- Local `getNestedValue` duplicate inside `DataTable.tsx` removed; the prototype-safe version from `exportUtils.ts` is now used throughout.
- `extractAllValues` (full-text search helper) uses `WeakSet` to handle circular references safely.

---

## [1.0.0] - 2026-02-11

### Added

- Initial release of Next Nice DataTable
- Comprehensive DataTable component with TypeScript support
- Client-side and server-side data modes
- Advanced search dialog with multi-field, multi-operator support
- Sorting (single column)
- Pagination with configurable options
- Client-side full-text filtering
- Row selection (single and multiple)
- Column visibility toggle (show/hide per column)
- Density control (compact, normal, comfortable)
- Export to CSV, Excel (XML/XLS), PDF (print dialog)
- CRUD action buttons (Add, View, Edit, Delete) with configurable labels
- Responsive design — `hiddenOnMobile` / `hiddenOnTablet` per column
- Material-UI 5 / 6 integration
- Full TypeScript type definitions

---

[2.0.0]: https://github.com/stellarx57/next-nice-datatable/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/stellarx57/next-nice-datatable/releases/tag/v1.0.0
