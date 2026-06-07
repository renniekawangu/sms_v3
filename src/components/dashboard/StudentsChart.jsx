import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { GRADE_LEVELS } from '../../utils/grades'

function StudentsChart() {
  const data = [
    { name: 'Girls', value: 234 },
    { name: 'Boys', value: 193 },
  ]

  const colors = ['#FFC107', '#0D6EFD']

  return (
    <div className="bg-card-white rounded-custom shadow-custom p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-dark">Students</h2>
        <select
          defaultValue={GRADE_LEVELS[GRADE_LEVELS.length - 1]}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-blue"
        >
          {GRADE_LEVELS.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width={250} height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value}: {entry.payload.value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-text-muted">Total: 427</p>
      </div>
    </div>
  )
}

export default StudentsChart
