# next-nice-datatable

A comprehensive, feature-rich DataTable component for Next.js and React applications built on Material-UI. Fully typed with TypeScript, production-ready, and extensively customizable.

[![npm version](https://img.shields.io/npm/v/next-nice-datatable.svg)](https://www.npmjs.com/package/next-nice-datatable)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## Features

### Core
- **TypeScript** — fully typed; zero `any` casts in the library itself
- **Material-UI 5 / 6** — consistent, themeable design out of the box
- **Client-side & server-side modes** — bring your own fetch or let the table handle it
- **Responsive** — built-in `hiddenOnMobile` / `hiddenOnTablet` per column

### Data
- **Sorting** — click column headers; cycles asc → desc → unsorted
- **Pagination** — configurable rows-per-page options, first/last buttons
- **Client-side filter** — instant full-text filter across all loaded rows (debounced, leak-free)
- **Advanced search dialog** — multi-field, multi-operator (Contains / Equals / Starts with / Ends with), AND/OR match mode
- **Column filters** — per-column inline filter row (client or server mode)
- **Row selection** — single or multiple, with configurable select-all scope (`page` or `all`)

### Exports (real files, not print dialogs)
- **CSV** — RFC-4180 compliant, handles commas, quotes, and newlines
- **Excel (.xlsx)** — via the `xlsx` package; real `.xlsx` with column widths and optional bold title row
- **PDF** — via `jsPDF` + `jspdf-autotable`; vector PDF with styled table, header, footer, and page numbers
- **Word (.doc)** — HTML-in-DOC, opens in Microsoft Word

### Customisation (new in v2)
- **Rename every button** — Add, View, Edit, Delete, Export, Advanced Search, Refresh, and more
- **Control every button's colour and tooltip** — per-button MUI colour prop
- **Show or hide any toolbar element** — individual flags in `toolbarConfig`
- **Select-all scope** — choose whether the checkbox selects only the current page or the entire filtered dataset
- **Column visibility menu title** — configurable string
- **Export button label** — configurable string


---

## Installation

```bash
npm install next-nice-datatable
```

### Peer dependencies

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled react react-dom
```

---

## Quick start

### Minimal table

```tsx
import { DataTable } from 'next-nice-datatable';
import type { DataTableColumn } from 'next-nice-datatable';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: DataTableColumn<User>[] = [
  { id: 'name',  label: 'Name',  sortable: true, minWidth: 150 },
  { id: 'email', label: 'Email', sortable: true, minWidth: 200 },
  { id: 'role',  label: 'Role',  sortable: true, minWidth: 120 },
];

const users: User[] = [
  { id: 1, name: 'John Doe',   email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User'  },
];

export default function UsersPage() {
  return (
    <DataTable
      data={users}
      columns={columns}
      title="Users"
      subtitle="Manage system users"
      rowKeyField="id"
    />
  );
}
```

### Row selection

```tsx
import { useState } from 'react';
import { DataTable } from 'next-nice-datatable';

export default function UsersPage() {
  const [selected, setSelected] = useState<User[]>([]);

  return (
    <DataTable
      data={users}
      columns={columns}
      rowKeyField="id"
      selectedRows={selected}
      onSelectionChange={setSelected}
      selectionConfig={{
        enabled: true,
        mode: 'multiple',
        showSelectAll: true,
        selectAllScope: 'page', // or 'all' to select across all filtered rows
      }}
    />
  );
}
```

### CRUD action buttons

```tsx
export default function UsersPage() {
  return (
    <DataTable
      data={users}
      columns={columns}
      rowKeyField="id"
      showAdd
      showView
      showEdit
      showDelete
      onAdd={()        => console.log('Add')}
      onView={(row)    => console.log('View', row)}
      onEdit={(row)    => console.log('Edit', row)}
      onDelete={(row)  => console.log('Delete', row)}
    />
  );
}
```

### Customise button labels, colours, and tooltips

```tsx
<DataTable
  data={users}
  columns={columns}
  showAdd
  showDelete
  onAdd={handleAdd}
  onDelete={handleDelete}
  actionButtons={{
    addLabel:      'New User',
    deleteLabel:   'Archive',
    addColor:      'success',
    deleteColor:   'warning',
    addTooltip:    'Create a new user account',
    deleteTooltip: 'Archive the selected user',
  }}
/>
```

### Export

```tsx
<DataTable
  data={users}
  columns={columns}
  exportConfig={{
    enabled:    true,
    formats:    ['csv', 'excel', 'pdf', 'word'],
    filename:   'users-export',
    title:      'User List',
    subtitle:   'Generated by Stellarx',
    buttonLabel: 'Download',          // renames the Export button
    pdfOrientation: 'landscape',
  }}
/>
```

### Customise the toolbar

```tsx
<DataTable
  data={users}
  columns={columns}
  toolbarConfig={{
    showFilter:            true,
    showAdvancedSearch:    true,
    showRefresh:           true,
    showDensityToggle:     true,
    showColumnVisibility:  true,
    showExport:            true,
    // Rename labels
    refreshLabel:          'Reload data',
    densityLabel:          'Row height',
    columnVisibilityLabel: 'Manage columns',
    advancedSearchLabel:   'Search',
    columnMenuTitle:       'Show / hide columns',
  }}
/>
```

### Server-side mode

```tsx
import type { FetchDataParams } from 'next-nice-datatable';

export default function UsersPage() {
  const fetchData = async (params: FetchDataParams) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const { data, total } = await res.json();
    return { data, totalCount: total };
  };

  return (
    <DataTable
      columns={columns}
      rowKeyField="id"
      onFetchData={fetchData}
      searchConfig={{
        enabled: true,
        searchableFields: [
          { id: 'name',  label: 'Name'  },
          { id: 'email', label: 'Email' },
        ],
        dialogTitle: 'Search Users',
      }}
      onAdvancedSearch={(search) => {
        // search.criteria, search.matchAll
      }}
    />
  );
}
```

### Custom cell rendering

```tsx
import { Chip, Avatar, Box, Typography } from '@mui/material';

const columns: DataTableColumn<User>[] = [
  {
    id: 'name',
    label: 'Name',
    format: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 28, height: 28 }}>{String(value)[0]}</Avatar>
        <Typography variant="body2">{String(value)}</Typography>
      </Box>
    ),
    exportFormat: (value) => String(value), // plain text for exports
  },
  {
    id: 'status',
    label: 'Status',
    format: (value) => (
      <Chip
        label={String(value)}
        color={value === 'active' ? 'success' : 'default'}
        size="small"
      />
    ),
    exportFormat: (value) => String(value),
  },
];
```

### Nested data paths

`id` in `DataTableColumn` supports dot-notation to read nested object fields:

```tsx
const columns: DataTableColumn<Order>[] = [
  { id: 'customer.name',    label: 'Customer'  },
  { id: 'customer.address.city', label: 'City' },
  { id: 'amount',           label: 'Amount'    },
];
```

### Styling

```tsx
<DataTable
  data={users}
  columns={columns}
  styleConfig={{
    stripe: {
      enabled:       true,
      oddRowColor:   '#f9f9f9',
      evenRowColor:  '#ffffff',
    },
    hoverEffect:            true,
    hoverColor:             '#e3f2fd',
    density:                'comfortable', // 'compact' | 'normal' | 'comfortable'
    rounded:                true,
    elevation:              true,
    headerBackgroundColor:  '#fafafa',
    headerTextColor:        '#1976d2',
    borderStyle:            'horizontal',  // 'none' | 'horizontal' | 'vertical' | 'all'
  }}
/>
```

### Responsive columns

```tsx
const columns: DataTableColumn<User>[] = [
  { id: 'name',    label: 'Name' },                              // always visible
  { id: 'email',   label: 'Email',   hiddenOnMobile: true },    // hidden on mobile
  { id: 'address', label: 'Address', hiddenOnMobile: true, hiddenOnTablet: true }, // desktop only
];
```

---

## API reference

### `DataTableProps<T>`

#### Data

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | `[]` | Row data (client-side mode) |
| `columns` | `DataTableColumn<T>[]` | required | Column definitions |
| `rowKeyField` | `string` | `'id'` | Field used as unique row key |
| `loading` | `boolean` | `false` | Shows skeleton rows |
| `error` | `string \| null` | — | Displays an error alert |
| `emptyMessage` | `string` | `'No data available'` | Empty-state text |
| `emptyComponent` | `ReactNode` | — | Custom empty-state component |
| `totalCount` | `number` | — | Total records (server-side) |

#### Pagination

| Prop | Type | Default | Description |
|---|---|---|---|
| `pagination` | `PaginationConfig` | — | Pagination configuration object |
| `page` | `number` | `0` | Controlled current page (0-indexed) |
| `rowsPerPage` | `number` | `12` | Controlled rows per page |
| `onPageChange` | `(page: number) => void` | — |  |
| `onRowsPerPageChange` | `(rows: number) => void` | — |  |

#### Sorting

| Prop | Type | Default | Description |
|---|---|---|---|
| `sortConfig` | `SortConfig` | — | Default sort column / direction |
| `sort` | `SortState` | — | Controlled sort state |
| `onSortChange` | `(sort: SortState) => void` | — |  |

#### Selection

| Prop | Type | Default | Description |
|---|---|---|---|
| `selectionConfig` | `SelectionConfig` | — | Selection configuration |
| `selectedRows` | `T[]` | — | Controlled selected rows |
| `onSelectionChange` | `(rows: T[]) => void` | — |  |

#### Filtering & search

| Prop | Type | Default | Description |
|---|---|---|---|
| `clientFilterTerm` | `string` | — | Controlled client-side filter term |
| `clientFilterConfig` | `ClientFilterConfig` | — | Client filter configuration |
| `onClientFilterChange` | `(term: string) => void` | — |  |
| `searchConfig` | `SearchConfig` | — | Advanced search configuration |
| `advancedSearch` | `AdvancedSearchState` | — | Controlled advanced search state |
| `onAdvancedSearch` | `(state: AdvancedSearchState) => void` | — |  |

#### Export

| Prop | Type | Default | Description |
|---|---|---|---|
| `exportConfig` | `ExportConfig` | — | Export configuration |

#### Action buttons (shorthand)

| Prop | Type | Default | Description |
|---|---|---|---|
| `showAdd` | `boolean` | — | Show Add button (requires `onAdd`) |
| `showView` | `boolean` | — | Show View button (requires `onView`) |
| `showEdit` | `boolean` | — | Show Edit button (requires `onEdit`) |
| `showDelete` | `boolean` | — | Show Delete button (requires `onDelete`) |
| `actionButtons` | `ActionButtonConfig` | — | Full button configuration object |
| `onAdd` | `() => void` | — |  |
| `onView` | `(row: T) => void` | — |  |
| `onEdit` | `(row: T) => void` | — |  |
| `onDelete` | `(row: T) => void` | — |  |

#### Toolbar

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Toolbar title |
| `subtitle` | `string` | — | Toolbar subtitle |
| `toolbarConfig` | `ToolbarConfig` | — | Full toolbar configuration object |
| `toolbarActions` | `ReactNode` | — | Custom elements injected into toolbar |
| `showRefresh` | `boolean` | — | Shorthand for `toolbarConfig.showRefresh` |
| `showDensityToggle` | `boolean` | — | Shorthand for `toolbarConfig.showDensityToggle` |
| `showColumnVisibility` | `boolean` | — | Shorthand for `toolbarConfig.showColumnVisibility` |
| `onRefresh` | `() => void` | — | Refresh callback (also shows Refresh button) |

#### Callbacks & misc

| Prop | Type | Default | Description |
|---|---|---|---|
| `onFetchData` | `(params: FetchDataParams) => Promise<{data,totalCount}>` | — | Enables server-side mode |
| `onRowClick` | `(row, index, event) => void` | — |  |
| `onRowDoubleClick` | `(row, index, event) => void` | — |  |
| `id` | `string` | — | HTML `id` on the Paper element |
| `ariaLabel` | `string` | — | `aria-label` on the `<table>` |
| `testId` | `string` | — | `data-testid` on the Paper element |

---

### `DataTableColumn<T>`

```typescript
interface DataTableColumn<T> {
  id: string;           // column key; supports dot-notation for nested paths
  label: string;        // header text

  // Layout
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sticky?: 'left' | 'right';

  // Visibility
  hidden?: boolean;           // hidden by default (can toggle via column menu)
  hiddenOnMobile?: boolean;
  hiddenOnTablet?: boolean;
  exportable?: boolean;       // false = excluded from exports (default true)

  // Behaviour
  sortable?: boolean;         // default true
  searchable?: boolean;       // included in client-side full-text search
  filterable?: boolean;       // shows per-column filter input
  filterType?: 'text' | 'number' | 'select' | 'date' | 'boolean';
  filterOptions?: { value: unknown; label: string }[];

  // Rendering
  format?: (value: unknown, row: T, rowIndex: number) => ReactNode;
  exportFormat?: (value: unknown, row: T, rowIndex: number) => string;
  renderHeader?: (column: DataTableColumn<T>) => ReactNode;
  tooltip?: string;     // shown as a tooltip on the column header
  className?: string;
}
```

---

### `SelectionConfig`

```typescript
interface SelectionConfig {
  enabled?: boolean;
  mode?: 'single' | 'multiple';
  showSelectAll?: boolean;
  doubleClickSelectsOnly?: boolean;
  /**
   * 'page' (default) — select-all covers only the current page.
   * 'all'            — select-all covers every row in the filtered dataset.
   */
  selectAllScope?: 'page' | 'all';
}
```

---

### `ExportConfig`

```typescript
interface ExportConfig {
  enabled?: boolean;
  formats?: ('csv' | 'excel' | 'pdf' | 'word')[];
  filename?: string;           // base name without extension
  title?: string;              // document heading
  subtitle?: string;
  includeHeaders?: boolean;    // default true
  visibleColumnsOnly?: boolean;
  filteredDataOnly?: boolean;
  pdfOrientation?: 'portrait' | 'landscape';
  pdfPageSize?: 'a4' | 'letter' | 'legal';
  buttonLabel?: string;        // renames the Export button (default: "Export")
  /**
   * Plain text injected as a header above the table in PDF / Word.
   * HTML-escaped by default. Set allowUnsafeHtml: true only for
   * server-controlled, trusted values.
   */
  customHeader?: string;
  customFooter?: string;
  allowUnsafeHtml?: boolean;   // default false
}
```

---

### `ToolbarConfig`

```typescript
interface ToolbarConfig {
  showFilter?: boolean;               // client-side filter input
  showAdvancedSearch?: boolean;       // advanced search button
  showRefresh?: boolean;
  showDensityToggle?: boolean;
  showColumnVisibility?: boolean;
  showExport?: boolean;
  showTitle?: boolean;

  // Custom labels / tooltips
  refreshLabel?: string;              // default "Refresh"
  densityLabel?: string;              // default "Table density"
  columnVisibilityLabel?: string;     // default "Show / hide columns"
  advancedSearchLabel?: string;       // default "Advanced Search"
  columnMenuTitle?: string;           // default "Toggle Columns"
}
```

---

### `ActionButtonConfig`

```typescript
interface ActionButtonConfig {
  showAdd?: boolean;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;

  addEnabled?: boolean;
  viewEnabled?: boolean;
  editEnabled?: boolean;
  deleteEnabled?: boolean;

  // Labels (text shown on the button)
  addLabel?: string;      // default "Add"
  viewLabel?: string;     // default "View"
  editLabel?: string;     // default "Edit"
  deleteLabel?: string;   // default "Delete"

  // Tooltips (hover text)
  addTooltip?: string;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;

  // MUI colours
  addColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  viewColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  editColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  deleteColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
}
```

---

### `PaginationConfig`

```typescript
interface PaginationConfig {
  defaultRowsPerPage?: number;        // default 12
  rowsPerPageOptions?: number[];      // default [5, 10, 12, 25, 50, 100]
  showRowsPerPageSelector?: boolean;
  showFirstLastButtons?: boolean;
  rowsPerPageLabel?: string;          // label before the selector
  position?: 'top' | 'bottom' | 'both';
}
```

---

### `SearchConfig`

```typescript
interface SearchConfig {
  enabled?: boolean;
  searchableFields?: { id: string; label: string }[];
  dialogTitle?: string;
  defaultSearchField?: string;
  maxCriteria?: number;
  debounceMs?: number;
  placeholder?: string;
}
```

---

### `FetchDataParams` (server-side)

```typescript
interface FetchDataParams {
  page: number;
  rowsPerPage: number;
  sort: SortState;
  filters: FilterState;
  advancedSearch?: AdvancedSearchState;
}

interface AdvancedSearchState {
  criteria: Array<{
    id: string;
    field: string;
    value: string;
    operator: 'CONTAINS' | 'EQUALS' | 'STARTS_WITH' | 'ENDS_WITH';
  }>;
  matchAll: boolean;
}
```

---

### Utility exports

```typescript
import {
  exportData,        // export any data programmatically
  exportToCsv,
  exportToExcel,
  exportToPdf,
  exportToWord,
  getExportFormatLabel,
  getNestedValue,    // prototype-pollution-safe path reader
  formatValueForExport,
  generateFilename,
} from 'next-nice-datatable';
```

---

## Security

### Prototype pollution

`getNestedValue` — used internally for dot-notation column paths — blocks the path segments `__proto__`, `constructor`, and `prototype`. Passing a malicious path such as `__proto__.polluted` returns `undefined` without traversing the prototype chain.

### XSS in exports

Custom strings injected into PDF and Word document headers / footers are **HTML-escaped by default**. This means a `customHeader` value of `<script>alert(1)</script>` will appear as the literal text `<script>alert(1)</script>` in the document, not be executed.

To insert actual HTML markup (e.g. a formatted paragraph), set `allowUnsafeHtml: true` in `ExportConfig` — but only when the value originates from a fully trusted, server-controlled source, never from user input.

---

## Performance tips

1. Always provide `rowKeyField` — it enables React's keyed reconciliation.
2. Memoize `columns` with `useMemo` — prevents unnecessary re-renders.
3. Memoize callbacks (`onView`, `onEdit`, …) with `useCallback`.
4. Use server-side mode with `onFetchData` for datasets larger than ~10 000 rows.
5. Use `hiddenOnMobile` to reduce DOM nodes on small screens.

---

## TypeScript — full type import

```typescript
import type {
  DataTableProps,
  DataTableColumn,
  DataTableState,
  PaginationConfig,
  PaginationState,
  SortState,
  SortConfig,
  FilterState,
  FilterConfig,
  ClientFilterConfig,
  SelectionConfig,
  ExportConfig,
  ExportFormat,
  StyleConfig,
  ToolbarConfig,
  ActionButtonConfig,
  SearchConfig,
  SearchField,
  SearchCriteria,
  SearchOperator,
  AdvancedSearchState,
  FetchDataParams,
  OnFetchDataCallback,
  OnSelectionChangeCallback,
  OnRowClickCallback,
  OnRowDoubleClickCallback,
  OnAddCallback,
  OnEditCallback,
  OnDeleteCallback,
  OnViewCallback,
} from 'next-nice-datatable';
```

---

## Testing

```tsx
import { render, screen } from '@testing-library/react';
import { DataTable } from 'next-nice-datatable';

test('renders table with data', () => {
  const columns = [{ id: 'name', label: 'Name' }];
  const data = [{ id: 1, name: 'John' }];

  render(<DataTable data={data} columns={columns} rowKeyField="id" />);

  expect(screen.getByText('John')).toBeInTheDocument();
});
```

Use `testId` to target the table container:

```tsx
<DataTable testId="users-table" ... />
// screen.getByTestId('users-table')
```

---

## Contributing

Contributions are welcome — please see [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, coding conventions, and the pull-request process.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full version history.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Acknowledgements

- Table UI: [Material-UI](https://mui.com/)
- PDF export: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- Excel export: [SheetJS / xlsx](https://github.com/SheetJS/sheetjs)
- Created and maintained by [Stellarx Team](https://github.com/stellarx57)

---

Made with care by [Stellarx Team](https://github.com/stellarx57)
