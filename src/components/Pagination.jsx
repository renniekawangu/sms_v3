import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, onPageChange, pageSize, totalItems }) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const pages = []
  const maxVisiblePages = 5

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-gray-50 rounded-lg">
      <div className="text-xs sm:text-sm text-text-muted">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 sm:p-2 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
        >
          <ChevronLeft size={16} className="sm:size-5" />
        </button>

        <div className="flex gap-1">
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-2 sm:px-3 py-1 rounded text-sm hover:bg-gray-100"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 py-1">...</span>}
            </>
          )}

          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-2 sm:px-3 py-1 rounded text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary-blue text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 py-1">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-2 sm:px-3 py-1 rounded text-sm hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 sm:p-2 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight size={16} className="sm:size-5" />
        </button>
      </div>

      <select
        value={pageSize}
        onChange={(e) => onPageChange(1, parseInt(e.target.value))}
        className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-blue"
      >
        <option value={10}>10 per page</option>
        <option value={25}>25 per page</option>
        <option value={50}>50 per page</option>
        <option value={100}>100 per page</option>
      </select>
    </div>
  )
}
