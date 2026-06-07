import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, School, Users, User, AlertCircle, Mail, Calendar, Clock } from 'lucide-react';
import Homework from '../components/Homework';
import ClassroomHomeworkList from '../components/ClassroomHomeworkList';

function ViewClassroom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClassroom() {
      setLoading(true);
      setError(null);
      try {
        const data = await classroomApi.getById(id);
        setClassroom(data);
      } catch (err) {
        setError(err.message || 'Failed to load classroom');
      } finally {
        setLoading(false);
      }
    }
    fetchClassroom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading classroom details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Error loading classroom</p>
          <p className="text-text-muted mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <School className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-dark font-medium mb-2">Classroom not found</p>
          <p className="text-text-muted mb-6">The classroom you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const studentCount = classroom.students?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-4 lg:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-primary-blue hover:text-primary-blue/80 font-medium transition-colors text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="sm:size-5" />
          <span>Back to Classrooms</span>
        </button>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-primary-blue to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 text-white mb-4 sm:mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="p-1 sm:p-2 bg-white/20 rounded-lg">
                  <School size={24} className="sm:size-7" />
                </div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold">
                  Grade {classroom.grade}
                  <span className="text-blue-100 ml-2 text-sm sm:text-base lg:text-lg">Section {classroom.section}</span>
                </h1>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm lg:text-base">Classroom Details</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          {/* Teacher Information Card */}
          <div className="bg-card-white rounded-lg shadow-custom p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div className="p-1 sm:p-2 bg-blue-50 rounded-lg">
                <User className="text-primary-blue sm:size-6" size={20} />
              </div>
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-text-dark">Assigned Teacher</h2>
            </div>
            <p className="text-text-muted text-xs sm:text-sm mb-2 sm:mb-3">Class Teacher</p>
            <p className="text-text-dark font-medium text-sm sm:text-base lg:text-lg">{classroom.teacher_name || 'No teacher assigned'}</p>
          </div>

          {/* Student Count Card */}
          <div className="bg-card-white rounded-lg shadow-custom p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div className="p-1 sm:p-2 bg-green-50 rounded-lg">
                <Users className="text-green-600 sm:size-6" size={20} />
              </div>
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-text-dark">Total Students</h2>
            </div>
            <p className="text-text-muted text-xs sm:text-sm mb-2 sm:mb-3">Enrolled</p>
            <p className="text-text-dark font-bold text-2xl sm:text-3xl lg:text-4xl">{studentCount}</p>
          </div>
        </div>

        {/* Timetable Section */}
        {classroom.timetable && classroom.timetable.schedule && classroom.timetable.schedule.length > 0 ? (
          <div className="bg-card-white rounded-lg shadow-custom p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1 sm:p-2 bg-purple-50 rounded-lg">
                <Calendar className="text-purple-600 sm:size-6" size={20} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-text-dark">Class Timetable</h2>
                <p className="text-text-muted text-xs">
                  {classroom.timetable.academicYear && `Year: ${classroom.timetable.academicYear}`}
                  {classroom.timetable.term && ` | Term: ${classroom.timetable.term}`}
                </p>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {classroom.timetable.schedule.map((day, dayIdx) => (
                <div key={dayIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-purple-50 px-2 sm:px-3 lg:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm text-text-dark flex items-center gap-2">
                    <Calendar size={14} className="text-purple-600 sm:size-4" />
                    {day.day}
                  </div>
                  <div className="divide-y divide-gray-200">
                    {day.periods && day.periods.length > 0 ? (
                      day.periods.map((period, periodIdx) => (
                        <div key={periodIdx} className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-2 sm:gap-3 lg:gap-4">
                            <div className="flex items-start gap-2 sm:gap-3 flex-1">
                              <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-full text-xs font-semibold text-purple-700">
                                  P{period.period}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs sm:text-sm text-text-dark">{period.subject}</p>
                                <p className="text-xs text-text-muted mt-1">
                                  {period.instructorId ? 'Instructor: ' + (typeof period.instructorId === 'object' ? period.instructorId.name || period.instructorId._id : period.instructorId) : 'Instructor: TBA'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-text-muted text-xs flex-shrink-0">
                              <Clock size={12} className="sm:size-3" />
                              {period.time}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-center text-text-muted text-xs sm:text-sm">
                        No classes scheduled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Homework Section */}
        <div className="mb-6">
          {/* Teacher View: Add Homework */}
          {user?.role === 'teacher' && (
            <Homework classroomId={id} />
          )}
          
          {/* Student/Parent View: Homework Submission */}
          {(user?.role === 'student' || user?.role === 'parent') && (
            <div className="bg-card-white rounded-lg shadow-custom p-3 sm:p-4 lg:p-6">
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-text-dark mb-3 sm:mb-4 flex items-center gap-2">
                <School size={18} className="text-primary-blue sm:size-5" />
                📚 Homework Assignments
              </h2>
              <ClassroomHomeworkList classroomId={id} />
            </div>
          )}
        </div>

        {/* Students List Card */}
        {studentCount > 0 ? (
          <div className="bg-card-white rounded-lg shadow-custom p-3 sm:p-4 lg:p-6">
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-text-dark mb-3 sm:mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary-blue sm:size-5" />
              Student Roster ({studentCount})
            </h2>
            <div className="divide-y divide-gray-200">
              {classroom.students.map((student, idx) => (
                <div
                  key={student._id || idx}
                  className="py-2 sm:py-3 lg:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors px-0 sm:px-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-primary-blue/10 rounded-full flex items-center justify-center">
                      <User size={14} className="text-primary-blue sm:size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm text-text-dark truncate">
                        {student.name || 'Student'}
                      </p>
                      {student.email && (
                        <p className="text-xs text-text-muted flex items-center gap-1 truncate">
                          <Mail size={10} />
                          {student.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Enrolled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card-white rounded-lg shadow-custom p-4 sm:p-6 lg:p-8 text-center">
            <Users className="mx-auto text-text-muted mb-2 sm:mb-3" size={28} />
            <p className="text-text-dark font-medium text-sm sm:text-base mb-1">No Students Yet</p>
            <p className="text-text-muted text-xs sm:text-sm">No students have been assigned to this classroom.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewClassroom;
