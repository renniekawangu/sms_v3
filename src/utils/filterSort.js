/**
 * Filtering and Sorting Utilities
 */

export const filterData = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) return data

  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      if (Array.isArray(value)) {
        return value.length === 0 || value.includes(item[key])
      }
      if (typeof value === 'string') {
        return item[key]?.toString().toLowerCase().includes(value.toLowerCase())
      }
      return item[key] === value
    })
  })
}

export const sortData = (data, sortBy, sortOrder = 'asc') => {
  if (!sortBy) return data

  const sorted = [...data].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    // Handle nested properties
    if (sortBy.includes('.')) {
      aVal = sortBy.split('.').reduce((obj, key) => obj?.[key], a)
      bVal = sortBy.split('.').reduce((obj, key) => obj?.[key], b)
    }

    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    if (typeof aVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
  })

  return sorted
}

export const paginateData = (data, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    data: data.slice(start, end),
    total: data.length,
    pageCount: Math.ceil(data.length / pageSize),
    currentPage: page,
    pageSize
  }
}

export const searchData = (data, query, searchFields) => {
  if (!query.trim()) return data

  const lowerQuery = query.toLowerCase()
  return data.filter(item =>
    searchFields.some(field => {
      const value = item[field]
      return value?.toString().toLowerCase().includes(lowerQuery)
    })
  )
}

export const groupData = (data, groupBy) => {
  return data.reduce((acc, item) => {
    const key = item[groupBy]
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

export const getUniqueValues = (data, field) => {
  return [...new Set(data.map(item => item[field]).filter(Boolean))]
}

export const aggregateData = (data, field, operation = 'sum') => {
  if (operation === 'sum') {
    return data.reduce((sum, item) => sum + (item[field] || 0), 0)
  }
  if (operation === 'avg') {
    const sum = aggregateData(data, field, 'sum')
    return data.length > 0 ? sum / data.length : 0
  }
  if (operation === 'count') {
    return data.filter(item => item[field]).length
  }
  if (operation === 'min') {
    return Math.min(...data.map(item => item[field] || 0))
  }
  if (operation === 'max') {
    return Math.max(...data.map(item => item[field] || 0))
  }
  return 0
}
