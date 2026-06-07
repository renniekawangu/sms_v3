import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { feesApi, studentsApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useSettings } from '../contexts/SettingsContext'
import Modal from '../components/Modal'
import FeeForm from '../components/FeeForm'
import PageHeader from '../components/PageHeader'
import { useCurrency, formatCurrency } from '../hooks/useCurrency'
import { debounce } from '../utils/helpers'
import { TableSkeleton } from '../components/LoadingSkeleton'
import ErrorBoundary from '../components/ErrorBoundary'

function Fees() {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFee, setEditingFee] = useState(null)
  const [filters, setFilters] = useState({
    academicYear: '',
    term: ''
  })
  const { success, error: showError } = useToast()
  const { schoolSettings, currentAcademicYear, academicYears: contextAcademicYears } = useSettings()
  const currency = useCurrency()

  // Debounced filter update function
  const debouncedFilterUpdate = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters)
    }, 500),
    []
  )

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value }
    debouncedFilterUpdate(newFilters)
  }, [filters, debouncedFilterUpdate])

  useEffect(() => {
    // Set default academic year filter
    if (currentAcademicYear?.year && !filters.academicYear) {
      setFilters(prev => ({ ...prev, academicYear: currentAcademicYear.year }))
    }
  }, [currentAcademicYear])

  useEffect(() => {
    // Use academic years from context
    if (contextAcademicYears && contextAcademicYears.length > 0) {
      setAcademicYears(contextAcademicYears)
    }
  }, [contextAcademicYears])

  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query params
      const queryParams = new URLSearchParams()
      if (filters.academicYear) queryParams.append('academicYear', filters.academicYear)
      if (filters.term) queryParams.append('term', filters.term)

      const [feesData, studentsData] = await Promise.all([
        feesApi.listByFilters(queryParams),
        studentsApi.list()
      ])
      setFees(feesData.fees || feesData)
      setStudents(studentsData)
    } catch (err) {
      const errorMessage = err.message || 'Failed to load data'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingFee(null)
    setIsModalOpen(true)
  }

  const handleEdit = (fee) => {
    setEditingFee(fee)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingFee) {
        await feesApi.update(editingFee._id || editingFee.fee_id, formData)
        success('Fee updated successfully')
      } else {
        await feesApi.create(formData)
        success('Fee created successfully')
      }
      setIsModalOpen(false)
      setEditingFee(null)
      await loadData()
    } catch (err) {
      const errorMessage = err.message || (editingFee ? 'Failed to update fee' : 'Failed to create fee')
      showError(errorMessage)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee?')) {
      try {
        await feesApi.delete(id)
        success('Fee deleted successfully')
        await loadData()
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete fee'
        showError(errorMessage)
      }
    }
  }

  const getStudentName = (student_id) => {
    return students.find(s => s.student_id === student_id)?.name || `Student ${student_id}`
  }

  const filteredFees = useMemo(() => {
    if (!searchQuery.trim()) return fees
    const query = searchQuery.toLowerCase()
    return fees.filter((fee) => {
      const studentName = getStudentName(fee.student_id).toLowerCase()
      return (
        studentName.includes(query) ||
        fee.fee_id?.toString().includes(query) ||
        fee.term?.toLowerCase().includes(query)
      )
    })
  }, [fees, students, searchQuery])

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="page-stack">
          <div className="surface-card section-pad">
            <h2 className="text-lg font-semibold mb-4">Fees Management</h2>
            <TableSkeleton rows={5} />
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (error && fees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Error loading fees</p>
          <p className="text-text-muted mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="page-stack">
      <PageHeader
        eyebrow="Fee Ledger"
        title="Fees"
        description="Review fee records, filter by academic period, and create or edit charges from the same consistent finance workspace."
        meta={
          <>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Loaded fees</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{fees.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Visible fees</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{filteredFees.length}</p>
            </div>
          </>
        }
        actions={
          <button onClick={handleCreate} className="btn-ui btn-primary">
            <Plus size={18} className="sm:size-5" />
            <span>Add Fee</span>
          </button>
        }
      />

      <div className="table-shell p-3 sm:p-4 lg:p-6">
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="ui-field">
            <label className="ui-label">Academic Year</label>
            <select
              value={filters.academicYear}
              onChange={(e) => handleFilterChange('academicYear', e.target.value)}
              className="ui-select"
            >
              <option value="">All Years</option>
              {academicYears.map((year) => (
                <option key={year._id} value={year.year}>
                  {year.year}
                </option>
              ))}
            </select>
          </div>
          
          <div className="ui-field">
            <label className="ui-label">Term</label>
            <select
              value={filters.term}
              onChange={(e) => handleFilterChange('term', e.target.value)}
              className="ui-select"
            >
              <option value="">All Terms</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ academicYear: currentAcademicYear?.year || '', term: '' })}
              className="btn-ui btn-secondary w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search fees by student or term..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ui-input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Student</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Academic Year</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Term</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-text-muted">
                    No fees found
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee._id || fee.fee_id} className="border-b border-gray-100 hover:bg-cyan-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-text-dark">{fee._id}</td>
                    <td className="py-3 px-4 text-sm text-text-dark">{fee.studentId?.firstName} {fee.studentId?.lastName}</td>
                    <td className="py-3 px-4 text-sm text-text-dark font-medium">{formatCurrency(fee.amount, currency)}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">{fee.academicYear}</td>
                    <td className="py-3 px-4 text-sm text-text-muted">{fee.term}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          fee.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : fee.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {fee.status?.charAt(0).toUpperCase() + fee.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(fee)}
                          className="text-primary-blue hover:text-primary-blue/80 text-sm font-medium flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(fee._id || fee.fee_id)}
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
            Showing {filteredFees.length} of {fees.length} fees
          </p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingFee(null)
        }}
        title={editingFee ? 'Edit Fee' : 'Add New Fee'}
      >
        <FeeForm
          fee={editingFee}
          students={students}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingFee(null)
          }}
        />
      </Modal>
      </div>
    </ErrorBoundary>
  )
}

export default Fees
