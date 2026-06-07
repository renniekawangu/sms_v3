import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Award, GraduationCap, BookOpen, TrendingUp, DollarSign, CheckCircle, Users, Edit, Trash2, Save, X } from 'lucide-react'
import { studentsApi, teachersApi, adminApi, resultApi, feesApi, parentsApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { ROLES } from '../config/rbac'

function SearchResults() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const userType = searchParams.get('type')
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.ADMIN
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [grades, setGrades] = useState([])
  const [fees, setFees] = useState([])
  const [parents, setParents] = useState([])
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null)
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [editingSection, setEditingSection] = useState(null)

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        setLoading(true)
        let details = null

        if (userType === 'student') {
          details = await studentsApi.get(id)
          
          // Try to load grades for student using results API
          try {
            const resultsData = await resultApi.getByStudent(id).catch(() => ({}))
            // Handle both direct array and wrapped response
            const gradesArray = resultsData.results || resultsData || []
            setGrades(gradesArray)
          } catch (err) {
            console.error('Note: Unable to load grades:', err)
          }
          
          // Try to load fees for student
          try {
            const allFees = await feesApi.list()
            
            const feesList = Array.isArray(allFees) ? allFees : allFees?.data || []
            
            const studentFees = feesList.filter(f => f.studentId === id)
            
            if (studentFees && studentFees.length > 0) {
              const totalFees = studentFees.reduce((sum, f) => sum + (f.amount || 0), 0)
              const paidFees = studentFees.reduce((sum, f) => sum + (f.amountPaid || 0), 0)
              const pendingFees = totalFees - paidFees
              setFees({
                fees: studentFees,
                total: totalFees,
                paid: paidFees,
                pending: pendingFees,
                percentage: totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0
              })
            }
          } catch (err) {
            console.error('Note: Unable to load fees:', err)
          }

          // Try to load parents for student
          try {
            if (details?.parents && details.parents.length > 0) {
              const allParents = await parentsApi.list()
              const parentsList = Array.isArray(allParents) ? allParents : allParents?.data || []
              const studentParents = parentsList.filter(p => details.parents.includes(p._id))
              setParents(studentParents)
            }
          } catch (err) {
            console.error('Note: Unable to load parents:', err)
          }
        } else if (userType === 'teacher') {
          details = await teachersApi.get(id)
        } else {
          const staffResponse = await adminApi.listStaff()
          const staffArray = Array.isArray(staffResponse) ? staffResponse : staffResponse.data || []
          details = staffArray.find(s => s._id === id)
        }

        setUserDetails({ ...details, type: userType })
      } catch (err) {
        setError(err.message || 'Failed to load user details')
      } finally {
        setLoading(false)
      }
    }

    if (id && userType) {
      loadUserDetails()
    } else {
      setError('No user selected')
      setLoading(false)
    }
  }, [id, userType])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error && !userDetails) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-blue hover:text-primary-blue/80 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-blue hover:text-primary-blue/80 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <p className="text-text-muted">No user data available</p>
      </div>
    )
  }

  const handleEdit = (section = 'profile') => {
    setEditData(userDetails)
    setEditingSection(section)
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      if (userType === 'student') {
        await studentsApi.update(id, editData)
        success('Student updated successfully')
      }
      setUserDetails(editData)
      setIsEditing(false)
      setEditingSection(null)
    } catch (err) {
      showError(err.message || 'Failed to update student')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingSection(null)
    setEditData({})
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        if (userType === 'student') {
          await studentsApi.delete(id)
          success('Student deleted successfully')
          navigate(-1)
        }
      } catch (err) {
        showError(err.message || 'Failed to delete student')
      }
    }
  }

  const getName = () => {
    if (userDetails.firstName) {
      return `${userDetails.firstName} ${userDetails.lastName || ''}`
    }
    return userDetails.name || 'Unknown'
  }

  const renderStudentDetails = () => {
    const firstName = userDetails.firstName || ''
    const lastName = userDetails.lastName || ''
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    
    return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="surface-card section-pad flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-blue to-primary-deep rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-3xl font-bold">{initials}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-dark">{getName()}</h2>
            <p className="text-text-muted">{userDetails.classLevel || 'Student'}</p>
            {userDetails.student_id && (
              <p className="text-sm text-text-muted">ID: {userDetails.student_id}</p>
            )}
          </div>
        </div>
        {userType === 'student' && isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="btn-ui btn-primary"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-dark">
                Edit {editingSection === 'personal' ? 'Personal Information' : 
                      editingSection === 'academic' ? 'Academic Information' :
                      editingSection === 'grades' ? 'Exam Results' :
                      editingSection === 'parents' ? 'Parent Information' : 'Student'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-text-muted hover:text-text-dark"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Personal Information Fields */}
              {editingSection === 'personal' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-text-muted">First Name</label>
                      <input
                        type="text"
                        value={editData.firstName || ''}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                        className="ui-input mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-text-muted">Last Name</label>
                      <input
                        type="text"
                        value={editData.lastName || ''}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                        className="ui-input mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Email</label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="ui-input mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-text-muted">Phone</label>
                      <input
                        type="text"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="ui-input mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-text-muted">Gender</label>
                      <select
                        value={editData.gender || ''}
                        onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                        className="ui-select mt-1"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Date of Birth</label>
                    <input
                      type="date"
                      value={editData.dob ? editData.dob.split('T')[0] : ''}
                      onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                      className="ui-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Address</label>
                    <input
                      type="text"
                      value={editData.address || ''}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="ui-input mt-1"
                    />
                  </div>
                </>
              )}

              {/* Academic Information Fields */}
              {editingSection === 'academic' && (
                <>
                  <div>
                    <label className="text-sm text-text-muted">Class Level</label>
                    <input
                      type="text"
                      value={editData.classLevel || ''}
                      onChange={(e) => setEditData({ ...editData, classLevel: e.target.value })}
                      className="ui-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Student ID</label>
                    <input
                      type="text"
                      value={editData.student_id || ''}
                      onChange={(e) => setEditData({ ...editData, student_id: e.target.value })}
                      className="ui-input mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Date of Join</label>
                    <input
                      type="date"
                      value={editData.date_of_join ? editData.date_of_join.split('T')[0] : ''}
                      onChange={(e) => setEditData({ ...editData, date_of_join: e.target.value })}
                      className="ui-input mt-1"
                    />
                  </div>
                </>
              )}

              {/* Grades Section Note */}
              {editingSection === 'grades' && (
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <p className="text-sm text-cyan-800">
                    <strong>Note:</strong> Exam results are typically managed through the Exams and Results modules. Contact your administrator to modify grades.
                  </p>
                </div>
              )}

              {/* Parents Section Note */}
              {editingSection === 'parents' && (
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <p className="text-sm text-cyan-800">
                    <strong>Note:</strong> Parent information is typically managed in the Parents module. Use the dedicated Parents section to modify parent details.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-text-dark hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              {editingSection !== 'grades' && editingSection !== 'parents' && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="surface-card section-pad">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} />
            <h3 className="text-lg font-semibold text-text-dark">Personal Information</h3>
          </div>
          {userType === 'student' && (
            <button
              onClick={() => handleEdit('personal')}
              className="flex items-center gap-2 px-3 py-1 text-primary-blue hover:bg-cyan-50 rounded-lg transition text-sm"
            >
              <Edit size={14} />
              Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-muted">First Name</label>
            <p className="text-text-dark font-medium">{userDetails.firstName}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted">Last Name</label>
            <p className="text-text-dark font-medium">{userDetails.lastName}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Mail size={16} />
              Email
            </label>
            <p className="text-text-dark font-medium">{userDetails.email}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Phone size={16} />
              Phone
            </label>
            <p className="text-text-dark font-medium">{userDetails.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <MapPin size={16} />
              Address
            </label>
            <p className="text-text-dark font-medium">{userDetails.address || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted">Gender</label>
            <p className="text-text-dark font-medium capitalize">{userDetails.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Calendar size={16} />
              Date of Birth
            </label>
            <p className="text-text-dark font-medium">
              {userDetails.dob ? new Date(userDetails.dob).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="surface-card section-pad">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-dark">Academic Information</h3>
          {userType === 'student' && (
            <button
              onClick={() => handleEdit('academic')}
              className="flex items-center gap-2 px-3 py-1 text-primary-blue hover:bg-cyan-50 rounded-lg transition text-sm"
            >
              <Edit size={14} />
              Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-muted">Student ID</label>
            <p className="text-text-dark font-medium">{userDetails.student_id || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted">Class Level</label>
            <p className="text-text-dark font-medium">{userDetails.classLevel || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Calendar size={16} />
              Date of Join
            </label>
            <p className="text-text-dark font-medium">
              {userDetails.date_of_join ? new Date(userDetails.date_of_join).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Parents Section */}
      {userDetails?.type === 'student' && parents.length > 0 && (
        <div className="surface-card section-pad">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-primary-blue" />
              <h3 className="text-lg font-semibold text-text-dark">Parent Information</h3>
            </div>
            <button
              onClick={() => handleEdit('parents')}
              className="flex items-center gap-2 px-3 py-1 text-primary-blue hover:bg-cyan-50 rounded-lg transition text-sm"
            >
              <Edit size={14} />
              Edit
            </button>
          </div>
          <div className="space-y-4">
            {parents.map((parent, idx) => (
              <div key={parent?._id || idx} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-text-dark mb-3">
                  {parent?.firstName} {parent?.lastName}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-text-muted flex items-center gap-2">
                      <Mail size={14} />
                      Email
                    </label>
                    <p className="text-text-dark font-medium">{parent?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-text-muted flex items-center gap-2">
                      <Phone size={14} />
                      Phone
                    </label>
                    <p className="text-text-dark font-medium">{parent?.phone || 'N/A'}</p>
                  </div>
                  {parent?.address && (
                    <div>
                      <label className="text-text-muted flex items-center gap-2">
                        <MapPin size={14} />
                        Address
                      </label>
                      <p className="text-text-dark font-medium">{parent.address}</p>
                    </div>
                  )}
                  {parent?.occupation && (
                    <div>
                      <label className="text-text-muted flex items-center gap-2">
                        <Briefcase size={14} />
                        Occupation
                      </label>
                      <p className="text-text-dark font-medium">{parent.occupation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grades Section */}
      {userDetails?.type === 'student' && (
        <div className="surface-card section-pad">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-primary-blue" />
              <h3 className="text-lg font-semibold text-text-dark">Recent Exam Results</h3>
            </div>
            {grades.length > 0 && (
              <button
                onClick={() => handleEdit('grades')}
                className="flex items-center gap-2 px-3 py-1 text-primary-blue hover:bg-cyan-50 rounded-lg transition text-sm"
              >
                <Edit size={14} />
                Edit
              </button>
            )}
          </div>
          {grades.length > 0 ? (
            <div>
              {/* Academic Year Tabs */}
              <div className="mb-4 border-b border-gray-200 overflow-x-auto">
                <div className="flex gap-1">
                  {Array.from(new Set(grades.map(g => g.exam?.academicYear))).sort().reverse().map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedAcademicYear(year)
                        setSelectedTerm(null)
                      }}
                      className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
                        selectedAcademicYear === year
                          ? 'text-primary-blue border-primary-blue'
                          : 'text-text-muted border-transparent hover:text-text-dark'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Set default academic year on first load */}
              {!selectedAcademicYear && grades.length > 0 && (
                (() => {
                  const defaultYear = Array.from(new Set(grades.map(g => g.exam?.academicYear))).sort().reverse()[0]
                  setSelectedAcademicYear(defaultYear)
                  return null
                })()
              )}

              {selectedAcademicYear && (
                <div>
                  {/* Term Tabs */}
                  <div className="mb-4 border-b border-gray-200 overflow-x-auto bg-gray-50 p-2 rounded-lg">
                    <div className="flex gap-2">
                      {Array.from(new Set(
                        grades
                          .filter(g => g.exam?.academicYear === selectedAcademicYear)
                          .map(g => g.exam?.term)
                      )).sort().map(term => (
                        <button
                          key={term}
                          onClick={() => setSelectedTerm(term)}
                          className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-lg transition ${
                            selectedTerm === term
                              ? 'text-white bg-primary-blue'
                              : 'text-text-muted bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Set default term on year change */}
                  {selectedAcademicYear && !selectedTerm && (
                    (() => {
                      const defaultTerm = Array.from(new Set(
                        grades
                          .filter(g => g.exam?.academicYear === selectedAcademicYear)
                          .map(g => g.exam?.term)
                      )).sort()[0]
                      setSelectedTerm(defaultTerm)
                      return null
                    })()
                  )}

                  {selectedTerm && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Exam</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Subject</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Score</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-text-dark">Percentage</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-text-dark">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grades
                            .filter(g => g.exam?.academicYear === selectedAcademicYear && g.exam?.term === selectedTerm)
                            .map((result, idx) => {
                              const percentage = result.maxMarks ? Math.round((result.score / result.maxMarks) * 100) : result.percentage || 0
                              const gradeColor = percentage >= 80 ? 'text-green-600 bg-green-50' : percentage >= 60 ? 'text-blue-600 bg-blue-50' : percentage >= 40 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
                              
                              return (
                                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-sm text-text-dark font-medium">
                                    <div>
                                      <p>{result.exam?.name || 'Exam'}</p>
                                      <p className="text-xs text-text-muted">{result.exam?.examType || ''}</p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-text-dark">{result.subject?.name || 'N/A'}</td>
                                  <td className="px-4 py-3 text-sm text-text-dark">
                                    {result.score || 'N/A'} / {result.maxMarks || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center font-semibold text-text-dark">
                                    {percentage}%
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <span className={`px-3 py-1 rounded-full font-semibold ${gradeColor}`}>
                                      {result.overallGrade || result.grade || 'N/A'}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-text-muted">No exam results available</p>
          )}
        </div>
      )}

      {/* Fees Section */}
      {userDetails?.type === 'student' && (
        <div className="bg-card-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-orange-600" />
            Fees & Payments
          </h3>
          
          {fees.fees && fees.fees.length > 0 ? (
            <>
              {/* Fees Overview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all"
                    style={{ width: `${fees.percentage || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-text-muted text-sm font-medium">Total</p>
                    <p className="text-lg font-bold text-text-dark mt-1">
                      K{((fees.paid || 0) + (fees.pending || 0)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm font-medium">Paid</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      K{(fees.paid || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm font-medium">Pending</p>
                    <p className="text-lg font-bold text-red-600 mt-1">
                      K{(fees.pending || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm text-text-muted mt-3">
                  Payment Progress: {fees.percentage || 0}%
                </p>
              </div>

              {/* Fees Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-text-dark">Description</th>
                      <th className="px-4 py-3 text-left font-semibold text-text-dark">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-text-dark">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.fees.map((fee) => (
                      <tr key={fee._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-text-dark">{fee.description || 'Fee'}</td>
                        <td className="px-4 py-3 font-medium">K{fee.amount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                            fee.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {fee.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-text-muted">No fees available</p>
          )}
        </div>
      )}
    </div>
    )
  }

  const renderTeacherDetails = () => (
    <div className="space-y-6">
      <div className="bg-card-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
          <Briefcase size={20} />
          Professional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-muted">Name</label>
            <p className="text-text-dark font-medium">{userDetails.name}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Mail size={16} />
              Email
            </label>
            <p className="text-text-dark font-medium">{userDetails.email}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Phone size={16} />
              Phone
            </label>
            <p className="text-text-dark font-medium">{userDetails.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <MapPin size={16} />
              Address
            </label>
            <p className="text-text-dark font-medium">{userDetails.address || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted">Gender</label>
            <p className="text-text-dark font-medium capitalize">{userDetails.sex || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Calendar size={16} />
              Date of Birth
            </label>
            <p className="text-text-dark font-medium">
              {userDetails.dob ? new Date(userDetails.dob).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm text-text-muted">Date of Join</label>
            <p className="text-text-dark font-medium">
              {userDetails.date_of_join ? new Date(userDetails.date_of_join).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStaffDetails = () => (
    <div className="space-y-6">
      <div className="bg-card-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
          <Briefcase size={20} />
          Staff Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-muted">Name</label>
            <p className="text-text-dark font-medium">{userDetails.name}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Mail size={16} />
              Email
            </label>
            <p className="text-text-dark font-medium">{userDetails.email}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Phone size={16} />
              Phone
            </label>
            <p className="text-text-dark font-medium">{userDetails.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-text-muted flex items-center gap-2">
              <Award size={16} />
              Role
            </label>
            <p className="text-text-dark font-medium capitalize">{userDetails.role || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary-blue hover:text-primary-blue/80 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Search
      </button>

      {/* User Header */}
      <div className="bg-gradient-to-r from-primary-blue to-primary-blue/80 rounded-lg p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getName()}</h1>
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium capitalize">
              {userDetails.type}
            </span>
          </div>
        </div>
      </div>

      {/* User Details */}
      {userDetails.type === 'student' && renderStudentDetails()}
      {userDetails.type === 'teacher' && renderTeacherDetails()}
      {!['student', 'teacher'].includes(userDetails.type) && renderStaffDetails()}
    </div>
  )
}

export default SearchResults
