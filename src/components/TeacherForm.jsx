import { useState, useEffect } from 'react'

function TeacherForm({ teacher, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    sex: 'M',
    address: '',
    date_of_join: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        dob: teacher.dob ? (teacher.dob.includes('T') ? teacher.dob.split('T')[0] : teacher.dob) : '',
        sex: teacher.sex || 'M',
        address: teacher.address || '',
        date_of_join: teacher.date_of_join 
          ? (teacher.date_of_join.includes('T') ? teacher.date_of_join.split('T')[0] : teacher.date_of_join)
          : new Date().toISOString().split('T')[0],
      })
    } else {
      // Reset form for new teacher
      setFormData({
        name: '',
        email: '',
        phone: '',
        dob: '',
        sex: 'M',
        address: '',
        date_of_join: new Date().toISOString().split('T')[0],
      })
    }
  }, [teacher])

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required'
    }

    if (!formData.sex) {
      newErrors.sex = 'Gender is required'
    }

    if (!formData.date_of_join) {
      newErrors.date_of_join = 'Date of join is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      // Convert dates to ISO strings for backend
      onSubmit({
        ...formData,
        dob: formData.dob ? new Date(formData.dob).toISOString() : formData.dob,
        date_of_join: formData.date_of_join ? new Date(formData.date_of_join).toISOString() : formData.date_of_join
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
            Name <span className="text-red-500">*</span>
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
            placeholder="Enter teacher name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.phone
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-text-dark mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.dob
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          />
          {errors.dob && <p className="mt-1 text-sm text-red-500">{errors.dob}</p>}
        </div>

        <div>
          <label htmlFor="sex" className="block text-sm font-medium text-text-dark mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="sex"
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.sex
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
          {errors.sex && <p className="mt-1 text-sm text-red-500">{errors.sex}</p>}
        </div>

        <div>
          <label htmlFor="date_of_join" className="block text-sm font-medium text-text-dark mb-2">
            Date of Join <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date_of_join"
            name="date_of_join"
            value={formData.date_of_join}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.date_of_join
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          />
          {errors.date_of_join && <p className="mt-1 text-sm text-red-500">{errors.date_of_join}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-text-dark mb-2">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          placeholder="Enter address"
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          {teacher ? 'Update Teacher' : 'Add Teacher'}
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

export default TeacherForm
