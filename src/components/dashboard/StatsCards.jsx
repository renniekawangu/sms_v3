import { ArrowUpRight } from 'lucide-react'

function StatsCards() {
  const cards = [
    { title: 'Students', value: 1738, bgColor: 'bg-accent-yellow/10', iconColor: 'text-accent-yellow' },
    { title: 'Teachers', value: 179, bgColor: 'bg-accent-yellow/10', iconColor: 'text-accent-yellow' },
    { title: 'Staffs', value: 165, bgColor: 'bg-accent-yellow/10', iconColor: 'text-accent-yellow' },
    { title: 'Awards', value: 893, bgColor: 'bg-primary-blue/10', iconColor: 'text-primary-blue' },
  ]

  return (
    <div className="grid grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-card-white rounded-custom shadow-custom p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-muted text-sm font-medium">{card.title}</h3>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <ArrowUpRight size={20} className={card.iconColor} />
            </div>
          </div>
          <p className="text-3xl font-semibold text-text-dark">{card.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
