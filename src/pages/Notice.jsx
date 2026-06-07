import { AlertCircle, Plus, Eye, Calendar, User } from 'lucide-react'

function Notice() {
  // Mock notice data
  const notices = [
    {
      id: 1,
      title: 'School Event Reminder',
      content: 'Please be reminded that the annual school event will be held on July 20th. All students and staff are expected to attend.',
      author: 'Ms. Harper',
      date: 'May 29, 2025',
      views: 436,
      priority: 'High',
    },
    {
      id: 2,
      title: 'Holiday Schedule Update',
      content: 'The school will be closed from July 25th to July 30th for summer break. Classes will resume on July 31st.',
      author: 'Principal Johnson',
      date: 'May 28, 2025',
      views: 389,
      priority: 'Medium',
    },
    {
      id: 3,
      title: 'Library Hours Change',
      content: 'Starting next week, the library will be open from 8 AM to 6 PM on weekdays. Weekend hours remain unchanged.',
      author: 'Ms. Lisa Librarian',
      date: 'May 27, 2025',
      views: 245,
      priority: 'Low',
    },
    {
      id: 4,
      title: 'Sports Day Announcement',
      content: 'The annual sports day will be held on July 15th. All students are encouraged to participate in various events.',
      author: 'Coach Johnson',
      date: 'May 26, 2025',
      views: 512,
      priority: 'High',
    },
    {
      id: 5,
      title: 'Parent-Teacher Meeting',
      content: 'Parent-teacher meetings are scheduled for July 10th. Please book your time slot through the online portal.',
      author: 'Admin Office',
      date: 'May 25, 2025',
      views: 678,
      priority: 'High',
    },
  ]

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text-dark">Notice Board</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">View and manage school notices</p>
        </div>
        <button className="flex items-center justify-center sm:justify-start gap-2 bg-primary-blue text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-blue/90 transition-colors text-sm sm:text-base font-medium">
          <Plus size={18} className="sm:size-5" />
          <span>Create Notice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-card-white rounded-custom shadow-custom p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-text-muted">High Priority</p>
              <p className="text-2xl font-semibold text-text-dark">8</p>
            </div>
          </div>
        </div>
        <div className="bg-card-white rounded-custom shadow-custom p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="text-accent-yellow" size={24} />
            </div>
            <div>
              <p className="text-sm text-text-muted">Medium Priority</p>
              <p className="text-2xl font-semibold text-text-dark">12</p>
            </div>
          </div>
        </div>
        <div className="bg-card-white rounded-custom shadow-custom p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertCircle className="text-primary-blue" size={24} />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Notices</p>
              <p className="text-2xl font-semibold text-text-dark">25</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-white rounded-custom shadow-custom p-6">
        <h2 className="text-lg font-semibold text-text-dark mb-6">Recent Notices</h2>
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-dark text-lg">{notice.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      notice.priority === 'High'
                        ? 'bg-red-100 text-red-700'
                        : notice.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {notice.priority}
                    </span>
                  </div>
                  <p className="text-text-muted mb-4">{notice.content}</p>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>By {notice.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{notice.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span>{notice.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button className="text-sm text-primary-blue hover:text-primary-blue/80 font-medium">
                  View Full Notice
                </button>
                <span className="text-text-muted">•</span>
                <button className="text-sm text-primary-blue hover:text-primary-blue/80 font-medium">
                  Edit
                </button>
                <span className="text-text-muted">•</span>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Notice
