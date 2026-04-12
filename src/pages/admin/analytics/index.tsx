import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, StatCard, Btn, ProgBar } from '@/components/admin/ui'
import { adminDashboard } from '@/lib/admin-api'
import { ngnKobo } from '@/lib/utils'
import { BarChart2, DollarSign, RefreshCw, Star, TrendingUp } from 'lucide-react'

const CHART_COLORS = ['#0A6E3F','#2563EB','#7C3AED','#D97706','#EA580C','#059669','#DC2626','#0891B2']

export default function AnalyticsPage() {
  const [stats,   setStats]   = useState<any>(null)
  const [chart,   setChart]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [range,   setRange]   = useState('6m')

  const load = () => {
    setLoading(true)
    Promise.all([adminDashboard.getStats(), adminDashboard.getSalesChart()])
      .then(([s, c]) => {
        console.log('[Analytics] stats:', s, 'chart:', c)
        setStats(s.data ?? s)
        const chartArr = Array.isArray(c.data) ? c.data : Array.isArray(c) ? c : []
        setChart(chartArr)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const sliceMap: Record<string, number> = { '3m': 3, '6m': 6, '12m': 12 }
  const chartData = chart.slice(-sliceMap[range])

  // Derive category data from stats if available
  const catData = stats?.categories ?? stats?.sales_by_category ?? []
  const hasCatData = Array.isArray(catData) && catData.length > 0

  // Derive order status data from stats
  const orderStatuses = stats?.order_status_breakdown ?? stats?.orders_by_status ?? []
  const hasOrderStatus = Array.isArray(orderStatuses) && orderStatuses.length > 0

  const totalRevenue  = Number(stats?.total_revenue ?? stats?.total_sales    ?? 0)
  const totalOrders   = Number(stats?.total_orders  ?? stats?.orders         ?? 0)
  const platformCut   = Number(stats?.platform_cut  ?? stats?.commission     ?? totalRevenue * 0.05)
  const spotRevenue   = Number(stats?.spotlight_revenue ?? stats?.spot_revenue ?? 0)
  const avgOrder      = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Analytics</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Live platform performance metrics.</p>
        </div>
        <div className="flex gap-2">
          {['3m','6m','12m'].map(r => (
            <Btn key={r} v={range === r ? 'green' : 'outline'} size="sm" onClick={() => setRange(r)}>
              {r === '12m' ? '1 Year' : r === '6m' ? '6 Months' : '3 Months'}
            </Btn>
          ))}
          <Btn v="outline" size="sm" onClick={load}><RefreshCw size={13} /></Btn>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign size={18} />} value={ngnKobo(platformCut)} label="Platform Revenue (5%)" accent="green" />
        <StatCard icon={<Star size={18} />}        value={ngnKobo(spotRevenue)} label="Spotlight Revenue"     accent="gold"  />
        <StatCard icon={<BarChart2 size={18} />}   value={ngnKobo(avgOrder)}   label="Avg Order Value"       accent="blue"  />
        <StatCard icon={<TrendingUp size={18} />}  value={ngnKobo(totalRevenue)} label="Total Revenue"       accent="green" />
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Orders
            <span className="text-[11px] font-normal text-[#6B6A62] ml-1">
              {range === '12m' ? 'Last 12 months' : range === '6m' ? 'Last 6 months' : 'Last 3 months'}
            </span>
          </CardTitle>
        </CardHeader>
        <div className="p-4 h-[260px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-[12px] text-[#A8A79F]">Loading…</div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[12px] text-[#A8A79F]">No chart data from API yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false}
                  tickFormatter={v => `₦${(v/1000).toFixed(0)}K`} width={52} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  formatter={(v: number, name: string) =>
                    name === 'Revenue' ? [`₦${Math.round(v).toLocaleString()}`, name] : [v, name]
                  }
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E0DA' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconSize={10} iconType="square" />
                <Bar yAxisId="left"  dataKey="total"  name="Revenue" fill="#0A6E3F" radius={[3,3,0,0]} opacity={0.85} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Order Status + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Order Status Breakdown</CardTitle></CardHeader>
          <div className="p-4 h-[240px]">
            {hasOrderStatus ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderStatuses.map((s: any, i: number) => ({
                    name: s.status ?? s.name ?? `Status ${i}`,
                    value: Number(s.count ?? s.value ?? s.total ?? 0),
                  }))} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                    {orderStatuses.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Legend iconSize={8} iconType="square" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[12px] text-[#A8A79F] text-center">
                Order status breakdown<br/>will appear here once available from API
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
          <div className="p-4 h-[240px]">
            {hasCatData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData.map((c: any, i: number) => ({
                  name: c.category ?? c.name ?? `Cat ${i}`,
                  share: Number(c.percentage ?? c.share ?? c.count ?? 0),
                }))} layout="vertical" margin={{ left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6B6A62' }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="share" radius={[0,3,3,0]}>
                    {catData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[12px] text-[#A8A79F] text-center">
                Category breakdown<br/>will appear here once available from API
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Raw stats debug in dev */}
      {import.meta.env.DEV && stats && (
        <Card>
          <CardHeader><CardTitle>Raw API Stats (dev only)</CardTitle></CardHeader>
          <div className="p-4">
            <pre className="text-[10px] bg-[#F5F4F0] p-3 rounded overflow-auto max-h-[300px]">
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </div>
  )
}
