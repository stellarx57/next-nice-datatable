/**
 * Next Nice DataTable - Type Definitions
 * A comprehensive, reusable data table component
 *
 * @author Stellarx Team
 * @version 2.0.0
 * @license MIT
 */

import { ReactNode } from 'react';

// ============================================================================
// COLUMN TYPES
// ============================================================================

export type ColumnAlign = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc' | null;

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

export interface ColumnFilter {
  value: string | number | boolean | [unknown, unknown];
  operator: FilterOperator;
}

export interface DataTableColumn<T = unknown> {
  /** Unique identifier for the column (typically matches data key). Dot-notation for nested paths. */
  id: string;
  /** Display label for column header */
  label: string;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  align?: ColumnAlign;
  sortable?: boolean;
  filterable?: boolean;
  /** Whether this column participates in client-side full-text search */
  searchable?: boolean;
  hiddenOnMobile?: boolean;
  hiddenOnTablet?: boolean;
  /** Whether the column starts hidden (toggle via column-visibility menu) */
  hidden?: boolean;
  /** Whether this column is included in exports */
  exportable?: boolean;
  /** Custom render function for table cells */
  format?: (value: unknown, row: T, rowIndex: number) => ReactNode;
  /** Custom render for exports – must return a plain string */
  exportFormat?: (value: unknown, row: T, rowIndex: number) => string;
  renderHeader?: (column: DataTableColumn<T>) => ReactNode;
  filterType?: 'text' | 'number' | 'select' | 'date' | 'boolean';
  filterOptions?: { value: unknown; label: string }[];
  className?: string;
  sticky?: 'left' | 'right';
  /** Tooltip displayed on the column header */
  tooltip?: string;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationState {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginationConfig {
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  showRowsPerPageSelector?: boolean;
  showFirstLastButtons?: boolean;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
  /** Label shown before the rows-per-page selector */
  rowsPerPageLabel?: string;
  position?: 'top' | 'bottom' | 'both';
}

// ============================================================================
// SORTING
// ============================================================================

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export interface SortConfig {
  defaultColumn?: string;
  defaultDirection?: SortDirection;
}

// ============================================================================
// COLUMN FILTERS
// ============================================================================

export interface FilterState {
  [columnId: string]: ColumnFilter;
}

export interface FilterConfig {
  /** Show the per-column inline filter row below the header */
  showFilterRow?: boolean;
  filterDebounceMs?: number;
  filterMode?: 'client' | 'server';
}

// ============================================================================
// CLIENT-SIDE FILTER
// ============================================================================

export interface ClientFilterConfig {
  enabled?: boolean;
  placeholder?: string;
  debounceMs?: number;
}

// ============================================================================
// ADVANCED / SERVER-SIDE SEARCH
// ============================================================================

export interface SearchField {
  id: string;
  label: string;
}

export type SearchOperator = 'CONTAINS' | 'EQUALS' | 'STARTS_WITH' | 'ENDS_WITH';

export interface SearchCriteria {
  id: string;
  field: string;
  value: string;
  operator: SearchOperator;
}

export interface AdvancedSearchState {
  criteria: SearchCriteria[];
  matchAll: boolean;
}

/** @deprecated Use AdvancedSearchState with onAdvancedSearch instead */
export interface ServerSearchState {
  term: string;
  fields: string[];
}

export interface SearchConfig {
  enabled?: boolean;
  placeholder?: string;
  debounceMs?: number;
  minCharacters?: number;
  searchableFields?: SearchField[];
  multipleFields?: boolean;
  defaultFields?: string[];
  defaultSearchField?: string;
  maxCriteria?: number;
  /** Title shown in the advanced-search dialog */
  dialogTitle?: string;
}

// ============================================================================
// EXPORT
// ============================================================================

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'word';

export interface ExportConfig {
  enabled?: boolean;
  /** Allowed export formats shown in the menu */
  formats?: ExportFormat[] | readonly ExportFormat[];
  /** Base filename without extension */
  filename?: string;
  /** Document title (used in PDF / Word headers) */
  title?: string;
  subtitle?: string;
  includeHeaders?: boolean;
  /** Export only currently visible columns */
  visibleColumnsOnly?: boolean;
  /** Export only data that survives the current client-side filter */
  filteredDataOnly?: boolean;
  /**
   * Custom HTML injected into the PDF / Word header section.
   * NOTE: This value is HTML-escaped before insertion; plain text only.
   * For styled HTML pass `customHeaderHtml` with `allowUnsafeHtml: true`.
   */
  customHeader?: string;
  /**
   * Custom HTML injected into the PDF / Word footer section.
   * NOTE: This value is HTML-escaped before insertion; plain text only.
   */
  customFooter?: string;
  /**
   * When true, customHeader / customFooter are treated as trusted raw HTML
   * and inserted without escaping. Only set this if the values come from a
   * trusted, server-controlled source — never from user input.
   */
  allowUnsafeHtml?: boolean;
  pdfOrientation?: 'portrait' | 'landscape';
  pdfPageSize?: 'a4' | 'letter' | 'legal';
  /** Label for the export button (default: "Export") */
  buttonLabel?: string;
}

// ============================================================================
// STYLING
// ============================================================================

export interface StripeConfig {
  enabled?: boolean;
  oddRowColor?: string;
  evenRowColor?: string;
}

export interface StyleConfig {
  stripe?: StripeConfig;
  hoverEffect?: boolean;
  hoverColor?: string;
  borderStyle?: 'none' | 'horizontal' | 'vertical' | 'all';
  borderColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  density?: 'compact' | 'normal' | 'comfortable';
  elevation?: boolean;
  rounded?: boolean;
  containerClassName?: string;
  tableClassName?: string;
}

// ============================================================================
// SELECTION
// ============================================================================

export interface SelectionConfig {
  enabled?: boolean;
  mode?: 'single' | 'multiple';
  showSelectAll?: boolean;
  rowKeyField?: string;
  doubleClickSelectsOnly?: boolean;
  /**
   * 'page' – select-all covers only the rows on the current page (default).
   * 'all'  – select-all covers every row in the loaded dataset.
   */
  selectAllScope?: 'page' | 'all';
}

// ============================================================================
// TOOLBAR
// ============================================================================

export interface ToolbarConfig {
  /** Show the client-side filter input */
  showFilter?: boolean;
  /** Show the advanced-search button */
  showAdvancedSearch?: boolean;
  /** Show the refresh icon button */
  showRefresh?: boolean;
  /** Show the density-toggle icon button */
  showDensityToggle?: boolean;
  /** Show the column-visibility icon button */
  showColumnVisibility?: boolean;
  /** Show the export button / menu */
  showExport?: boolean;
  /** Show the title / subtitle in the toolbar */
  showTitle?: boolean;
  /** Label for the refresh button tooltip */
  refreshLabel?: string;
  /** Label for the density-toggle button tooltip */
  densityLabel?: string;
  /** Label for the column-visibility button tooltip */
  columnVisibilityLabel?: string;
  /** Label for the advanced-search button */
  advancedSearchLabel?: string;
  /** Heading of the toggle-columns menu */
  columnMenuTitle?: string;
}

// ============================================================================
// ACTION BUTTONS
// ============================================================================

export interface ActionButtonConfig {
  showAdd?: boolean;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  addEnabled?: boolean;
  viewEnabled?: boolean;
  editEnabled?: boolean;
  deleteEnabled?: boolean;
  /** Text shown on the Add button */
  addLabel?: string;
  /** Text shown on the View button */
  viewLabel?: string;
  /** Text shown on the Edit button */
  editLabel?: string;
  /** Text shown on the Delete / Archive button */
  deleteLabel?: string;
  /** Tooltip override for the Add button */
  addTooltip?: string;
  /** Tooltip override for the View button */
  viewTooltip?: string;
  /** Tooltip override for the Edit button */
  editTooltip?: string;
  /** Tooltip override for the Delete button */
  deleteTooltip?: string;
  /** MUI color for the Add button */
  addColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  /** MUI color for the View button */
  viewColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  /** MUI color for the Edit button */
  editColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
  /** MUI color for the Delete button */
  deleteColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit';
}

// ============================================================================
// CALLBACKS
// ============================================================================

export type OnPageChangeCallback = (page: number) => void | Promise<void>;
export type OnRowsPerPageChangeCallback = (rowsPerPage: number) => void | Promise<void>;
export type OnSortChangeCallback = (sort: SortState) => void | Promise<void>;
export type OnFilterChangeCallback = (filters: FilterState) => void | Promise<void>;
export type OnClientFilterChangeCallback = (filterTerm: string) => void | Promise<void>;
export type OnServerSearchChangeCallback = (search: ServerSearchState) => void | Promise<void>;
export type OnAdvancedSearchCallback = (search: AdvancedSearchState) => void | Promise<void>;
/** @deprecated Use OnClientFilterChangeCallback */
export type OnSearchChangeCallback = (searchTerm: string) => void | Promise<void>;
export type OnSelectionChangeCallback<T> = (selectedRows: T[]) => void;
export type OnRowClickCallback<T> = (row: T, rowIndex: number, event: React.MouseEvent) => void;
export type OnRowDoubleClickCallback<T> = (row: T, rowIndex: number, event: React.MouseEvent) => void;
export type OnAddCallback = () => void;
export type OnEditCallback<T> = (row: T) => void;
export type OnDeleteCallback<T> = (row: T) => void;
export type OnViewCallback<T> = (row: T) => void;

export interface FetchDataParams {
  page: number;
  rowsPerPage: number;
  sort: SortState;
  filters: FilterState;
  /** @deprecated Use advancedSearch */
  search: ServerSearchState;
  advancedSearch?: AdvancedSearchState;
}

export type OnFetchDataCallback<T> = (params: FetchDataParams) => Promise<{
  data: T[];
  totalCount: number;
}>;

// ============================================================================
// MAIN PROPS
// ============================================================================

export interface DataTableProps<T = unknown> {
  // --- DATA ---
  data?: T[];
  columns: DataTableColumn<T>[];
  rowKeyField?: string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyComponent?: ReactNode;

  // --- PAGINATION ---
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  pagination?: PaginationConfig;

  // --- SORTING ---
  sort?: SortState;
  sortConfig?: SortConfig;

  // --- COLUMN FILTERING ---
  filters?: FilterState;
  filterConfig?: FilterConfig;

  // --- CLIENT-SIDE FILTER ---
  clientFilterTerm?: string;
  clientFilterConfig?: ClientFilterConfig;

  // --- SERVER / ADVANCED SEARCH ---
  /** @deprecated Use advancedSearch */
  serverSearch?: ServerSearchState;
  advancedSearch?: AdvancedSearchState;
  searchConfig?: SearchConfig;

  // --- LEGACY ---
  /** @deprecated Use clientFilterTerm */
  searchTerm?: string;

  // --- EXPORT ---
  exportConfig?: ExportConfig;

  // --- STYLING ---
  styleConfig?: StyleConfig;

  // --- SELECTION ---
  selectionConfig?: SelectionConfig;
  selectedRows?: T[];

  // --- TOOLBAR ---
  toolbarConfig?: ToolbarConfig;

  // --- ACTION BUTTONS ---
  actionButtons?: ActionButtonConfig;

  // --- CALLBACKS ---
  onPageChange?: OnPageChangeCallback;
  onRowsPerPageChange?: OnRowsPerPageChangeCallback;
  onSortChange?: OnSortChangeCallback;
  onFilterChange?: OnFilterChangeCallback;
  onClientFilterChange?: OnClientFilterChangeCallback;
  onServerSearchChange?: OnServerSearchChangeCallback;
  onAdvancedSearch?: OnAdvancedSearchCallback;
  /** @deprecated Use onClientFilterChange */
  onSearchChange?: OnSearchChangeCallback;
  onSelectionChange?: OnSelectionChangeCallback<T>;
  onRowClick?: OnRowClickCallback<T>;
  onRowDoubleClick?: OnRowDoubleClickCallback<T>;
  onFetchData?: OnFetchDataCallback<T>;
  onRefresh?: () => void;
  onAdd?: OnAddCallback;
  onView?: OnViewCallback<T>;
  onEdit?: OnEditCallback<T>;
  onDelete?: OnDeleteCallback<T>;

  // --- TOOLBAR SHORTHAND PROPS (merged into toolbarConfig internally) ---
  title?: string;
  subtitle?: string;
  toolbarActions?: ReactNode;
  showColumnVisibility?: boolean;
  showRefresh?: boolean;
  showDensityToggle?: boolean;

  // --- ACTION BUTTON SHORTHAND PROPS (merged into actionButtons internally) ---
  showAdd?: boolean;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  /** @deprecated Use actionButtons.deleteLabel */
  deleteLabel?: string;
  addEnabled?: boolean;
  viewEnabled?: boolean;
  editEnabled?: boolean;
  deleteEnabled?: boolean;

  // --- ACCESSIBILITY ---
  id?: string;
  ariaLabel?: string;
  testId?: string;
}

// ============================================================================
// INTERNAL STATE
// ============================================================================

export interface DataTableState<T = unknown> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  sort: SortState;
  filters: FilterState;
  clientFilterTerm: string;
  /** @deprecated */
  serverSearch: ServerSearchState;
  advancedSearch: AdvancedSearchState;
  selectedRows: T[];
  visibleColumns: string[];
  density: 'compact' | 'normal' | 'comfortable';
}
