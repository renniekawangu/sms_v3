import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function IssueForm({ issue, onSubmit, onCancel }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title || '',
        category: issue.category || '',
        description: issue.description || '',
        priority: issue.priority || 'medium',
      })
    } else {
      setFormData({
        title: '',
        category: '',
        description: '',
        priority: 'medium',
      })
    }
  }, [issue, user])

  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const categoryTypes = [
    'technical',
    'academic',
    'administrative',
    'facility',
    'financial',
    'discipline',
    'other'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-dark mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Issue title..."
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.title
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

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
          <option value="">Select issue category</option>
          {categoryTypes.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-text-dark mb-2">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-dark mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.description
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
          placeholder="Describe the issue in detail..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          {issue ? 'Update Issue' : 'Create Issue'}
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

export default IssueForm
