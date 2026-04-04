// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole     = 'buyer' | 'vendor' | 'admin'
export type VendorStatus = 'pending' | 'active' | 'suspended' | 'banned'
export type OrderStatus  = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
export type PayStatus    = 'pending' | 'success' | 'failed' | 'refunded'
export type PayoutStatus = 'pending' | 'processing' | 'done' | 'failed'
export type SpotStatus   = 'active' | 'expired'

// ─── Models ──────────────────────────────────────────────────────────────────

export interface Profile {
  id:           string
  email:        string | null
  phone:        string | null
  name:         string | null
  avatar_url:   string | null
  role:         UserRole
  is_verified:  boolean
  is_active:    boolean
  last_login_at: string | null
  created_at:   string
}

export interface Vendor {
  id:               string
  user_id:          string
  store_name:       string
  slug:             string
  description:      string | null
  logo_url:         string | null
  category:         string
  status:           VendorStatus
  spotlight_active: boolean
  spotlight_ends_at: string | null
  rating:           number
  review_count:     number
  total_sales:      number
  is_verified:      boolean
  paystack_sub_id:  string | null
  bank_code:        string | null
  bank_account:     string | null
  created_at:       string
  // joined from profiles
  owner_name?:      string
  owner_email?:     string
  // computed
  product_count?:   number
  order_count?:     number
  revenue?:         number
}

export interface PendingVendor {
  id:    string
  name:  string
  biz:   string
  cat:   string
  email: string
  phone: string
  nin:   string
  sub:   string
  doc:   string
}

export interface Product {
  id:                 string
  vendor_id:          string
  category_id:        string
  title:              string
  slug:               string
  description:        string
  price:              number  // kobo
  compare_price:      number | null
  discount_percentage: number
  sku:                string | null
  stock:              number
  weight_grams:       number | null
  icon_key:           string | null
  icon_color:         string | null
  bg_gradient:        string | null
  rating:             number
  review_count:       number
  sales_count:        number
  is_active:          boolean
  is_featured:        boolean
  tags:               string[]
  created_at:         string
  // joined
  vendor_name?:       string
  category_name?:     string
}

export interface Order {
  id:             string
  user_id:        string | null
  guest_email:    string | null
  reference:      string
  status:         OrderStatus
  payment_status: PayStatus
  payment_ref:    string | null
  subtotal:       number
  delivery_fee:   number
  total:          number
  note:           string | null
  created_at:     string
  // joined
  user_name?:     string
  vendor_name?:   string
}

export interface Transaction {
  ref:    string
  vendor: string
  type:   'product' | 'spotlight'
  amount: number
  cut:    number
  date:   string
  status: 'success' | 'refunded'
}

export interface Payout {
  id:          string
  vendor_id:   string
  vendor_name: string
  amount:      number
  fee:         number
  net:         number
  reference:   string
  status:      PayoutStatus
  bank_code:   string
  bank_account: string
  created_at:  string
  processed_at: string | null
}

export interface SpotlightSub {
  id:        string
  vendor_id: string
  vendor:    string
  owner:     string
  paid:      string
  exp:       string
  ref:       string
  status:    SpotStatus
}

export interface DashboardStats {
  revenue:        number
  prevRevenue:    number
  orders:         number
  prevOrders:     number
  users:          number
  prevUsers:      number
  vendors:        number
  pendingVendors: number
  platformCut:    number
  spotRevenue:    number
}

export interface RevenuePoint {
  month:   string
  revenue: number
  orders:  number
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

export interface NavItem {
  id:       string
  label:    string
  icon:     string
  href:     string
  badge?:   number
}

export interface NavSection {
  section: string
  items:   NavItem[]
}
