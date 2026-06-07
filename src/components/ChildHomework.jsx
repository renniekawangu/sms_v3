import { useState, useEffect } from 'react'
import { parentsApi, homeworkApi } from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useSettings } from '../contexts/SettingsContext'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Calendar, User, Download, FileText } from 'lucide-react'
import ErrorBoundary from '../components/ErrorBoundary'
import HomeworkSubmission from './HomeworkSubmission'

function ChildHomework({ studentId }) {
  const { user } = useAuth()
  const { error: showError, success } = useToast()
  const { currentAcademicYear } = useSettings()
  
  const [homework, setHomework] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [showingSubmissionId, setShowingSubmissionId] = useState(null)
  
  // Check user roles for submission access
  const isStudent = user?.role === 'student' && user?.id === studentId
  const isParent = user?.role === 'parent'
  const isTeacher = user?.role === 'teacher'
  const canSubmit = isStudent || isParent || isTeacher

  useEffect(() => {
    loadHomework()
  }, [studentId, currentAcademicYear])

  const loadHomework = async () => {
    try {
      setLoading(true)
      const data = await parentsApi.getChildHomework(
        studentId,
        currentAcademicYear?.year
      )
      setHomework(data.homework || [])
    } catch (err) {
      showError(err.message || 'Failed to load homework')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadAttachment = async (homeworkId, attachment, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Get attachment ID - could be _id or filename
      const attachmentId = attachment._id || attachment.filename || attachment.url?.split('/').pop()
      
      if (!attachmentId) {
        showError('Unable to identify attachment')
        return
      }

      const blob = await parentsApi.downloadHomeworkAttachment(homeworkId, attachmentId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.name || attachment.filename || 'homework-material.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      success('File downloaded successfully')
    } catch (err) {
      showError(err.message || 'Failed to download file')
    }
  }

  const handleDownloadSubmissionAttachment = async (homeworkId, studentId, attachment, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Get attachment ID - could be _id or filename
      const attachmentId = attachment._id || attachment.filename || attachment.url?.split('/').pop()
      
      if (!attachmentId) {
        showError('Unable to identify attachment')
        return
      }

      // Use homeworkApi for submission attachments
      const blob = await homeworkApi.downloadSubmissionAttachment(homeworkId, studentId, attachmentId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.name || attachment.filename || 'submission.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      success('File downloaded successfully')
    } catch (err) {
      showError(err.message || 'Failed to download file')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-text-muted text-sm">Loading homework...</p>
        </div>
      </div>
    )
  }

  if (homework.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen size={36} className="mx-auto text-text-muted opacity-50 mb-3" />
        <p className="text-text-muted">No homework assignments</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-3">
        {homework.map((hw) => {
          const isSubmitted = hw.studentSubmission?.status === 'submitted' || hw.studentSubmission?.status === 'graded'
          const isGraded = hw.studentSubmission?.status === 'graded'
          
          return (
            <div
              key={hw._id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
              onClick={() => setExpandedId(expandedId === hw._id ? null : hw._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-text-dark mb-1">{hw.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-text-muted mb-2 flex-wrap">
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {hw.subject}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Due: {new Date(hw.dueDate).toLocaleDateString()}
                    </span>
                    {hw.teacher && (
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {hw.teacher.firstName} {hw.teacher.lastName}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  {isGraded && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Grade: {hw.studentSubmission?.grade}
                    </span>
                  )}
                  {isSubmitted && !isGraded && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Submitted
                    </span>
                  )}
                  {!isSubmitted && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === hw._id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-text-muted mb-3">{hw.description}</p>
                  
                  {/* Show teacher materials */}
                  {hw.attachments && hw.attachments.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                        <FileText size={16} />
                        📚 Learning Materials
                      </h5>
                      <div className="space-y-2">
                        {hw.attachments.map((material, idx) => {
                          const attachmentId = material._id || material.filename || material.url?.split('/').pop();
                          const displayName = material.name || material.filename || 'Learning Material';
                          
                          return (
                            <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                              <span
                                className="text-sm text-primary-blue truncate flex-1 flex items-center gap-2"
                                title={displayName}
                              >
                                <FileText size={14} />
                                {displayName}
                              </span>
                              <button
                                onClick={(e) => handleDownloadAttachment(hw._id, material, e)}
                                className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                                title="Download"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Show submission form for students/parents/teachers who haven't submitted */}
                  {!isSubmitted && showingSubmissionId === hw._id && (
                    <div 
                      className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-xs text-blue-700 mb-3 font-medium">
                        {isStudent && '📝 Submit your homework'}
                        {isParent && `👨‍👩‍👧 Submitting on behalf of your child`}
                        {isTeacher && '👨‍🏫 Uploading homework materials'}
                        {!isStudent && !isParent && !isTeacher && '📝 Upload files'}
                      </div>
                      <HomeworkSubmission
                        homeworkId={hw._id}
                        classroomId={hw.classroomId}
                        onSubmitSuccess={() => {
                          success('Homework submitted successfully!')
                          setShowingSubmissionId(null)
                          loadHomework()
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Show submit button for those who haven't submitted */}
                  {!isSubmitted && showingSubmissionId !== hw._id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowingSubmissionId(hw._id)
                      }}
                      className="w-full mb-3 px-4 py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-md"
                    >
                      {isStudent && '📝 Submit Homework'}
                      {isParent && '👨‍👩‍👧 Submit on Behalf of Child'}
                      {isTeacher && '📤 Upload Materials'}
                      {!isStudent && !isParent && !isTeacher && '📝 Submit'}
                    </button>
                  )}
                  
                  {/* Teacher view: show submission info */}
                  {isTeacher && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded">
                      <p className="text-xs font-medium text-amber-800 mb-1">📊 Submission Status:</p>
                      {isSubmitted ? (
                        <p className="text-sm text-amber-700">✓ Submitted by student</p>
                      ) : (
                        <p className="text-sm text-amber-700">⏳ Awaiting submission</p>
                      )}
                    </div>
                  )}
                  
                  {hw.studentSubmission && (
                    <div className="bg-gray-50 rounded p-3">
                      <h5 className="font-medium text-sm text-text-dark mb-2">
                        {isTeacher ? '📥 Student Submission:' : '✓ Your Submission:'}
                      </h5>
                      {hw.studentSubmission.submissionDate && (
                        <p className="text-xs text-text-muted mb-2">
                          Submitted: {new Date(hw.studentSubmission.submissionDate).toLocaleString()}
                        </p>
                      )}
                      
                      {/* Show submitted attachments */}
                      {hw.studentSubmission.attachments && hw.studentSubmission.attachments.length > 0 && (
                        <div className="mb-3 p-2 bg-white border border-gray-200 rounded">
                          <p className="text-xs font-medium text-text-dark mb-2">Submitted Files:</p>
                          <div className="space-y-1">
                            {hw.studentSubmission.attachments.map((att, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-xs text-text-dark truncate flex-1 flex items-center gap-1">
                                  📄 {att.name || att.filename || 'Submission file'} 
                                  {att.size && ` (${(att.size / 1024 / 1024).toFixed(2)} MB)`}
                                </span>
                                <button
                                  onClick={(e) => handleDownloadSubmissionAttachment(hw._id, studentId, att, e)}
                                  className="ml-2 p-1 text-primary-blue hover:bg-blue-100 rounded transition"
                                  title="Download"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {hw.studentSubmission.feedback && (
                        <div className="p-2 bg-white border border-gray-200 rounded">
                          <p className="text-xs font-medium text-text-dark">👨‍🏫 Teacher Feedback:</p>
                          <p className="text-sm text-text-muted mt-1">{hw.studentSubmission.feedback}</p>
                        </div>
                      )}
                      
                      {isTeacher && hw.studentSubmission.grade && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-xs font-medium text-green-800">Grade: {hw.studentSubmission.grade}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </ErrorBoundary>
  )
}

export default ChildHomework
