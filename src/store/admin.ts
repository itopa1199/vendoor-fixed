import { create } from 'zustand'
import type { Vendor, Product, Order, Payout, SpotlightSub, PendingVendor } from '@/types/admin'
import {
  VENDORS, PRODUCTS, ORDERS, PAYOUTS, SPOTLIGHT_SUBS, PENDING_VENDORS,
} from '@/lib/mock-data'

interface AdminState {
  // Data
  vendors:       Vendor[]
  products:      Product[]
  orders:        Order[]
  payouts:       Payout[]
  spotlightSubs: SpotlightSub[]
  pendingVendors:PendingVendor[]
  notifCount:    number

  // Vendor actions
  approveVendor:  (id: string) => void
  rejectVendor:   (id: string) => void
  suspendVendor:  (id: string) => void
  restoreVendor:  (id: string) => void
  banVendor:      (id: string) => void

  // Product actions
  flagProduct:    (id: string) => void
  unflagProduct:  (id: string) => void
  removeProduct:  (id: string) => void
  toggleFeatured: (id: string) => void

  // Order actions
  advanceOrder:   (id: string) => void
  cancelOrder:    (id: string) => void

  // Payout actions
  processPayout:  (id: string) => void

  // Spotlight actions
  removeSpotlight:(id: string) => void

  // Notifications
  decrementNotif: () => void
}

const ORDER_FLOW: Order['status'][] = [
  'confirmed', 'preparing', 'out_for_delivery', 'delivered',
]

export const useAdminStore = create<AdminState>((set, get) => ({
  vendors:        VENDORS.map(v => ({ ...v })),
  products:       PRODUCTS.map(p => ({ ...p })),
  orders:         ORDERS.map(o => ({ ...o })),
  payouts:        PAYOUTS.map(p => ({ ...p })),
  spotlightSubs:  SPOTLIGHT_SUBS.map(s => ({ ...s })),
  pendingVendors: PENDING_VENDORS.map(v => ({ ...v })),
  notifCount:     4,

  // ── Vendor ──────────────────────────────────────────────
  approveVendor: (id) => {
    const pv = get().pendingVendors.find(v => v.id === id)
    if (!pv) return
    set(s => ({
      pendingVendors: s.pendingVendors.filter(v => v.id !== id),
      vendors: [...s.vendors, {
        id, user_id: id, store_name: pv.biz, slug: pv.biz.toLowerCase().replace(/\s+/g,'-'),
        description: null, logo_url: null, category: pv.cat,
        status: 'active', spotlight_active: false, spotlight_ends_at: null,
        rating: 0, review_count: 0, total_sales: 0, is_verified: true,
        paystack_sub_id: null, bank_code: null, bank_account: null,
        created_at: new Date().toISOString(),
        owner_name: pv.name, owner_email: pv.email,
        product_count: 0, order_count: 0, revenue: 0,
      } as Vendor],
    }))
  },

  rejectVendor: (id) =>
    set(s => ({ pendingVendors: s.pendingVendors.filter(v => v.id !== id) })),

  suspendVendor: (id) =>
    set(s => ({ vendors: s.vendors.map(v => v.id === id ? { ...v, status: 'suspended' } : v) })),

  restoreVendor: (id) =>
    set(s => ({ vendors: s.vendors.map(v => v.id === id ? { ...v, status: 'active' } : v) })),

  banVendor: (id) =>
    set(s => ({ vendors: s.vendors.map(v => v.id === id ? { ...v, status: 'banned', spotlight_active: false } : v) })),

  // ── Product ─────────────────────────────────────────────
  flagProduct: (id) =>
    set(s => ({ products: s.products.map(p => p.id === id ? { ...p, is_active: false } : p) })),

  unflagProduct: (id) =>
    set(s => ({ products: s.products.map(p => p.id === id ? { ...p, is_active: true } : p) })),

  removeProduct: (id) =>
    set(s => ({ products: s.products.filter(p => p.id !== id) })),

  toggleFeatured: (id) =>
    set(s => ({ products: s.products.map(p => p.id === id ? { ...p, is_featured: !p.is_featured } : p) })),

  // ── Order ───────────────────────────────────────────────
  advanceOrder: (id) =>
    set(s => ({
      orders: s.orders.map(o => {
        if (o.id !== id) return o
        const i = ORDER_FLOW.indexOf(o.status as typeof ORDER_FLOW[number])
        return i < ORDER_FLOW.length - 1 ? { ...o, status: ORDER_FLOW[i + 1] } : o
      }),
    })),

  cancelOrder: (id) =>
    set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o) })),

  // ── Payout ──────────────────────────────────────────────
  processPayout: (id) =>
    set(s => ({
      payouts: s.payouts.map(p =>
        p.id === id ? { ...p, status: 'done', processed_at: new Date().toISOString() } : p
      ),
    })),

  // ── Spotlight ───────────────────────────────────────────
  removeSpotlight: (id) =>
    set(s => ({
      spotlightSubs: s.spotlightSubs.map(s => s.id === id ? { ...s, status: 'expired' } : s),
    })),

  decrementNotif: () =>
    set(s => ({ notifCount: Math.max(0, s.notifCount - 1) })),
}))
