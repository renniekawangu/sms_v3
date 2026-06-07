import { Award, Medal, Trophy } from 'lucide-react'

function StudentActivities() {
  const activities = [
    { title: 'Best in Show at Statewide Art Contest', icon: Award, date: 'May 5' },
    { title: 'Gold Medal in National Math Olympiad', icon: Medal, date: 'April 10' },
    { title: 'First Place in Regional Science Fair', icon: Trophy, date: 'March 15' },
  ]

  return (
    <div className="bg-card-white rounded-custom shadow-custom p-6">
      <h2 className="text-lg font-semibold text-text-dark mb-6">Student Activities</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-3 bg-accent-yellow/10 rounded-lg">
                <Icon size={24} className="text-accent-yellow" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-dark mb-1">{activity.title}</h3>
                <p className="text-sm text-text-muted">{activity.date}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StudentActivities
