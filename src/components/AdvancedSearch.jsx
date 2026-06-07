import React from 'react'
import { Search, Filter, X } from 'lucide-react'

export function AdvancedSearch({
  searchFields = [],
  filterOptions = {},
  onSearch,
  onFilter,
  onClear,
  loading = false
}) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeFilters, setActiveFilters] = React.useState({})
  const [showFilters, setShowFilters] = React.useState(false)

  const handleSearch = (value) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleFilter = (field, value) => {
    const newFilters = { ...activeFilters }
    if (newFilters[field] === value) {
      delete newFilters[field]
    } else {
      newFilters[field] = value
    }
    setActiveFilters(newFilters)
    onFilter?.(newFilters)
  }

  const handleClear = () => {
    setSearchQuery('')
    setActiveFilters({})
    setShowFilters(false)
    onClear?.()
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className="space-y-3 mb-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={loading}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:bg-gray-50"
          aria-label="Search"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-dark"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-blue-50 border-primary-blue text-primary-blue'
              : 'border-gray-200 text-text-dark hover:bg-gray-50'
          }`}
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary-blue text-white rounded-full px-2 py-0.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 text-text-dark hover:bg-gray-50"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
          {Object.entries(filterOptions).map(([field, options]) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-text-dark mb-2 capitalize">
                {field}
              </label>
              <div className="space-y-2">
                {Array.isArray(options) ? (
                  options.map(option => (
                    <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters[field] === option}
                        onChange={() => handleFilter(field, option)}
                        className="rounded w-4 h-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))
                ) : (
                  <input
                    type={options.type || 'text'}
                    placeholder={`Filter by ${field}...`}
                    value={activeFilters[field] || ''}
                    onChange={(e) => handleFilter(field, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-blue"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch
