import React, { useState } from 'react'
import { Card, StatCard, Btn, StatusBadge, Badge, Tabs, Empty } from '@/components/admin/ui'
import { TRANSACTIONS, ngnKobo } from '@/lib/mock-data'
import { BarChart2, DollarSign, Landmark, Star } from 'lucide-react'

export default function TransactionsPage() {
  const [tab, setTab] = useState('all')

  const all       = TRANSACTIONS
  const products  = TRANSACTIONS.filter(t => t.type === 'product')
  const spotlight = TRANSACTIONS.filter(t => t.type === 'spotlight')
  const refunded  = TRANSACTIONS.filter(t => t.status === 'refunded')

  const visible =
    tab === 'product'   ? products  :
    tab === 'spotlight' ? spotlight :
    tab === 'refunded'  ? refunded  : all

  const totalVol  = all.reduce((s, t) => s + t.amount, 0)
  const totalCuts = all.reduce((s, t) => s + t.cut, 0)
  const spotRev   = spotlight.reduce((s, t) => s + t.cut, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Transactions</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">All Paystack transactions processed on Vendoor.</p>
        </div>
        <Btn v="outline" size="sm">Export CSV</Btn>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign size={18} />} value={ngnKobo(totalVol)}  label="Total Volume"         accent="green"  />
        <StatCard icon={<Landmark size={18} />} value={ngnKobo(totalCuts)} label="Platform Revenue (5%)" accent="blue"   />
        <StatCard icon={<Star size={18} />} value={ngnKobo(spotRev)}   label="Spotlight Revenue"     accent="gold"   />
        <StatCard icon={<BarChart2 size={18} />} value={String(all.length)} label="Total Transactions"    accent="purple" />
      </div>

      <Card>
        <div className="px-4 pt-3">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'all',       label: 'All',        count: all.length       },
              { id: 'product',   label: 'Product',    count: products.length  },
              { id: 'spotlight', label: 'Spotlight',  count: spotlight.length },
              { id: 'refunded',  label: 'Refunded',   count: refunded.length  },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Paystack Ref</th><th>Vendor</th><th>Type</th>
                <th>Amount</th><th>Platform Cut</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t, i) => (
                <tr key={i}>
                  <td className="font-mono text-[11px] font-semibold text-[#2563EB]">{t.ref}</td>
                  <td className="font-semibold">{t.vendor}</td>
                  <td>
                    <Badge v={t.type === 'spotlight' ? 'gold' : 'green'}>{t.type}</Badge>
                  </td>
                  <td className="font-bold">{ngnKobo(t.amount)}</td>
                  <td className="text-[#0A6E3F] font-bold">{ngnKobo(t.cut)}</td>
                  <td className="text-[11px] text-[#6B6A62]">{t.date}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={7} className="py-10">
                  <Empty icon="💳" title="No transactions in this category" />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
