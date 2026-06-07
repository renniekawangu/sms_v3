import { useState, useEffect } from 'react'
import { useSettings } from '../contexts/SettingsContext'

function FeeForm({ fee, students, onSubmit, onCancel }) {
  const { currentAcademicYear, academicYears } = useSettings()
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    description: '',
    dueDate: '',
    academicYear: currentAcademicYear?.year || '',
    term: 'General',
    status: 'unpaid',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (fee) {
      setFormData({
        studentId: fee.studentId?._id || fee.studentId || '',
        amount: fee.amount || '',
        description: fee.description || '',
        dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '',
        academicYear: fee.academicYear || currentAcademicYear?.year || '',
        term: fee.term || 'General',
        status: fee.status || 'unpaid',
      })
    } else {
      setFormData({
        studentId: '',
        amount: '',
        description: '',
        dueDate: '',
        academicYear: currentAcademicYear?.year || '',
        term: 'General',
        status: 'unpaid',
      })
    }
  }, [fee, currentAcademicYear])

  const validate = () => {
    const newErrors = {}

    if (!formData.studentId) {
      newErrors.studentId = 'Student is required'
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Academic year is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="font-display text-lg font-semibold text-slate-900">{fee ? 'Update fee record' : 'Create a new fee record'}</p>
        <p className="mt-1 text-sm text-text-muted">Use the same finance workflow styling as the rest of the dashboard for cleaner data entry.</p>
      </div>

      <div className="ui-field">
        <label htmlFor="studentId" className="ui-label">
          Student <span className="text-red-500">*</span>
        </label>
        <select
          id="studentId"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          className={`ui-select ${
            errors.studentId
              ? 'border-red-300 focus:ring-red-500'
              : ''
          }`}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.firstName} {student.lastName} (ID: {student.studentId})
            </option>
          ))}
        </select>
        {errors.studentId && <p className="text-sm text-red-500">{errors.studentId}</p>}
      </div>

      <div className="form-grid-ui two-up">
        <div className="ui-field">
          <label htmlFor="amount" className="ui-label">
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
            className={`ui-input ${
              errors.amount
                ? 'border-red-300 focus:ring-red-500'
                : ''
            }`}
            placeholder="Enter amount"
          />
          {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
        </div>

        <div className="ui-field">
          <label htmlFor="dueDate" className="ui-label">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`ui-input ${
              errors.dueDate
                ? 'border-red-300 focus:ring-red-500'
                : ''
            }`}
          />
          {errors.dueDate && <p className="text-sm text-red-500">{errors.dueDate}</p>}
        </div>

        <div className="ui-field">
          <label htmlFor="academicYear" className="ui-label">
            Academic Year <span className="text-red-500">*</span>
          </label>
          <select
            id="academicYear"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className={`ui-select ${
              errors.academicYear
                ? 'border-red-300 focus:ring-red-500'
                : ''
            }`}
          >
            <option value="">Select academic year</option>
            {academicYears?.map((year) => (
              <option key={year._id} value={year.year}>
                {year.year}
              </option>
            ))}
          </select>
          {errors.academicYear && <p className="text-sm text-red-500">{errors.academicYear}</p>}
        </div>

        <div className="ui-field">
          <label htmlFor="term" className="ui-label">
            Term
          </label>
          <select
            id="term"
            name="term"
            value={formData.term}
            onChange={handleChange}
            className="ui-select"
          >
            <option value="General">General</option>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
        </div>

        <div className="ui-field">
          <label htmlFor="description" className="ui-label">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="ui-input"
            placeholder="e.g., Tuition Fee"
          />
        </div>

        <div className="ui-field">
          <label htmlFor="status" className="ui-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="ui-select"
          >
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="btn-ui btn-primary flex-1"
        >
          {fee ? 'Update Fee' : 'Add Fee'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-ui btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default FeeForm
