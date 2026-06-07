import { useState, useEffect } from 'react'

function TimetableForm({ timetable, classrooms, subjects, teachers, selectedClassroom, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    classroom_id: '',
    teacher_id: '',
    day: 'Monday',
    time: '',
    subject: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (timetable) {
      // Editing existing entry
      setFormData({
        classroom_id: timetable.classroom_id || timetable.classroom?._id || '',
        teacher_id: timetable.teacher_id || timetable.teacher?._id || '',
        day: timetable.day || timetable.dayOfWeek || 'Monday',
        time: timetable.time || timetable.startTime || '',
        subject: (timetable.subject && typeof timetable.subject === 'object')
          ? (timetable.subject.name || '')
          : (timetable.subjectName || timetable.subject || ''),
      })
    } else {
      // Creating new entry - auto-populate from selected classroom
      const classroom = (classrooms || []).find(c => (c._id || c.classroom_id) === selectedClassroom)
      setFormData({
        classroom_id: selectedClassroom || '',
        teacher_id: classroom?.teacher_id || '',
        day: 'Monday',
        time: '',
        subject: '',
      })
    }
  }, [timetable, selectedClassroom, classrooms])

  const validate = () => {
    const newErrors = {}

    if (!formData.classroom_id) {
      newErrors.classroom_id = 'Classroom is required'
    }

    if (!formData.teacher_id) {
      newErrors.teacher_id = 'Teacher is required'
    }

    if (!formData.day) {
      newErrors.day = 'Day is required'
    }

    if (!formData.time) {
      newErrors.time = 'Time is required'
    } else {
      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(formData.time)) {
        newErrors.time = 'Invalid time format. Use HH:MM (e.g., 09:00)'
      }
    }

    const subjectStr = typeof formData.subject === 'string'
      ? formData.subject
      : (formData.subject?.name || '')
    if (!subjectStr || !subjectStr.trim()) {
      newErrors.subject = 'Subject is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        classroom: formData.classroom_id,
        teacher: formData.teacher_id,
        dayOfWeek: formData.day,
        time: formData.time,
        subject: (typeof formData.subject === 'string') ? formData.subject : (formData.subject?.name || ''),
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

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="classroom_id" className="block text-sm font-medium text-text-dark mb-2">
          Classroom <span className="text-red-500">*</span>
        </label>
        <select
          id="classroom_id"
          name="classroom_id"
          value={formData.classroom_id}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.classroom_id
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
        >
          <option value="">Select a classroom</option>
          {(classrooms || []).map((classroom) => (
            <option key={classroom._id || classroom.classroom_id} value={classroom._id || classroom.classroom_id}>
              Grade {classroom.grade} - Section {classroom.section}
            </option>
          ))}
        </select>
        {errors.classroom_id && <p className="mt-1 text-sm text-red-500">{errors.classroom_id}</p>}
      </div>

      <div>
        <label htmlFor="teacher_id" className="block text-sm font-medium text-text-dark mb-2">
          Teacher <span className="text-red-500">*</span>
        </label>
        <select
          id="teacher_id"
          name="teacher_id"
          value={formData.teacher_id}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.teacher_id
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
        >
          <option value="">Select a teacher</option>
          {teachers && teachers.map((teacher) => (
            <option key={teacher._id || teacher.staff_id} value={teacher._id || teacher.staff_id}>
              {teacher.firstName || teacher.name} {teacher.lastName || ''}
            </option>
          ))}
        </select>
        {errors.teacher_id && <p className="mt-1 text-sm text-red-500">{errors.teacher_id}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="day" className="block text-sm font-medium text-text-dark mb-2">
            Day <span className="text-red-500">*</span>
          </label>
          <select
            id="day"
            name="day"
            value={formData.day}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.day
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          {errors.day && <p className="mt-1 text-sm text-red-500">{errors.day}</p>}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-text-dark mb-2">
            Time <span className="text-red-500">*</span>
          </label>
          <select
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.time
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
          >
            <option value="">Select time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-text-dark mb-2">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.subject
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-200 focus:ring-primary-blue'
          }`}
          placeholder="Enter subject name"
        />
        {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
        {(subjects || []).length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-text-muted mb-1">Or select from existing subjects:</p>
            <div className="flex flex-wrap gap-2">
              {(subjects || []).map((subject) => (
                <button
                  key={subject._id || subject.subject_id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, subject: subject.name }))}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-text-dark"
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          {timetable ? 'Update Entry' : 'Add Entry'}
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

export default TimetableForm
