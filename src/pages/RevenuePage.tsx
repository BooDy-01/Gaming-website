import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { DollarSign, TrendingUp, Users, BarChart3 } from 'lucide-react'

const PIE_COLORS = ['#0024A7', '#1A3DFF', '#8A8A8A']

export default function RevenuePage() {
  const [chartPeriod, setChartPeriod] = useState<'today' | 'week' | 'month'>('week')

  const { data: todayRevenue } = trpc.revenue.today.useQuery()
  const { data: weeklyRevenue } = trpc.revenue.weekly.useQuery()
  const { data: monthlyRevenue } = trpc.revenue.monthly.useQuery()
  const { data: dailyChart } = trpc.revenue.dailyChart.useQuery(7)
  const { data: breakdown } = trpc.revenue.breakdown.useQuery({ period: chartPeriod })

  const chartData = dailyChart?.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en', { weekday: 'short', day: 'numeric' }),
  })) || []

  const pieData = breakdown
    ? [
        { name: 'Gaming', value: breakdown.gamingRevenue },
        { name: 'Snacks & Drinks', value: breakdown.addonsRevenue },
      ].filter((d) => d.value > 0)
    : []

  const totalRevenue = (breakdown?.totalRevenue || 0).toFixed(2)

  return (
    <div className="p-6 lg:p-12">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
          Revenue
        </div>
        <div className="text-2xl font-black text-[#F9F9F9] mt-1">
          FINANCIAL REPORTS
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 mb-8">
        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={14} className="text-[#0024A7]" />
            <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">Today's Revenue</span>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#F9F9F9] animate-metric-pulse">
            ${(todayRevenue?.totalRevenue || 0).toFixed(0)}.
          </div>
          <div className="mt-1 text-[10px] font-mono-tech text-[#8A8A8A]">
            {todayRevenue?.sessionCount || 0} sessions
          </div>
        </div>

        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-[#0024A7]" />
            <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">Weekly</span>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#F9F9F9]">
            ${(weeklyRevenue?.totalRevenue || 0).toFixed(0)}.
          </div>
          <div className="mt-1 text-[10px] font-mono-tech text-[#8A8A8A]">
            {weeklyRevenue?.sessionCount || 0} sessions
          </div>
        </div>

        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-[#0024A7]" />
            <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">
              {monthlyRevenue?.[0]?.month || 'This Month'}
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#F9F9F9]">
            ${(monthlyRevenue?.[0]?.totalRevenue || 0).toFixed(0)}.
          </div>
          <div className="mt-1 text-[10px] font-mono-tech text-[#8A8A8A]">
            {monthlyRevenue?.[0]?.sessionCount || 0} sessions
          </div>
        </div>

        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-[#0024A7]" />
            <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">
              {monthlyRevenue?.[1]?.month || 'Last Month'}
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#F9F9F9]">
            ${(monthlyRevenue?.[1]?.totalRevenue || 0).toFixed(0)}.
          </div>
          <div className="mt-1 text-[10px] font-mono-tech text-[#8A8A8A]">
            {monthlyRevenue?.[1]?.sessionCount || 0} sessions
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 mb-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-[#101010] border border-[rgba(255,255,255,0.1)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs font-bold text-[#F9F9F9] uppercase">
              Daily Revenue (Last 7 Days)
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#8A8A8A', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8A8A8A', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101010',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F9F9F9',
                    fontSize: 11,
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Bar dataKey="gaming" fill="#0024A7" name="Gaming" />
                <Bar dataKey="addons" fill="#1A3DFF" name="Snacks & Drinks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs font-bold text-[#F9F9F9] uppercase">
              Revenue Breakdown
            </div>
            <div className="flex gap-1">
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-2 py-1 text-[10px] font-bold uppercase transition-colors ${
                    chartPeriod === p
                      ? 'bg-[#0024A7] text-white'
                      : 'text-[#8A8A8A] hover:text-[#F9F9F9]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101010',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F9F9F9',
                    fontSize: 11,
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-xs font-mono-tech text-[#8A8A8A] mb-4">
            TOTAL: ${totalRevenue}
          </div>

          <div className="space-y-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-xs text-[#F9F9F9] flex-1">{entry.name}</span>
                <span className="text-xs font-mono-tech text-[#8A8A8A]">
                  ${entry.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-6">
        <div className="text-xs font-bold text-[#F9F9F9] uppercase mb-6">
          Monthly Comparison (Last 3 Months)
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {monthlyRevenue?.map((month, index) => (
            <div
              key={month.month}
              className="border border-[rgba(255,255,255,0.1)] p-4 hover:border-[#0024A7] transition-colors"
              style={{
                opacity: 1 - index * 0.2,
              }}
            >
              <div className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-2">
                {month.month}
              </div>
              <div className="text-xl font-black text-[#F9F9F9]">
                ${month.totalRevenue.toFixed(0)}.
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono-tech text-[#8A8A8A]">
                <div>
                  <span className="text-[#0024A7]">${month.gamingRevenue.toFixed(0)}</span> Gaming
                </div>
                <div>
                  <span className="text-[#1A3DFF]">${month.addonsRevenue.toFixed(0)}</span> Addons
                </div>
              </div>
              <div className="mt-2 text-[10px] font-mono-tech text-[#8A8A8A]">
                {month.sessionCount} sessions
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
