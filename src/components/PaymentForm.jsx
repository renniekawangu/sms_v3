import { useState, useEffect } from 'react'

function PaymentForm({ payment, fees, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    feeId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'cash',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [selectedFee, setSelectedFee] = useState(null)

  useEffect(() => {
    if (payment) {
      setFormData({
        feeId: payment.feeId || '',
        amount: payment.amount || '',
        paymentDate: payment.paymentDate ? (payment.paymentDate.includes('T') ? payment.paymentDate.split('T')[0] : payment.paymentDate) : new Date().toISOString().split('T')[0],
        method: payment.method || 'cash',
        notes: payment.notes || '',
      })
    } else {
      setFormData({
        feeId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        method: 'cash',
        notes: '',
      })
    }
  }, [payment])

  useEffect(() => {
    if (formData.feeId && fees) {
      const fee = fees.find(f => (f._id || f.id) === formData.feeId)
      setSelectedFee(fee)
      if (fee) {
        // Calculate remaining balance using correct field names
        const totalAmount = fee.amount || 0
        const paidAmount = fee.amountPaid || 0
        const remainingBalance = totalAmount - paidAmount
        if (formData.amount > remainingBalance) {
          setFormData(prev => ({ ...prev, amount: remainingBalance }))
        }
      }
    } else {
      setSelectedFee(null)
    }
  }, [formData.feeId, fees])

  const validate = () => {
    const newErrors = {}

    if (!formData.feeId) {
      newErrors.feeId = 'Fee is required'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (selectedFee) {
      const remainingBalance = (selectedFee.amount || 0) - (selectedFee.amountPaid || 0)
      if (formData.amount > remainingBalance) {
        newErrors.amount = `Amount cannot exceed remaining balance (K${remainingBalance.toFixed(2)})`
      }
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required'
    }

    if (!formData.method) {
      newErrors.method = 'Payment method is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      // Convert date to ISO string and numbers for backend
      onSubmit({
        ...formData,
        feeId: formData.feeId,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : formData.paymentDate
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Filter fees to show only unpaid or partially paid
  const availableFees = (fees || []).filter(f => f.status !== 'paid')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {selectedFee && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-text-dark font-semibold">
            Payment for: <span className="text-primary-blue">
              {selectedFee.studentId?.firstName || selectedFee.studentId?.name || 'Student'}
              {selectedFee.studentId?.lastName ? ` ${selectedFee.studentId.lastName}` : ''}
            </span>
          </p>
        </div>
      )}
      <div>
        <label htmlFor="feeId" className="block text-sm font-medium text-text-dark mb-2">
          Fee <span className="text-red-500">*</span>
        </label>
        <select
          id="feeId"
          name="feeId"
          value={formData.feeId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.feeId
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
        >
          <option value="">Select a fee</option>
          {availableFees.map((fee) => {
            const feeId = fee._id || fee.id
            const totalAmount = fee.amount || 0
            const amountPaid = fee.amountPaid || 0
            const remaining = totalAmount - amountPaid
            const studentName = fee.studentId?.firstName 
              ? `${fee.studentId.firstName}${fee.studentId.lastName ? ` ${fee.studentId.lastName}` : ''}`
              : fee.studentId?.name || 'Unknown'
            const feeDescription = fee.description || 'Fee'
            return (
              <option key={feeId} value={feeId}>
                {studentName} - {feeDescription} - K{totalAmount.toFixed(2)} ({fee.term || 'General'}) - K{remaining.toFixed(2)} remaining
              </option>
            )
          })}
        </select>
        {errors.feeId && <p className="mt-1 text-sm text-red-500">{errors.feeId}</p>}
        {selectedFee && (
          <p className="mt-1 text-sm text-text-muted">
            Total: K{(selectedFee.amount || 0).toFixed(2)} | Paid: K{(selectedFee.amountPaid || 0).toFixed(2)} | Remaining: K{((selectedFee.amount || 0) - (selectedFee.amountPaid || 0)).toFixed(2)} | Status: {selectedFee.status}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-text-dark mb-2">
            Amount to Pay (K) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            max={selectedFee ? ((selectedFee.amount || 0) - (selectedFee.amountPaid || 0)) : undefined}
            step="0.01"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.amount
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
            placeholder="Enter amount"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
        </div>

        <div>
          <label htmlFor="paymentDate" className="block text-sm font-medium text-text-dark mb-2">
            Payment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="paymentDate"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.paymentDate
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          />
          {errors.paymentDate && <p className="mt-1 text-sm text-red-500">{errors.paymentDate}</p>}
        </div>

        <div>
          <label htmlFor="method" className="block text-sm font-medium text-text-dark mb-2">
            Payment Method <span className="text-red-500">*</span>
          </label>
          <select
            id="method"
            name="method"
            value={formData.method}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.method
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
          {errors.method && <p className="mt-1 text-sm text-red-500">{errors.method}</p>}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-text-dark mb-2">
            Notes / Receipt #
          </label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            placeholder="Optional notes or receipt number"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          Record Payment
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-200 text-text-dark px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default PaymentForm
