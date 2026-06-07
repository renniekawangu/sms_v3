import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function AttendanceChart() {
  const data = [
    { day: 'Mon', Present: 1650, Absent: 88 },
    { day: 'Tue', Present: 1680, Absent: 58 },
    { day: 'Wed', Present: 1620, Absent: 118 },
    { day: 'Thu', Present: 1700, Absent: 38 },
    { day: 'Fri', Present: 1660, Absent: 78 },
    { day: 'Sat', Present: 1640, Absent: 98 },
    { day: 'Sun', Present: 1680, Absent: 58 },
  ]

  return (
    <div className="bg-card-white rounded-custom shadow-custom p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-dark">Attendance</h2>
        <span className="text-sm text-text-muted bg-gray-100 px-3 py-1 rounded-lg">Weekly</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="day" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="Present" fill="#0D6EFD" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Absent" fill="#EF4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AttendanceChart
