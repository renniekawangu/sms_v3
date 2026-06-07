import { useState, useEffect, useMemo } from 'react'
import { TrendingDown, Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { expensesApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import ExpenseForm from '../components/ExpenseForm'
import { useCurrency, formatCurrency } from '../hooks/useCurrency'

function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const { success, error: showError } = useToast()
  const currency = useCurrency()

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await expensesApi.list()
      setExpenses(data)
    } catch (err) {
      const errorMessage = err.message || 'Failed to load expenses'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingExpense(null)
    setIsModalOpen(true)
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingExpense) {
        await expensesApi.update(editingExpense.expense_id, formData)
        success('Expense updated successfully')
      } else {
        await expensesApi.create(formData)
        success('Expense created successfully')
      }
      setIsModalOpen(false)
      setEditingExpense(null)
      await loadExpenses()
    } catch (err) {
      const errorMessage = err.message || (editingExpense ? 'Failed to update expense' : 'Failed to create expense')
      showError(errorMessage)
    }
  }

  const handleDelete = async (expense_id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expensesApi.delete(expense_id)
        success('Expense deleted successfully')
        await loadExpenses()
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete expense'
        showError(errorMessage)
      }
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses
    const query = searchQuery.toLowerCase()
    return expenses.filter((expense) => {
      return (
        expense.category?.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query) ||
        expense.expense_id?.toString().includes(query)
      )
    })
  }, [expenses, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading expenses...</p>
        </div>
      </div>
    )
  }

  if (error && expenses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Error loading expenses</p>
          <p className="text-text-muted mb-4">{error}</p>
          <button
            onClick={loadExpenses}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Expenses</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Manage school expenses</p>
      </div>
      {expenses.length > 0 && (
        <div className="bg-card-white rounded-custom shadow-custom p-3 sm:p-4 mb-4">
          <p className="text-xs sm:text-sm text-text-muted">Total Expenses</p>
          <p className="text-xl sm:text-2xl font-semibold text-text-dark">{formatCurrency(totalExpenses, currency)}</p>
        </div>
      )}
      <button
        onClick={handleCreate}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors text-sm sm:text-base font-medium"
      >
        <Plus size={18} />
        <span>Add Expense</span>
      </button>

      <div className="bg-card-white rounded-custom shadow-custom p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search expenses by category or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-text-muted">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.expense_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-text-dark">{expense.expense_id}</td>
                    <td className="py-3 px-4 text-sm text-text-dark font-medium">{expense.category}</td>
                    <td className="py-3 px-4 text-sm text-text-dark font-medium">{formatCurrency(expense.amount, currency)}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">
                      {expense.date ? (expense.date.includes('T') ? expense.date.split('T')[0] : expense.date) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-muted">{expense.description || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-primary-blue hover:text-primary-blue/80 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.expense_id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <p className="text-sm text-text-muted">
            Showing {filteredExpenses.length} of {expenses.length} expenses
          </p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingExpense(null)
        }}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <ExpenseForm
          expense={editingExpense}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingExpense(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default Expenses
