'use client';

/**
 * Next Nice DataTable - Main Component
 *
 * Changes in v2:
 *  - Debounce via useRef – clears previous timer on each keystroke (was broken)
 *  - useEffect cleanup clears outstanding timers on unmount
 *  - Local getNestedValue removed; uses the prototype-safe version from exportUtils
 *  - Top-level shorthand props (showAdd, showRefresh, deleteLabel, …) are merged
 *    with the structured actionButtons / toolbarConfig objects so both APIs work
 *  - All toolbar icon-button tooltips are configurable via toolbarConfig labels
 *  - Export button label is configurable via exportConfig.buttonLabel
 *  - Action-button colours and tooltips are configurable via actionButtons
 *  - Column-visibility menu title is configurable via toolbarConfig.columnMenuTitle
 *  - Advanced-search button label configurable via toolbarConfig.advancedSearchLabel
 *
 * @author Stellarx Team
 * @version 2.0.0
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Typography,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Stack,
  Chip,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  FilterList,
  Refresh,
  Download,
  ViewColumn,
  FirstPage,
  LastPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Clear,
  TableChart,
  PictureAsPdf,
  Description,
  GridOn,
  TextSnippet,
  DensitySmall,
  DensityMedium,
  DensityLarge,
  Check,
  ArrowDropDown,
  ManageSearch,
  Add,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';

import {
  DataTableProps,
  DataTableColumn,
  ExportFormat,
  AdvancedSearchState,
  ActionButtonConfig,
  ToolbarConfig,
} from './types';
import { useDataTable } from './useDataTable';
import { exportData, getExportFormatLabel, getNestedValue } from './exportUtils';
import SearchDialog from './SearchDialog';

// ============================================================================
// CUSTOM PAGINATION ACTIONS
// ============================================================================

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  showFirstLastButtons?: boolean;
}

function TablePaginationActions({
  count,
  page,
  rowsPerPage,
  onPageChange,
  showFirstLastButtons = true,
}: TablePaginationActionsProps) {
  const theme = useTheme();
  const totalPages = Math.ceil(count / rowsPerPage);

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showFirstLastButtons && (
        <Tooltip title="First page">
          <span>
            <IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0} size="small">
              {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
            </IconButton>
          </span>
        </Tooltip>
      )}
      <Tooltip title="Previous page">
        <span>
          <IconButton onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0} size="small">
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
          </IconButton>
        </span>
      </Tooltip>

      <Typography variant="body2" sx={{ mx: 1, minWidth: 80, textAlign: 'center' }}>
        Page {page + 1} of {totalPages || 1}
      </Typography>

      <Tooltip title="Next page">
        <span>
          <IconButton
            onClick={(e) => onPageChange(e, page + 1)}
            disabled={page >= totalPages - 1}
            size="small"
          >
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </IconButton>
        </span>
      </Tooltip>
      {showFirstLastButtons && (
        <Tooltip title="Last page">
          <span>
            <IconButton
              onClick={(e) => onPageChange(e, Math.max(0, totalPages - 1))}
              disabled={page >= totalPages - 1}
              size="small"
            >
              {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function DataTable<T extends Record<string, unknown>>(props: DataTableProps<T>) {
  const {
    error,
    emptyMessage = 'No data available',
    emptyComponent,
    pagination: paginationConfig = {},
    clientFilterConfig = {},
    searchConfig = {},
    exportConfig = {},
    styleConfig = {},
    selectionConfig = {},
    // Structured config objects
    toolbarConfig: toolbarConfigProp = {},
    actionButtons: actionButtonsProp = {},
    // Top-level toolbar shortcuts (merged below)
    title,
    subtitle,
    toolbarActions,
    showColumnVisibility: showColumnVisibilityProp,
    showRefresh: showRefreshProp,
    showDensityToggle: showDensityToggleProp,
    // Top-level action-button shortcuts (merged below)
    showAdd: showAddProp,
    showView: showViewProp,
    showEdit: showEditProp,
    showDelete: showDeleteProp,
    deleteLabel: deleteLabelProp,
    addEnabled: addEnabledProp,
    viewEnabled: viewEnabledProp,
    editEnabled: editEnabledProp,
    deleteEnabled: deleteEnabledProp,
    // Callbacks
    onRefresh,
    onRowClick,
    onRowDoubleClick,
    onAdd,
    onView,
    onEdit,
    onDelete,
    // Accessibility
    id,
    ariaLabel,
    testId,
  } = props;

  // -------------------------------------------------------------------------
  // MERGE shorthand top-level props into structured config objects.
  // The structured object (actionButtons / toolbarConfig) wins on conflict.
  // -------------------------------------------------------------------------

  const toolbarConfig: ToolbarConfig = useMemo(() => ({
    showRefresh: showRefreshProp,
    showColumnVisibility: showColumnVisibilityProp,
    showDensityToggle: showDensityToggleProp,
    ...toolbarConfigProp,
  }), [showRefreshProp, showColumnVisibilityProp, showDensityToggleProp, toolbarConfigProp]);

  const actionButtons: ActionButtonConfig = useMemo(() => ({
    showAdd: showAddProp,
    showView: showViewProp,
    showEdit: showEditProp,
    showDelete: showDeleteProp,
    deleteLabel: deleteLabelProp,
    addEnabled: addEnabledProp,
    viewEnabled: viewEnabledProp,
    editEnabled: editEnabledProp,
    deleteEnabled: deleteEnabledProp,
    ...actionButtonsProp,
  }), [
    showAddProp, showViewProp, showEditProp, showDeleteProp, deleteLabelProp,
    addEnabledProp, viewEnabledProp, editEnabledProp, deleteEnabledProp,
    actionButtonsProp,
  ]);

  // -------------------------------------------------------------------------
  // HOOK
  // -------------------------------------------------------------------------

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const {
    data,
    allProcessedData,
    totalCount,
    loading,
    page,
    rowsPerPage,
    rowsPerPageOptions,
    sort,
    filters,
    hasActiveFilters,
    clientFilterTerm,
    serverSearch,
    searchableFields,
    advancedSearch,
    hasActiveAdvancedSearch,
    selectedRows,
    isRowSelected,
    isAllSelected,
    isIndeterminate,
    columns,
    allColumns,
    visibleColumns,
    density,
    handlePageChange,
    handleRowsPerPageChange,
    handleSortChange,
    handleFilterChange,
    handleClearFilters,
    handleClientFilterChange,
    handleServerSearchChange,
    handleAdvancedSearch,
    handleClearAdvancedSearch,
    handleSelectionChange,
    handleDoubleClickSelection,
    handleSelectAll,
    handleColumnVisibilityChange,
    handleDensityChange,
  } = useDataTable<T>(props);

  // -------------------------------------------------------------------------
  // LOCAL UI STATE
  // -------------------------------------------------------------------------

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);
  const [densityAnchorEl, setDensityAnchorEl] = useState<null | HTMLElement>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [localFilterValue, setLocalFilterValue] = useState(clientFilterTerm);
  const [localSearchValue, setLocalSearchValue] = useState(serverSearch.term);

  // -------------------------------------------------------------------------
  // DEBOUNCE – useRef pattern so each keystroke cancels the previous timer
  // -------------------------------------------------------------------------

  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleFilterInputChange = useCallback((value: string) => {
    setLocalFilterValue(value);
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => {
      handleClientFilterChange(value);
    }, clientFilterConfig.debounceMs ?? 300);
  }, [handleClientFilterChange, clientFilterConfig.debounceMs]);

  const handleSearchInputChange = useCallback((value: string) => {
    setLocalSearchValue(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      handleServerSearchChange(value);
    }, searchConfig.debounceMs ?? 500);
  }, [handleServerSearchChange, searchConfig.debounceMs]);

  // -------------------------------------------------------------------------
  // STYLE HELPERS
  // -------------------------------------------------------------------------

  const rowHeight = useMemo(() => {
    switch (density) {
      case 'compact':    return 36;
      case 'comfortable': return 64;
      default:           return 52;
    }
  }, [density]);

  const cellPadding = useMemo(() => {
    switch (density) {
      case 'compact':    return '4px 8px';
      case 'comfortable': return '16px 16px';
      default:           return '8px 16px';
    }
  }, [density]);

  const getRowStyle = useCallback((index: number): React.CSSProperties => {
    const stripe = styleConfig.stripe;
    if (stripe?.enabled === false) return {};
    const isEven = index % 2 === 0;
    return {
      backgroundColor: isEven
        ? (stripe?.evenRowColor || 'transparent')
        : (stripe?.oddRowColor || alpha(theme.palette.action.hover, 0.04)),
    };
  }, [styleConfig.stripe, theme]);

  // -------------------------------------------------------------------------
  // VIEWPORT-AWARE COLUMN LIST
  // -------------------------------------------------------------------------

  const visibleColumnsForViewport = useMemo(() =>
    columns.filter(col => {
      if (isMobile && col.hiddenOnMobile) return false;
      if (isTablet && col.hiddenOnTablet) return false;
      return true;
    }),
    [columns, isMobile, isTablet]
  );

  // -------------------------------------------------------------------------
  // CELL RENDERING
  // -------------------------------------------------------------------------

  const getRowKey = useCallback((row: T, index: number): string | number => {
    const keyField = props.rowKeyField || 'id';
    const key = row[keyField];
    return (key !== null && key !== undefined) ? String(key) : index;
  }, [props.rowKeyField]);

  const renderCellContent = useCallback((row: T, column: DataTableColumn<T>, rowIndex: number) => {
    const value = getNestedValue(row as Record<string, unknown>, column.id);

    if (column.format) return column.format(value, row, rowIndex);
    if (value === null || value === undefined) return <Typography color="text.secondary">—</Typography>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  }, []);

  // -------------------------------------------------------------------------
  // SKELETON ROWS (loading state)
  // -------------------------------------------------------------------------

  const renderSkeletonRows = useCallback(() =>
    Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {selectionConfig.enabled && (
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={24} height={24} />
          </TableCell>
        )}
        {visibleColumnsForViewport.map((col) => (
          <TableCell key={col.id} sx={{ padding: cellPadding }}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
      </TableRow>
    )),
    [rowsPerPage, selectionConfig.enabled, visibleColumnsForViewport, cellPadding]
  );

  // -------------------------------------------------------------------------
  // EXPORT
  // -------------------------------------------------------------------------

  const exportFormats: readonly ExportFormat[] = exportConfig.formats || ['csv', 'excel', 'pdf', 'word'];

  const handleExport = useCallback((format: ExportFormat) => {
    const config = {
      ...exportConfig,
      filename: exportConfig.filename || title || 'export',
      title: exportConfig.title || title,
    };
    const dataToExport = exportConfig.filteredDataOnly !== false
      ? allProcessedData
      : (props.data || []);
    const columnsToExport = exportConfig.visibleColumnsOnly !== false ? columns : allColumns;

    exportData(format, dataToExport, columnsToExport, config);
    setExportAnchorEl(null);
  }, [exportConfig, title, allProcessedData, props.data, columns, allColumns]);

  // =========================================================================
  // TOOLBAR VISIBILITY
  // =========================================================================

  const showFilter = toolbarConfig.showFilter !== false && clientFilterConfig.enabled !== false;
  const showAdvancedSearch = toolbarConfig.showAdvancedSearch !== false
    && searchConfig.enabled === true
    && searchableFields.length > 0;
  const showRefresh = toolbarConfig.showRefresh !== false && !!onRefresh;
  const showDensity = toolbarConfig.showDensityToggle !== false;
  const showColumns = toolbarConfig.showColumnVisibility !== false;
  const showExport = toolbarConfig.showExport !== false && exportConfig.enabled !== false;
  const showTitleSubtitle = toolbarConfig.showTitle !== false && (!!title || !!subtitle);

  // =========================================================================
  // ACTION BUTTONS
  // =========================================================================

  const {
    showAdd = true,
    showView = true,
    showEdit = true,
    showDelete = true,
    addEnabled,
    viewEnabled,
    editEnabled,
    deleteEnabled,
    addLabel = 'Add',
    viewLabel = 'View',
    editLabel = 'Edit',
    deleteLabel = 'Delete',
    addTooltip,
    viewTooltip,
    editTooltip,
    deleteTooltip,
    addColor = 'primary',
    viewColor = 'info',
    editColor = 'primary',
    deleteColor = 'error',
  } = actionButtons;

  const hasMultipleSelection = selectedRows.length > 1;
  const hasSingleSelection = selectedRows.length === 1;
  const selectedRow = hasSingleSelection ? selectedRows[0] : null;

  const isAddEnabled = addEnabled ?? true;
  const isViewEnabled = (viewEnabled ?? true) && hasSingleSelection;
  const isEditEnabled = (editEnabled ?? true) && hasSingleSelection;
  const isDeleteEnabled = (deleteEnabled ?? true) && hasSingleSelection;

  const resolvedViewTooltip = viewTooltip
    || (hasMultipleSelection ? 'Select only one row to view'
      : hasSingleSelection ? `View selected item`
      : 'Select a row to view');
  const resolvedEditTooltip = editTooltip
    || (hasMultipleSelection ? 'Select only one row to edit'
      : hasSingleSelection ? `Edit selected item`
      : 'Select a row to edit');
  const resolvedDeleteTooltip = deleteTooltip
    || (hasMultipleSelection ? `Select only one row to ${deleteLabel.toLowerCase()}`
      : hasSingleSelection ? `${deleteLabel} selected item`
      : `Select a row to ${deleteLabel.toLowerCase()}`);

  const hasActionButtons = (showAdd && !!onAdd) || (showView && !!onView)
    || (showEdit && !!onEdit) || (showDelete && !!onDelete);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <Paper
      elevation={styleConfig.elevation !== false ? 1 : 0}
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        borderRadius: styleConfig.rounded !== false ? 2 : 0,
        border: styleConfig.elevation === false ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
      id={id}
      data-testid={testId}
    >
      {/* ================================================================= */}
      {/* TOOLBAR                                                             */}
      {/* ================================================================= */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: styleConfig.headerBackgroundColor || 'background.paper',
        }}
      >
        {/* Top row: title + action buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: (showFilter || showAdvancedSearch) ? 2 : 0 }}
        >
          {/* Title / subtitle */}
          {showTitleSubtitle && (
            <Box>
              {title && (
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}

          {/* CRUD action buttons */}
          {hasActionButtons && (
            <Stack direction="row" spacing={1} alignItems="center">
              {showAdd && onAdd && (
                <Tooltip title={addTooltip || ''}>
                  <span>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={onAdd}
                      disabled={!isAddEnabled}
                      color={addColor}
                    >
                      {addLabel}
                    </Button>
                  </span>
                </Tooltip>
              )}

              {showView && onView && (
                <Tooltip title={resolvedViewTooltip}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => selectedRow && onView(selectedRow)}
                      disabled={!isViewEnabled}
                      color={viewColor}
                    >
                      {viewLabel}
                    </Button>
                  </span>
                </Tooltip>
              )}

              {showEdit && onEdit && (
                <Tooltip title={resolvedEditTooltip}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => selectedRow && onEdit(selectedRow)}
                      disabled={!isEditEnabled}
                      color={editColor}
                    >
                      {editLabel}
                    </Button>
                  </span>
                </Tooltip>
              )}

              {showDelete && onDelete && (
                <Tooltip title={resolvedDeleteTooltip}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => selectedRow && onDelete(selectedRow)}
                      disabled={!isDeleteEnabled}
                      color={deleteColor}
                    >
                      {deleteLabel}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Stack>
          )}
        </Stack>

        {/* Second row: filter / search + toolbar icons */}
        {(showFilter || showAdvancedSearch || showRefresh || showDensity || showColumns || showExport || toolbarActions) && (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            {/* Left: filter + advanced-search */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ flex: 1, maxWidth: { md: 700 } }}
            >
              {showFilter && (
                <TextField
                  size="small"
                  sx={{ minWidth: 200, flex: 1 }}
                  placeholder={clientFilterConfig.placeholder || 'Filter loaded data…'}
                  value={localFilterValue}
                  onChange={(e) => handleFilterInputChange(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterList fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: localFilterValue && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setLocalFilterValue('');
                            handleClientFilterChange('');
                          }}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              {showAdvancedSearch && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    variant={hasActiveAdvancedSearch ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={<ManageSearch />}
                    onClick={() => setSearchDialogOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: hasActiveAdvancedSearch ? 600 : 400,
                      minWidth: 140,
                    }}
                    color={hasActiveAdvancedSearch ? 'primary' : 'inherit'}
                  >
                    {hasActiveAdvancedSearch
                      ? `${toolbarConfig.advancedSearchLabel || 'Search'} (${advancedSearch.criteria.filter(c => c.value).length})`
                      : (toolbarConfig.advancedSearchLabel || 'Advanced Search')
                    }
                  </Button>

                  {hasActiveAdvancedSearch && (
                    <Tooltip title="Clear search">
                      <IconButton
                        size="small"
                        onClick={handleClearAdvancedSearch}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) },
                        }}
                      >
                        <Clear fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              )}
            </Stack>

            {/* Right: icon buttons + export */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              {/* Active column-filter chips */}
              {hasActiveFilters && (
                <Chip
                  label={`${Object.keys(filters).length} filter${Object.keys(filters).length > 1 ? 's' : ''}`}
                  size="small"
                  onDelete={handleClearFilters}
                  color="primary"
                  variant="outlined"
                />
              )}

              {/* Consumer-provided custom toolbar actions */}
              {toolbarActions}

              {/* Refresh */}
              {showRefresh && (
                <Tooltip title={toolbarConfig.refreshLabel || 'Refresh'}>
                  <IconButton onClick={onRefresh} disabled={loading}>
                    {loading ? <CircularProgress size={20} /> : <Refresh />}
                  </IconButton>
                </Tooltip>
              )}

              {/* Density toggle */}
              {showDensity && (
                <>
                  <Tooltip title={toolbarConfig.densityLabel || 'Table density'}>
                    <IconButton onClick={(e) => setDensityAnchorEl(e.currentTarget)}>
                      {density === 'compact'
                        ? <DensitySmall />
                        : density === 'comfortable'
                          ? <DensityLarge />
                          : <DensityMedium />}
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={densityAnchorEl}
                    open={Boolean(densityAnchorEl)}
                    onClose={() => setDensityAnchorEl(null)}
                  >
                    {(['compact', 'normal', 'comfortable'] as const).map((d) => (
                      <MenuItem
                        key={d}
                        selected={density === d}
                        onClick={() => { handleDensityChange(d); setDensityAnchorEl(null); }}
                      >
                        <ListItemIcon>
                          {d === 'compact'
                            ? <DensitySmall fontSize="small" />
                            : d === 'comfortable'
                              ? <DensityLarge fontSize="small" />
                              : <DensityMedium fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primary={d.charAt(0).toUpperCase() + d.slice(1)} />
                        {density === d && <Check fontSize="small" color="primary" />}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Column visibility */}
              {showColumns && (
                <>
                  <Tooltip title={toolbarConfig.columnVisibilityLabel || 'Show / hide columns'}>
                    <IconButton onClick={(e) => setColumnAnchorEl(e.currentTarget)}>
                      <ViewColumn />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={columnAnchorEl}
                    open={Boolean(columnAnchorEl)}
                    onClose={() => setColumnAnchorEl(null)}
                    PaperProps={{ sx: { maxHeight: 400, width: 250 } }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle2">
                        {toolbarConfig.columnMenuTitle || 'Toggle Columns'}
                      </Typography>
                    </Box>
                    <Divider />
                    {allColumns.map((col) => (
                      <MenuItem
                        key={col.id}
                        dense
                        onClick={() => handleColumnVisibilityChange(col.id, !visibleColumns.includes(col.id))}
                      >
                        <Checkbox checked={visibleColumns.includes(col.id)} size="small" />
                        <ListItemText primary={col.label} />
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Export */}
              {showExport && (
                <>
                  <Tooltip title={exportConfig.buttonLabel || 'Export data'}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      endIcon={<ArrowDropDown />}
                      onClick={(e) => setExportAnchorEl(e.currentTarget)}
                      sx={{ display: { xs: 'none', sm: 'flex' } }}
                    >
                      {exportConfig.buttonLabel || 'Export'}
                    </Button>
                  </Tooltip>
                  <Tooltip title={exportConfig.buttonLabel || 'Export data'}>
                    <IconButton
                      onClick={(e) => setExportAnchorEl(e.currentTarget)}
                      sx={{ display: { xs: 'flex', sm: 'none' } }}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={exportAnchorEl}
                    open={Boolean(exportAnchorEl)}
                    onClose={() => setExportAnchorEl(null)}
                  >
                    {exportFormats.map((format) => (
                      <MenuItem key={format} onClick={() => handleExport(format)}>
                        <ListItemIcon>
                          {format === 'pdf'   ? <PictureAsPdf fontSize="small" /> :
                           format === 'excel' ? <GridOn fontSize="small" /> :
                           format === 'word'  ? <Description fontSize="small" /> :
                                               <TextSnippet fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primary={`Export as ${getExportFormatLabel(format)}`} />
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </Stack>
          </Stack>
        )}
      </Box>

      {/* ================================================================= */}
      {/* ERROR STATE                                                         */}
      {/* ================================================================= */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* ================================================================= */}
      {/* TABLE                                                               */}
      {/* ================================================================= */}
      <TableContainer
        sx={{
          maxHeight: { xs: 'calc(100vh - 350px)', md: 'calc(100vh - 320px)' },
          minHeight: 200,
          overflowX: 'auto',
        }}
      >
        <Table
          stickyHeader
          size={density === 'compact' ? 'small' : 'medium'}
          aria-label={ariaLabel || title || 'Data table'}
          sx={{ minWidth: { xs: 'auto', sm: 650 }, tableLayout: 'auto' }}
        >
          {/* Head */}
          <TableHead>
            <TableRow>
              {selectionConfig.enabled && (
                <TableCell
                  padding="checkbox"
                  sx={{ bgcolor: styleConfig.headerBackgroundColor || 'background.paper' }}
                >
                  {selectionConfig.showSelectAll !== false && selectionConfig.mode !== 'single' && (
                    <Checkbox
                      indeterminate={isIndeterminate}
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      size={density === 'compact' ? 'small' : 'medium'}
                    />
                  )}
                </TableCell>
              )}

              {visibleColumnsForViewport.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    width: column.width,
                    fontWeight: 600,
                    bgcolor: styleConfig.headerBackgroundColor || 'background.paper',
                    color: styleConfig.headerTextColor,
                    padding: cellPadding,
                    position: column.sticky ? 'sticky' : undefined,
                    left: column.sticky === 'left' ? 0 : undefined,
                    right: column.sticky === 'right' ? 0 : undefined,
                    zIndex: column.sticky ? 3 : 2,
                  }}
                >
                  {column.tooltip ? (
                    <Tooltip title={column.tooltip} placement="top">
                      <span>
                        {column.sortable !== false ? (
                          <TableSortLabel
                            active={sort.column === column.id}
                            direction={sort.column === column.id && sort.direction ? sort.direction : 'asc'}
                            onClick={() => handleSortChange(column.id)}
                          >
                            {column.renderHeader ? column.renderHeader(column) : column.label}
                          </TableSortLabel>
                        ) : (
                          column.renderHeader ? column.renderHeader(column) : column.label
                        )}
                      </span>
                    </Tooltip>
                  ) : column.sortable !== false ? (
                    <TableSortLabel
                      active={sort.column === column.id}
                      direction={sort.column === column.id && sort.direction ? sort.direction : 'asc'}
                      onClick={() => handleSortChange(column.id)}
                    >
                      {column.renderHeader ? column.renderHeader(column) : column.label}
                    </TableSortLabel>
                  ) : (
                    column.renderHeader ? column.renderHeader(column) : column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Body */}
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnsForViewport.length + (selectionConfig.enabled ? 1 : 0)}
                  sx={{ py: 8, textAlign: 'center' }}
                >
                  {emptyComponent || (
                    <Box>
                      <TableChart sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">{emptyMessage}</Typography>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const rowKey = getRowKey(row, rowIndex);
                const isSelected = isRowSelected(row);

                return (
                  <TableRow
                    key={rowKey}
                    hover={styleConfig.hoverEffect !== false}
                    selected={isSelected}
                    onClick={(e) => {
                      if (selectionConfig.enabled) handleSelectionChange(row);
                      onRowClick?.(row, rowIndex, e);
                    }}
                    onDoubleClick={(e) => {
                      handleDoubleClickSelection(row);
                      if (onView && (viewEnabled ?? true)) {
                        onView(row);
                      } else {
                        onRowDoubleClick?.(row, rowIndex, e);
                      }
                    }}
                    sx={{
                      ...getRowStyle(rowIndex),
                      cursor: (onRowClick || onRowDoubleClick || onView || selectionConfig.enabled)
                        ? 'pointer'
                        : 'default',
                      '&:hover': styleConfig.hoverEffect !== false ? {
                        bgcolor: styleConfig.hoverColor || alpha(theme.palette.primary.main, 0.08),
                      } : undefined,
                    }}
                  >
                    {selectionConfig.enabled && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectionChange(row)}
                          onClick={(e) => e.stopPropagation()}
                          size={density === 'compact' ? 'small' : 'medium'}
                        />
                      </TableCell>
                    )}

                    {visibleColumnsForViewport.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        sx={{
                          padding: cellPadding,
                          position: column.sticky ? 'sticky' : undefined,
                          left: column.sticky === 'left' ? 0 : undefined,
                          right: column.sticky === 'right' ? 0 : undefined,
                          bgcolor: column.sticky ? 'background.paper' : 'inherit',
                          zIndex: column.sticky ? 1 : undefined,
                        }}
                        className={column.className}
                      >
                        {renderCellContent(row, column, rowIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================================================================= */}
      {/* PAGINATION                                                          */}
      {/* ================================================================= */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, newPage) => handlePageChange(newPage)}
        onRowsPerPageChange={(e) => handleRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage={isMobile ? 'Rows:' : (paginationConfig.rowsPerPageLabel || 'Rows per page:')}
        ActionsComponent={(actionProps) => (
          <TablePaginationActions
            {...actionProps}
            showFirstLastButtons={paginationConfig.showFirstLastButtons !== false}
          />
        )}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '.MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'flex-end' },
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
        }}
      />

      {/* ================================================================= */}
      {/* ADVANCED SEARCH DIALOG                                             */}
      {/* ================================================================= */}
      {showAdvancedSearch && (
        <SearchDialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          onSearch={handleAdvancedSearch}
          searchableFields={searchableFields}
          title={searchConfig.dialogTitle || 'Advanced Search'}
          defaultField={searchConfig.defaultSearchField || searchableFields[0]?.id}
          initialCriteria={advancedSearch.criteria.length > 0 ? advancedSearch.criteria : undefined}
          maxCriteria={searchConfig.maxCriteria || 10}
        />
      )}
    </Paper>
  );
}

export default DataTable;
