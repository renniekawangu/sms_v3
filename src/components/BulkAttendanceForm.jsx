import { useEffect, useState } from 'react'
import { teacherApi, subjectsApi } from '../services/api'

function BulkAttendanceForm({ onSubmit, onCancel }) {
  const [classrooms, setClassrooms] = useState([])
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])

  const [form, setForm] = useState({
    classroomId: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
  })

  const [statuses, setStatuses] = useState({})
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function loadInitial() {
      try {
        const [rooms, subs] = await Promise.all([
          teacherApi.getMyClassrooms().catch(() => []),
          subjectsApi.list().catch(() => [])
        ])
        setClassrooms(Array.isArray(rooms?.data) ? rooms.data : rooms)
        setSubjects(subs || [])
      } catch (_) {
        setClassrooms([])
        setSubjects([])
      }
    }
    loadInitial()
  }, [])

  const loadStudents = async (classroomId) => {
    if (!classroomId) return
    setLoadingStudents(true)
    try {
      const resp = await teacherApi.getClassroomStudents(classroomId)
      const list = Array.isArray(resp?.data) ? resp.data : resp
      setStudents(list || [])
      const initial = {}
      for (const s of list || []) {
        initial[s._id] = 'present'
      }
      setStatuses(initial)
    } catch (_) {
      setStudents([])
      setStatuses({})
    } finally {
      setLoadingStudents(false)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.classroomId) e.classroomId = 'Classroom is required'
    if (!form.subject) e.subject = 'Subject is required'
    if (!form.date) e.date = 'Date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    if (!validate()) return

    const records = (students || []).map(s => ({
      studentId: s._id,
      status: statuses[s._id] || 'present'
    }))

    await onSubmit({
      subject: form.subject,
      date: form.date,
      records
    })
  }

  const setAllStatus = (value) => {
    const next = {}
    for (const s of students || []) {
      next[s._id] = value
    }
    setStatuses(next)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Classroom <span className="text-red-500">*</span></label>
          <select
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.classroomId ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-blue'}`}
            value={form.classroomId}
            onChange={(e) => {
              setForm(prev => ({ ...prev, classroomId: e.target.value }))
              setErrors(prev => ({ ...prev, classroomId: '' }))
              loadStudents(e.target.value)
            }}
          >
            <option value="">Select classroom</option>
            {(classrooms || []).map(c => (
              <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.className || 'Classroom'}</option>
            ))}
          </select>
          {errors.classroomId && <p className="mt-1 text-sm text-red-500">{errors.classroomId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-blue'}`}
            value={form.date}
            onChange={(e) => {
              setForm(prev => ({ ...prev, date: e.target.value }))
              setErrors(prev => ({ ...prev, date: '' }))
            }}
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">Subject <span className="text-red-500">*</span></label>
          <select
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.subject ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-blue'}`}
            value={form.subject}
            onChange={(e) => {
              setForm(prev => ({ ...prev, subject: e.target.value }))
              setErrors(prev => ({ ...prev, subject: '' }))
            }}
          >
            <option value="">Select subject</option>
            {(subjects || []).map(s => (
              <option key={s._id || s.subject_id} value={s.name || s.subject}>{s.name || s.subject}</option>
            ))}
          </select>
          {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button type="button" onClick={() => setAllStatus('present')} className="px-3 py-2 text-xs md:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Mark all Present</button>
        <button type="button" onClick={() => setAllStatus('absent')} className="px-3 py-2 text-xs md:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Mark all Absent</button>
        <button type="button" onClick={() => setAllStatus('late')} className="px-3 py-2 text-xs md:text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">Mark all Late</button>
      </div>

      <div className="bg-card-white rounded-custom shadow-custom p-4">
        {loadingStudents ? (
          <p className="text-sm text-text-muted">Loading students...</p>
        ) : (students.length === 0 ? (
          <p className="text-sm text-text-muted">Select a classroom to load students</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-2 px-3 text-xs md:text-sm font-semibold text-text-dark">Student</th>
                  <th className="text-left py-2 px-3 text-xs md:text-sm font-semibold text-text-dark">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-xs md:text-sm">{s.firstName ? `${s.firstName} ${s.lastName || ''}` : s.name || 'Student'}</td>
                    <td className="py-2 px-3">
                      <select
                        className="px-2 py-1 border border-gray-200 rounded"
                        value={statuses[s._id] || 'present'}
                        onChange={(e) => setStatuses(prev => ({ ...prev, [s._id]: e.target.value }))}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="flex-1 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors font-medium">Submit Bulk Attendance</button>
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 text-text-dark px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">Cancel</button>
      </div>
    </form>
  )
}

export default BulkAttendanceForm
