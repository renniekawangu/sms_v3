import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { receiptsApi } from '../services/receiptsApi';
import { useToast } from '../contexts/ToastContext';

export default function ReceiptHistory() {
  const { showSuccess, showError } = useToast();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [filters, setFilters] = useState({
    method: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load receipt history
  useEffect(() => {
    loadReceipts();
  }, [page, limit, filters]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptsApi.getReceiptHistory({
        page,
        limit,
        method: filters.method,
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      setReceipts(response.receipts);
      setTotal(response.pagination.total);
    } catch (err) {
      showError(err.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId, receiptNumber) => {
    try {
      setDownloading(paymentId);
      await receiptsApi.downloadReceiptFile(paymentId, `${receiptNumber}.pdf`);
      showSuccess('Receipt downloaded successfully');
    } catch (err) {
      showError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadBatch = async () => {
    if (selectedReceipts.length === 0) {
      showError('Please select at least one receipt');
      return;
    }

    try {
      setDownloading('batch');
      await receiptsApi.downloadBatchReceiptFile(selectedReceipts);
      showSuccess(`Batch receipt downloaded for ${selectedReceipts.length} payments`);
      setSelectedReceipts([]);
    } catch (err) {
      showError(err.message);
    } finally {
      setDownloading(null);
    }
  };

  const toggleReceiptSelection = (receiptId) => {
    setSelectedReceipts(prev =>
      prev.includes(receiptId)
        ? prev.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page
  };

  const formatCurrency = (amount) => {
    return `K${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer',
      'mobile_money': 'Mobile Money',
      'cheque': 'Cheque',
      'other': 'Other'
    };
    return methods[method] || (method ? method.charAt(0).toUpperCase() + method.slice(1) : 'Unknown');
  };

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-dark flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-blue" />
            Receipt History
          </h2>
          <p className="text-sm text-text-muted mt-1">View and download payment receipts</p>
        </div>

        <button
          onClick={() => loadReceipts()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-text-dark rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-primary-blue font-medium hover:text-primary-blue/80 transition-colors"
        >
          <Filter size={18} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Payment Method
              </label>
              <select
                value={filters.method}
                onChange={(e) => handleFilterChange('method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Batch Actions */}
      {selectedReceipts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-sm font-medium text-text-dark">
              {selectedReceipts.length} receipt(s) selected
            </span>
            <button
              onClick={handleDownloadBatch}
              disabled={downloading === 'batch'}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Download size={16} />
              {downloading === 'batch' ? 'Downloading...' : 'Download Batch'}
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && receipts.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-text-muted mb-2">No receipts found</p>
          <p className="text-sm text-text-muted">Try adjusting your filters</p>
        </div>
      )}

      {/* Receipt List */}
      {receipts.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedReceipts.length === receipts.length && receipts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReceipts(receipts.map(r => r._id));
                        } else {
                          setSelectedReceipts([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-text-dark">Receipt #</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-dark">Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-dark">Fee Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-dark">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-dark">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-dark">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-text-dark">Action</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedReceipts.includes(receipt._id)}
                        onChange={() => toggleReceiptSelection(receipt._id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-text-dark">{receipt.receiptNumber}</td>
                    <td className="py-3 px-4 text-text-dark">{receipt.studentName}</td>
                    <td className="py-3 px-4 text-text-dark">{receipt.feeType}</td>
                    <td className="py-3 px-4 font-medium text-text-dark">{formatCurrency(receipt.amount)}</td>
                    <td className="py-3 px-4 text-text-dark">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                        {formatPaymentMethod(receipt.method)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted text-xs">{formatDate(receipt.paymentDate)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDownloadReceipt(receipt._id, receipt.receiptNumber)}
                        disabled={downloading === receipt._id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-blue text-white rounded hover:bg-primary-blue/90 transition-colors disabled:opacity-50 text-xs font-medium"
                      >
                        <Download size={14} />
                        {downloading === receipt._id ? 'Downloading...' : 'Download'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">
                  Page {page} of {pagination.pages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = Math.max(1, page - 2) + i;
                  if (pageNum > pagination.pages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        page === pageNum
                          ? 'bg-primary-blue text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              <div>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-text-muted mt-2">Loading receipts...</p>
        </div>
      )}
    </div>
  );
}
