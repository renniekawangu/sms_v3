/**
 * Loading Skeleton Components
 * Used for showing placeholder UI while loading
 */

export const TableRowSkeleton = () => (
  <tr className="border-b border-gray-200 hover:bg-gray-50">
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div></td>
  </tr>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <table className="w-full">
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </tbody>
  </table>
);

export const CardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-1/2"></div>
    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
  </div>
);

export const ModalSkeleton = () => (
  <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
    <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
    <div className="space-y-3">
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
    <div className="flex gap-2 mt-6">
      <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
    </div>
  </div>
);
