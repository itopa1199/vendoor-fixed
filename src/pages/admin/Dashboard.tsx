import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  DollarSign, ShoppingCart, Users, Store,
  TrendingUp, BarChart2, CheckCircle, Package, CreditCard, Trash2,
} from 'lucide-react'
import { StatCard, Card, CardHeader, CardTitle, Btn, StatusBadge, Avatar, ProgBar } from '@/components/admin/ui'
import { adminDashboard, adminVendors } from '@/lib/admin-api'
import { ngnKobo } from '@/lib/mock-data'

const CATEGORY_CHART = {
  labels: ['Phones','Laptops','Fashion','Beauty','Groceries','Sports','Decor','Fragrances'],
  data:   [32, 19, 15, 11, 9, 6, 5, 3],
  colors: ['#0A6E3F','#2563EB','#7C3AED','#D97706','#EA580C','#059669','#DC2626','#0891B2'],
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState<any>(null)
  const [chart,   setChart]   = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminDashboard.getStats(),
      adminDashboard.getSalesChart(),
      adminVendors.listPending(),
    ]).then(([s, c, p]) => {
      if (s.status)  setStats(s.data)
      if (c.status)  setChart(c.data ?? [])
      if (p.status)  setPending(p.data ?? [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-black">Dashboard</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Welcome back, Super Admin.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/analytics"><Btn v="outline"><TrendingUp size={13} /> Analytics</Btn></Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign size={18} className="text-[#0A6E3F]" />}
          value={stats ? ngnKobo(stats.total_sales ?? 0) : '—'} label="Total Sales" accent="green" />
        <StatCard icon={<ShoppingCart size={18} className="text-[#2563EB]" />}
          value={stats ? String(stats.total_orders ?? 0) : '—'} label="Total Orders" accent="blue" />
        <StatCard icon={<Users size={18} className="text-[#D97706]" />}
          value={stats ? String(stats.total_users ?? 0) : '—'} label="Registered Users" accent="gold" />
        <StatCard icon={<Store size={18} className="text-[#DC2626]" />}
          value={stats ? String(stats.total_vendors ?? 0) : '—'} label="Active Vendors" accent="red" />
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview <span className="text-[11px] text-[#6B6A62] font-normal ml-1">Last 6 months</span></CardTitle>
          </CardHeader>
          <div className="p-4 h-[200px]">
            {chart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0A6E3F" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0A6E3F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false}
                    tickFormatter={v => `₦${(v/1000).toFixed(0)}K`} width={52} />
                  <Tooltip formatter={(v: number) => [`₦${Number(v).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E0DA' }} />
                  <Area type="monotone" dataKey="total" stroke="#0A6E3F" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[12px] text-[#A8A79F]">
                {loading ? 'Loading chart…' : 'No chart data available'}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_CHART.labels.map((l, i) => ({ name: l, value: CATEGORY_CHART.data[i] }))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {CATEGORY_CHART.labels.map((_, i) => <Cell key={i} fill={CATEGORY_CHART.colors[i]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend iconSize={8} iconType="square" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>
            Pending Approvals{' '}
            {pending.length > 0 && <span className="text-[11px] text-[#DC2626] font-normal">{pending.length} vendors</span>}
          </CardTitle>
          <Link to="/admin/pending"><Btn v="gold" size="sm">View All</Btn></Link>
        </CardHeader>
        <div>
          {loading ? (
            <div className="text-center py-8 text-[12px] text-[#6B6A62]">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-[#6B6A62]">No pending applications</div>
          ) : pending.slice(0, 4).map((v: any) => (
            <div key={v.uuid ?? v.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E2E0DA] last:border-0">
              <Avatar name={v.name ?? v.store_name ?? '?'} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold truncate">{v.store_name ?? v.biz}</div>
                <div className="text-[10px] text-[#6B6A62]">{v.category ?? v.cat}</div>
              </div>
              <Link to="/admin/pending"><Btn v="green" size="sm">Review</Btn></Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick stats from API */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<CreditCard size={18} className="text-[#0A6E3F]" />}
            value={ngnKobo(stats.total_revenue ?? 0)} label="Total Revenue" accent="green" />
          <StatCard icon={<BarChart2 size={18} className="text-[#7C3AED]" />}
            value={String(stats.pending_vendors ?? 0)} label="Pending Vendors" accent="purple" />
          <StatCard icon={<Package size={18} className="text-[#EA580C]" />}
            value={String(stats.total_products ?? 0)} label="Total Products" accent="red" />
          <StatCard icon={<CheckCircle size={18} className="text-[#0A6E3F]" />}
            value={String(stats.completed_orders ?? 0)} label="Completed Orders" accent="green" />
        </div>
      )}
    </div>
  )
}
