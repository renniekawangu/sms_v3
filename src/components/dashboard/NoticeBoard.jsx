import { Eye } from 'lucide-react'

function NoticeBoard() {
  const notices = [
    {
      title: 'School Event Reminder',
      author: 'Ms. Harper',
      date: 'May 29, 2025',
      views: 436,
    },
  ]

  return (
    <div className="bg-card-white rounded-custom shadow-custom p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-dark">Notice Board</h2>
        <span className="text-sm text-text-muted">Latest</span>
      </div>
      <div className="space-y-4">
        {notices.map((notice, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-text-dark mb-2">{notice.title}</h3>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">By {notice.author}</span>
                <span className="text-text-muted">•</span>
                <span className="text-text-muted">{notice.date}</span>
              </div>
              <div className="flex items-center gap-1 text-text-muted">
                <Eye size={16} />
                <span>{notice.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NoticeBoard
