import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function EarningsChart() {
  const data = [
    { month: 'Dec', Earnings: 45000, Expenses: 38000 },
    { month: 'Jan', Earnings: 52000, Expenses: 42000 },
    { month: 'Feb', Earnings: 48000, Expenses: 40000 },
    { month: 'Mar', Earnings: 61000, Expenses: 45000 },
    { month: 'Apr', Earnings: 55000, Expenses: 48000 },
    { month: 'May', Earnings: 67000, Expenses: 50000 },
    { month: 'Jun', Earnings: 63000, Expenses: 52000 },
    { month: 'Jul', Earnings: 72000, Expenses: 55000 },
  ]

  return (
    <div className="bg-card-white rounded-custom shadow-custom p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-dark">Earnings</h2>
        <span className="text-sm text-text-muted">Last 8 Months</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" />
          <YAxis stroke="#6B7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Earnings"
            stroke="#FFC107"
            strokeWidth={2}
            dot={{ fill: '#FFC107', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Expenses"
            stroke="#0D6EFD"
            strokeWidth={2}
            dot={{ fill: '#0D6EFD', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EarningsChart
