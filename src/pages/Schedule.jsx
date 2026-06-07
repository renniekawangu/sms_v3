import { Calendar, Clock, MapPin } from 'lucide-react'
import { GRADE_LEVELS } from '../utils/grades'

function Schedule() {
  // Mock schedule data
  const schedule = [
    { time: '8:00 AM - 9:00 AM', subject: 'Mathematics', teacher: 'Dr. Emily Chen', room: 'Room 101', grade: 'Grade 7' },
    { time: '9:00 AM - 10:00 AM', subject: 'Science', teacher: 'Prof. Robert Taylor', room: 'Lab 201', grade: 'Grade 7' },
    { time: '10:00 AM - 11:00 AM', subject: 'English', teacher: 'Ms. Lisa Anderson', room: 'Room 102', grade: 'Grade 7' },
    { time: '11:00 AM - 12:00 PM', subject: 'History', teacher: 'Mr. James Wilson', room: 'Room 103', grade: 'Grade 7' },
    { time: '1:00 PM - 2:00 PM', subject: 'Physics', teacher: 'Dr. Maria Garcia', room: 'Lab 202', grade: 'Grade 7' },
    { time: '2:00 PM - 3:00 PM', subject: 'Physical Education', teacher: 'Coach Johnson', room: 'Gym', grade: 'Grade 7' },
  ]

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Schedule</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">View and manage class schedules</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <select className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-blue">
            {GRADE_LEVELS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <button className="w-full sm:w-auto bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors text-sm sm:text-base font-medium">
            Add Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-card-white rounded-custom shadow-custom p-3 sm:p-4 lg:p-5">
            <h3 className="font-semibold text-text-dark mb-3 sm:mb-4 text-center text-sm sm:text-base">{day}</h3>
            <div className="space-y-2 sm:space-y-3">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <Clock size={14} className="text-text-muted flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-text-muted line-clamp-1">{item.time}</span>
                  </div>
                  <h4 className="font-medium text-text-dark text-xs sm:text-sm mb-1">{item.subject}</h4>
                  <p className="text-xs text-text-muted mb-1 line-clamp-1">{item.teacher}</p>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-text-muted flex-shrink-0" />
                    <span className="text-xs text-text-muted line-clamp-1">{item.room}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card-white rounded-custom shadow-custom p-3 sm:p-4 lg:p-6">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-text-dark mb-3 sm:mb-4">Today's Schedule</h2>
        <div className="space-y-2 sm:space-y-3">
          {schedule.slice(0, 3).map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                <div className="w-full sm:w-24 text-xs sm:text-sm font-medium text-text-dark">{item.time}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-dark text-sm sm:text-base">{item.subject}</h4>
                  <p className="text-xs sm:text-sm text-text-muted">{item.teacher}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm text-text-muted">{item.room}</span>
                <span className="px-2 sm:px-3 py-1 bg-primary-blue/10 text-primary-blue rounded-lg text-xs sm:text-sm whitespace-nowrap">{item.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Schedule
