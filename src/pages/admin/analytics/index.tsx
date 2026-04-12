import React, { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, StatCard, Btn, ProgBar } from '@/components/admin/ui'
import { useAdminStore } from '@/store/admin'
import { STATS, REVENUE_CHART, CATEGORY_CHART, ngnKobo, pctChange } from '@/lib/mock-data'
import { BarChart2, DollarSign, RefreshCw, Star } from 'lucide-react'

export default function AnalyticsPage() {
  const { vendors } = useAdminStore()
  const [range, setRange] = useState('12m')

  const sliceMap: Record<string, number> = { '3m': 3, '6m': 6, '12m': 12 }
  const chartData = REVENUE_CHART.slice(-sliceMap[range])

  const orderStatusData = [
    { name: 'Delivered',       value: 5, color: '#0A6E3F' },
    { name: 'Confirmed',       value: 1, color: '#2563EB' },
    { name: 'Preparing',       value: 1, color: '#D97706' },
    { name: 'Out for Delivery',value: 1, color: '#7C3AED' },
    { name: 'Cancelled',       value: 1, color: '#DC2626' },
    { name: 'Refunded',        value: 1, color: '#EA580C' },
  ]

  const topVendors = [...vendors]
    .filter(v => v.status === 'active')
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    .slice(0, 6)

  const maxRev = topVendors[0]?.revenue || 1

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Analytics</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Detailed platform performance metrics.</p>
        </div>
        <div className="flex gap-2">
          {['3m','6m','12m'].map(r => (
            <Btn key={r} v={range === r ? 'green' : 'outline'} size="sm" onClick={() => setRange(r)}>
              {r === '12m' ? '1 Year' : r === '6m' ? '6 Months' : '3 Months'}
            </Btn>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign size={18} />} value={ngnKobo(STATS.platformCut)}     label="Platform Revenue (5%)" accent="green"  delta={pctChange(STATS.platformCut, STATS.prevRevenue * 0.05)} />
        <StatCard icon={<Star size={18} />} value={ngnKobo(STATS.spotRevenue)}      label="Spotlight Revenue"     accent="gold"   />
        <StatCard icon={<BarChart2 size={18} />} value={ngnKobo(STATS.revenue / STATS.orders)} label="Avg Order Value" accent="blue"   />
        <StatCard icon={<RefreshCw size={18} />} value="2.8%"                             label="Cancellation Rate"     accent="red"    />
      </div>

      {/* Main chart — Revenue & Orders */}
      <Card>
        <CardHeader>
          <CardTitle>
            Revenue & Orders <span className="text-[11px] font-normal text-[#6B6A62] ml-1">
              {range === '12m' ? 'Last 12 months' : range === '6m' ? 'Last 6 months' : 'Last 3 months'}
            </span>
          </CardTitle>
        </CardHeader>
        <div className="p-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false}
                tickFormatter={v => `₦${(v / 100000).toFixed(0)}K`} width={52} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} width={28} />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === 'Revenue' ? [`₦${Math.round(v).toLocaleString()}`, name] : [v, name]
                }
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E0DA' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconSize={10} iconType="square" />
              <Bar yAxisId="left"  dataKey="revenue" name="Revenue" fill="#0A6E3F" radius={[3,3,0,0]} opacity={0.85} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two-column: top vendors + order status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <CardHeader><CardTitle>Top Vendors by Revenue</CardTitle></CardHeader>
          <div className="p-4 space-y-3">
            {topVendors.map((v, i) => (
              <div key={v.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] font-semibold">{i + 1}. {v.store_name}</span>
                  <span className="text-[12px] text-[#0A6E3F] font-bold">{ngnKobo(v.revenue || 0)}</span>
                </div>
                <ProgBar pct={Math.round(((v.revenue || 0) / maxRev) * 100)} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Order Status Breakdown</CardTitle></CardHeader>
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={95}
                  paddingAngle={2} dataKey="value"
                >
                  {orderStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend
                  iconSize={8} iconType="square"
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => <span style={{ color: '#6B6A62' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Category breakdown */}
      <Card>
        <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
        <div className="p-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={CATEGORY_CHART.labels.map((l, i) => ({ name: l, share: CATEGORY_CHART.data[i], fill: CATEGORY_CHART.colors[i] }))}
              layout="vertical"
              margin={{ left: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B6A62' }} tickLine={false} axisLine={false} width={72} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="share" radius={[0,3,3,0]}>
                {CATEGORY_CHART.labels.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_CHART.colors[i]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  )
}
