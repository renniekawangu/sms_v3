import { useState, useEffect } from 'react'
import { parentsApi } from '../services/api'

function StudentForm({ student, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    classLevel: 'Grade 1',
    gender: 'Male',
    enrollmentDate: new Date().toISOString().split('T')[0],
    parentId: '',
  })
  const [parents, setParents] = useState([])
  const [loadingParents, setLoadingParents] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadParents()
  }, [])

  useEffect(() => {
    if (student) {
      // Handle both DTO format (from API with name, dob, date_of_join) and model format
      let firstName = student.firstName || '';
      let lastName = student.lastName || '';
      
      // If we have 'name' but not firstName/lastName, parse it
      if (!firstName && student.name) {
        const nameParts = student.name.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      // Handle parent linking - check if parents array exists and has items
      let parentId = '';
      if (student.parents && Array.isArray(student.parents) && student.parents.length > 0) {
        parentId = student.parents[0]._id || student.parents[0];
      }
      
      setFormData({
        firstName,
        lastName,
        email: student.email || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth 
          ? (student.dateOfBirth.includes('T') ? student.dateOfBirth.split('T')[0] : student.dateOfBirth) 
          : student.dob 
            ? (student.dob.includes('T') ? student.dob.split('T')[0] : student.dob)
            : '',
        address: student.address || '',
        classLevel: student.classLevel || 'Grade 1',
        gender: student.gender || 'Male',
        enrollmentDate: student.enrollmentDate 
          ? (student.enrollmentDate.includes('T') ? student.enrollmentDate.split('T')[0] : student.enrollmentDate) 
          : student.date_of_join
            ? (student.date_of_join.includes('T') ? student.date_of_join.split('T')[0] : student.date_of_join)
            : new Date().toISOString().split('T')[0],
        parentId,
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        classLevel: 'Grade 1',
        gender: 'Male',
        enrollmentDate: new Date().toISOString().split('T')[0],
        parentId: '',
      })
    }
  }, [student])

  const loadParents = async () => {
    try {
      setLoadingParents(true)
      const data = await parentsApi.list()
      setParents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading parents:', error)
      setParents([])
    } finally {
      setLoadingParents(false)
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }
    if (!formData.enrollmentDate) {
      newErrors.enrollmentDate = 'Enrollment date is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      // Transform form data to match backend API expectations
      const backendData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        dob: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
        address: formData.address,
        date_of_join: formData.enrollmentDate ? new Date(formData.enrollmentDate).toISOString() : undefined,
        gender: formData.gender,
        classLevel: formData.classLevel,
        parentId: formData.parentId || undefined,
      }
      onSubmit(backendData)
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
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[75vh]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Name Fields */}
        <div>
          <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              errors.firstName
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              errors.lastName
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
            placeholder="Enter last name"
          />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
        </div>

        {/* Contact Fields */}
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-text-dark mb-1">
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

        {/* Personal Info */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text-dark mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.dateOfBirth
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          />
          {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-text-dark mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.gender
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
        </div>

        {/* School Info */}
        <div>
          <label htmlFor="classLevel" className="block text-sm font-medium text-text-dark mb-2">
            Class Level
          </label>
          <select
            id="classLevel"
            name="classLevel"
            value={formData.classLevel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            <option value="Baby Class">Baby Class</option>
            <option value="Nursery">Nursery</option>
            <option value="PP1">PP1</option>
            <option value="PP2">PP2</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
            <option value="Grade 6">Grade 6</option>
            <option value="Grade 7">Grade 7</option>
          </select>
        </div>
        <div>
          <label htmlFor="enrollmentDate" className="block text-sm font-medium text-text-dark mb-2">
            Enrollment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="enrollmentDate"
            name="enrollmentDate"
            value={formData.enrollmentDate}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.enrollmentDate
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          />
          {errors.enrollmentDate && <p className="mt-1 text-sm text-red-500">{errors.enrollmentDate}</p>}
        </div>
      </div>

      {/* Address - Full Width */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-text-dark mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.address
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
          placeholder="Enter full address"
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* Parent Selection - Full Width */}
      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-text-dark mb-2">
          Parent/Guardian
        </label>
        <select
          id="parentId"
          name="parentId"
          value={formData.parentId}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          disabled={loadingParents}
        >
          <option value="">No parent assigned</option>
          {Array.isArray(parents) && parents.map((parent) => (
            <option key={parent._id} value={parent._id}>
              {parent.firstName} {parent.lastName} ({parent.email || parent.phone})
            </option>
          ))}
        </select>
        {loadingParents && <p className="mt-1 text-xs text-text-muted">Loading parents...</p>}
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          {student ? 'Update Student' : 'Add Student'}
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

export default StudentForm
