import { useState, useEffect, useMemo } from 'react'
import { School, Search, Plus, Edit, Trash2, AlertCircle, Eye } from 'lucide-react'
import { classroomsApi, adminApi, timetableApi, teachersApi, teacherApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import Modal from '../components/Modal'
import ClassroomForm from '../components/ClassroomForm'
import { useNavigate } from 'react-router-dom'

function Classrooms() {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState(null)
  const { success, error: showError } = useToast()
  const [courseSubjectsByClassroom, setCourseSubjectsByClassroom] = useState(new Map())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For teachers, fetch only their classrooms
      if (user?.role === 'teacher') {
        const [classroomsData, studentsResp, coursesData] = await Promise.all([
          teacherApi.getMyClassrooms(),
          adminApi.listStudents({ limit: 1000 }),
          timetableApi.courses.list()
        ])
        const classroomList = classroomsData.data || classroomsData || []
        setClassrooms(classroomList)
        setTeachers([]) // Teachers don't need teacher list
        
        const studentList = (studentsResp.students || []).map(s => ({
          _id: s._id,
          name: s.name || [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || s.email || 'Student'
        }))
        setStudents(studentList)

        const map = new Map()
        ;(coursesData || []).forEach(course => {
          const cid = course?.classroomId?._id || course?.classroomId
          if (!cid) return
          const existing = map.get(cid)
          if (!existing || new Date(course.updatedAt || 0) > new Date(existing._ts || 0)) {
            const subjects = Array.isArray(course.subjects) ? course.subjects : []
            map.set(cid, { subjects, _ts: course.updatedAt || course.createdAt || null })
          }
        })
        setCourseSubjectsByClassroom(map)
      } else {
        // For admins/others, fetch all classrooms and teachers
        const [classroomsData, teachersData, studentsResp, coursesData] = await Promise.all([
          classroomsApi.list(),
          teachersApi.list(),
          adminApi.listStudents({ limit: 1000 }),
          timetableApi.courses.list()
        ])
        setClassrooms(classroomsData)
        // Normalize teachers to {_id, name} - teachersApi returns both Staff and User teachers
        const teacherList = (teachersData || []).map(t => ({
          _id: t._id,
          name: t.name || [t.firstName, t.lastName].filter(Boolean).join(' ').trim() || 'Teacher',
          type: t.type || 'staff'  // type indicator: 'staff' or 'user'
        }))
        setTeachers(teacherList)
        // Normalize students to {_id, name}
        const studentList = (studentsResp.students || []).map(s => ({
          _id: s._id,
          name: s.name || [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || s.email || 'Student'
        }))
        setStudents(studentList)

        // Build a map of classroomId -> subjects[] including codes
        const map = new Map()
        ;(coursesData || []).forEach(course => {
          const cid = course?.classroomId?._id || course?.classroomId
          if (!cid) return
          // Prefer the latest by updatedAt if multiple
          const existing = map.get(cid)
          if (!existing || new Date(course.updatedAt || 0) > new Date(existing._ts || 0)) {
            const subjects = Array.isArray(course.subjects) ? course.subjects : []
            map.set(cid, { subjects, _ts: course.updatedAt || course.createdAt || null })
          }
        })
        setCourseSubjectsByClassroom(map)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load data'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingClassroom(null)
    setIsModalOpen(true)
  }

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingClassroom) {
        await classroomsApi.update(editingClassroom._id, formData)
        success('Classroom updated successfully')
      } else {
        await classroomsApi.create(formData)
        success('Classroom created successfully')
      }
      setIsModalOpen(false)
      setEditingClassroom(null)
      await loadData()
    } catch (err) {
      const errorMessage = err.message || (editingClassroom ? 'Failed to update classroom' : 'Failed to create classroom')
      showError(errorMessage)
    }
  }

  const handleDelete = async (_id) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      try {
        await classroomsApi.delete(_id)
        success('Classroom deleted successfully')
        await loadData()
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete classroom'
        showError(errorMessage)
      }
    }
  }

  const getTeacherName = (teacher_id) => {
    if (!teacher_id) return 'No teacher assigned'
    return teachers.find(t => t._id === teacher_id)?.name || 'Unknown teacher'
  }

  const filteredClassrooms = useMemo(() => {
    if (!searchQuery.trim()) return classrooms
    const query = searchQuery.toLowerCase()
    return classrooms.filter((classroom) => {
      const teacherName = getTeacherName(classroom.teacher_id).toLowerCase()
      return (
        teacherName.includes(query) ||
        classroom.grade?.toString().includes(query) ||
        classroom.section?.toLowerCase().includes(query)
      )
    })
  }, [classrooms, teachers, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading classrooms...</p>
        </div>
      </div>
    )
  }

  if (error && classrooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Error loading classrooms</p>
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
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">
            {user?.role === 'teacher' ? 'My Classrooms' : 'Classrooms'}
          </h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">
            {user?.role === 'teacher' ? 'View your assigned classrooms' : 'Manage all classrooms'}
          </p>
        </div>
        {user?.role !== 'teacher' && (
          <button
            onClick={handleCreate}
            className="flex items-center justify-center sm:justify-start gap-2 bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors text-sm sm:text-base font-medium"
          >
            <Plus size={18} className="sm:size-5" />
            <span>Add Classroom</span>
          </button>
        )}
      </div>

      <div className="bg-card-white rounded-custom shadow-custom p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search classrooms by grade, section, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredClassrooms.length === 0 ? (
            <div className="col-span-full text-center py-8 text-text-muted">
              No classrooms found
            </div>
          ) : (
            filteredClassrooms.map((classroom) => (
              <div key={classroom._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <School className="text-primary-blue" size={24} />
                    <div>
                      <h3 className="font-semibold text-text-dark">Grade {classroom.grade} - Section {classroom.section}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/classrooms/${classroom._id}`)}
                      className="text-primary-blue hover:text-primary-blue/80 p-1"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    {user?.role !== 'teacher' && (
                      <>
                        <button
                          onClick={() => handleEdit(classroom)}
                          className="text-primary-blue hover:text-primary-blue/80 p-1"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(classroom._id)}
                          className="text-red-500 hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-text-muted">Teacher: {getTeacherName(classroom.teacher_id)}</p>
                  <p className="text-text-muted">Students: {classroom.students?.length || 0}</p>
                  {/* Subjects & Codes */}
                  {(() => {
                    const cid = classroom._id
                    const entry = courseSubjectsByClassroom.get(cid)
                    const subjects = entry?.subjects || []
                    if (!subjects.length) return null
                    return (
                      <div>
                        <span className="text-text-dark font-medium">Subjects:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {subjects.map((s) => (
                            <span
                              key={s._id || s.id || s.code || s.name}
                              className="px-2 py-0.5 text-[11px] bg-blue-50 text-blue-800 rounded border border-blue-100"
                            >
                              {s.name}{s.code ? ` (${s.code})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-text-muted">
            Showing {filteredClassrooms.length} of {classrooms.length} classrooms
          </p>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClassroom(null)
        }}
        title={editingClassroom ? 'Edit Classroom' : 'Add New Classroom'}
      >
        <ClassroomForm
          classroom={editingClassroom}
          teachers={teachers}
          students={students}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingClassroom(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default Classrooms
