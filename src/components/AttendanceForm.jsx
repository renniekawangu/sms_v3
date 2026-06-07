import { useState, useEffect } from 'react'
import { subjectsApi } from '../services/api'

function AttendanceForm({ attendance, students, onSubmit, onCancel }) {
    const [subjects, setSubjects] = useState([])
  const [formData, setFormData] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    subject: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const data = await subjectsApi.list()
        setSubjects(data)
      } catch {
        setSubjects([])
      }
    }
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (attendance) {
      setFormData({
        studentId: attendance.studentId || '',
        date: attendance.date ? (attendance.date.includes('T') ? attendance.date.split('T')[0] : attendance.date) : new Date().toISOString().split('T')[0],
        status: attendance.status || 'present',
        subject: attendance.subject || '',
      })
    } else {
      setFormData({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        subject: '',
      })
    }
  }, [attendance])

  const validate = () => {
    const newErrors = {}

    if (!formData.studentId) {
      newErrors.studentId = 'Student is required'
    }
    if (!formData.subject) {
      newErrors.subject = 'Subject is required'
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
      onSubmit({
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : formData.date,
      })
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="studentId" className="block text-sm font-medium text-text-dark mb-2">
          Student <span className="text-red-500">*</span>
        </label>
        <select
          id="studentId"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.studentId
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.student_id} value={student.student_id}>
              {student.name} (ID: {student.student_id})
            </option>
          ))}
        </select>
        {errors.studentId && <p className="mt-1 text-sm text-red-500">{errors.studentId}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-text-dark mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
        </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-text-dark mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.subject
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-primary-blue'
                }`}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id || subject.subject_id} value={subject.name || subject.subject}>
                    {subject.name || subject.subject}
                  </option>
                ))}
              </select>
              {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
            </div>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          {attendance ? 'Update Attendance' : 'Mark Attendance'}
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

export default AttendanceForm
