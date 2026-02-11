# MetroSq DataTable

A comprehensive, fully-featured, reusable data table component for React applications. Built with Material-UI and designed for both client-side and server-side data handling.

## Features

- ✅ **Sorting** - Click column headers to sort (ascending/descending/none)
- ✅ **Filtering** - Column-based filtering with multiple operators
- ✅ **Searching** - Global search across all searchable columns
- ✅ **Pagination** - On-demand page loading with configurable page sizes
- ✅ **Export** - Export to CSV, Excel, PDF, and Word formats
- ✅ **Selection** - Single or multiple row selection
- ✅ **Column Visibility** - Toggle column visibility at runtime
- ✅ **Responsive** - Mobile and tablet optimized with hidden column support
- ✅ **Density** - Compact, normal, and comfortable row heights
- ✅ **Striping** - Alternating row colors with customizable colors
- ✅ **Server-Side Mode** - Full support for server-side pagination/sorting/filtering
- ✅ **TypeScript** - Full TypeScript support with comprehensive types

## Installation

```bash
npm install @metrosq/datatable
# or
yarn add @metrosq/datatable
```

### Peer Dependencies

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

## Quick Start

```tsx
import { DataTable, DataTableColumn } from '@metrosq/datatable';

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
}

const columns: DataTableColumn<User>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { 
    id: 'status', 
    label: 'Status',
    format: (value) => <Chip label={value} color={value === 'active' ? 'success' : 'default'} />
  },
];

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
];

function MyComponent() {
  return (
    <DataTable
      data={users}
      columns={columns}
      title="Users"
      pagination={{ defaultRowsPerPage: 12 }}
    />
  );
}
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Data array to display |
| `columns` | `DataTableColumn<T>[]` | Required | Column definitions |
| `rowKeyField` | `string` | `'id'` | Unique key field for rows |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string \| null` | `null` | Error message to display |
| `emptyMessage` | `string` | `'No data available'` | Message when no data |
| `title` | `string` | - | Table title |
| `subtitle` | `string` | - | Table subtitle |

### Pagination Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalCount` | `number` | - | Total count for server-side pagination |
| `page` | `number` | `0` | Current page (controlled) |
| `rowsPerPage` | `number` | `12` | Rows per page (controlled) |
| `pagination.defaultRowsPerPage` | `number` | `12` | Default rows per page |
| `pagination.rowsPerPageOptions` | `number[]` | `[5,10,12,25,50,100]` | Page size options |
| `pagination.showFirstLastButtons` | `boolean` | `true` | Show first/last page buttons |
| `pagination.rowsPerPageLabel` | `string` | `'Rows per page:'` | Label for page size selector |

### Sorting Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sort` | `SortState` | - | Current sort state (controlled) |
| `sortConfig.defaultColumn` | `string` | - | Default sort column |
| `sortConfig.defaultDirection` | `'asc' \| 'desc'` | - | Default sort direction |

### Search Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchTerm` | `string` | - | Current search term (controlled) |
| `searchConfig.enabled` | `boolean` | `true` | Enable global search |
| `searchConfig.placeholder` | `string` | `'Search...'` | Search placeholder |
| `searchConfig.debounceMs` | `number` | `300` | Search debounce time |
| `searchConfig.searchMode` | `'client' \| 'server'` | `'client'` | Search mode |

### Export Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `exportConfig.enabled` | `boolean` | `true` | Enable export functionality |
| `exportConfig.formats` | `ExportFormat[]` | `['csv','excel','pdf','word']` | Allowed formats |
| `exportConfig.filename` | `string` | `'export'` | Default filename |
| `exportConfig.documentTitle` | `string` | - | Title for PDF/Word |
| `exportConfig.pdfOrientation` | `'portrait' \| 'landscape'` | `'portrait'` | PDF orientation |
| `exportConfig.pdfPageSize` | `'a4' \| 'letter' \| 'legal'` | `'a4'` | PDF page size |

### Style Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `styleConfig.stripe.enabled` | `boolean` | `true` | Enable row striping |
| `styleConfig.stripe.oddRowColor` | `string` | - | Odd row background color |
| `styleConfig.stripe.evenRowColor` | `string` | - | Even row background color |
| `styleConfig.hoverEffect` | `boolean` | `true` | Enable row hover effect |
| `styleConfig.hoverColor` | `string` | - | Row hover color |
| `styleConfig.density` | `'compact' \| 'normal' \| 'comfortable'` | `'normal'` | Row density |
| `styleConfig.elevation` | `boolean` | `true` | Show shadow elevation |
| `styleConfig.rounded` | `boolean` | `true` | Rounded corners |

### Selection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectionConfig.enabled` | `boolean` | `false` | Enable row selection |
| `selectionConfig.mode` | `'single' \| 'multiple'` | `'multiple'` | Selection mode |
| `selectionConfig.showSelectAll` | `boolean` | `true` | Show select all checkbox |
| `selectedRows` | `T[]` | - | Selected rows (controlled) |

### Callback Props

| Prop | Type | Description |
|------|------|-------------|
| `onPageChange` | `(page: number) => void` | Called when page changes |
| `onRowsPerPageChange` | `(rowsPerPage: number) => void` | Called when page size changes |
| `onSortChange` | `(sort: SortState) => void` | Called when sort changes |
| `onFilterChange` | `(filters: FilterState) => void` | Called when filters change |
| `onSearchChange` | `(searchTerm: string) => void` | Called when search changes |
| `onSelectionChange` | `(selectedRows: T[]) => void` | Called when selection changes |
| `onRowClick` | `(row: T, rowIndex: number) => void` | Called when row is clicked |
| `onRefresh` | `() => void` | Called when refresh button clicked |
| `onFetchData` | `(params: FetchDataParams) => Promise<{data, totalCount}>` | Server-side data fetching |

## Column Definition

```tsx
interface DataTableColumn<T> {
  id: string;                 // Column ID (supports nested paths like 'user.name')
  label: string;              // Display label
  minWidth?: number;          // Minimum width in pixels
  maxWidth?: number;          // Maximum width in pixels
  width?: number;             // Fixed width in pixels
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;         // Enable sorting (default: true)
  filterable?: boolean;       // Enable filtering
  searchable?: boolean;       // Include in global search (default: true)
  hiddenOnMobile?: boolean;   // Hide on mobile devices
  hiddenOnTablet?: boolean;   // Hide on tablet devices
  hidden?: boolean;           // Initially hidden
  exportable?: boolean;       // Include in exports (default: true)
  sticky?: 'left' | 'right';  // Sticky column position
  
  // Custom rendering
  format?: (value: any, row: T, rowIndex: number) => ReactNode;
  exportFormat?: (value: any, row: T, rowIndex: number) => string;
  renderHeader?: (column: DataTableColumn<T>) => ReactNode;
}
```

## Server-Side Mode

For large datasets, use server-side mode with `onFetchData`:

```tsx
const fetchData = async (params: FetchDataParams) => {
  const { page, rowsPerPage, sort, filters, searchTerm } = params;
  
  const response = await api.getUsers({
    page,
    size: rowsPerPage,
    sortBy: sort.column,
    sortDir: sort.direction,
    search: searchTerm,
    ...filters,
  });
  
  return {
    data: response.content,
    totalCount: response.totalElements,
  };
};

<DataTable
  columns={columns}
  onFetchData={fetchData}
  searchConfig={{ searchMode: 'server' }}
/>
```

## Export Customization

```tsx
<DataTable
  data={data}
  columns={columns}
  exportConfig={{
    enabled: true,
    formats: ['csv', 'excel', 'pdf', 'word'],
    filename: 'my-report',
    documentTitle: 'Monthly Sales Report',
    documentSubtitle: 'Generated from MetroSq Dashboard',
    pdfOrientation: 'landscape',
    pdfPageSize: 'a4',
    includeHeaders: true,
    filteredDataOnly: true,
    customHeader: '<p>Company Logo</p>',
    customFooter: 'Confidential - For Internal Use Only',
  }}
/>
```

## Styling Examples

### Custom Stripe Colors

```tsx
<DataTable
  data={data}
  columns={columns}
  styleConfig={{
    stripe: {
      enabled: true,
      oddRowColor: '#f5f5f5',
      evenRowColor: '#ffffff',
    },
    hoverEffect: true,
    hoverColor: 'rgba(25, 118, 210, 0.08)',
  }}
/>
```

### Compact Dense Mode

```tsx
<DataTable
  data={data}
  columns={columns}
  styleConfig={{
    density: 'compact',
    elevation: false,
    rounded: true,
  }}
/>
```

## TypeScript

Full TypeScript support with generic type parameter:

```tsx
interface Product {
  id: number;
  name: string;
  price: number;
  category: { id: number; name: string };
}

const columns: DataTableColumn<Product>[] = [
  { id: 'name', label: 'Product Name' },
  { id: 'price', label: 'Price', format: (v) => `$${v.toFixed(2)}` },
  { id: 'category.name', label: 'Category' }, // Nested path support
];

<DataTable<Product>
  data={products}
  columns={columns}
/>
```

## License

MIT © MetroSq Team

