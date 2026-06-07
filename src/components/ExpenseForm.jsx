import { useState, useEffect } from 'react'

function ExpenseForm({ expense, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (expense) {
      setFormData({
        category: expense.category || '',
        amount: expense.amount || '',
        date: expense.date ? (expense.date.includes('T') ? expense.date.split('T')[0] : expense.date) : new Date().toISOString().split('T')[0],
        description: expense.description || '',
      })
    } else {
      setFormData({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      })
    }
  }, [expense])

  const validate = () => {
    const newErrors = {}

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      // Convert date to ISO string and amount to number for backend
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date ? new Date(formData.date).toISOString() : formData.date
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

  const categories = [
    'Utilities',
    'Supplies',
    'Salaries',
    'Maintenance',
    'Transportation',
    'Food & Catering',
    'Equipment',
    'Other'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-text-dark mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.category
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-text-dark mb-2">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
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
          <label htmlFor="date" className="block text-sm font-medium text-text-dark mb-2">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.date
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-dark mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          placeholder="Enter expense description"
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          {expense ? 'Update Expense' : 'Add Expense'}
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

export default ExpenseForm
