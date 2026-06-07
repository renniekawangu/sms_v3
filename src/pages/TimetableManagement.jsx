/**
 * Timetable Management Page
 * Comprehensive timetable management following the prototype structure
 */
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  BookOpen,
  Users,
  Clock
} from 'lucide-react';
import { timetableApi, classroomsApi, teachersApi } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import TimetableScheduleView from '../components/TimetableScheduleView';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TimetableManagement() {
  const [schedules, setSchedules] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedules'); // schedules, instructors, courses
  const [filters, setFilters] = useState({
    classroom: '',
    academicYear: new Date().getFullYear().toString(),
    term: 'Term 1',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // schedule, instructor, course
  const { success, error: showError } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load schedules
      const schedulesData = await timetableApi.schedules.list(filters);
      setSchedules(schedulesData);
      
      // Load classrooms
      const classroomsData = await classroomsApi.list();
      setClassrooms(classroomsData);
      
      // Load instructors
      const instructorsData = await timetableApi.instructors.list();
      setInstructors(instructorsData);
      
      // Load courses
      const coursesData = await timetableApi.courses.list(filters);
      setCourses(coursesData);
      
    } catch (err) {
      showError(err.message || 'Failed to load timetable data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    setModalType('schedule');
    setSelectedSchedule(null);
    setIsModalOpen(true);
  };

  const handleEditSchedule = (schedule) => {
    setModalType('schedule');
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleCreateInstructor = () => {
    setModalType('instructor');
    setIsModalOpen(true);
  };

  const handleCreateCourse = () => {
    setModalType('course');
    setIsModalOpen(true);
  };

  const handleExportSchedule = (schedule) => {
    const dataStr = JSON.stringify(schedule, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timetable-${schedule.classroomId?.name || 'schedule'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    success('Schedule exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-text-muted">Loading timetable data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Scheduling"
        title="Timetable Management"
        description="Manage class schedules, instructors, and course assignments with a consistent school-wide workflow."
        meta={
          <>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Schedules</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{schedules.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">Instructors</p>
              <p className="mt-1 font-display text-2xl font-semibold text-slate-900">{instructors.length}</p>
            </div>
          </>
        }
      />

      {/* Tabs */}
      <div>
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex gap-2 sm:gap-4 lg:gap-8">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedules'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="inline-block w-4 h-4 mr-2" />
              Schedules ({schedules.length})
            </button>
            <button
              onClick={() => setActiveTab('instructors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'instructors'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              Instructors ({instructors.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="inline-block w-4 h-4 mr-2" />
              Courses ({courses.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-card section-pad">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Classroom
            </label>
            <select
              value={filters.classroom}
              onChange={(e) => setFilters({ ...filters, classroom: e.target.value })}
              className="ui-select"
            >
              <option value="">All Classrooms</option>
              {classrooms.map(classroom => (
                <option key={classroom._id} value={classroom._id}>
                  {classroom.name || `Grade ${classroom.grade} ${classroom.section}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              value={filters.academicYear}
              onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
              className="ui-input"
              placeholder="2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term
            </label>
            <select
              value={filters.term}
              onChange={(e) => setFilters({ ...filters, term: e.target.value })}
              className="ui-select"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadData}
              className="btn-ui btn-secondary w-full"
            >
              <Filter className="inline-block w-4 h-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'schedules' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Timetable Schedules
            </h2>
            <button
              onClick={handleCreateSchedule}
              className="btn-ui btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No timetable schedules found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first timetable schedule to get started
              </p>
              <button
                onClick={handleCreateSchedule}
                className="btn-ui btn-primary"
              >
                Create Schedule
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {schedules.map(schedule => (
                <div key={schedule._id}>
                  <TimetableScheduleView
                    schedule={schedule}
                    onEdit={handleEditSchedule}
                    editable={true}
                    subjects={
                      courses.find(c => c.classroomId?._id === schedule.classroomId?._id)?.subjects || []
                    }
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleExportSchedule(schedule)}
                      className="px-3 py-1 text-sm text-primary-blue hover:text-primary-blue/80 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'instructors' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Instructors
            </h2>
            <button
              onClick={handleCreateInstructor}
              className="btn-ui btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Instructor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instructors.map(instructor => (
              <div key={instructor._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-6 h-6 text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {instructor.staffId?.firstName} {instructor.staffId?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{instructor.staffId?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Subjects:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {instructor.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-cyan-100 text-cyan-800 rounded"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Max Hours: {instructor.maxHoursPerWeek}/week
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Courses
            </h2>
            <button
              onClick={handleCreateCourse}
              className="btn-ui btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(course => (
              <div key={course._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {course.classroomId?.name || 
                     `Grade ${course.classroomId?.grade} ${course.classroomId?.section}`}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {course.academicYear} - {course.term}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-2">
                    Subjects ({course.subjects?.length || 0}):
                  </span>
                  <div className="space-y-1">
                    {course.subjects?.map((subject, idx) => (
                      <div
                        key={idx}
                        className="text-sm bg-gray-50 rounded px-2 py-1 flex justify-between"
                      >
                        <span>{subject.name}</span>
                        <span className="text-gray-500">
                          {subject.code} ({subject.hoursPerWeek}h/week)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for creating/editing */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'schedule' ? 'Timetable Schedule' :
          modalType === 'instructor' ? 'Instructor' :
          modalType === 'course' ? 'Course' : ''
        }
      >
        <div className="p-4">
          <p className="text-gray-600">
            Form component for {modalType} will go here
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default TimetableManagement;
