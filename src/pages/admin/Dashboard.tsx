import React from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  DollarSign, ShoppingCart, Users, Store,
  TrendingUp, BarChart2, CheckCircle,
} from 'lucide-react'
import { StatCard, Card, CardHeader, CardTitle, Btn, StatusBadge, Avatar, ProgBar } from '@/components/admin/ui'
import { useAdminStore } from '@/store/admin'
import { STATS, REVENUE_CHART, CATEGORY_CHART, RECENT_ACTIVITY, ngnKobo, pctChange } from '@/lib/mock-data'

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  '✅': <CheckCircle size={14} className="text-[#0A6E3F]" />,
  '🛒': <ShoppingCart size={14} className="text-[#2563EB]" />,
  '👤': <Users size={14} className="text-[#7C3AED]" />,
  '💳': <DollarSign size={14} className="text-[#2563EB]" />,
  '⚠️': <Store size={14} className="text-[#EA580C]" />,
  '🏪': <Store size={14} className="text-[#DC2626]" />,
  '🗑️': <BarChart2 size={14} className="text-[#DC2626]" />,
}

export default function DashboardPage() {
  const { pendingVendors, vendors, orders } = useAdminStore()

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[18px] font-black">Dashboard</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Welcome back, Super Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/analytics"><Btn v="outline"><TrendingUp size={13} /> Analytics</Btn></Link>
          <Btn v="green"><BarChart2 size={13} /> Export Report</Btn>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign size={18} className="text-[#0A6E3F]" />} value={ngnKobo(STATS.revenue)} label="Total Revenue"    accent="green"  delta={pctChange(STATS.revenue, STATS.prevRevenue)} />
        <StatCard icon={<ShoppingCart size={18} className="text-[#2563EB]" />} value={STATS.orders.toLocaleString()} label="Total Orders" accent="blue" delta={pctChange(STATS.orders, STATS.prevOrders)} />
        <StatCard icon={<Users size={18} className="text-[#D97706]" />} value={STATS.users.toLocaleString()} label="Registered Users" accent="gold" delta={pctChange(STATS.users, STATS.prevUsers)} />
        <StatCard icon={<Store size={18} className="text-[#DC2626]" />} value={String(STATS.vendors)} label="Active Vendors" accent="red" delta={pctChange(STATS.vendors, 54)} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview <span className="text-[11px] text-[#6B6A62] font-normal ml-1">Last 12 months</span></CardTitle>
          </CardHeader>
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_CHART}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0A6E3F" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0A6E3F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#A8A79F' }} tickLine={false} axisLine={false} tickFormatter={v => `₦${(v/100000).toFixed(0)}K`} width={52} />
                <Tooltip formatter={(v: number) => [`₦${Math.round(v).toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E2E0DA' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0A6E3F" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
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

      {/* Pending + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals <span className="text-[11px] text-[#DC2626] font-normal">{pendingVendors.length} vendors</span></CardTitle>
            <Link to="/admin/pending"><Btn v="gold" size="sm">View All</Btn></Link>
          </CardHeader>
          <div>
            {pendingVendors.slice(0, 4).map(v => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E2E0DA] last:border-0">
                <Avatar name={v.name} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate">{v.biz}</div>
                  <div className="text-[10px] text-[#6B6A62]">{v.cat} · {v.sub}</div>
                </div>
                <Link to="/admin/pending"><Btn v="green" size="sm">Approve</Btn></Link>
              </div>
            ))}
            {pendingVendors.length === 0 && <div className="text-center py-8 text-[12px] text-[#6B6A62]">No pending applications</div>}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <div className="px-4 py-2 max-h-[240px] overflow-y-auto">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-[#E2E0DA] last:border-0">
                <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: a.color }}>
                  {ACTIVITY_ICONS[a.icon] ?? a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] leading-[1.4]" dangerouslySetInnerHTML={{ __html: a.msg }} />
                  <div className="text-[10px] text-[#A8A79F] mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Vendors by Revenue</CardTitle>
          <Link to="/admin/vendors"><Btn v="outline" size="sm">View All</Btn></Link>
        </CardHeader>
        <div className="p-4 space-y-3">
          {[...vendors].filter(v => v.status === 'active').sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5).map((v, i) => (
            <div key={v.id}>
              <div className="flex justify-between mb-1">
                <span className="text-[12px] font-semibold">{i + 1}. {v.store_name}</span>
                <span className="text-[12px] text-[#0A6E3F] font-bold">{ngnKobo(v.revenue || 0)}</span>
              </div>
              <ProgBar pct={Math.round(((v.revenue || 0) / (vendors[0]?.revenue || 1)) * 100)} />
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <Link to="/admin/orders"><Btn v="outline" size="sm">View All</Btn></Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Vendor</th><th>Customer</th><th>Amount</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map(o => (
                <tr key={o.id}>
                  <td className="font-mono font-bold text-[11px] text-[#2563EB]">{o.reference}</td>
                  <td className="font-semibold">{o.vendor_name}</td>
                  <td>{o.user_name}</td>
                  <td className="font-bold text-[#0A6E3F]">{ngnKobo(o.total)}</td>
                  <td className="text-[11px] text-[#6B6A62]">{new Date(o.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short' })}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
