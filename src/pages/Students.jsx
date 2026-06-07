import { useState, useEffect, useMemo } from 'react'
import { GraduationCap, Search, Plus, Edit, Trash2, AlertCircle, Download, CheckSquare, Square } from 'lucide-react'
import { studentsApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../config/rbac'
import Modal from '../components/Modal'
import StudentForm from '../components/StudentForm'
import AdvancedSearch from '../components/AdvancedSearch'
import Pagination from '../components/Pagination'
import SkeletonLoader from '../components/SkeletonLoader'
import ConfirmDialog from '../components/ConfirmDialog'
import PageHeader from '../components/PageHeader'
import { exportToCSV, exportToJSON } from '../utils/exportData'
import { filterData, sortData, searchData, paginateData } from '../utils/filterSort'
import { validateFormData } from '../utils/validation'
import useKeyboardShortcuts from '../utils/keyboardShortcuts.jsx'

function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false })
  const { success, error: showError } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.ADMIN

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await studentsApi.list()
      setStudents(data)
    } catch (err) {
      const errorMessage = err.message || 'Failed to load students'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingStudent(null)
    setIsModalOpen(true)
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setIsModalOpen(true)
  }

  const handleSubmit = async (formData) => {
    try {
      if (editingStudent) {
        await studentsApi.update(editingStudent._id || editingStudent.student_id, formData)
        success('Student updated successfully')
      } else {
        await studentsApi.create(formData)
        success('Student created successfully')
      }
      setIsModalOpen(false)
      setEditingStudent(null)
      await loadStudents()
    } catch (err) {
      const errorMessage = err.message || (editingStudent ? 'Failed to update student' : 'Failed to create student')
      showError(errorMessage)
    }
  }

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await studentsApi.delete(id)
          success('Student deleted successfully')
          await loadStudents()
          setConfirmDialog({ isOpen: false })
        } catch (err) {
          showError(err.message || 'Failed to delete student')
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    })
  }

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds)
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Multiple Students',
      message: `Are you sure you want to delete ${ids.length} student(s)? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete All',
      onConfirm: async () => {
        try {
          for (const id of ids) {
            await studentsApi.delete(id)
          }
          success(`${ids.length} student(s) deleted successfully`)
          setSelectedIds(new Set())
          await loadStudents()
          setConfirmDialog({ isOpen: false })
        } catch (err) {
          showError(err.message || 'Failed to delete students')
        }
      },
      onCancel: () => setConfirmDialog({ isOpen: false })
    })
  }

  const handleExportAll = () => {
    exportToCSV(processedStudents, 'students.csv', [
      'student_id',
      'name',
      'email',
      'phone',
      'dob',
      'date_of_join'
    ])
  }

  const handleExportSelected = () => {
    const selectedData = students.filter(s => selectedIds.has(s._id || s.student_id))
    if (selectedData.length === 0) {
      showError('No students selected for export')
      return
    }
    exportToCSV(selectedData, 'students_selected.csv', [
      'student_id',
      'name',
      'email',
      'phone',
      'dob',
      'date_of_join'
    ])
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === processedStudents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(processedStudents.map(s => s._id || s.student_id)))
    }
  }

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    new: handleCreate,
    export: handleExportAll,
    search: () => document.querySelector('input[type="text"]')?.focus()
  })

  // Filter, sort, search, and paginate
  let processedStudents = useMemo(() => {
    let result = filterData(students, filters)
    result = searchData(result, searchQuery, ['name', 'email', 'student_id'])
    result = sortData(result, sortBy, sortOrder)
    return result
  }, [students, filters, searchQuery, sortBy, sortOrder])

  const paginatedData = useMemo(() => {
    return paginateData(processedStudents, currentPage, pageSize)
  }, [processedStudents, currentPage, pageSize])

  if (loading) {
    return (
      <div className="page-stack">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="surface-card section-pad overflow-x-auto">
          <table className="min-w-full">
            <tbody>
              <SkeletonLoader count={5} variant="row" />
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (error && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Error loading students</p>
          <p className="text-text-muted mb-4">{error}</p>
          <button
            onClick={loadStudents}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Student Records"
        title="Students"
        description={`Manage enrolment, details, and exports from one consistent workspace. You currently have ${students.length} student records in view.`}
        meta={
          <>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Visible records</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{processedStudents.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Selected</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{selectedIds.size}</p>
            </div>
          </>
        }
        actions={
          <>
            {isAdmin && (
              <button
                onClick={handleCreate}
                className="btn-ui btn-primary"
                title="Ctrl+N"
              >
                <Plus size={18} />
                <span>Add Student</span>
              </button>
            )}
            <button
              onClick={handleExportAll}
              className="btn-ui btn-secondary"
              title="Ctrl+E"
            >
              <Download size={18} />
              <span>Export All</span>
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleExportSelected}
                className="btn-ui btn-secondary"
              >
                <Download size={18} />
                <span>Export Selected</span>
              </button>
            )}
            {selectedIds.size > 0 && isAdmin && (
              <button
                onClick={handleDeleteSelected}
                className="btn-ui btn-danger"
              >
                <Trash2 size={18} />
                <span>Delete Selected</span>
              </button>
            )}
          </>
        }
      />

      {/* Advanced Search */}
      <div className="toolbar-card">
        <AdvancedSearch
          searchFields={['name', 'email', 'student_id']}
          filterOptions={{
            grade: ['A', 'B', 'C', 'D', 'E'],
            status: ['Active', 'Inactive', 'Graduated']
          }}
          onSearch={setSearchQuery}
          onFilter={setFilters}
          onClear={() => {
            setSearchQuery('')
            setFilters({})
          }}
          loading={loading}
        />
      </div>

      <div className="table-shell p-3 sm:p-4 lg:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 sm:px-4 w-8">
                  <button
                    onClick={toggleSelectAll}
                    className="text-primary-blue hover:text-primary-blue/80"
                    title="Select all"
                  >
                    {selectedIds.size === paginatedData.data.length ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th 
                  className="hidden sm:table-cell text-left py-3 px-2 sm:px-4 font-semibold text-text-dark cursor-pointer hover:bg-gray-50"
                  onClick={() => setSortBy('student_id')}
                >
                  ID {sortBy === 'student_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left py-3 px-2 sm:px-4 font-semibold text-text-dark cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSortBy('name')
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')
                  }}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="hidden md:table-cell text-left py-3 px-4 font-semibold text-text-dark cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSortBy('email')
                    setSortOrder(sortBy === 'email' && sortOrder === 'asc' ? 'desc' : 'asc')
                  }}>
                  Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="hidden lg:table-cell text-left py-3 px-4 font-semibold text-text-dark">Phone</th>
                <th className="hidden lg:table-cell text-left py-3 px-4 font-semibold text-text-dark">DOB</th>
                <th className="hidden xl:table-cell text-left py-3 px-4 font-semibold text-text-dark">Date of Join</th>
                <th className="text-left py-3 px-2 sm:px-4 font-semibold text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs sm:text-sm text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <GraduationCap size={24} className="text-cyan-600" />
                      <p>No students found</p>
                      {(searchQuery || Object.keys(filters).length > 0) && (
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setFilters({})
                          }}
                          className="btn-ui btn-secondary"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.data.map((student) => (
                  <tr key={student._id || student.student_id} className="border-b border-gray-100 hover:bg-cyan-50/50 transition-colors">
                    <td className="py-3 px-2 sm:px-4">
                      <button
                        onClick={() => toggleSelect(student._id || student.student_id)}
                        className="text-primary-blue hover:text-primary-blue/80"
                      >
                        {selectedIds.has(student._id || student.student_id) ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="hidden sm:table-cell py-3 px-2 sm:px-4 text-text-dark">{student.student_id}</td>
                    <td className="py-3 px-2 sm:px-4 text-text-dark font-medium">{student.name}</td>
                    <td className="hidden md:table-cell py-3 px-4 text-sm text-text-muted">{student.email}</td>
                    <td className="hidden lg:table-cell py-3 px-4 text-sm text-text-muted">{student.phone}</td>
                    <td className="hidden lg:table-cell py-3 px-4 text-sm text-text-muted">
                      {student.dob ? (student.dob.includes('T') ? student.dob.split('T')[0] : student.dob) : '-'}
                    </td>
                    <td className="hidden xl:table-cell py-3 px-4 text-sm text-text-muted">
                      {student.date_of_join ? (student.date_of_join.includes('T') ? student.date_of_join.split('T')[0] : student.date_of_join) : '-'}
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-1 sm:gap-3">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-primary-blue hover:text-primary-blue/80 text-xs sm:text-sm font-medium flex items-center gap-1 p-1 rounded hover:bg-cyan-50"
                              title="Edit"
                            >
                              <Edit size={14} className="sm:size-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(student._id || student.student_id)}
                              className="text-red-500 hover:text-red-600 text-xs sm:text-sm font-medium flex items-center gap-1 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={14} className="sm:size-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedData.pageCount > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginatedData.pageCount}
            totalItems={paginatedData.total}
            pageSize={pageSize}
            onPageChange={(page, newPageSize) => {
              if (newPageSize) {
                setPageSize(newPageSize)
                setCurrentPage(1)
              } else {
                setCurrentPage(page)
              }
            }}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingStudent(null)
        }}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <StudentForm
          student={editingStudent}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingStudent(null)
          }}
        />
      </Modal>

      <ConfirmDialog {...confirmDialog} />
    </div>
  )
}

export default Students
