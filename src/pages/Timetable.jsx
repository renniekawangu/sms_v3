import { useState, useEffect, useMemo } from 'react'
import { Calendar, Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { timetableApi, classroomsApi, subjectsApi, teachersApi } from '../services/api'
import { exportToCSV, exportToJSON } from '../utils/exportData'
import { filterData, sortData, searchData, paginateData, getUniqueValues } from '../utils/filterSort'
import { useToast } from '../contexts/ToastContext'
import Modal from '../components/Modal'
import TimetableForm from '../components/TimetableForm'
import ConfirmDialog from '../components/ConfirmDialog'
import useKeyboardShortcuts from '../utils/keyboardShortcuts.jsx'
import AdvancedSearch from '../components/AdvancedSearch'
import Pagination from '../components/Pagination'

function Timetable() {
  const [classrooms, setClassrooms] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [timetable, setTimetable] = useState([])
  const [courseSubjects, setCourseSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false })
  const { success, error: showError } = useToast()
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('startTime')
  const [sortOrder, setSortOrder] = useState('asc')
  const [pageSize, setPageSize] = useState(8)
  const [currentPage, setCurrentPage] = useState(1)

  // Base time slots used for computing period numbers and end time
  const BASE_TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00'
  ]

  const addMinutes = (hhmm, minutes) => {
    if (!hhmm) return ''
    const [hh, mm] = hhmm.split(':').map(Number)
    const d = new Date(1970, 0, 1, hh, mm)
    d.setMinutes(d.getMinutes() + minutes)
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedClassroom) {
      loadTimetable(selectedClassroom)
      loadCourseSubjects(selectedClassroom)
    }
  }, [selectedClassroom])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [classroomsData, subjectsData, teachersData] = await Promise.all([
        classroomsApi.list(),
        subjectsApi.list(),
        teachersApi.list()
      ])
      setClassrooms(classroomsData)
      setSubjects(subjectsData)
      setTeachers(teachersData)
      if (classroomsData.length > 0) {
        setSelectedClassroom(classroomsData[0]._id || classroomsData[0].classroom_id)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load data'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadTimetable = async (classroom_id) => {
    try {
      const data = await timetableApi.schedules.getByClassroom(classroom_id)
      // Transform schedule structure into legacy entry list for this view
      if (data && data.timetable) {
        const entries = []
        ;(data.timetable || []).forEach(day => {
          ;(day.periods || []).forEach(p => {
            const start = (p.time || '').split('-')[0] || ''
            entries.push({
              _id: `${data._id}:${day.day}:${p.period}`,
              dayOfWeek: day.day,
              startTime: start,
              subjectName: p.subject,
              subject: { name: p.subject },
              teacher: p.instructorId ? { firstName: p.instructorId.firstName, lastName: p.instructorId.lastName, _id: p.instructorId._id } : undefined
            })
          })
        })
        setTimetable(entries)
      } else {
        setTimetable([])
      }
    } catch (err) {
      // If schedule not found, treat as empty timetable
      setTimetable([])
    }
  }

  const loadCourseSubjects = async (classroom_id) => {
    try {
      const course = await timetableApi.courses.getByClassroom(classroom_id)
      setCourseSubjects(course?.subjects || [])
    } catch (err) {
      // It's okay if no course exists yet; clear subjects list
      setCourseSubjects([])
    }
  }

  const handleCreate = () => {
    setEditingEntry(null)
    setIsModalOpen(true)
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    try {
      const classroomId = formData.classroom || formData.classroom_id || selectedClassroom
      const instructorId = formData.teacher || formData.teacher_id
      const day = formData.dayOfWeek || formData.day
      const start = formData.time
      if (!classroomId) throw new Error('Classroom is required')
      if (!day) throw new Error('Day is required')
      if (!start) throw new Error('Time is required')

      const periodNum = Math.max(1, BASE_TIME_SLOTS.indexOf(start) + 1)
      const end = addMinutes(start, 60)
      const periodEntry = {
        period: periodNum,
        subject: formData.subject,
        instructorId: instructorId || undefined,
        time: `${start}-${end}`
      }

      // Try to fetch existing schedule for classroom
      let schedule
      try {
        schedule = await timetableApi.schedules.getByClassroom(classroomId)
      } catch (e) {
        schedule = null
      }

      if (!schedule) {
        const newSchedule = {
          classroomId,
          timetable: [ { day, periods: [periodEntry] } ]
        }
        await timetableApi.schedules.create(newSchedule)
        success('Timetable schedule created successfully')
      } else {
        const tt = Array.isArray(schedule.timetable) ? [...schedule.timetable] : []
        let dayObj = tt.find(d => d.day === day)
        if (!dayObj) {
          dayObj = { day, periods: [] }
          tt.push(dayObj)
        }
        const idx = (dayObj.periods || []).findIndex(p => p.period === periodNum)
        if (idx >= 0) {
          dayObj.periods[idx] = periodEntry
        } else {
          dayObj.periods = [...(dayObj.periods || []), periodEntry]
        }

        await timetableApi.schedules.update(schedule._id, { timetable: tt })
        success('Timetable schedule updated successfully')
      }

      setIsModalOpen(false)
      setEditingEntry(null)
      if (selectedClassroom) {
        await loadTimetable(selectedClassroom)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to save timetable entry'
      showError(errorMessage)
    }
  }

  const handleDelete = async (entry_id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Timetable Entry',
      message: 'Are you sure you want to delete this entry? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          // entry_id is in the form scheduleId:Day:Period
          const parts = String(entry_id).split(':')
          const scheduleId = parts[0]
          const dayName = parts[1]
          const periodNum = parseInt(parts[2], 10)
          if (!scheduleId || !dayName || !periodNum) throw new Error('Invalid entry identifier')

          const schedule = await timetableApi.schedules.get(scheduleId)
          if (!schedule || !Array.isArray(schedule.timetable)) throw new Error('Schedule not found')

          const updated = [...schedule.timetable]
          const dIdx = updated.findIndex(d => d.day === dayName)
          if (dIdx >= 0) {
            const periods = (updated[dIdx].periods || []).filter(p => p.period !== periodNum)
            updated[dIdx] = { ...updated[dIdx], periods }
          }

          await timetableApi.schedules.update(scheduleId, { timetable: updated })
          success('Timetable entry deleted successfully')
          if (selectedClassroom) await loadTimetable(selectedClassroom)
          setConfirmDialog({ isOpen: false })
        } catch (err) {
          const errorMessage = err.message || 'Failed to delete entry'
          showError(errorMessage)
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    })
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    new: handleCreate,
    search: () => document.querySelector('input[placeholder="Search..."]')?.focus()
  })

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Normalize entries and process with filters/search/sort
  const normalized = useMemo(() => (
    (timetable || []).map(e => ({
      ...e,
      dayOfWeek: e.dayOfWeek || e.day,
      startTime: e.startTime || e.time,
      subjectName: e.subject?.name || e.subject,
      teacherName: e.teacher ? `${e.teacher.firstName || e.teacher.name || ''} ${e.teacher.lastName || ''}`.trim() : ''
    }))
  ), [timetable])

  const processedEntries = useMemo(() => {
    let result = filterData(normalized, filters)
    result = searchData(result, searchQuery, ['dayOfWeek', 'startTime', 'subjectName', 'teacherName'])
    result = sortData(result, sortBy, sortOrder)
    return result
  }, [normalized, filters, searchQuery, sortBy, sortOrder])

  const timeSlots = useMemo(() => (
    [...new Set(processedEntries.map(t => t.startTime))].filter(Boolean).sort()
  ), [processedEntries])

  const filteredTimetable = processedEntries

  // Map subject name -> code (from course subjects)
  const subjectCodeMap = useMemo(() => {
    const map = new Map()
    ;(courseSubjects || []).forEach(s => {
      if (s?.name) map.set(String(s.name).toLowerCase(), s.code || '')
    })
    return map
  }, [courseSubjects])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading timetable...</p>
        </div>
      </div>
    )
  }

  if (error && classrooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Error loading timetable</p>
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
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Timetable</h1>
        <p className="text-sm sm:text-base text-text-muted mt-1">Manage class timetable</p>
      </div>

      {/* Controls - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(classrooms || []).length > 0 && (
          <select
            value={selectedClassroom || ''}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            {(classrooms || []).map((classroom) => (
              <option key={classroom._id || classroom.classroom_id} value={classroom._id || classroom.classroom_id}>
                Grade {classroom.grade} - Section {classroom.section}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={handleCreate}
          className="w-full flex items-center justify-center sm:justify-start gap-2 bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors text-sm sm:text-base font-medium"
        >
          <Plus size={18} />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Subjects & Codes Legend */}
      {courseSubjects.length > 0 && (
        <div className="bg-card-white rounded-custom shadow-custom p-3 sm:p-4">
          <p className="text-xs font-semibold text-text-dark uppercase tracking-wide mb-2">Subjects & Codes</p>
          <div className="flex flex-wrap gap-2">
            {courseSubjects.map((subj) => (
              <span
                key={subj._id || subj.id || subj.code || subj.name}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100"
              >
                <span className="font-semibold">{subj.name}</span>
                {subj.code && <span className="text-blue-600">({subj.code})</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card-white rounded-custom shadow-custom p-4 md:p-6">
        <AdvancedSearch
          searchFields={['dayOfWeek','startTime','subjectName','teacherName']}
          filterOptions={{
            dayOfWeek: days,
            teacherName: getUniqueValues(normalized, 'teacherName').filter(Boolean),
            subjectName: getUniqueValues(normalized, 'subjectName').filter(Boolean)
          }}
          onSearch={(q) => { setSearchQuery(q); setCurrentPage(1) }}
          onFilter={(f) => { setFilters(f); setCurrentPage(1) }}
          onClear={() => { setFilters({}); setSearchQuery(''); setCurrentPage(1) }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(processedEntries, 'timetable.csv', ['dayOfWeek','startTime','endTime','subjectName','teacherName'])}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Export CSV
            </button>
            <button
              onClick={() => exportToJSON(processedEntries, 'timetable.json')}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Export JSON
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">Rows per page</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1) }}
              className="px-2 py-1 text-sm border border-gray-200 rounded"
            >
              {[5,8,10,15,20].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {filteredTimetable.length === 0 ? (
          <div className="text-center py-8 text-sm text-text-muted">
            {timetable.length === 0 ? 'No timetable data available' : 'No entries match your search'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 md:mx-0 md:overflow-visible">
              <table className="w-full min-w-max md:min-w-0">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold text-text-dark whitespace-nowrap">Time</th>
                    {days.map((day) => (
                      <th key={day} className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-text-dark whitespace-nowrap">
                        {day.substring(0, 3)}
                      </th>
                    ))}
                    <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-text-dark whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginateData(timeSlots, currentPage, pageSize).data.map((time, timeIndex) => (
                    <tr key={`${time}-${timeIndex}`} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-xs md:text-sm font-medium text-text-dark whitespace-nowrap">{time}</td>
                      {days.map((day) => {
                        const slot = filteredTimetable.find(t => t.dayOfWeek === day && t.startTime === time)
                        return (
                          <td key={`${day}-${time}`} className="py-3 px-2 md:px-4 text-xs md:text-sm text-text-muted whitespace-nowrap">
                            {(() => {
                              const name = slot?.subjectName || slot?.subject?.name || slot?.subject
                              if (!name) return '-'
                              const code = subjectCodeMap.get(String(name).toLowerCase())
                              return code ? `${name} (${code})` : name
                            })()}
                          </td>
                        )
                      })}
                      <td className="py-3 px-2 md:px-4">
                        {filteredTimetable.filter(t => t.startTime === time).length > 0 && (
                          <div className="flex items-center gap-1">
                            {filteredTimetable
                              .filter(t => t.startTime === time)
                              .map((entry) => (
                                <div key={entry._id} className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEdit(entry)}
                                    className="text-primary-blue hover:text-primary-blue/80 p-1"
                                    title="Edit"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(entry._id)}
                                    className="text-red-500 hover:text-red-600 p-1"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Showing {filteredTimetable.length} of {timetable.length} entries
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={paginateData(timeSlots, currentPage, pageSize).pageCount}
                totalItems={timeSlots.length}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEntry(null)
        }}
        title={editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
      >
        <TimetableForm
          timetable={editingEntry}
          classrooms={classrooms}
          subjects={subjects}
          teachers={teachers}
          selectedClassroom={selectedClassroom}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingEntry(null)
          }}
        />
      </Modal>

      <ConfirmDialog {...confirmDialog} />
    </div>
  )
}

export default Timetable
