import { useState, useEffect, useMemo } from 'react'

function ClassroomForm({ classroom, teachers, students, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    grade: '',
    section: '',
    teacher_id: '',
    students: [],
  })
  const [errors, setErrors] = useState({})
  const [selectedStudents, setSelectedStudents] = useState([])
  const [teacherQuery, setTeacherQuery] = useState('')
  const [studentQuery, setStudentQuery] = useState('')

  useEffect(() => {
    if (classroom) {
      setFormData({
        grade: classroom.grade || '',
        section: classroom.section || '',
        teacher_id: classroom.teacher_id || '',
        students: classroom.students || [],
      })
      setSelectedStudents(classroom.students || [])
    } else {
      setFormData({
        grade: '',
        section: '',
        teacher_id: '',
        students: [],
      })
      setSelectedStudents([])
    }
  }, [classroom])

  const filteredTeachers = useMemo(() => {
    if (!teachers) return []
    if (!teacherQuery.trim()) return teachers
    const q = teacherQuery.toLowerCase()
    return (teachers || []).filter(t => (t.name || '').toLowerCase().includes(q))
  }, [teachers, teacherQuery])

  const filteredStudents = useMemo(() => {
    if (!students) return []
    if (!studentQuery.trim()) return students
    const q = studentQuery.toLowerCase()
    return (students || []).filter(s => (s.name || '').toLowerCase().includes(q))
  }, [students, studentQuery])

  const validate = () => {
    const newErrors = {}

    if (!formData.grade || formData.grade < 1 || formData.grade > 12) {
      newErrors.grade = 'Grade must be between 1 and 12'
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required'
    }

    // Teacher is optional; backend allows null

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        grade: parseInt(formData.grade),
        teacher_id: formData.teacher_id || null,
        students: selectedStudents
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

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label htmlFor="section" className="block text-sm font-medium text-text-dark mb-2">
            Section <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.section
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-200 focus:ring-primary-blue'
            }`}
            placeholder="e.g., A, B, C"
          />
          {errors.section && <p className="mt-1 text-sm text-red-500">{errors.section}</p>}
        </div>

        <div>
          <label htmlFor="teacher_id" className="block text-sm font-medium text-text-dark mb-2">
            Teacher <span className="text-text-muted text-xs">(optional)</span>
          </label>
          <input
            type="text"
            value={teacherQuery}
            onChange={(e) => setTeacherQuery(e.target.value)}
            placeholder="Filter teachers..."
            className="mb-2 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
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
            <option value="">No teacher assigned</option>
            {filteredTeachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
                {import.meta.env.DEV && teacher._id ? ` [${teacher._id.slice(-6)}]` : ''}
              </option>
            ))}
          </select>
          {errors.teacher_id && <p className="mt-1 text-sm text-red-500">{errors.teacher_id}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-dark mb-2">
          Students
        </label>
        <div className="border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
          <div className="mb-3">
            <input
              type="text"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
          {filteredStudents.length === 0 ? (
            <p className="text-sm text-text-muted">No students available</p>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <label key={student._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => handleStudentToggle(student._id)}
                    className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
                  />
                  <span className="text-sm text-text-dark">
                    {student.name}
                    {import.meta.env.DEV && student._id ? (
                      <span className="text-xs text-gray-400 ml-1">[{student._id.slice(-6)}]</span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-text-muted">
          {selectedStudents.length} student(s) selected
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium"
        >
          {classroom ? 'Update Classroom' : 'Add Classroom'}
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

export default ClassroomForm
