/**
 * Bulk Operations Utilities
 */

export const useBulkSelection = () => {
  const [selectedIds, setSelectedIds] = React.useState(new Set())

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = (ids) => {
    setSelectedIds(new Set(ids))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const toggleSelectAll = (ids) => {
    if (selectedIds.size === ids.length) {
      deselectAll()
    } else {
      selectAll(ids)
    }
  }

  const isSelected = (id) => selectedIds.has(id)

  const getSelectedIds = () => Array.from(selectedIds)

  const clearSelection = () => setSelectedIds(new Set())

  return {
    selectedIds,
    setSelectedIds,
    toggleSelect,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    getSelectedIds,
    clearSelection,
    selectCount: selectedIds.size
  }
}

export const performBulkOperation = async (ids, operation, operationFn) => {
  if (!ids || ids.length === 0) {
    throw new Error('No items selected')
  }

  const results = {
    success: [],
    failed: []
  }

  for (const id of ids) {
    try {
      await operationFn(id)
      results.success.push(id)
    } catch (error) {
      results.failed.push({ id, error: error.message })
    }
  }

  return results
}

export const deleteBulk = async (ids, deleteFunction) => {
  return performBulkOperation(ids, 'delete', deleteFunction)
}

export const updateBulk = async (ids, updates, updateFunction) => {
  return performBulkOperation(ids, 'update', (id) => updateFunction(id, updates))
}

export const exportSelected = (data, selectedIds, filename = 'export.csv') => {
  const selectedData = data.filter(item => selectedIds.includes(item._id || item.id))
  if (selectedData.length === 0) {
    alert('No items selected for export')
    return
  }
  // Use export utility
  const { exportToCSV } = require('./exportData')
  exportToCSV(selectedData, filename)
}
