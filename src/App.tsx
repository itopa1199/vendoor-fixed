import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// ── Always-loaded (tiny, needed immediately) ──────────────────────
import BuyerLayout from './components/buyer/BuyerLayout'
import NotFound from './pages/NotFound'

// ── Lazy chunks ───────────────────────────────────────────────────
// Auth
const AuthPage = lazy(() => import('./pages/auth/AuthPage'))

// Buyer
const BuyerHome         = lazy(() => import('./pages/buyer/BuyerHome'))
const CategoryPage      = lazy(() => import('./pages/buyer/CategoryPage'))
const ProductPage       = lazy(() => import('./pages/buyer/ProductPage'))
const SearchPage        = lazy(() => import('./pages/buyer/SearchPage'))
const CheckoutPage      = lazy(() => import('./pages/buyer/CheckoutPage'))
const SuccessPage       = lazy(() => import('./pages/buyer/SuccessPage'))
const OrdersPage        = lazy(() => import('./pages/buyer/OrdersPage'))
const OrderDetailPage   = lazy(() => import('./pages/buyer/OrderDetailPage'))
const VendorProfilePage = lazy(() => import('./pages/buyer/VendorProfilePage'))
const VendorsPage       = lazy(() => import('./pages/buyer/VendorsPage'))
const CategoriesPage    = lazy(() => import('./pages/buyer/CategoriesPage'))

// Vendor
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'))

// Admin — all in one lazy chunk (recharts lives here)
const AdminLayout       = lazy(() => import('./pages/admin/AdminLayout'))
const AdminLogin        = lazy(() => import('./pages/admin/login/index'))
const AdminDashboard    = lazy(() => import('./pages/admin/Dashboard'))
const AnalyticsPage     = lazy(() => import('./pages/admin/analytics/index'))
const PendingPage       = lazy(() => import('./pages/admin/pending/index'))
const AdminVendorsPage  = lazy(() => import('./pages/admin/vendors/index'))
const AdminProductsPage = lazy(() => import('./pages/admin/products/index'))
const UsersPage         = lazy(() => import('./pages/admin/users/index'))
const AdminOrdersPage   = lazy(() => import('./pages/admin/orders/index'))
const TransactionsPage  = lazy(() => import('./pages/admin/transactions/index'))
const PayoutsPage       = lazy(() => import('./pages/admin/payouts/index'))
const SpotlightPage     = lazy(() => import('./pages/admin/spotlight/index'))
const NotificationsPage = lazy(() => import('./pages/admin/notifications/index'))
const SettingsPage      = lazy(() => import('./pages/admin/settings/index'))

// ── Simple fullscreen spinner shown during chunk loads ────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="w-8 h-8 rounded-full border-[3px] border-[#F85606] border-t-transparent animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/buyer" replace />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Buyer storefront */}
        <Route path="/buyer" element={<BuyerLayout />}>
          <Route index element={<BuyerHome />} />
          <Route path="category/:slug"  element={<CategoryPage />} />
          <Route path="product/:uuid"   element={<ProductPage />} />
          <Route path="search"          element={<SearchPage />} />
          <Route path="checkout"        element={<CheckoutPage />} />
          <Route path="success"         element={<SuccessPage />} />
          <Route path="orders"          element={<OrdersPage />} />
          <Route path="orders/:uuid"    element={<OrderDetailPage />} />
          <Route path="vendor/:uuid"    element={<VendorProfilePage />} />
          <Route path="vendors"         element={<VendorsPage />} />
          <Route path="categories"      element={<CategoriesPage />} />
        </Route>

        {/* Vendor portal */}
        <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />

        {/* Admin portal */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                   element={<AdminDashboard />} />
          <Route path="analytics"        element={<AnalyticsPage />} />
          <Route path="pending"          element={<PendingPage />} />
          <Route path="vendors"          element={<AdminVendorsPage />} />
          <Route path="products"         element={<AdminProductsPage />} />
          <Route path="users"            element={<UsersPage />} />
          <Route path="orders"           element={<AdminOrdersPage />} />
          <Route path="transactions"     element={<TransactionsPage />} />
          <Route path="payouts"          element={<PayoutsPage />} />
          <Route path="spotlight"        element={<SpotlightPage />} />
          <Route path="notifications"    element={<NotificationsPage />} />
          <Route path="settings"         element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
