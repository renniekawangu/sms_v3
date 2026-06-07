import React from 'react'

export function SkeletonLoader({ count = 1, variant = 'row' }) {
  if (variant === 'row') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <tr key={i} className="border-b border-gray-100">
            <td colSpan="7" className="py-4 px-4">
              <div className="flex gap-4">
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </td>
          </tr>
        ))}
      </>
    )
  }

  if (variant === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-card-white rounded-custom shadow-custom p-6 mb-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse mb-2 w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
          </div>
        ))}
      </>
    )
  }

  if (variant === 'form') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/4"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default SkeletonLoader
