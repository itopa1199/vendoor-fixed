import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAdminStore } from '@/store/admin'
import {
  LayoutDashboard, TrendingUp, Clock, Store, Package,
  Users, ShoppingCart, CreditCard, Landmark, Star,
  Bell, Settings, LogOut,
} from 'lucide-react'

const NAV = [
  {
    section: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard',       Icon: LayoutDashboard, href: '/admin'             },
      { id: 'analytics', label: 'Analytics',        Icon: TrendingUp,      href: '/admin/analytics'   },
    ],
  },
  {
    section: 'Marketplace',
    items: [
      { id: 'pending',  label: 'Pending Approvals', Icon: Clock,          href: '/admin/pending',      badge: 'pending' },
      { id: 'vendors',  label: 'Vendors',            Icon: Store,          href: '/admin/vendors'       },
      { id: 'products', label: 'Products',           Icon: Package,        href: '/admin/products',     badge: 'flagged' },
      { id: 'users',    label: 'Users',              Icon: Users,          href: '/admin/users'         },
      { id: 'orders',   label: 'Orders',             Icon: ShoppingCart,   href: '/admin/orders'        },
    ],
  },
  {
    section: 'Finance',
    items: [
      { id: 'transactions', label: 'Transactions', Icon: CreditCard, href: '/admin/transactions' },
      { id: 'payouts',      label: 'Payouts',      Icon: Landmark,   href: '/admin/payouts'      },
      { id: 'spotlight',    label: 'Spotlight',    Icon: Star,       href: '/admin/spotlight'    },
    ],
  },
  {
    section: 'System',
    items: [
      { id: 'notifications', label: 'Notifications', Icon: Bell,     href: '/admin/notifications', badge: 'notifs' },
      { id: 'settings',      label: 'Settings',       Icon: Settings, href: '/admin/settings'       },
    ],
  },
]

interface SidebarProps { onClose?: () => void }

export default function Sidebar({ onClose }: SidebarProps) {
  const { pathname } = useLocation()
  const pendingCount = useAdminStore(s => s.pendingVendors.length)
  const flaggedCount = useAdminStore(s => s.products.filter(p => !p.is_active).length)
  const notifCount   = useAdminStore(s => s.notifCount)

  function getBadge(key?: string): number {
    if (key === 'pending') return pendingCount
    if (key === 'flagged') return flaggedCount
    if (key === 'notifs')  return notifCount
    return 0
  }

  return (
    <aside className="w-[var(--sw,232px)] bg-white border-r border-[#E2E0DA] flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-[#E2E0DA] flex items-center justify-between flex-shrink-0">
        <div className="text-[18px] font-black text-[#0A6E3F]">
          Vend<span className="text-[#D97706]">oor</span>
        </div>
        <span className="text-[9px] font-bold bg-[#FEF2F2] text-[#DC2626] px-2 py-0.5 rounded-full tracking-[.04em]">
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-2">
        {NAV.map(section => (
          <div key={section.section}>
            <div className="text-[9px] font-bold uppercase tracking-[.1em] text-[#A8A79F] px-2 mt-4 mb-1 first:mt-1">
              {section.section}
            </div>
            {section.items.map(item => {
              const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              const badge  = getBadge((item as any).badge)
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center justify-between px-2.5 py-2 rounded-[8px] mb-0.5 transition-all text-[13px] font-medium',
                    active
                      ? 'bg-[#FEF2F2] text-[#DC2626] font-semibold'
                      : 'text-[#6B6A62] hover:bg-[#ECEAE4] hover:text-[#1A1A18]'
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <item.Icon size={15} strokeWidth={2} />
                    {item.label}
                  </span>
                  {badge > 0 && (
                    <span className="bg-[#DC2626] text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-[#E2E0DA] flex-shrink-0">
        <div className="flex items-center gap-2 p-2 bg-[#ECEAE4] rounded-[8px]">
          <div className="w-7 h-7 rounded-[6px] bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate">Super Admin</div>
            <div className="text-[10px] text-[#6B6A62] truncate">admin@vendoor.ng</div>
          </div>
          <Link to="/admin/login" className="text-[#6B6A62] hover:text-[#DC2626] transition-colors">
            <LogOut size={14} />
          </Link>
        </div>
      </div>
    </aside>
  )
}
