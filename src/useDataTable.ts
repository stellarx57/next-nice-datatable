/**
 * Next Nice DataTable - Custom Hook
 * State management and data-processing logic for the DataTable component.
 *
 * Changes in v2:
 *  - Eliminated all `any` casts; uses Record<string, unknown> for row access
 *  - getNestedValue imported from exportUtils (prototype-pollution safe)
 *  - handleSelectAll respects selectionConfig.selectAllScope ('page' | 'all')
 *  - isAllSelected / isIndeterminate reflect the active scope
 *
 * @author Stellarx Team
 * @version 2.0.0
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DataTableProps,
  SortState,
  FilterState,
  DataTableColumn,
  FetchDataParams,
  ServerSearchState,
  AdvancedSearchState,
} from './types';
import { getNestedValue } from './exportUtils';

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_ROWS_PER_PAGE = 12;
const DEFAULT_ROWS_PER_PAGE_OPTIONS = [5, 10, 12, 25, 50, 100];

// ============================================================================
// HOOK
// ============================================================================

export function useDataTable<T extends Record<string, unknown>>(props: DataTableProps<T>) {
  const {
    data: propData = [],
    columns,
    totalCount: propTotalCount,
    page: propPage,
    rowsPerPage: propRowsPerPage,
    sort: propSort,
    filters: propFilters,
    clientFilterTerm: propClientFilterTerm,
    clientFilterConfig,
    serverSearch: propServerSearch,
    advancedSearch: propAdvancedSearch,
    searchConfig,
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
    onSearchChange,
    onSelectionChange,
    onFetchData,
    rowKeyField = 'id',
  } = props;

  // =========================================================================
  // INTERNAL STATE
  // =========================================================================

  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(
    paginationConfig?.defaultRowsPerPage || DEFAULT_ROWS_PER_PAGE
  );
  const [internalSort, setInternalSort] = useState<SortState>({
    column: sortConfig?.defaultColumn || null,
    direction: sortConfig?.defaultDirection || null,
  });
  const [internalFilters, setInternalFilters] = useState<FilterState>({});
  const [internalClientFilterTerm, setInternalClientFilterTerm] = useState('');
  const [internalServerSearch, setInternalServerSearch] = useState<ServerSearchState>({
    term: '',
    fields: searchConfig?.defaultFields || [],
  });
  const [internalAdvancedSearch, setInternalAdvancedSearch] = useState<AdvancedSearchState>({
    criteria: [],
    matchAll: true,
  });
  const [internalSelectedRows, setInternalSelectedRows] = useState<T[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter(col => !col.hidden).map(col => col.id)
  );
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>(
    styleConfig?.density || 'normal'
  );
  const [serverLoading, setServerLoading] = useState(false);
  const [serverData, setServerData] = useState<T[]>([]);
  const [serverTotalCount, setServerTotalCount] = useState(0);

  // =========================================================================
  // CONTROLLED / UNCONTROLLED RESOLUTION
  // =========================================================================

  const page = propPage ?? internalPage;
  const rowsPerPage = propRowsPerPage ?? internalRowsPerPage;
  const sort = propSort ?? internalSort;
  const filters = propFilters ?? internalFilters;
  const clientFilterTerm = propClientFilterTerm ?? propSearchTerm ?? internalClientFilterTerm;
  const serverSearch = propServerSearch ?? internalServerSearch;
  const advancedSearch = propAdvancedSearch ?? internalAdvancedSearch;
  const selectedRows = propSelectedRows ?? internalSelectedRows;

  // =========================================================================
  // SERVER-SIDE FLAG
  // =========================================================================

  const isServerSide = !!onFetchData;

  // =========================================================================
  // CLIENT-SIDE SEARCH HELPERS
  // =========================================================================

  /**
   * Recursively collects all leaf string values from an object.
   * Uses a WeakSet to handle circular references safely.
   */
  const extractAllValues = useCallback((obj: unknown, visited = new WeakSet()): string[] => {
    if (obj === null || obj === undefined) return [];
    const values: string[] = [];

    if (typeof obj === 'string') {
      values.push(obj);
    } else if (typeof obj === 'number' || typeof obj === 'boolean') {
      values.push(String(obj));
    } else if (obj instanceof Date) {
      values.push(obj.toISOString(), obj.toLocaleDateString());
    } else if (Array.isArray(obj)) {
      if (visited.has(obj)) return [];
      visited.add(obj);
      for (const item of obj) values.push(...extractAllValues(item, visited));
    } else if (typeof obj === 'object') {
      if (visited.has(obj as object)) return [];
      visited.add(obj as object);
      for (const value of Object.values(obj as Record<string, unknown>)) {
        values.push(...extractAllValues(value, visited));
      }
    }

    return values;
  }, []);

  const matchesSearch = useCallback((row: T, searchLower: string): boolean => {
    // Check explicitly declared searchable columns first
    const searchableCols = columns.filter(col => col.searchable !== false);
    for (const col of searchableCols) {
      const value = getNestedValue(row as Record<string, unknown>, col.id);
      if (value !== null && value !== undefined) {
        if (String(value).toLowerCase().includes(searchLower)) return true;
      }
    }
    // Full-text fallback across all values
    const allValues = extractAllValues(row);
    return allValues.some(v => v.toLowerCase().includes(searchLower));
  }, [columns, extractAllValues]);

  // =========================================================================
  // DATA PROCESSING
  // =========================================================================

  const processedData = useMemo((): T[] => {
    if (isServerSide) return serverData;

    let result = [...propData];

    // Client-side full-text filter
    if (clientFilterTerm && clientFilterConfig?.enabled !== false) {
      const filterLower = clientFilterTerm.toLowerCase();
      result = result.filter(row => matchesSearch(row, filterLower));
    }

    // Column filters (client-side only)
    if (Object.keys(filters).length > 0 && filterConfig?.filterMode !== 'server') {
      result = result.filter(row =>
        Object.entries(filters).every(([columnId, filter]) => {
          const value = getNestedValue(row as Record<string, unknown>, columnId);
          const strVal = String(value ?? '').toLowerCase();
          const strFilter = String(filter.value ?? '').toLowerCase();

          switch (filter.operator) {
            case 'equals':      return String(value) === String(filter.value);
            case 'contains':    return strVal.includes(strFilter);
            case 'startsWith':  return strVal.startsWith(strFilter);
            case 'endsWith':    return strVal.endsWith(strFilter);
            case 'greaterThan': return Number(value) > Number(filter.value);
            case 'lessThan':    return Number(value) < Number(filter.value);
            case 'isEmpty':     return value === null || value === undefined || value === '';
            case 'isNotEmpty':  return value !== null && value !== undefined && value !== '';
            default:            return true;
          }
        })
      );
    }

    // Sorting
    if (sort.column && sort.direction) {
      result.sort((a, b) => {
        const aVal = getNestedValue(a as Record<string, unknown>, sort.column!);
        const bVal = getNestedValue(b as Record<string, unknown>, sort.column!);

        let cmp = 0;
        if (aVal === null || aVal === undefined) cmp = 1;
        else if (bVal === null || bVal === undefined) cmp = -1;
        else if (typeof aVal === 'string' && typeof bVal === 'string') {
          cmp = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }

        return sort.direction === 'desc' ? -cmp : cmp;
      });
    }

    return result;
  }, [
    propData, clientFilterTerm, filters, sort,
    isServerSide, serverData, clientFilterConfig, filterConfig, matchesSearch,
  ]);

  const totalCount = useMemo((): number => {
    if (isServerSide) return propTotalCount ?? serverTotalCount;
    return processedData.length;
  }, [isServerSide, propTotalCount, serverTotalCount, processedData.length]);

  const totalPages = useMemo(() => Math.ceil(totalCount / rowsPerPage), [totalCount, rowsPerPage]);

  const paginatedData = useMemo((): T[] => {
    if (isServerSide) return processedData;
    const start = page * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, page, rowsPerPage, isServerSide]);

  const visibleColumnsConfig = useMemo((): DataTableColumn<T>[] =>
    columns.filter(col => visibleColumns.includes(col.id)),
    [columns, visibleColumns]
  );

  // =========================================================================
  // SERVER-SIDE FETCHING
  // =========================================================================

  const fetchServerData = useCallback(async () => {
    if (!onFetchData) return;
    setServerLoading(true);
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
      setServerData(result.data as T[]);
      setServerTotalCount(result.totalCount);
    } catch (err) {
      console.error('[DataTable] Failed to fetch server data:', err);
    } finally {
      setServerLoading(false);
    }
  }, [onFetchData, page, rowsPerPage, sort, filters, serverSearch, advancedSearch]);

  useEffect(() => {
    if (isServerSide) fetchServerData();
  }, [isServerSide, fetchServerData]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handlePageChange = useCallback((newPage: number) => {
    if (onPageChange) onPageChange(newPage);
    else setInternalPage(newPage);
  }, [onPageChange]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0);
    }
  }, [onRowsPerPageChange]);

  const handleSortChange = useCallback((column: string) => {
    const newDir =
      sort.column === column
        ? sort.direction === 'asc' ? 'desc' : sort.direction === 'desc' ? null : 'asc'
        : 'asc';

    const newSort: SortState = {
      column: newDir === null ? null : column,
      direction: newDir,
    };

    if (onSortChange) onSortChange(newSort);
    else setInternalSort(newSort);
  }, [sort, onSortChange]);

  const handleFilterChange = useCallback((
    columnId: string,
    value: unknown,
    operator = 'contains'
  ) => {
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[columnId];
    } else {
      newFilters[columnId] = { value: value as FilterState[string]['value'], operator: operator as FilterState[string]['operator'] };
    }
    if (onFilterChange) onFilterChange(newFilters);
    else { setInternalFilters(newFilters); setInternalPage(0); }
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    if (onFilterChange) onFilterChange({});
    else { setInternalFilters({}); setInternalPage(0); }
  }, [onFilterChange]);

  const handleClientFilterChange = useCallback((value: string) => {
    if (onClientFilterChange) onClientFilterChange(value);
    else if (onSearchChange) onSearchChange(value);
    else { setInternalClientFilterTerm(value); setInternalPage(0); }
  }, [onClientFilterChange, onSearchChange]);

  const handleServerSearchChange = useCallback((term: string) => {
    const newSearch: ServerSearchState = { ...serverSearch, term };
    if (onServerSearchChange) onServerSearchChange(newSearch);
    else { setInternalServerSearch(newSearch); setInternalPage(0); }
  }, [serverSearch, onServerSearchChange]);

  const handleSearchFieldsChange = useCallback((fields: string[]) => {
    const newSearch: ServerSearchState = { ...serverSearch, fields };
    if (onServerSearchChange) onServerSearchChange(newSearch);
    else setInternalServerSearch(newSearch);
  }, [serverSearch, onServerSearchChange]);

  const handleAdvancedSearch = useCallback((search: AdvancedSearchState) => {
    if (onAdvancedSearch) onAdvancedSearch(search);
    else { setInternalAdvancedSearch(search); setInternalPage(0); }
  }, [onAdvancedSearch]);

  const handleClearAdvancedSearch = useCallback(() => {
    const empty: AdvancedSearchState = { criteria: [], matchAll: true };
    if (onAdvancedSearch) onAdvancedSearch(empty);
    else { setInternalAdvancedSearch(empty); setInternalPage(0); }
  }, [onAdvancedSearch]);

  const hasActiveAdvancedSearch = useMemo(() =>
    advancedSearch.criteria.length > 0 &&
    advancedSearch.criteria.some(c => c.value.trim() !== ''),
    [advancedSearch]
  );

  /** @deprecated – kept for backwards-compat, delegates to handleClientFilterChange */
  const handleSearchChange = useCallback((value: string) => {
    handleClientFilterChange(value);
  }, [handleClientFilterChange]);

  // -------------------------------------------------------------------------
  // SELECTION
  // -------------------------------------------------------------------------

  const getRowKey = useCallback((row: T): unknown =>
    (row as Record<string, unknown>)[rowKeyField],
    [rowKeyField]
  );

  const isRowSelected = useCallback((row: T): boolean => {
    const key = getRowKey(row);
    return selectedRows.some(r => (r as Record<string, unknown>)[rowKeyField] === key);
  }, [selectedRows, rowKeyField, getRowKey]);

  const handleSelectionChange = useCallback((row: T) => {
    const key = getRowKey(row);
    const alreadySelected = selectedRows.some(r => (r as Record<string, unknown>)[rowKeyField] === key);

    let newSelection: T[];
    if (selectionConfig?.mode === 'single') {
      newSelection = alreadySelected ? [] : [row];
    } else {
      newSelection = alreadySelected
        ? selectedRows.filter(r => (r as Record<string, unknown>)[rowKeyField] !== key)
        : [...selectedRows, row];
    }

    if (onSelectionChange) onSelectionChange(newSelection);
    else setInternalSelectedRows(newSelection);
  }, [selectedRows, rowKeyField, selectionConfig, onSelectionChange, getRowKey]);

  const handleDoubleClickSelection = useCallback((row: T) => {
    if (selectionConfig?.doubleClickSelectsOnly !== false) {
      if (onSelectionChange) onSelectionChange([row]);
      else setInternalSelectedRows([row]);
    }
  }, [selectionConfig, onSelectionChange]);

  /**
   * Determines which set of rows the "select all" checkbox covers.
   * 'page' (default) – only the currently visible page.
   * 'all' – every row surviving the current filter.
   */
  const selectAllScope = useMemo((): T[] =>
    selectionConfig?.selectAllScope === 'all' ? processedData : paginatedData,
    [selectionConfig?.selectAllScope, processedData, paginatedData]
  );

  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelection = checked ? selectAllScope : [];
    if (onSelectionChange) onSelectionChange(newSelection);
    else setInternalSelectedRows(newSelection);
  }, [selectAllScope, onSelectionChange]);

  const isAllSelected = useMemo(() => {
    if (selectAllScope.length === 0) return false;
    return selectAllScope.every(row => isRowSelected(row));
  }, [selectAllScope, isRowSelected]);

  const isIndeterminate = useMemo(() => {
    if (selectAllScope.length === 0) return false;
    const count = selectAllScope.filter(row => isRowSelected(row)).length;
    return count > 0 && count < selectAllScope.length;
  }, [selectAllScope, isRowSelected]);

  // -------------------------------------------------------------------------
  // COLUMN VISIBILITY & DENSITY
  // -------------------------------------------------------------------------

  const handleColumnVisibilityChange = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns(prev =>
      visible ? [...prev, columnId] : prev.filter(id => id !== columnId)
    );
  }, []);

  const handleDensityChange = useCallback((newDensity: 'compact' | 'normal' | 'comfortable') => {
    setDensity(newDensity);
  }, []);

  // =========================================================================
  // RETURN
  // =========================================================================

  return {
    // Data
    data: paginatedData,
    allProcessedData: processedData,
    totalCount,
    totalPages,
    loading: !!props.loading || serverLoading,

    // Pagination
    page,
    rowsPerPage,
    rowsPerPageOptions: paginationConfig?.rowsPerPageOptions || DEFAULT_ROWS_PER_PAGE_OPTIONS,

    // Sort
    sort,

    // Column filters
    filters,
    hasActiveFilters: Object.keys(filters).length > 0,

    // Client-side filter
    clientFilterTerm,

    // Server search (legacy)
    serverSearch,
    searchableFields: searchConfig?.searchableFields || [],

    // Advanced search
    advancedSearch,
    hasActiveAdvancedSearch,

    // Legacy alias
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

    // UI
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
    handleSearchChange,
    handleSelectionChange,
    handleDoubleClickSelection,
    handleSelectAll,
    handleColumnVisibilityChange,
    handleDensityChange,
    refetch: fetchServerData,
  };
}

export default useDataTable;
