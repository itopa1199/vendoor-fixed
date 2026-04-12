import axios from 'axios'
import Cookies from 'js-cookie'

// ── Admin token helpers ───────────────────────────────────────────
const ADMIN_BASE  = 'https://vendoor.ng/store/api/admin'
const LOGIN_URL   = 'https://vendoor.ng/store/api/admin-login'

export const getAdminToken    = () => Cookies.get('adm_jwt') ?? null
export const saveAdminToken   = (token: string, refresh: string) => {
  Cookies.set('adm_jwt',     token,   { expires: 7,  sameSite: 'lax' })
  Cookies.set('adm_refresh', refresh, { expires: 30, sameSite: 'lax' })
}
export const clearAdminTokens = () => {
  Cookies.remove('adm_jwt')
  Cookies.remove('adm_refresh')
  Cookies.remove('adm_profile')
}
export const isAdminLoggedIn  = () => !!getAdminToken()

// ── Axios instance with auto-attach token ─────────────────────────
const adminClient = axios.create({
  baseURL: ADMIN_BASE,
  headers: { 'Content-Type': 'application/json' },
})

adminClient.interceptors.request.use(cfg => {
  const token = getAdminToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Redirect to login on 401
adminClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      clearAdminTokens()
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

// ── Generic POST helper ───────────────────────────────────────────
async function post<T = any>(payload: Record<string, unknown>): Promise<T> {
  const res = await adminClient.post('', payload)
  return res.data
}

// ── Auth ──────────────────────────────────────────────────────────
export const adminAuth = {
  login: (email: string, password: string) =>
    axios.post(LOGIN_URL, { email, password }).then(r => r.data),

  logout: () => clearAdminTokens(),

  getProfile: () => post({ action: 'get_profile' }),

  editProfile: (name: string, email: string, password?: string) =>
    post({ action: 'edit_profile', name, email, ...(password ? { password } : {}) }),

  changePassword: (old_password: string, new_password: string, confirm_password: string) =>
    post({ action: 'change_admin_password', old_password, new_password, confirm_password }),
}

// ── Dashboard & Analytics ─────────────────────────────────────────
export const adminDashboard = {
  getStats:     () => post({ action: 'get_stats_overview' }),
  getSalesChart:() => post({ action: 'get_sales_chart'   }),
}

// ── Vendor Management ─────────────────────────────────────────────
export const adminVendors = {
  listPending:  () => post({ action: 'list_pending_verifications' }),

  approve: (vendor_uuid: string) =>
    post({ action: 'approve_vendor', vendor_uuid }),

  reject: (vendor_uuid: string, reason: string) =>
    post({ action: 'reject_vendor', vendor_uuid, reason }),

  getVendor: (target_uuid: string) =>
    post({ action: 'get_vendor', target_uuid }),
}

// ── User Management ───────────────────────────────────────────────
export const adminUsers = {
  list: (page = 1, limit = 20, search = '') =>
    post({ action: 'get_users', page, limit, search }),

  block: (target_uuid: string) =>
    post({ action: 'block_user', target_uuid }),

  searchByPhone: (phone: string) =>
    post({ action: 'search_user', phone }),

  resetPassword: (user_uuid: string, new_password: string) =>
    post({ action: 'admin_reset_user_pass', user_uuid, new_password }),
}

// ── Orders ────────────────────────────────────────────────────────
export const adminOrders = {
  list: (params: { status?: string; search?: string; date_from?: string; date_to?: string } = {}) =>
    post({ action: 'manage_orders', ...params }),

  updateStatus: (order_uuid: string, status: string) =>
    post({ action: 'update_order_status', order_uuid, status }),

  exportCSV: async () => {
    const token = getAdminToken()
    const res = await axios.post(ADMIN_BASE, { action: 'export_orders' }, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      responseType: 'blob',
    })
    const url  = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', 'orders.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
}

// ── Financials ────────────────────────────────────────────────────
export const adminFinance = {
  listWithdrawals: () => post({ action: 'list_withdrawals' }),

  processWithdrawal: (withdrawal_id: number) =>
    post({ action: 'process_withdrawal', withdrawal_id }),

  setCommission: (rate: number) =>
    post({ action: 'set_commission', rate }),

  correctBalance: (user_uuid: string, amount: string) =>
    post({ action: 'correct_balance', user_uuid, amount }),
}

// ── Moderation ────────────────────────────────────────────────────
export const adminModeration = {
  deleteProduct: (product_uuid: string) =>
    post({ action: 'delete_product', product_uuid }),

  deleteReview: (id: number) =>
    post({ action: 'delete_review', id }),

  sendEmail: (target_uuid: string, subject: string, message: string) =>
    post({ action: 'send_email', target_uuid, subject, message }),

  viewLogs: () => post({ action: 'view_logs' }),
}
