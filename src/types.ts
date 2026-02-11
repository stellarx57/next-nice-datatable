/**
 * Next Nice DataTable - Type Definitions
 * A comprehensive, reusable data table component
 * 
 * @author Stellarx Team
 * @version 1.0.0
 * @license MIT
 */

import { ReactNode } from 'react';

// ============================================================================
// COLUMN TYPES
// ============================================================================

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Filter operator types
 */
export type FilterOperator = 
  | 'equals' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith' 
  | 'greaterThan' 
  | 'lessThan' 
  | 'between'
  | 'isEmpty'
  | 'isNotEmpty';

/**
 * Column filter definition
 */
export interface ColumnFilter {
  value: string | number | boolean | [any, any];
  operator: FilterOperator;
}

/**
 * Column definition for the data table
 */
export interface DataTableColumn<T = any> {
  /** Unique identifier for the column (typically matches data key) */
  id: string;
  /** Display label for column header */
  label: string;
  /** Minimum width of the column in pixels */
  minWidth?: number;
  /** Maximum width of the column in pixels */
  maxWidth?: number;
  /** Fixed width of the column in pixels */
  width?: number;
  /** Text alignment */
  align?: ColumnAlign;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether the column is filterable */
  filterable?: boolean;
  /** Whether the column is searchable (included in global search) */
  searchable?: boolean;
  /** Whether to hide this column on mobile devices */
  hiddenOnMobile?: boolean;
  /** Whether to hide this column on tablet devices */
  hiddenOnTablet?: boolean;
  /** Whether the column is hidden (but can be shown via column visibility) */
  hidden?: boolean;
  /** Whether to include this column in exports */
  exportable?: boolean;
  /** Custom format function for display */
  format?: (value: any, row: T, rowIndex: number) => ReactNode;
  /** Custom format function for export (returns string) */
  exportFormat?: (value: any, row: T, rowIndex: number) => string;
  /** Header render function for custom header content */
  renderHeader?: (column: DataTableColumn<T>) => ReactNode;
  /** Filter type for this column */
  filterType?: 'text' | 'number' | 'select' | 'date' | 'boolean';
  /** Options for select filter type */
  filterOptions?: { value: any; label: string }[];
  /** CSS class name for the column */
  className?: string;
  /** Whether this column is sticky (fixed position) */
  sticky?: 'left' | 'right';
  /** Tooltip for column header */
  tooltip?: string;
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Pagination state
 */
export interface PaginationState {
  /** Current page number (0-indexed) */
  page: number;
  /** Number of rows per page */
  rowsPerPage: number;
  /** Total number of items */
  totalCount: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Default number of rows per page */
  defaultRowsPerPage?: number;
  /** Available options for rows per page selector */
  rowsPerPageOptions?: number[];
  /** Whether to show the rows per page selector */
  showRowsPerPageSelector?: boolean;
  /** Whether to show first/last page buttons */
  showFirstLastButtons?: boolean;
  /** Whether to show page numbers */
  showPageNumbers?: boolean;
  /** Maximum number of page buttons to show */
  maxPageButtons?: number;
  /** Label for rows per page selector */
  rowsPerPageLabel?: string;
  /** Position of pagination */
  position?: 'top' | 'bottom' | 'both';
}

// ============================================================================
// SORTING TYPES
// ============================================================================

/**
 * Sort state
 */
export interface SortState {
  /** Column ID to sort by */
  column: string | null;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  /** Default sort column */
  defaultColumn?: string;
  /** Default sort direction */
  defaultDirection?: SortDirection;
  /** Whether to allow multi-column sorting */
  multiSort?: boolean;
  /** Maximum columns for multi-sort */
  maxSortColumns?: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filter state (column ID -> filter value)
 */
export interface FilterState {
  [columnId: string]: ColumnFilter;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Whether to show filter row */
  showFilterRow?: boolean;
  /** Debounce time for filter input (ms) */
  filterDebounceMs?: number;
  /** Filter mode: 'client' for client-side, 'server' for server-side */
  filterMode?: 'client' | 'server';
}

// ============================================================================
// FILTER (CLIENT-SIDE) TYPES
// ============================================================================

/**
 * Client-side filter configuration (full-text filtering on loaded data)
 */
export interface ClientFilterConfig {
  /** Whether to show client-side filter */
  enabled?: boolean;
  /** Placeholder text for filter input */
  placeholder?: string;
  /** Debounce time for filter input (ms) */
  debounceMs?: number;
}

// ============================================================================
// SEARCH (SERVER-SIDE) TYPES
// ============================================================================

/**
 * Server-side search field selection
 */
export interface SearchField {
  /** Field/column ID */
  id: string;
  /** Display label */
  label: string;
}

/**
 * Search operator types for advanced search
 */
export type SearchOperator = 'CONTAINS' | 'EQUALS' | 'STARTS_WITH' | 'ENDS_WITH';

/**
 * Single search criterion for advanced search
 */
export interface SearchCriteria {
  /** Unique identifier for the criterion */
  id: string;
  /** Field/column ID to search in */
  field: string;
  /** Search value */
  value: string;
  /** Search operator */
  operator: SearchOperator;
}

/**
 * Advanced search state (for complex database queries)
 */
export interface AdvancedSearchState {
  /** Array of search criteria */
  criteria: SearchCriteria[];
  /** Whether all criteria must match (AND) or any (OR) */
  matchAll: boolean;
}

/**
 * Server-side search state (simple single-term search)
 * @deprecated Use AdvancedSearchState for complex searches
 */
export interface ServerSearchState {
  /** Search term */
  term: string;
  /** Selected fields to search in */
  fields: string[];
}

/**
 * Server-side search configuration (database search)
 */
export interface SearchConfig {
  /** Whether to show server-side search */
  enabled?: boolean;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Debounce time for search input (ms) */
  debounceMs?: number;
  /** Minimum characters to trigger search */
  minCharacters?: number;
  /** Available fields for search selection */
  searchableFields?: SearchField[];
  /** Whether to allow multiple field selection */
  multipleFields?: boolean;
  /** Default fields to search in */
  defaultFields?: string[];
  /** Default field for advanced search dialog */
  defaultSearchField?: string;
  /** Maximum number of search criteria allowed */
  maxCriteria?: number;
  /** Title for the advanced search dialog */
  dialogTitle?: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'word';

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Whether to enable export functionality */
  enabled?: boolean;
  /** Allowed export formats */
  formats?: ExportFormat[] | readonly ExportFormat[];
  /** Default filename for exports (without extension) */
  filename?: string;
  /** Document title for PDF/Word exports */
  title?: string;
  /** Document subtitle/description */
  subtitle?: string;
  /** Whether to include headers in export */
  includeHeaders?: boolean;
  /** Whether to include only visible columns */
  visibleColumnsOnly?: boolean;
  /** Whether to include only filtered data */
  filteredDataOnly?: boolean;
  /** Custom header for PDF/Word */
  customHeader?: string;
  /** Custom footer for PDF/Word */
  customFooter?: string;
  /** Page orientation for PDF */
  pdfOrientation?: 'portrait' | 'landscape';
  /** Page size for PDF */
  pdfPageSize?: 'a4' | 'letter' | 'legal';
}

// ============================================================================
// STYLING TYPES
// ============================================================================

/**
 * Stripe configuration
 */
export interface StripeConfig {
  /** Whether to show striped rows */
  enabled?: boolean;
  /** Color for odd rows */
  oddRowColor?: string;
  /** Color for even rows */
  evenRowColor?: string;
}

/**
 * Style configuration
 */
export interface StyleConfig {
  /** Stripe configuration */
  stripe?: StripeConfig;
  /** Whether to show row hover effect */
  hoverEffect?: boolean;
  /** Hover background color */
  hoverColor?: string;
  /** Border style */
  borderStyle?: 'none' | 'horizontal' | 'vertical' | 'all';
  /** Border color */
  borderColor?: string;
  /** Header background color */
  headerBackgroundColor?: string;
  /** Header text color */
  headerTextColor?: string;
  /** Row height: 'compact', 'normal', 'comfortable' */
  density?: 'compact' | 'normal' | 'comfortable';
  /** Whether to show shadow/elevation */
  elevation?: boolean;
  /** Whether to make table rounded */
  rounded?: boolean;
  /** Custom CSS class for the table container */
  containerClassName?: string;
  /** Custom CSS class for the table */
  tableClassName?: string;
}

// ============================================================================
// SELECTION TYPES
// ============================================================================

/**
 * Selection configuration
 */
export interface SelectionConfig {
  /** Whether to enable row selection */
  enabled?: boolean;
  /** Selection mode */
  mode?: 'single' | 'multiple';
  /** Whether to show select all checkbox */
  showSelectAll?: boolean;
  /** Key field for identifying rows */
  rowKeyField?: string;
  /** Whether double-click selects only the clicked row (deselects others) */
  doubleClickSelectsOnly?: boolean;
}

// ============================================================================
// TOOLBAR CONFIGURATION
// ============================================================================

/**
 * Toolbar visibility configuration
 */
export interface ToolbarConfig {
  /** Whether to show the filter input */
  showFilter?: boolean;
  /** Whether to show the advanced search button */
  showAdvancedSearch?: boolean;
  /** Whether to show the refresh button */
  showRefresh?: boolean;
  /** Whether to show the density toggle */
  showDensityToggle?: boolean;
  /** Whether to show column visibility toggle */
  showColumnVisibility?: boolean;
  /** Whether to show export button */
  showExport?: boolean;
  /** Whether to show title and subtitle */
  showTitle?: boolean;
}

// ============================================================================
// ACTION BUTTON TYPES
// ============================================================================

/**
 * Action button configuration for CRUD operations
 */
export interface ActionButtonConfig {
  /** Whether the Add button is shown */
  showAdd?: boolean;
  /** Whether the View button is shown */
  showView?: boolean;
  /** Whether the Edit button is shown */
  showEdit?: boolean;
  /** Whether the Delete button is shown */
  showDelete?: boolean;
  /** Whether the Add button is enabled (default: true) */
  addEnabled?: boolean;
  /** Whether the View button is enabled (default: true, disabled with multiple selection) */
  viewEnabled?: boolean;
  /** Whether the Edit button is enabled (default: true, disabled with multiple selection) */
  editEnabled?: boolean;
  /** Whether the Delete button is enabled (default: true, disabled with multiple selection) */
  deleteEnabled?: boolean;
  /** Label for Add button */
  addLabel?: string;
  /** Label for View button */
  viewLabel?: string;
  /** Label for Edit button */
  editLabel?: string;
  /** Label for Delete button */
  deleteLabel?: string;
}

// ============================================================================
// CALLBACK TYPES
// ============================================================================

/**
 * Callback when page changes
 */
export type OnPageChangeCallback = (page: number) => void | Promise<void>;

/**
 * Callback when rows per page changes
 */
export type OnRowsPerPageChangeCallback = (rowsPerPage: number) => void | Promise<void>;

/**
 * Callback when sort changes
 */
export type OnSortChangeCallback = (sort: SortState) => void | Promise<void>;

/**
 * Callback when filter changes
 */
export type OnFilterChangeCallback = (filters: FilterState) => void | Promise<void>;

/**
 * Callback when client filter changes
 */
export type OnClientFilterChangeCallback = (filterTerm: string) => void | Promise<void>;

/**
 * Callback when server search changes
 */
export type OnServerSearchChangeCallback = (search: ServerSearchState) => void | Promise<void>;

/**
 * Callback when advanced search is performed
 */
export type OnAdvancedSearchCallback = (search: AdvancedSearchState) => void | Promise<void>;

/**
 * @deprecated Use OnClientFilterChangeCallback instead
 */
export type OnSearchChangeCallback = (searchTerm: string) => void | Promise<void>;

/**
 * Callback when selection changes
 */
export type OnSelectionChangeCallback<T> = (selectedRows: T[]) => void;

/**
 * Callback when row is clicked
 */
export type OnRowClickCallback<T> = (row: T, rowIndex: number, event: React.MouseEvent) => void;

/**
 * Callback when row is double-clicked
 */
export type OnRowDoubleClickCallback<T> = (row: T, rowIndex: number, event: React.MouseEvent) => void;

/**
 * Callback for Add action button
 */
export type OnAddCallback = () => void;

/**
 * Callback for Edit action button
 */
export type OnEditCallback<T> = (row: T) => void;

/**
 * Callback for Delete action button
 */
export type OnDeleteCallback<T> = (row: T) => void;

/**
 * Callback for View action button
 */
export type OnViewCallback<T> = (row: T) => void;

/**
 * Callback for fetching data (server-side)
 */
export interface FetchDataParams {
  page: number;
  rowsPerPage: number;
  sort: SortState;
  filters: FilterState;
  /** Server-side search state (simple) */
  search: ServerSearchState;
  /** Advanced search state (complex multi-field search) */
  advancedSearch?: AdvancedSearchState;
}

export type OnFetchDataCallback<T> = (params: FetchDataParams) => Promise<{
  data: T[];
  totalCount: number;
}>;

// ============================================================================
// MAIN PROPS TYPE
// ============================================================================

/**
 * Main DataTable props
 */
export interface DataTableProps<T = any> {
  // === DATA ===
  /** Data array to display (for client-side mode) */
  data?: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Unique key field for rows */
  rowKeyField?: string;
  /** Loading state */
  loading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state component */
  emptyComponent?: ReactNode;

  // === PAGINATION ===
  /** Total count for server-side pagination */
  totalCount?: number;
  /** Current page (controlled) */
  page?: number;
  /** Rows per page (controlled) */
  rowsPerPage?: number;
  /** Pagination configuration */
  pagination?: PaginationConfig;

  // === SORTING ===
  /** Current sort state (controlled) */
  sort?: SortState;
  /** Sort configuration */
  sortConfig?: SortConfig;

  // === COLUMN FILTERING ===
  /** Current column filter state (controlled) */
  filters?: FilterState;
  /** Column filter configuration */
  filterConfig?: FilterConfig;

  // === CLIENT-SIDE FILTER (Full-text on loaded data) ===
  /** Current client filter term (controlled) */
  clientFilterTerm?: string;
  /** Client-side filter configuration */
  clientFilterConfig?: ClientFilterConfig;

  // === SERVER-SIDE SEARCH (Database search with field selection) ===
  /** Current server search state (controlled) */
  serverSearch?: ServerSearchState;
  /** Current advanced search state (controlled) */
  advancedSearch?: AdvancedSearchState;
  /** Server-side search configuration */
  searchConfig?: SearchConfig;

  // === LEGACY: searchTerm (deprecated, use clientFilterTerm) ===
  /** @deprecated Use clientFilterTerm instead */
  searchTerm?: string;

  // === EXPORT ===
  /** Export configuration */
  exportConfig?: ExportConfig;

  // === STYLING ===
  /** Style configuration */
  styleConfig?: StyleConfig;

  // === SELECTION ===
  /** Selection configuration */
  selectionConfig?: SelectionConfig;
  /** Currently selected rows (controlled) */
  selectedRows?: T[];

  // === TOOLBAR ===
  /** Toolbar visibility configuration */
  toolbarConfig?: ToolbarConfig;

  // === ACTION BUTTONS ===
  /** Action button configuration (Add, Edit, Delete) */
  actionButtons?: ActionButtonConfig;

  // === CALLBACKS ===
  /** Callback when page changes */
  onPageChange?: OnPageChangeCallback;
  /** Callback when rows per page changes */
  onRowsPerPageChange?: OnRowsPerPageChangeCallback;
  /** Callback when sort changes */
  onSortChange?: OnSortChangeCallback;
  /** Callback when column filters change */
  onFilterChange?: OnFilterChangeCallback;
  /** Callback when client-side filter changes */
  onClientFilterChange?: OnClientFilterChangeCallback;
  /** Callback when server-side search changes */
  onServerSearchChange?: OnServerSearchChangeCallback;
  /** Callback when advanced search is performed */
  onAdvancedSearch?: OnAdvancedSearchCallback;
  /** @deprecated Use onClientFilterChange instead */
  onSearchChange?: OnSearchChangeCallback;
  /** Callback when selection changes */
  onSelectionChange?: OnSelectionChangeCallback<T>;
  /** Callback when row is clicked */
  onRowClick?: OnRowClickCallback<T>;
  /** Callback when row is double-clicked */
  onRowDoubleClick?: OnRowDoubleClickCallback<T>;
  /** Callback for fetching data (server-side mode) */
  onFetchData?: OnFetchDataCallback<T>;
  /** Callback when refresh is clicked */
  onRefresh?: () => void;
  /** Callback when Add button is clicked */
  onAdd?: OnAddCallback;
  /** Callback when View button is clicked */
  onView?: OnViewCallback<T>;
  /** Callback when Edit button is clicked */
  onEdit?: OnEditCallback<T>;
  /** Callback when Delete button is clicked */
  onDelete?: OnDeleteCallback<T>;

  // === TOOLBAR ===
  /** Title to display in toolbar */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Custom toolbar actions */
  toolbarActions?: ReactNode;
  /** Whether to show column visibility toggle */
  showColumnVisibility?: boolean;
  /** Whether to show refresh button */
  showRefresh?: boolean;
  /** Whether to show density toggle */
  showDensityToggle?: boolean;
  /** Whether to show add button */
  showAdd?: boolean;
  /** Whether to show view button */
  showView?: boolean;
  /** Whether to show edit button */
  showEdit?: boolean;
  /** Whether to show delete button */
  showDelete?: boolean;
  /** Label for delete button (e.g., "Archive", "Delete") */
  deleteLabel?: string;
  /** Whether add button is enabled */
  addEnabled?: boolean;
  /** Whether view button is enabled */
  viewEnabled?: boolean;
  /** Whether edit button is enabled */
  editEnabled?: boolean;
  /** Whether delete button is enabled */
  deleteEnabled?: boolean;

  // === MISC ===
  /** ID for the table (for accessibility) */
  id?: string;
  /** ARIA label for the table */
  ariaLabel?: string;
  /** Test ID for testing */
  testId?: string;
}

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Internal state of the DataTable
 */
export interface DataTableState<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  sort: SortState;
  filters: FilterState;
  /** Client-side filter term (for full-text filtering on loaded data) */
  clientFilterTerm: string;
  /** Server-side search state (for database search with field selection) */
  serverSearch: ServerSearchState;
  /** Advanced search state (for complex multi-field database search) */
  advancedSearch: AdvancedSearchState;
  selectedRows: T[];
  visibleColumns: string[];
  density: 'compact' | 'normal' | 'comfortable';
}
