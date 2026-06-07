/**
 * Receipt API Service
 * Frontend service for receipt generation and download
 */
const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/accounts` : '/api/accounts';

function getAuthToken() {
  return localStorage.getItem('auth_token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response;
}

export const receiptsApi = {
  /**
   * Download receipt for a single payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Blob>} PDF blob
   */
  downloadReceipt: async (paymentId) => {
    const response = await apiRequest(`/receipts/${paymentId}`);
    return response.blob();
  },

  /**
   * Download batch receipt for multiple payments
   * @param {string[]} paymentIds - Array of payment IDs
   * @returns {Promise<Blob>} PDF blob
   */
  downloadBatchReceipt: async (paymentIds) => {
    const response = await apiRequest('/receipts/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIds })
    });
    return response.blob();
  },

  /**
   * Get receipt history with filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Receipt list with pagination
   */
  getReceiptHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/receipts?${queryString}`);
    return response.json();
  },

  /**
   * Generate and download receipt by payment ID
   * Helper function for automatic download
   * @param {string} paymentId - Payment ID
   * @param {string} filename - Optional custom filename
   */
  downloadReceiptFile: async (paymentId, filename = null) => {
    try {
      const blob = await receiptsApi.downloadReceipt(paymentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      return true;
    } catch (error) {
      throw new Error(`Failed to download receipt: ${error.message}`);
    }
  },

  /**
   * Generate and download batch receipt
   * @param {string[]} paymentIds - Array of payment IDs
   * @param {string} filename - Optional custom filename
   */
  downloadBatchReceiptFile: async (paymentIds, filename = null) => {
    try {
      const blob = await receiptsApi.downloadBatchReceipt(paymentIds);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `batch-receipt-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      return true;
    } catch (error) {
      throw new Error(`Failed to download batch receipt: ${error.message}`);
    }
  }
};
