'use client';

/**
 * Next Nice DataTable - Advanced Search Dialog
 * A popup form for building complex database search queries
 * 
 * @author Stellarx Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Stack,
  Typography,
  Divider,
  Chip,
  Paper,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  InputAdornment,
} from '@mui/material';
import {
  Close,
  Add,
  Delete,
  Search,
  FilterList,
  Clear,
  Tune,
} from '@mui/icons-material';
import { SearchField, SearchCriteria, AdvancedSearchState, SearchOperator } from './types';

export interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (searchState: AdvancedSearchState) => void;
  searchableFields: SearchField[];
  title?: string;
  defaultField?: string;
  initialCriteria?: SearchCriteria[];
  maxCriteria?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 9);

const OPERATORS = [
  { value: 'CONTAINS', label: 'Contains' },
  { value: 'EQUALS', label: 'Equals' },
  { value: 'STARTS_WITH', label: 'Starts with' },
  { value: 'ENDS_WITH', label: 'Ends with' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function SearchDialog({
  open,
  onClose,
  onSearch,
  searchableFields,
  title = 'Advanced Search',
  defaultField,
  initialCriteria,
  maxCriteria = 10,
}: SearchDialogProps) {
  const theme = useTheme();
  
  // Initialize criteria with default field or first available field
  const getInitialCriteria = useCallback((): SearchCriteria[] => {
    if (initialCriteria && initialCriteria.length > 0) {
      return initialCriteria;
    }
    const field = defaultField || searchableFields[0]?.id || '';
    return [{
      id: generateId(),
      field,
      value: '',
      operator: 'CONTAINS',
    }];
  }, [defaultField, searchableFields, initialCriteria]);

  const [criteria, setCriteria] = useState<SearchCriteria[]>(getInitialCriteria);
  const [matchAll, setMatchAll] = useState(true);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCriteria(getInitialCriteria());
    }
  }, [open, getInitialCriteria]);

  // Add new search criterion
  const handleAddCriterion = useCallback(() => {
    if (criteria.length >= maxCriteria) return;
    
    // Find a field not already used, or use the first one
    const usedFields = criteria.map(c => c.field);
    const availableField = searchableFields.find(f => !usedFields.includes(f.id))?.id 
      || searchableFields[0]?.id || '';
    
    setCriteria(prev => [...prev, {
      id: generateId(),
      field: availableField,
      value: '',
      operator: 'CONTAINS',
    }]);
  }, [criteria, maxCriteria, searchableFields]);

  // Remove a criterion
  const handleRemoveCriterion = useCallback((id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  }, []);

  // Update a criterion
  const handleUpdateCriterion = useCallback((id: string, updates: Partial<SearchCriteria>) => {
    setCriteria(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  // Clear all criteria
  const handleClearAll = useCallback(() => {
    setCriteria(getInitialCriteria());
  }, [getInitialCriteria]);

  // Submit search
  const handleSubmit = useCallback(() => {
    // Filter out empty criteria
    const validCriteria = criteria.filter(c => c.value.trim() !== '');
    
    if (validCriteria.length === 0) {
      // If no valid criteria, just close
      onClose();
      return;
    }

    onSearch({
      criteria: validCriteria,
      matchAll,
    });
    onClose();
  }, [criteria, matchAll, onSearch, onClose]);

  // Get field label
  const getFieldLabel = (fieldId: string) => {
    return searchableFields.find(f => f.id === fieldId)?.label || fieldId;
  };

  // Check if can submit (at least one criterion with value)
  const canSubmit = criteria.some(c => c.value.trim() !== '');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tune />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Instructions */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Build your search query by adding fields and values. Multiple criteria can be combined 
            using <strong>AND</strong> (all must match) or <strong>OR</strong> (any can match).
          </Typography>
        </Paper>

        {/* Match Mode Toggle */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Match mode:
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              label="Match ALL"
              variant={matchAll ? 'filled' : 'outlined'}
              color={matchAll ? 'primary' : 'default'}
              onClick={() => setMatchAll(true)}
              size="small"
              sx={{ fontWeight: matchAll ? 600 : 400 }}
            />
            <Chip
              label="Match ANY"
              variant={!matchAll ? 'filled' : 'outlined'}
              color={!matchAll ? 'primary' : 'default'}
              onClick={() => setMatchAll(false)}
              size="small"
              sx={{ fontWeight: !matchAll ? 600 : 400 }}
            />
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Search Criteria */}
        <Stack spacing={2}>
          {criteria.map((criterion, index) => (
            <Paper
              key={criterion.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.02),
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.light',
                  boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                {/* Row Number */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>

                {/* Field Selector */}
                <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={criterion.field}
                    label="Field"
                    onChange={(e) => handleUpdateCriterion(criterion.id, { field: e.target.value })}
                  >
                    {searchableFields.map((field) => (
                      <MenuItem key={field.id} value={field.id}>
                        {field.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Operator Selector */}
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Operator</InputLabel>
                  <Select
                    value={criterion.operator}
                    label="Operator"
                    onChange={(e) => handleUpdateCriterion(criterion.id, { 
                      operator: e.target.value as SearchOperator 
                    })}
                  >
                    {OPERATORS.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Value Input */}
                <TextField
                  size="small"
                  placeholder={`Search in ${getFieldLabel(criterion.field)}...`}
                  value={criterion.value}
                  onChange={(e) => handleUpdateCriterion(criterion.id, { value: e.target.value })}
                  sx={{ flex: 2, minWidth: 200 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: criterion.value && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateCriterion(criterion.id, { value: '' })}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />

                {/* Remove Button */}
                {criteria.length > 1 && (
                  <Tooltip title="Remove this criterion">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveCriterion(criterion.id)}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              {/* Connector label between criteria */}
              {index < criteria.length - 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 2,
                  }}
                >
                  <Chip
                    label={matchAll ? 'AND' : 'OR'}
                    size="small"
                    color={matchAll ? 'primary' : 'secondary'}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                </Box>
              )}
            </Paper>
          ))}
        </Stack>

        {/* Add Button */}
        {criteria.length < maxCriteria && (
          <Button
            startIcon={<Add />}
            onClick={handleAddCriterion}
            sx={{ mt: 2 }}
            variant="outlined"
            size="small"
          >
            Add Search Field
          </Button>
        )}
      </DialogContent>

      <Divider />

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          startIcon={<Clear />}
          onClick={handleClearAll}
          color="inherit"
          size="small"
        >
          Clear All
        </Button>
        <Stack direction="row" spacing={2}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<Search />}
            disabled={!canSubmit}
            sx={{
              px: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }}
          >
            Search
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

