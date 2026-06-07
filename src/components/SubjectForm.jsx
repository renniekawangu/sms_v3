import { useState, useEffect } from 'react'

function SubjectForm({ subject, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    description: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        grade: subject.grade || '',
        description: subject.description || '',
      })
    } else {
      setFormData({
        name: '',
        grade: '',
        description: '',
      })
    }
  }, [subject])

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required'
    }

    if (!formData.grade || formData.grade < 1 || formData.grade > 12) {
      newErrors.grade = 'Grade must be between 1 and 12'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        grade: parseInt(formData.grade),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
          Subject Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.name
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
          placeholder="Enter subject name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-text-dark mb-2">
            Grade <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            min="1"
            max="12"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.grade
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
            placeholder="Enter grade (1-12)"
          />
          {errors.grade && <p className="mt-1 text-sm text-red-500">{errors.grade}</p>}
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
          placeholder="Enter subject description"
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          {subject ? 'Update Subject' : 'Add Subject'}
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

export default SubjectForm
