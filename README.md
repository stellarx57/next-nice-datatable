# Next Nice DataTable

A comprehensive, feature-rich DataTable component for Next.js and React applications with Material-UI. Built with TypeScript, fully customizable, and production-ready.

[![npm version](https://img.shields.io/npm/v/next_nice_datatable.svg)](https://www.npmjs.com/package/next_nice_datatable)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Features

### Core Features
- ✅ **TypeScript Support** - Fully typed for excellent IDE support
- ✅ **Material-UI Integration** - Beautiful, consistent design
- ✅ **Client & Server-Side** - Support for both data modes
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Accessible** - ARIA labels and keyboard navigation

### Data Management
- 🔍 **Advanced Search** - Multi-field, multi-operator search dialog
- 🔀 **Sorting** - Single and multi-column sorting
- 📄 **Pagination** - Configurable with multiple options
- 🔎 **Filtering** - Client-side and server-side filtering
- 🎯 **Selection** - Single and multiple row selection

### User Interface
- 📊 **Column Customization** - Show/hide, resize, reorder
- 📐 **Density Control** - Compact, normal, and comfortable views
- 🎨 **Styling Options** - Stripes, borders, colors
- 💫 **Smooth Animations** - Professional transitions

### Export Capabilities
- 📥 **CSV Export** - Standard CSV format
- 📗 **Excel Export** - `.xlsx` format with styling
- 📕 **PDF Export** - Professional PDFs with headers/footers
- 📝 **Word Export** - `.docx` format

### Developer Experience
- 🧩 **Modular Architecture** - Use only what you need
- 🔌 **Easy Integration** - Drop-in component
- 📚 **Comprehensive Types** - Full TypeScript definitions
- 🎯 **Callback System** - Control every interaction

---

## 📦 Installation

```bash
npm install next_nice_datatable
```

### Peer Dependencies

Make sure you have these installed:

```bash
npm install @mui/material @mui/icons-material react react-dom
```

---

## 🚀 Quick Start

### Basic Usage

```tsx
import { DataTable } from 'next_nice_datatable';
import type { DataTableColumn } from 'next_nice_datatable';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: DataTableColumn<User>[] = [
  {
    id: 'name',
    label: 'Name',
    sortable: true,
    minWidth: 150,
  },
  {
    id: 'email',
    label: 'Email',
    sortable: true,
    minWidth: 200,
  },
  {
    id: 'role',
    label: 'Role',
    sortable: true,
    minWidth: 120,
  },
];

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

function MyApp() {
  return (
    <DataTable
      data={users}
      columns={columns}
      title="Users"
      subtitle="Manage your users"
      rowKeyField="id"
    />
  );
}
```

### With Selection

```tsx
import { useState } from 'react';
import { DataTable } from 'next_nice_datatable';

function MyApp() {
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  return (
    <DataTable
      data={users}
      columns={columns}
      rowKeyField="id"
      selectedRows={selectedRows}
      onSelectionChange={setSelectedRows}
      selectionConfig={{
        enabled: true,
        mode: 'multiple',
        showSelectAll: true,
      }}
    />
  );
}
```

### With CRUD Operations

```tsx
function MyApp() {
  const handleAdd = () => console.log('Add clicked');
  const handleView = (row: User) => console.log('View:', row);
  const handleEdit = (row: User) => console.log('Edit:', row);
  const handleDelete = (row: User) => console.log('Delete:', row);

  return (
    <DataTable
      data={users}
      columns={columns}
      showAdd
      showView
      showEdit
      showDelete
      onAdd={handleAdd}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
```

### With Export

```tsx
<DataTable
  data={users}
  columns={columns}
  exportConfig={{
    filename: 'users-export',
    title: 'User List',
    formats: ['csv', 'excel', 'pdf'],
  }}
/>
```

### Server-Side Mode

```tsx
import { useState } from 'react';
import type { FetchDataParams } from 'next_nice_datatable';

function MyApp() {
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async (params: FetchDataParams) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const { data, total } = await response.json();
    setTotalCount(total);
    return { data, totalCount: total };
  };

  return (
    <DataTable
      columns={columns}
      totalCount={totalCount}
      onFetchData={fetchData}
      rowKeyField="id"
    />
  );
}
```

---

## 📖 API Reference

### Main Props

#### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Data array for client-side mode |
| `columns` | `DataTableColumn<T>[]` | **required** | Column definitions |
| `rowKeyField` | `string` | `'id'` | Unique key field for rows |
| `loading` | `boolean` | `false` | Loading state |
| `totalCount` | `number` | - | Total count for server-side pagination |

#### Pagination Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `number` | `0` | Current page (0-indexed) |
| `rowsPerPage` | `number` | `12` | Rows per page |
| `onPageChange` | `(page: number) => void` | - | Page change callback |
| `onRowsPerPageChange` | `(rows: number) => void` | - | Rows per page change callback |
| `pagination` | `PaginationConfig` | - | Pagination configuration |

#### Selection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedRows` | `T[]` | `[]` | Selected rows array |
| `onSelectionChange` | `(rows: T[]) => void` | - | Selection change callback |
| `selectionConfig` | `SelectionConfig` | - | Selection configuration |

#### Action Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showAdd` | `boolean` | `false` | Show add button |
| `showView` | `boolean` | `false` | Show view button |
| `showEdit` | `boolean` | `false` | Show edit button |
| `showDelete` | `boolean` | `false` | Show delete button |
| `onAdd` | `() => void` | - | Add callback |
| `onView` | `(row: T) => void` | - | View callback |
| `onEdit` | `(row: T) => void` | - | Edit callback |
| `onDelete` | `(row: T) => void` | - | Delete callback |

### Column Definition

```typescript
interface DataTableColumn<T> {
  id: string;                    // Column ID (matches data key)
  label: string;                 // Display label
  minWidth?: number;             // Minimum width (px)
  maxWidth?: number;             // Maximum width (px)
  width?: number;                // Fixed width (px)
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;            // Enable sorting
  searchable?: boolean;          // Include in search
  hidden?: boolean;              // Hidden by default
  format?: (value: any, row: T, index: number) => ReactNode;
  exportFormat?: (value: any, row: T, index: number) => string;
}
```

### Configuration Objects

#### SelectionConfig

```typescript
interface SelectionConfig {
  enabled?: boolean;             // Enable selection
  mode?: 'single' | 'multiple'; // Selection mode
  showSelectAll?: boolean;       // Show select all checkbox
  doubleClickSelectsOnly?: boolean; // Double-click behavior
}
```

#### ExportConfig

```typescript
interface ExportConfig {
  filename?: string;             // Export filename (without extension)
  title?: string;                // Document title
  subtitle?: string;             // Document subtitle
  formats?: ('csv' | 'excel' | 'pdf')[];
  pdfOrientation?: 'portrait' | 'landscape';
}
```

#### PaginationConfig

```typescript
interface PaginationConfig {
  defaultRowsPerPage?: number;  // Default rows per page
  rowsPerPageOptions?: number[]; // Available options
  showFirstLastButtons?: boolean; // Show first/last buttons
}
```

---

## 🎨 Styling

### Custom Styling

```tsx
<DataTable
  data={users}
  columns={columns}
  styleConfig={{
    stripe: {
      enabled: true,
      oddRowColor: '#f9f9f9',
      evenRowColor: '#ffffff',
    },
    hoverEffect: true,
    hoverColor: '#e3f2fd',
    density: 'comfortable',
    rounded: true,
    elevation: true,
  }}
/>
```

### Density Control

```tsx
<DataTable
  data={users}
  columns={columns}
  styleConfig={{
    density: 'compact' | 'normal' | 'comfortable',
  }}
/>
```

---

## 🔍 Advanced Features

### Advanced Search Dialog

```tsx
<DataTable
  data={users}
  columns={columns}
  searchConfig={{
    enabled: true,
    searchableFields: [
      { id: 'name', label: 'Name' },
      { id: 'email', label: 'Email' },
      { id: 'role', label: 'Role' },
    ],
    maxCriteria: 5,
    dialogTitle: 'Search Users',
  }}
  onAdvancedSearch={(search) => console.log(search)}
/>
```

### Custom Column Formatting

```tsx
const columns: DataTableColumn<User>[] = [
  {
    id: 'name',
    label: 'Name',
    format: (value, row) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar>{value[0]}</Avatar>
        <Typography>{value}</Typography>
      </Box>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    format: (value) => (
      <Chip
        label={value}
        color={value === 'active' ? 'success' : 'default'}
      />
    ),
  },
];
```

### Row Click Handling

```tsx
<DataTable
  data={users}
  columns={columns}
  onRowClick={(row, index, event) => {
    console.log('Row clicked:', row);
  }}
  onRowDoubleClick={(row, index, event) => {
    console.log('Row double-clicked:', row);
  }}
/>
```

---

## 🔧 TypeScript

The package is fully typed with comprehensive TypeScript definitions:

```typescript
import type {
  DataTable,
  DataTableColumn,
  DataTableProps,
  PaginationConfig,
  SelectionConfig,
  ExportConfig,
  SearchConfig,
  SortState,
  FilterState,
  AdvancedSearchState,
} from 'next_nice_datatable';
```

---

## 📱 Responsive Design

The DataTable automatically adapts to different screen sizes:

- **Mobile**: Simplified view with essential columns
- **Tablet**: Medium density with most features
- **Desktop**: Full features with all columns

Control responsive behavior:

```tsx
const columns: DataTableColumn<User>[] = [
  {
    id: 'name',
    label: 'Name',
    // Always show
  },
  {
    id: 'email',
    label: 'Email',
    hiddenOnMobile: true, // Hide on mobile
  },
  {
    id: 'details',
    label: 'Details',
    hiddenOnMobile: true, // Hide on mobile
    hiddenOnTablet: true, // Hide on tablet
  },
];
```

---

## ⚡ Performance

### Optimization Tips

1. **Use `rowKeyField`** for efficient rendering
2. **Memoize callbacks** with `useCallback`
3. **Lazy load data** with server-side mode
4. **Limit visible columns** on mobile
5. **Use pagination** for large datasets

```tsx
import { useCallback, useMemo } from 'react';

function MyApp() {
  // Memoize columns
  const columns = useMemo(() => [...], []);

  // Memoize callbacks
  const handleView = useCallback((row) => {
    // ...
  }, []);

  return (
    <DataTable
      data={users}
      columns={columns}
      onView={handleView}
      rowKeyField="id" // Important for performance
    />
  );
}
```

---

## 🧪 Testing

The component is designed to be easily testable:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from 'next_nice_datatable';

test('renders table with data', () => {
  const columns = [{ id: 'name', label: 'Name' }];
  const data = [{ id: 1, name: 'John' }];

  render(<DataTable data={data} columns={columns} />);

  expect(screen.getByText('John')).toBeInTheDocument();
});
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Material-UI](https://mui.com/)
- Export functionality powered by [jsPDF](https://github.com/parallax/jsPDF) and [XLSX](https://github.com/SheetJS/sheetjs)
- Created by [Stellarx Team](https://github.com/stellarx57)

---

## 📞 Support

- 📧 Email: support@stellarx.com
- 🐛 Issues: [GitHub Issues](https://github.com/stellarx57/next_nice_datatable/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/stellarx57/next_nice_datatable/discussions)

---

## 🗺️ Roadmap

- [ ] Inline editing
- [ ] Column resizing with drag
- [ ] Row reordering with drag & drop
- [ ] Virtual scrolling for large datasets
- [ ] Column grouping
- [ ] Nested/tree data support
- [ ] Mobile-optimized views
- [ ] Dark mode support
- [ ] Accessibility improvements

---

Made with ❤️ by [Stellarx Team](https://github.com/stellarx57)

