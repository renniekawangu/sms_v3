import React, { useState, useEffect } from 'react'
import { Download, FileText, GraduationCap, Calendar, AlertCircle, Loader, CheckCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import PageHeader from '../components/PageHeader'

const ReportCards = () => {
  const { success, error } = useToast()
  const [view, setView] = useState('individual') // 'individual' or 'classroom'
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  
  // Data
  const [students, setStudents] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [terms, setTerms] = useState([])
  
  // Filters
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('')
  const [availableTerms, setAvailableTerms] = useState([])

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const token = JSON.parse(localStorage.getItem('user')).token

      // Load students and classrooms
      const [studentsRes, classroomsRes] = await Promise.all([
        fetch('/api/students', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/classrooms', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (!studentsRes.ok) {
        throw new Error(`Failed to load students: ${studentsRes.status}`)
      }
      if (!classroomsRes.ok) {
        throw new Error(`Failed to load classrooms: ${classroomsRes.status}`)
      }

      const studentsData = await studentsRes.json()
      const classroomsData = await classroomsRes.json()

      console.log('[ReportCards] Students data:', studentsData)
      console.log('[ReportCards] Classrooms data:', classroomsData)

      // API returns array directly, or wrapped in data/students property
      const studentList = Array.isArray(studentsData) ? studentsData : (studentsData.data || studentsData.students || [])
      const classroomList = Array.isArray(classroomsData) ? classroomsData : (classroomsData.data || classroomsData.classrooms || [])

      console.log('[ReportCards] Processed students:', studentList.length)
      console.log('[ReportCards] Processed classrooms:', classroomList.length)

      setStudents(studentList)
      setClassrooms(classroomList)

      if (studentList.length === 0) {
        error('No students found in the system')
      }
      if (classroomList.length === 0) {
        error('No classrooms found in the system')
      }
    } catch (err) {
      console.error('[ReportCards] Error loading initial data:', err)
      error(err.message || 'Failed to load students and classrooms')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableTerms = async (studentId) => {
    try {
      const token = JSON.parse(localStorage.getItem('user')).token
      const response = await fetch(`/api/reports/terms/available?studentId=${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableTerms(data.terms || [])
        
        // Set default term if available
        if (data.terms && data.terms.length > 0) {
          setSelectedTerm(data.terms[0].term)
          setSelectedAcademicYear(data.terms[0].academicYear)
        }
      }
    } catch (err) {
      console.error('Error loading terms:', err)
      error('Failed to load available terms')
    }
  }

  const handleStudentChange = (e) => {
    const studentId = e.target.value
    setSelectedStudent(studentId)
    if (studentId) {
      loadAvailableTerms(studentId)
    }
  }

  const handleDownloadIndividualReportCard = async () => {
    if (!selectedStudent) {
      error('Please select a student')
      return
    }

    if (!selectedTerm || !selectedAcademicYear) {
      error('Please select a term and academic year')
      return
    }

    try {
      setDownloading(true)
      const token = JSON.parse(localStorage.getItem('user')).token

      const params = new URLSearchParams()
      params.append('term', selectedTerm)
      params.append('academicYear', selectedAcademicYear)

      const response = await fetch(
        `/api/reports/report-card/${selectedStudent}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to generate report card: ${response.status}`)
      }

      // Get filename from header
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `report-card-${Date.now()}.pdf`

      // Download PDF
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(link.href)
      document.body.removeChild(link)

      success('Report card downloaded successfully')
    } catch (err) {
      console.error('Error downloading report card:', err)
      error('Failed to download report card')
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadClassroomReportCards = async () => {
    if (!selectedClassroom) {
      error('Please select a classroom')
      return
    }

    if (!selectedTerm || !selectedAcademicYear) {
      error('Please select a term and academic year')
      return
    }

    try {
      setDownloading(true)
      const token = JSON.parse(localStorage.getItem('user')).token

      const params = new URLSearchParams()
      params.append('term', selectedTerm)
      params.append('academicYear', selectedAcademicYear)
      params.append('format', 'json')

      const response = await fetch(
        `/api/reports/report-cards/classroom/${selectedClassroom}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to generate report cards: ${response.status}`)
      }

      const data = await response.json()
      success(`Retrieved ${data.count} report cards. You can now view or export them.`)
    } catch (err) {
      console.error('Error downloading report cards:', err)
      error('Failed to download report cards')
    } finally {
      setDownloading(false)
    }
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s._id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown'
  }

  const getClassroomName = (classroomId) => {
    const classroom = classrooms.find(c => c._id === classroomId)
    return classroom ? classroom.className : 'Unknown'
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Academics"
        title="Student Report Cards"
        description="Generate and download individual or classroom report cards by term and academic year."
        meta={
          <>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Students</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{students.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Classrooms</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{classrooms.length}</p>
            </div>
          </>
        }
      />

        {/* View Selection */}
        <div className="surface-card section-pad">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Select Report Type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setView('individual')}
              className={`p-4 rounded-lg border-2 transition-all ${
                view === 'individual'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <GraduationCap className="w-6 h-6 mb-2" />
              <p className="font-semibold text-text-dark">Individual Report Card</p>
              <p className="text-sm text-text-muted">Generate for one student</p>
            </button>
            <button
              onClick={() => setView('classroom')}
              className={`p-4 rounded-lg border-2 transition-all ${
                view === 'classroom'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <FileText className="w-6 h-6 mb-2" />
              <p className="font-semibold text-text-dark">Classroom Report Cards</p>
              <p className="text-sm text-text-muted">Generate for all students in a class</p>
            </button>
          </div>
        </div>

        {/* Individual Report Card View */}
        {view === 'individual' && (
          <div className="surface-card section-pad">
            <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-4">Generate Individual Report Card</h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={24} className="animate-spin text-primary-blue mr-2" />
                <p className="text-text-muted">Loading data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={handleStudentChange}
                    className="ui-select"
                  >
                    <option value="">Select a student...</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName} ({student.student_id || student.studentId || '-'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Term Selection */}
                {selectedStudent && availableTerms.length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Term
                      </label>
                      <select
                        value={selectedTerm}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                        className="ui-select"
                      >
                        {availableTerms.map((term, idx) => (
                          <option key={idx} value={term.term}>
                            {term.term}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Academic Year
                      </label>
                      <select
                        value={selectedAcademicYear}
                        onChange={(e) => setSelectedAcademicYear(e.target.value)}
                        className="ui-select"
                      >
                        {availableTerms.map((term, idx) => (
                          <option key={idx} value={term.academicYear}>
                            {term.academicYear}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {selectedStudent && availableTerms.length === 0 && (
                  <div className="col-span-1 sm:col-span-2 flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      No exam results available for this student yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedStudent && availableTerms.length > 0 && (
              <button
                onClick={handleDownloadIndividualReportCard}
                disabled={downloading || !selectedStudent || !selectedTerm || !selectedAcademicYear}
                className="mt-6 btn-ui btn-primary w-full disabled:bg-gray-400"
              >
                {downloading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Report Card
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Classroom Report Cards View */}
        {view === 'classroom' && (
          <div className="surface-card section-pad">
            <h2 className="text-lg sm:text-xl font-semibold text-text-dark mb-4">Generate Classroom Report Cards</h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={24} className="animate-spin text-primary-blue mr-2" />
                <p className="text-text-muted">Loading data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Classroom Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Classroom
                  </label>
                  <select
                    value={selectedClassroom}
                    onChange={(e) => {
                      setSelectedClassroom(e.target.value)
                      setSelectedTerm('')
                      setSelectedAcademicYear('')
                    }}
                    className="ui-select"
                  >
                    <option value="">Select a classroom...</option>
                    {classrooms.map(classroom => (
                      <option key={classroom._id} value={classroom._id}>
                        {classroom.className}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Term Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Term
                  </label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="ui-select"
                  >
                    <option value="">Select term...</option>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>

                {/* Academic Year Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="ui-select"
                  >
                    <option value="">Select year...</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>
              </div>
            )}

            {selectedClassroom && selectedTerm && selectedAcademicYear && (
              <button
                onClick={handleDownloadClassroomReportCards}
                disabled={downloading}
                className="mt-6 btn-ui btn-primary w-full disabled:bg-gray-400"
              >
                {downloading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Generate Report Cards for All Students
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-cyan-700 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-cyan-900 mb-2">What's Included</h3>
                <ul className="text-sm text-cyan-800 space-y-1">
                  <li>• Student information and ID</li>
                  <li>• All subject scores and grades</li>
                  <li>• Overall percentage and grade</li>
                  <li>• Term and academic year</li>
                  <li>• School details and contact info</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">Available Terms</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Term 1</li>
                  <li>• Term 2</li>
                  <li>• Term 3</li>
                  <li>• Academic years 2024-2027</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default ReportCards
