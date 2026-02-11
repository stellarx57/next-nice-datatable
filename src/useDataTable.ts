/**
 * Next Nice DataTable - Custom Hook
 * State management and logic for the DataTable component
 * 
 * @author Stellarx Team
 * @version 1.0.0
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DataTableProps,
  DataTableState,
  SortState,
  FilterState,
  PaginationState,
  DataTableColumn,
  FetchDataParams,
  ServerSearchState,
  AdvancedSearchState,
  SearchCriteria,
} from './types';
import { getNestedValue } from './exportUtils';

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_ROWS_PER_PAGE = 12;
const DEFAULT_ROWS_PER_PAGE_OPTIONS = [5, 10, 12, 25, 50, 100];

// ============================================================================
// HOOK
// ============================================================================

export function useDataTable<T>(props: DataTableProps<T>) {
  const {
    data: propData = [],
    columns,
    totalCount: propTotalCount,
    page: propPage,
    rowsPerPage: propRowsPerPage,
    sort: propSort,
    filters: propFilters,
    // Client-side filter (full-text on loaded data)
    clientFilterTerm: propClientFilterTerm,
    clientFilterConfig,
    // Server-side search (database search with field selection)
    serverSearch: propServerSearch,
    // Advanced search (complex multi-field database search)
    advancedSearch: propAdvancedSearch,
    searchConfig,
    // Legacy prop (deprecated)
    searchTerm: propSearchTerm,
    selectedRows: propSelectedRows,
    pagination: paginationConfig,
    sortConfig,
    filterConfig,
    selectionConfig,
    styleConfig,
    onPageChange,
    onRowsPerPageChange,
    onSortChange,
    onFilterChange,
    onClientFilterChange,
    onServerSearchChange,
    onAdvancedSearch,
    // Legacy callback (deprecated)
    onSearchChange,
    onSelectionChange,
    onFetchData,
    rowKeyField = 'id',
  } = props;

  // =========================================================================
  // STATE
  // =========================================================================

  // Pagination state
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(
    paginationConfig?.defaultRowsPerPage || DEFAULT_ROWS_PER_PAGE
  );

  // Sort state
  const [internalSort, setInternalSort] = useState<SortState>({
    column: sortConfig?.defaultColumn || null,
    direction: sortConfig?.defaultDirection || null,
  });

  // Column filter state
  const [internalFilters, setInternalFilters] = useState<FilterState>({});

  // Client-side filter state (full-text on loaded data)
  const [internalClientFilterTerm, setInternalClientFilterTerm] = useState('');

  // Server-side search state (database search with field selection)
  const [internalServerSearch, setInternalServerSearch] = useState<ServerSearchState>({
    term: '',
    fields: searchConfig?.defaultFields || [],
  });

  // Advanced search state (complex multi-field database search)
  const [internalAdvancedSearch, setInternalAdvancedSearch] = useState<AdvancedSearchState>({
    criteria: [],
    matchAll: true,
  });

  // Selection state
  const [internalSelectedRows, setInternalSelectedRows] = useState<T[]>([]);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter(col => !col.hidden).map(col => col.id)
  );

  // Density
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>(
    styleConfig?.density || 'normal'
  );

  // Loading state for server-side operations
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState<T[]>([]);
  const [serverTotalCount, setServerTotalCount] = useState(0);

  // =========================================================================
  // CONTROLLED VS UNCONTROLLED
  // =========================================================================

  const page = propPage ?? internalPage;
  const rowsPerPage = propRowsPerPage ?? internalRowsPerPage;
  const sort = propSort ?? internalSort;
  const filters = propFilters ?? internalFilters;
  // Client-side filter (supports legacy searchTerm prop)
  const clientFilterTerm = propClientFilterTerm ?? propSearchTerm ?? internalClientFilterTerm;
  // Server-side search
  const serverSearch = propServerSearch ?? internalServerSearch;
  // Advanced search
  const advancedSearch = propAdvancedSearch ?? internalAdvancedSearch;
  const selectedRows = propSelectedRows ?? internalSelectedRows;

  // =========================================================================
  // DATA PROCESSING
  // =========================================================================

  // Determine if we're using server-side mode
  const isServerSide = !!onFetchData;

  /**
   * Recursively extracts all string values from an object for full-text search
   */
  const extractAllValues = useCallback((obj: any, visited = new WeakSet()): string[] => {
    if (obj === null || obj === undefined) return [];
    
    // Prevent circular references
    if (typeof obj === 'object' && visited.has(obj)) return [];
    
    const values: string[] = [];
    
    if (typeof obj === 'string') {
      values.push(obj);
    } else if (typeof obj === 'number' || typeof obj === 'boolean') {
      values.push(String(obj));
    } else if (obj instanceof Date) {
      values.push(obj.toISOString());
      values.push(obj.toLocaleDateString());
    } else if (Array.isArray(obj)) {
      visited.add(obj);
      obj.forEach(item => {
        values.push(...extractAllValues(item, visited));
      });
    } else if (typeof obj === 'object') {
      visited.add(obj);
      Object.values(obj).forEach(value => {
        values.push(...extractAllValues(value, visited));
      });
    }
    
    return values;
  }, []);

  /**
   * Performs full-text search on a row
   * Searches across all field values (including nested objects)
   */
  const matchesSearch = useCallback((row: T, searchLower: string): boolean => {
    // First, try searching in defined searchable columns
    const searchableColumns = columns.filter(col => col.searchable !== false);
    
    for (const col of searchableColumns) {
      const value = getNestedValue(row, col.id);
      if (value !== null && value !== undefined) {
        if (String(value).toLowerCase().includes(searchLower)) {
          return true;
        }
      }
    }
    
    // Then, perform full-text search across ALL field values
    const allValues = extractAllValues(row);
    return allValues.some(value => 
      value.toLowerCase().includes(searchLower)
    );
  }, [columns, extractAllValues]);

  // Get processed data (filtered, sorted, paginated)
  const processedData = useMemo(() => {
    if (isServerSide) {
      return serverData;
    }

    let result = [...propData];

    // Apply client-side full-text filter across all field values
    if (clientFilterTerm && clientFilterConfig?.enabled !== false) {
      const filterLower = clientFilterTerm.toLowerCase();
      result = result.filter(row => matchesSearch(row, filterLower));
    }

    // Apply column filters
    if (Object.keys(filters).length > 0 && filterConfig?.filterMode !== 'server') {
      result = result.filter(row => {
        return Object.entries(filters).every(([columnId, filter]) => {
          const value = getNestedValue(row, columnId);
          
          switch (filter.operator) {
            case 'equals':
              return value == filter.value;
            case 'contains':
              return String(value || '').toLowerCase().includes(String(filter.value).toLowerCase());
            case 'startsWith':
              return String(value || '').toLowerCase().startsWith(String(filter.value).toLowerCase());
            case 'endsWith':
              return String(value || '').toLowerCase().endsWith(String(filter.value).toLowerCase());
            case 'greaterThan':
              return Number(value) > Number(filter.value);
            case 'lessThan':
              return Number(value) < Number(filter.value);
            case 'isEmpty':
              return value === null || value === undefined || value === '';
            case 'isNotEmpty':
              return value !== null && value !== undefined && value !== '';
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sort.column && sort.direction) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sort.column!);
        const bValue = getNestedValue(b, sort.column!);

        let comparison = 0;
        if (aValue === null || aValue === undefined) comparison = 1;
        else if (bValue === null || bValue === undefined) comparison = -1;
        else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sort.direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [propData, clientFilterTerm, filters, sort, columns, isServerSide, serverData, clientFilterConfig, filterConfig, matchesSearch]);

  // Calculate total count
  const totalCount = useMemo(() => {
    if (isServerSide) {
      return propTotalCount ?? serverTotalCount;
    }
    return processedData.length;
  }, [isServerSide, propTotalCount, serverTotalCount, processedData.length]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / rowsPerPage);
  }, [totalCount, rowsPerPage]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    if (isServerSide) {
      return processedData;
    }
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return processedData.slice(start, end);
  }, [processedData, page, rowsPerPage, isServerSide]);

  // Get visible columns configuration
  const visibleColumnsConfig = useMemo(() => {
    return columns.filter(col => visibleColumns.includes(col.id));
  }, [columns, visibleColumns]);

  // =========================================================================
  // SERVER-SIDE DATA FETCHING
  // =========================================================================

  const fetchServerData = useCallback(async () => {
    if (!onFetchData) return;

    setLoading(true);
    try {
      const params: FetchDataParams = {
        page,
        rowsPerPage,
        sort,
        filters,
        search: serverSearch,
        advancedSearch: advancedSearch.criteria.length > 0 ? advancedSearch : undefined,
      };
      const result = await onFetchData(params);
      setServerData(result.data);
      setServerTotalCount(result.totalCount);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [onFetchData, page, rowsPerPage, sort, filters, serverSearch, advancedSearch]);

  // Fetch data when params change (server-side mode)
  useEffect(() => {
    if (isServerSide) {
      fetchServerData();
    }
  }, [isServerSide, fetchServerData]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handlePageChange = useCallback((newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  }, [onPageChange]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0); // Reset to first page
    }
  }, [onRowsPerPageChange]);

  const handleSortChange = useCallback((column: string) => {
    const newSort: SortState = {
      column,
      direction:
        sort.column === column
          ? sort.direction === 'asc'
            ? 'desc'
            : sort.direction === 'desc'
            ? null
            : 'asc'
          : 'asc',
    };

    // Clear sort if direction is null
    if (newSort.direction === null) {
      newSort.column = null;
    }

    if (onSortChange) {
      onSortChange(newSort);
    } else {
      setInternalSort(newSort);
    }
  }, [sort, onSortChange]);

  const handleFilterChange = useCallback((columnId: string, value: any, operator: string = 'contains') => {
    const newFilters = { ...filters };

    if (value === '' || value === null || value === undefined) {
      delete newFilters[columnId];
    } else {
      newFilters[columnId] = { value, operator: operator as any };
    }

    if (onFilterChange) {
      onFilterChange(newFilters);
    } else {
      setInternalFilters(newFilters);
      setInternalPage(0); // Reset to first page
    }
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    if (onFilterChange) {
      onFilterChange({});
    } else {
      setInternalFilters({});
      setInternalPage(0);
    }
  }, [onFilterChange]);

  // Client-side filter handler (full-text on loaded data)
  const handleClientFilterChange = useCallback((value: string) => {
    if (onClientFilterChange) {
      onClientFilterChange(value);
    } else if (onSearchChange) {
      // Legacy support
      onSearchChange(value);
    } else {
      setInternalClientFilterTerm(value);
      setInternalPage(0); // Reset to first page
    }
  }, [onClientFilterChange, onSearchChange]);

  // Server-side search handler (database search with field selection)
  const handleServerSearchChange = useCallback((term: string) => {
    const newSearch: ServerSearchState = {
      ...serverSearch,
      term,
    };
    if (onServerSearchChange) {
      onServerSearchChange(newSearch);
    } else {
      setInternalServerSearch(newSearch);
      setInternalPage(0); // Reset to first page
    }
  }, [serverSearch, onServerSearchChange]);

  // Handler to change selected search fields
  const handleSearchFieldsChange = useCallback((fields: string[]) => {
    const newSearch: ServerSearchState = {
      ...serverSearch,
      fields,
    };
    if (onServerSearchChange) {
      onServerSearchChange(newSearch);
    } else {
      setInternalServerSearch(newSearch);
    }
  }, [serverSearch, onServerSearchChange]);

  // Advanced search handler (complex multi-field database search)
  const handleAdvancedSearch = useCallback((search: AdvancedSearchState) => {
    if (onAdvancedSearch) {
      onAdvancedSearch(search);
    } else {
      setInternalAdvancedSearch(search);
      setInternalPage(0); // Reset to first page
    }
  }, [onAdvancedSearch]);

  // Clear advanced search
  const handleClearAdvancedSearch = useCallback(() => {
    const emptySearch: AdvancedSearchState = { criteria: [], matchAll: true };
    if (onAdvancedSearch) {
      onAdvancedSearch(emptySearch);
    } else {
      setInternalAdvancedSearch(emptySearch);
      setInternalPage(0);
    }
  }, [onAdvancedSearch]);

  // Check if advanced search is active
  const hasActiveAdvancedSearch = useMemo(() => {
    return advancedSearch.criteria.length > 0 && advancedSearch.criteria.some(c => c.value.trim() !== '');
  }, [advancedSearch]);

  // Legacy handler for backwards compatibility
  const handleSearchChange = useCallback((value: string) => {
    handleClientFilterChange(value);
  }, [handleClientFilterChange]);

  const handleSelectionChange = useCallback((row: T) => {
    const rowKey = (row as any)[rowKeyField];
    const isSelected = selectedRows.some((r: any) => r[rowKeyField] === rowKey);
    
    let newSelection: T[];
    if (selectionConfig?.mode === 'single') {
      newSelection = isSelected ? [] : [row];
    } else {
      newSelection = isSelected
        ? selectedRows.filter((r: any) => r[rowKeyField] !== rowKey)
        : [...selectedRows, row];
    }

    if (onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      setInternalSelectedRows(newSelection);
    }
  }, [selectedRows, rowKeyField, selectionConfig, onSelectionChange]);

  // Handle double-click selection (selects only the clicked row, deselects others)
  const handleDoubleClickSelection = useCallback((row: T) => {
    if (selectionConfig?.doubleClickSelectsOnly !== false) {
      const newSelection = [row];
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      } else {
        setInternalSelectedRows(newSelection);
      }
    }
  }, [selectionConfig, onSelectionChange]);

  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked ? paginatedData : [];
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      setInternalSelectedRows(newSelection);
    }
  }, [paginatedData, onSelectionChange]);

  const handleColumnVisibilityChange = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns(prev => 
      visible 
        ? [...prev, columnId]
        : prev.filter(id => id !== columnId)
    );
  }, []);

  const handleDensityChange = useCallback((newDensity: 'compact' | 'normal' | 'comfortable') => {
    setDensity(newDensity);
  }, []);

  // =========================================================================
  // SELECTION HELPERS
  // =========================================================================

  const isRowSelected = useCallback((row: T) => {
    const rowKey = (row as any)[rowKeyField];
    return selectedRows.some((r: any) => r[rowKeyField] === rowKey);
  }, [selectedRows, rowKeyField]);

  const isAllSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every(row => isRowSelected(row));
  }, [paginatedData, isRowSelected]);

  const isIndeterminate = useMemo(() => {
    if (paginatedData.length === 0) return false;
    const selectedCount = paginatedData.filter(row => isRowSelected(row)).length;
    return selectedCount > 0 && selectedCount < paginatedData.length;
  }, [paginatedData, isRowSelected]);

  // =========================================================================
  // RETURN
  // =========================================================================

  return {
    // Data
    data: paginatedData,
    allProcessedData: processedData,
    totalCount,
    totalPages,
    loading: props.loading || loading,

    // Pagination
    page,
    rowsPerPage,
    rowsPerPageOptions: paginationConfig?.rowsPerPageOptions || DEFAULT_ROWS_PER_PAGE_OPTIONS,

    // Sort
    sort,

    // Column Filters
    filters,
    hasActiveFilters: Object.keys(filters).length > 0,

    // Client-side Filter (full-text on loaded data)
    clientFilterTerm,

    // Server-side Search (database search with field selection)
    serverSearch,
    searchableFields: searchConfig?.searchableFields || [],

    // Advanced Search (complex multi-field database search)
    advancedSearch,
    hasActiveAdvancedSearch,

    // Legacy (deprecated)
    searchTerm: clientFilterTerm,

    // Selection
    selectedRows,
    isRowSelected,
    isAllSelected,
    isIndeterminate,

    // Columns
    columns: visibleColumnsConfig,
    allColumns: columns,
    visibleColumns,

    // Density
    density,

    // Handlers
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
    handleFilterChange,
    handleClearFilters,
    handleClientFilterChange,
    handleServerSearchChange,
    handleSearchFieldsChange,
    handleAdvancedSearch,
    handleClearAdvancedSearch,
    handleSearchChange, // Legacy
    handleSelectionChange,
    handleDoubleClickSelection,
    handleSelectAll,
    handleColumnVisibilityChange,
    handleDensityChange,
    refetch: fetchServerData,
  };
}

export default useDataTable;

