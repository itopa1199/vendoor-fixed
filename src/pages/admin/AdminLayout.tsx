import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'
import { ToastProvider } from '@/components/admin/ui'
import { isAdminLoggedIn } from '@/lib/admin-api'

const PAGE_TITLES: Record<string, string> = {
  '/admin':               'Dashboard',
  '/admin/analytics':     'Analytics',
  '/admin/pending':       'Pending Approvals',
  '/admin/vendors':       'Vendors',
  '/admin/products':      'Products',
  '/admin/users':         'Users',
  '/admin/orders':        'Orders',
  '/admin/transactions':  'Transactions',
  '/admin/payouts':       'Payouts',
  '/admin/spotlight':     'Spotlight',
  '/admin/notifications': 'Notifications',
  '/admin/settings':      'Settings',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'Admin'

  // Route guard — redirect to login if no token
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: '#F5F4F0' }}>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-[99] md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className={`fixed md:static inset-y-0 left-0 z-[100] transition-transform duration-250 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-5 animate-fadeIn admin-root">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
