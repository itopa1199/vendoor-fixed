import React, { useState } from 'react'
import { Card, Btn, Badge, useToast } from '@/components/admin/ui'
import { Store, Package, CreditCard, Lock, Settings, DollarSign } from 'lucide-react'
import { clsx } from 'clsx'

const NOTIFICATIONS = [
  { id:'n1', type:'vendor',   icon:'store', msg:'New vendor application: FreshBakes NG requires review.',     time:'3 hours ago', read:false },
  { id:'n2', type:'order',    icon:'package', msg:'Order VND-G4W2X6 has been cancelled by customer.',           time:'4 hours ago', read:false },
  { id:'n3', type:'payment',  icon:'card', msg:'Refund processed for VND-H8Y5Z7 — ₦120,000.',               time:'6 hours ago', read:false },
  { id:'n4', type:'security', icon:'lock', msg:'Flagged product "Suspicious Item XYZ" needs review.',        time:'1 day ago',   read:false },
  { id:'n5', type:'vendor',   icon:'store', msg:'New vendor application: TechZone Abuja requires review.',    time:'2 days ago',  read:true  },
  { id:'n6', type:'system',   icon:'settings', msg:'System backup completed successfully.',                       time:'3 days ago',  read:true  },
  { id:'n7', type:'order',    icon:'package', msg:'Order VND-A9F2K3 delivered successfully to Adaeze M.',       time:'3 days ago',  read:true  },
  { id:'n8', type:'payment',  icon:'dollar', msg:'Spotlight payment received from SportCity NG.',              time:'4 days ago',  read:true  },
]

const TYPE_BG: Record<string, string> = {
  vendor:   '#E8F5EE',
  order:    '#EFF6FF',
  payment:  '#EFF6FF',
  security: '#FEF2F2',
  system:   '#ECEAE4',
}

export default function NotificationsPage() {
  const toast = useToast()
  const [notifs, setNotifs] = useState(NOTIFICATIONS.map(n => ({ ...n })))
  const [filter, setFilter] = useState('all')

  const unread = notifs.filter(n => !n.read).length

  function markRead(id: string) {
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    const unreadCount = notifs.filter(n => !n.read).length
    setNotifs(ns => ns.map(n => ({ ...n, read: true })))
    toast('✅ All notifications marked as read.')
  }

  const visible = notifs.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'vendor')   return n.type === 'vendor'
    if (filter === 'orders')   return n.type === 'order'
    if (filter === 'payments') return n.type === 'payment'
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Notifications</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{unread} unread.</p>
        </div>
        <div className="flex gap-2">
          <Btn v="outline" size="sm" onClick={markAllRead}>Mark All Read</Btn>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all',      label: 'All',       count: notifs.length },
          { id: 'unread',   label: 'Unread',    count: unread        },
          { id: 'vendor',   label: 'Vendors',   count: notifs.filter(n=>n.type==='vendor').length   },
          { id: 'orders',   label: 'Orders',    count: notifs.filter(n=>n.type==='order').length    },
          { id: 'payments', label: 'Payments',  count: notifs.filter(n=>n.type==='payment').length  },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
              filter === f.id
                ? 'bg-[#0A6E3F] text-white border-[#0A6E3F]'
                : 'bg-white text-[#6B6A62] border-[#E2E0DA] hover:border-[#0A6E3F]'
            )}
          >
            {f.label} {f.count > 0 && <span className={filter === f.id ? 'text-white/80' : 'text-[#A8A79F]'}>({f.count})</span>}
          </button>
        ))}
      </div>

      <Card>
        {visible.length === 0 ? (
          <div className="text-center py-12 text-[#6B6A62]">
            <div className="text-4xl mb-3">🔔</div>
            <div className="text-[13px] font-semibold">No notifications in this category</div>
          </div>
        ) : (
          visible.map(n => (
            <div
              key={n.id}
              className={clsx(
                'flex items-start gap-3 px-4 py-3.5 border-b border-[#E2E0DA] last:border-0 transition-colors',
                !n.read && 'bg-[#2563EB]/[0.025]'
              )}
            >
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                style={{ background: TYPE_BG[n.type] || '#ECEAE4' }}
              >
                {n.icon === 'store'    && <Store size={15} className="text-[#0A6E3F]" />}
                {n.icon === 'package'  && <Package size={15} className="text-[#2563EB]" />}
                {n.icon === 'card'     && <CreditCard size={15} className="text-[#2563EB]" />}
                {n.icon === 'lock'     && <Lock size={15} className="text-[#DC2626]" />}
                {n.icon === 'settings' && <Settings size={15} className="text-[#6B6A62]" />}
                {n.icon === 'dollar'   && <DollarSign size={15} className="text-[#0A6E3F]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx('text-[12px] leading-[1.5]', !n.read && 'font-semibold')}>
                  {n.msg}
                </p>
                <p className="text-[10px] text-[#A8A79F] mt-1">{n.time}</p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-[10px] text-[#6B6A62] border border-[#E2E0DA] px-2 py-1 rounded-md hover:border-[#0A6E3F] hover:text-[#0A6E3F] transition-colors flex-shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
