'use client';

/**
 * Next Nice DataTable - Main Component
 * A comprehensive, reusable, fully-featured data table
 * 
 * @author Stellarx Team
 * @version 1.0.0
 * @license MIT
 */

import React, { useState, useMemo, useCallback } from 'react';
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
  Collapse,
  FormControlLabel,
  Switch,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Download,
  ViewColumn,
  MoreVert,
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

import { DataTableProps, DataTableColumn, ExportFormat, AdvancedSearchState } from './types';
import { useDataTable } from './useDataTable';
import { exportData, getExportFormatLabel } from './exportUtils';
import SearchDialog from './SearchDialog';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  showFirstLastButtons?: boolean;
}

/**
 * Custom pagination actions component
 */
function TablePaginationActions({
  count,
  page,
  rowsPerPage,
  onPageChange,
  showFirstLastButtons = true,
}: TablePaginationActionsProps) {
  const theme = useTheme();
  const totalPages = Math.ceil(count / rowsPerPage);

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, totalPages - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showFirstLastButtons && (
        <Tooltip title="First page">
          <span>
            <IconButton
              onClick={handleFirstPageButtonClick}
              disabled={page === 0}
              size="small"
            >
              {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
            </IconButton>
          </span>
        </Tooltip>
      )}
      <Tooltip title="Previous page">
        <span>
          <IconButton onClick={handleBackButtonClick} disabled={page === 0} size="small">
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
            onClick={handleNextButtonClick}
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
              onClick={handleLastPageButtonClick}
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

function DataTable<T extends Record<string, any>>(props: DataTableProps<T>) {
  const {
    columns: propColumns,
    error,
    emptyMessage = 'No data available',
    emptyComponent,
    pagination: paginationConfig = {},
    clientFilterConfig = {},
    searchConfig = {},
    exportConfig = {},
    styleConfig = {},
    selectionConfig = {},
    toolbarConfig = {},
    actionButtons = {},
    title,
    subtitle,
    toolbarActions,
    showColumnVisibility = true,
    showRefresh: showRefreshProp = true,
    showDensityToggle = true,
    onRefresh,
    onRowClick,
    onRowDoubleClick,
    onAdd,
    onView,
    onEdit,
    onDelete,
    id,
    ariaLabel,
    testId,
  } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Use custom hook for state management
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
    handleSearchFieldsChange,
    handleAdvancedSearch,
    handleClearAdvancedSearch,
    handleSelectionChange,
    handleDoubleClickSelection,
    handleSelectAll,
    handleColumnVisibilityChange,
    handleDensityChange,
    refetch,
  } = useDataTable(props);

  // Local UI state
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);
  const [densityAnchorEl, setDensityAnchorEl] = useState<null | HTMLElement>(null);
  const [searchFieldsAnchorEl, setSearchFieldsAnchorEl] = useState<null | HTMLElement>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [localFilterValue, setLocalFilterValue] = useState(clientFilterTerm);
  const [localSearchValue, setLocalSearchValue] = useState(serverSearch.term);

  // Debounced client-side filter
  const handleFilterInputChange = useCallback((value: string) => {
    setLocalFilterValue(value);
    const debounceMs = clientFilterConfig.debounceMs || 300;
    const timeoutId = setTimeout(() => {
      handleClientFilterChange(value);
    }, debounceMs);
    return () => clearTimeout(timeoutId);
  }, [handleClientFilterChange, clientFilterConfig.debounceMs]);

  // Debounced server-side search
  const handleSearchInputChange = useCallback((value: string) => {
    setLocalSearchValue(value);
    const debounceMs = searchConfig.debounceMs || 500;
    const timeoutId = setTimeout(() => {
      handleServerSearchChange(value);
    }, debounceMs);
    return () => clearTimeout(timeoutId);
  }, [handleServerSearchChange, searchConfig.debounceMs]);

  // Get row key
  const getRowKey = useCallback((row: T, index: number): string | number => {
    const keyField = props.rowKeyField || 'id';
    return row[keyField] ?? index;
  }, [props.rowKeyField]);

  // Style calculations
  const rowHeight = useMemo(() => {
    switch (density) {
      case 'compact': return 36;
      case 'comfortable': return 64;
      default: return 52;
    }
  }, [density]);

  const cellPadding = useMemo(() => {
    switch (density) {
      case 'compact': return '4px 8px';
      case 'comfortable': return '16px 16px';
      default: return '8px 16px';
    }
  }, [density]);

  // Stripe styles
  const getRowStyle = useCallback((index: number, row: T) => {
    const stripe = styleConfig.stripe;
    const baseStyle: React.CSSProperties = {};

    if (stripe?.enabled !== false) {
      const isEven = index % 2 === 0;
      baseStyle.backgroundColor = isEven
        ? (stripe?.evenRowColor || 'transparent')
        : (stripe?.oddRowColor || alpha(theme.palette.action.hover, 0.04));
    }

    return baseStyle;
  }, [styleConfig.stripe, theme]);

  // Visible columns for current viewport
  const visibleColumnsForViewport = useMemo(() => {
    return columns.filter(col => {
      if (isMobile && col.hiddenOnMobile) return false;
      if (isTablet && col.hiddenOnTablet) return false;
      return true;
    });
  }, [columns, isMobile, isTablet]);

  // Handle export
  const handleExport = useCallback((format: ExportFormat) => {
    const config = {
      ...exportConfig,
      filename: exportConfig.filename || title || 'export',
      title: exportConfig.title || title,
    };
    
    const dataToExport = exportConfig.filteredDataOnly !== false ? allProcessedData : (props.data || []);
    const columnsToExport = exportConfig.visibleColumnsOnly !== false ? columns : allColumns;
    
    exportData(format, dataToExport, columnsToExport, config);
    setExportAnchorEl(null);
  }, [exportConfig, title, allProcessedData, props.data, columns, allColumns]);

  // Get nested value
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Render cell content
  const renderCellContent = useCallback((row: T, column: DataTableColumn<T>, rowIndex: number) => {
    const value = getNestedValue(row, column.id);
    
    if (column.format) {
      return column.format(value, row, rowIndex);
    }
    
    if (value === null || value === undefined) {
      return <Typography color="text.secondary">-</Typography>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return value;
  }, []);

  // Render skeleton rows
  const renderSkeletonRows = useCallback(() => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {selectionConfig.enabled && (
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={24} height={24} />
          </TableCell>
        )}
        {visibleColumnsForViewport.map((column) => (
          <TableCell key={column.id} sx={{ padding: cellPadding }}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
      </TableRow>
    ));
  }, [rowsPerPage, selectionConfig.enabled, visibleColumnsForViewport, cellPadding]);

  // Export formats
  const exportFormats = exportConfig.formats || ['csv', 'excel', 'pdf', 'word'];

  // =========================================================================
  // TOOLBAR VISIBILITY CONFIGURATION
  // =========================================================================
  
  const showFilter = toolbarConfig.showFilter !== false && clientFilterConfig.enabled !== false;
  const showAdvancedSearch = toolbarConfig.showAdvancedSearch !== false && searchConfig.enabled && searchableFields.length > 0;
  const showRefresh = (toolbarConfig.showRefresh !== false && showRefreshProp) && onRefresh;
  const showDensity = toolbarConfig.showDensityToggle !== false && showDensityToggle;
  const showColumns = toolbarConfig.showColumnVisibility !== false && showColumnVisibility;
  const showExport = toolbarConfig.showExport !== false && exportConfig.enabled !== false;
  const showTitleSubtitle = toolbarConfig.showTitle !== false && (title || subtitle);

  // =========================================================================
  // ACTION BUTTON CONFIGURATION
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
  } = actionButtons;

  // Calculate if action buttons should be enabled
  // Default to true if not specified (null or undefined)
  const isAddEnabled = addEnabled ?? true;
  
  // View, Edit and Delete are disabled when multiple rows are selected
  const hasMultipleSelection = selectedRows.length > 1;
  const hasSingleSelection = selectedRows.length === 1;
  const isViewEnabled = (viewEnabled ?? true) && !hasMultipleSelection && hasSingleSelection;
  const isEditEnabled = (editEnabled ?? true) && !hasMultipleSelection && hasSingleSelection;
  const isDeleteEnabled = (deleteEnabled ?? true) && !hasMultipleSelection && hasSingleSelection;

  // Get the selected row for view/edit/delete operations
  const selectedRow = hasSingleSelection ? selectedRows[0] : null;

  // Check if any action buttons should be shown
  const hasActionButtons = (showAdd && onAdd) || (showView && onView) || (showEdit && onEdit) || (showDelete && onDelete);

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
      {/* ================================================================== */}
      {/* TOOLBAR */}
      {/* ================================================================== */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: styleConfig.headerBackgroundColor || 'background.paper',
        }}
      >
        {/* Title and Action Buttons Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: (showFilter || showAdvancedSearch) ? 2 : 0 }}
        >
          {/* Title */}
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

          {/* CRUD Action Buttons (Add, View, Edit, Delete) */}
          {hasActionButtons && (
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Add Button */}
              {showAdd && onAdd && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={onAdd}
                  disabled={!isAddEnabled}
                  color="primary"
                >
                  {addLabel}
                </Button>
              )}

              {/* View Button */}
              {showView && onView && (
                <Tooltip title={hasMultipleSelection ? 'Select only one row to view' : (hasSingleSelection ? `View selected item` : 'Select a row to view')}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => selectedRow && onView(selectedRow)}
                      disabled={!isViewEnabled}
                      color="info"
                    >
                      {viewLabel}
                    </Button>
                  </span>
                </Tooltip>
              )}

              {/* Edit Button */}
              {showEdit && onEdit && (
                <Tooltip title={hasMultipleSelection ? 'Select only one row to edit' : (hasSingleSelection ? `Edit selected item` : 'Select a row to edit')}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => selectedRow && onEdit(selectedRow)}
                      disabled={!isEditEnabled}
                      color="primary"
                    >
                      {editLabel}
                    </Button>
                  </span>
                </Tooltip>
              )}

              {/* Delete/Archive/Reinstate Button */}
              {showDelete && onDelete && (
                <Tooltip title={hasMultipleSelection ? `Select only one row to ${deleteLabel.toLowerCase()}` : (hasSingleSelection ? `${deleteLabel} selected item` : `Select a row to ${deleteLabel.toLowerCase()}`)}>
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => selectedRow && onDelete(selectedRow)}
                      disabled={!isDeleteEnabled}
                      color="error"
                    >
                      {deleteLabel}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Stack>
          )}
        </Stack>

        {/* Filter & Search Row */}
        {(showFilter || showAdvancedSearch) && (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          {/* Filter & Search Controls */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ flex: 1, maxWidth: { md: 700 } }}
          >
            {/* Client-side Filter (full-text on loaded data) */}
            {showFilter && (
              <TextField
                size="small"
                sx={{ minWidth: 200, flex: 1 }}
                placeholder={clientFilterConfig.placeholder || 'Filter loaded data...'}
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

            {/* Advanced Database Search Button */}
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
                    ? `Search (${advancedSearch.criteria.filter(c => c.value).length})` 
                    : 'Advanced Search'
                  }
                </Button>
                
                {/* Show active search indicator */}
                {hasActiveAdvancedSearch && (
                  <Tooltip title="Clear search">
                    <IconButton 
                      size="small" 
                      onClick={handleClearAdvancedSearch}
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            )}
          </Stack>

          {/* Toolbar Action Buttons */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {/* Active filters indicator */}
            {hasActiveFilters && (
              <Chip
                label={`${Object.keys(filters).length} filter(s)`}
                size="small"
                onDelete={handleClearFilters}
                color="primary"
                variant="outlined"
              />
            )}

            {/* Custom toolbar actions */}
            {toolbarActions}

            {/* Refresh button */}
            {showRefresh && (
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} disabled={loading}>
                  {loading ? <CircularProgress size={20} /> : <Refresh />}
                </IconButton>
              </Tooltip>
            )}

            {/* Density toggle */}
            {showDensity && (
              <>
                <Tooltip title="Table density">
                  <IconButton onClick={(e) => setDensityAnchorEl(e.currentTarget)}>
                    {density === 'compact' ? <DensitySmall /> : density === 'comfortable' ? <DensityLarge /> : <DensityMedium />}
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
                        {d === 'compact' ? <DensitySmall fontSize="small" /> : d === 'comfortable' ? <DensityLarge fontSize="small" /> : <DensityMedium fontSize="small" />}
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
                <Tooltip title="Show/hide columns">
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
                    <Typography variant="subtitle2">Toggle Columns</Typography>
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
                <Tooltip title="Export data">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                    endIcon={<ArrowDropDown />}
                    onClick={(e) => setExportAnchorEl(e.currentTarget)}
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Export
                  </Button>
                </Tooltip>
                <Tooltip title="Export data">
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
                        {format === 'pdf' ? <PictureAsPdf fontSize="small" /> :
                         format === 'excel' ? <GridOn fontSize="small" /> :
                         format === 'word' ? <Description fontSize="small" /> :
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

      {/* ================================================================== */}
      {/* ERROR STATE */}
      {/* ================================================================== */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* ================================================================== */}
      {/* TABLE */}
      {/* ================================================================== */}
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
          sx={{ 
            minWidth: { xs: 'auto', sm: 650 },
            tableLayout: 'auto',
          }}
        >
          {/* Table Head */}
          <TableHead>
            <TableRow>
              {/* Selection checkbox */}
              {selectionConfig.enabled && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    bgcolor: styleConfig.headerBackgroundColor || 'background.paper',
                  }}
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

              {/* Column headers */}
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
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
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
                      // Don't toggle selection on row click, only on checkbox click
                      // This prevents accidental selection when clicking on content
                      onRowClick?.(row, rowIndex, e);
                    }}
                    onDoubleClick={(e) => {
                      // Double-click opens View if enabled and onView callback is provided
                      if (onView && (viewEnabled ?? true)) {
                        onView(row);
                      } else if (onRowDoubleClick) {
                        // Fall back to custom double-click handler
                        onRowDoubleClick(row, rowIndex, e);
                      }
                    }}
                    sx={{
                      ...getRowStyle(rowIndex, row),
                      cursor: (onRowClick || onRowDoubleClick || onView || selectionConfig.enabled) ? 'pointer' : 'default',
                      '&:hover': styleConfig.hoverEffect !== false ? {
                        bgcolor: styleConfig.hoverColor || alpha(theme.palette.primary.main, 0.08),
                      } : undefined,
                    }}
                  >
                    {/* Selection checkbox */}
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

                    {/* Data cells */}
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

      {/* ================================================================== */}
      {/* PAGINATION */}
      {/* ================================================================== */}
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
          '.MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          },
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
        }}
      />

      {/* ================================================================== */}
      {/* ADVANCED SEARCH DIALOG */}
      {/* ================================================================== */}
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

