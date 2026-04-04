import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2,
  Star, Settings, LogOut, Menu, X, Plus, Edit2, Trash2,
  Upload, Send, MessageSquare, Check, XCircle, TrendingUp,
  DollarSign, ChevronRight, AlertCircle, ChevronDown,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Truck,
  Camera,
} from 'lucide-react'
import { vendorApi, profileApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { ngn, fileToBase64, cn } from '@/lib/utils'
import type { VendorProduct, IncomingOrder, VendorAnalytic, ChatMessage } from '@/types'
import { FaDumbbell, FaLaptop, FaLeaf, FaMale, FaMobileAlt, FaShoppingCart, FaSprayCan, FaTshirt } from 'react-icons/fa'
import { MdCheckCircle, MdHome } from 'react-icons/md'
import { BsDropletFill } from 'react-icons/bs'
import { PaystackButton } from 'react-paystack'

import React from 'react';
import { Store, User, ShieldCheck, Loader2 } from 'lucide-react';


const STATUS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}
const pill = (s: string) => STATUS[s?.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border border-gray-200'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'spotlight', label: 'Spotlight', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onChange, onLogout, user }: {
  active: string; onChange: (t: string) => void; onLogout: () => void
  user: { name?: string; email?: string } | null
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="text-[20px] font-[800] text-[#00853D]">
          Vend<span className="text-[#FFC200]">oor</span>
        </div>
        <p className="text-[11px] text-gray-400 font-[600] mt-[2px]">Vendor Portal</p>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-[2px]">
        <p className="text-[10px] font-[700] uppercase tracking-[0.1em] text-gray-400 px-3 mb-2">Main</p>
        {NAV.slice(0, 4).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={cn('w-full flex items-center gap-3 px-3 py-[11px] rounded-[8px] text-[14px] font-[600] transition-all',
              active === id ? 'bg-[#E8F7EF] text-[#00853D] font-[700]' : 'text-gray-600 hover:bg-gray-50')}>
            <Icon size={18} />
            {label}
            {active === id && <ChevronRight size={13} className="ml-auto" />}
          </button>
        ))}
        <p className="text-[10px] font-[700] uppercase tracking-[0.1em] text-gray-400 px-3 mb-2 mt-5">Store</p>
        {NAV.slice(4).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={cn('w-full flex items-center gap-3 px-3 py-[11px] rounded-[8px] text-[14px] font-[600] transition-all',
              active === id ? 'bg-[#E8F7EF] text-[#00853D] font-[700]' : 'text-gray-600 hover:bg-gray-50')}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-[8px] bg-gray-50 mb-2">
          <div className="w-8 h-8 rounded-[8px] bg-[#E8F7EF] flex items-center justify-center text-base flex-shrink-0">🏪</div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-[700] truncate">{user?.name ?? 'My Store'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-colors font-[600]">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const primary = NAV.slice(0, 4)
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 pb-[max(6px,env(safe-area-inset-bottom))]">
      <div className="flex justify-around">
        {primary.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={cn('flex flex-col items-center gap-[2px] px-3 pt-[6px] pb-1 text-[10px] font-[700] transition-colors',
              active === id ? 'text-[#00853D]' : 'text-gray-400')}>
            <Icon size={22} />
            {label}
          </button>
        ))}
        {/* "More" button for remaining tabs */}
        <MobileMoreMenu active={active} onChange={onChange} />
      </div>
    </div>
  )
}

function MobileMoreMenu({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const [open, setOpen] = useState(false)
  const extra = NAV.slice(4)
  const isActive = extra.some((n) => n.id === active)
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className={cn('flex flex-col items-center gap-[2px] px-3 pt-[6px] pb-1 text-[10px] font-[700] transition-colors',
          isActive ? 'text-[#00853D]' : 'text-gray-400')}>
        <ChevronDown size={22} />
        More
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[10]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-[110%] right-0 bg-white rounded-[12px] shadow-xl border border-gray-100 overflow-hidden z-[20] w-[160px]">
            {extra.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { onChange(id); setOpen(false) }}
                className={cn('w-full flex items-center gap-3 px-4 py-3 text-[14px] font-[600] transition-colors text-left',
                  active === id ? 'bg-[#E8F7EF] text-[#00853D]' : 'text-gray-700 hover:bg-gray-50')}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, earnings: 0 })
  const [orders, setOrders] = useState<IncomingOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([vendorApi.dashboard(), vendorApi.earnings(), vendorApi.incomingOrders()])
      .then(([d, e, o]) => {
        console.log('incoming orders', o.data)
        setStats({ orders: d.data.orders ?? 0, revenue: d.data.revenue ?? 0, products: d.data.products ?? 0, earnings: e.data.earnings ?? 0 })
        setOrders((o.data.orders ?? []).slice(0, 6))
      }).catch(() => { }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { icon: '📦', label: 'Orders', value: stats.orders.toLocaleString(), color: '#0066CC', bg: '#EEF5FF' },
    { icon: '💰', label: 'Revenue', value: ngn(stats.revenue), color: '#F85606', bg: '#FFF3EE' },
    { icon: '🛍️', label: 'Products', value: stats.products.toLocaleString(), color: '#7C3AED', bg: '#F5F3FF' },
    { icon: '💳', label: 'Earnings', value: ngn(stats.earnings), color: '#00853D', bg: '#E8F7EF' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-[800]">Dashboard Overview</h2>
        <p className="text-[13px] text-gray-500">Here's how your store is performing</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg mb-2" style={{ background: c.bg }}>{c.icon}</div>
            <p className="text-[11px] font-[700] text-gray-500 uppercase tracking-[.05em]">{c.label}</p>
            {loading
              ? <div className="skeleton h-6 w-3/4 mt-1 rounded-[6px]" />
              : <p className="text-[18px] sm:text-[22px] font-[800] mt-1 truncate" style={{ color: c.color }}>{c.value}</p>}
          </div>
        ))}
      </div>

      {/* Recent orders — card layout on mobile, table on md+ */}
      <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-[700] text-[15px]">Recent Orders</h3>
          <span className="text-[12px] text-gray-400">{orders.length} orders</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-[8px]" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <ShoppingCart size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-[600]">No orders yet</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {orders.map((o) => (
                <div key={o.order_uuid} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-[700] text-blue-600 truncate">{o.order_uuid.slice(0, 14)}…</p>
                    <p className="text-[12px] text-gray-600 mt-[2px]">{o.customer_name}</p>
                    <p className="text-[11px] text-gray-400 mt-[1px]">×{o.quantity} · {o.created_at}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-[900] text-[#F85606]">{ngn(o.price)}</p>
                    <span className={`text-[10px] font-[700] px-[8px] py-[2px] rounded-full mt-1 inline-block ${pill(o.status)}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50">
                  <tr>{['Order ID', 'Customer', 'Qty', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] text-gray-500 font-[700] uppercase tracking-[.04em]">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_uuid} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-[700] text-blue-600 text-[12px]">{o.order_uuid.slice(0, 12)}…</td>
                      <td className="px-5 py-3">{o.customer_name}</td>
                      <td className="px-5 py-3 text-gray-500">×{o.quantity}</td>
                      <td className="px-5 py-3 font-[800] text-[#F85606]">{ngn(o.price)}</td>
                      <td className="px-5 py-3"><span className={`text-[11px] font-[700] px-[10px] py-[3px] rounded-full ${pill(o.status)}`}>{o.status}</span></td>
                      <td className="px-5 py-3 text-gray-400 text-[12px]">{o.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Partial<VendorProduct> | false>(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<any>({ name: '', description: '', price: '', stock: '', categories: '', images: [] as string[] })

  const load = useCallback(() => {
    setLoading(true)
    vendorApi.myProducts().then((r) => setProducts(r.data.products ?? [])).catch(() => { }).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm({ name: '', description: '', price: '', stock: '', categories: '', images: [] }); setModal({}) }
  const openEdit = (p: VendorProduct) => {
    return
   // setForm({ name: p.name, description: p.description ?? '', price: String(p.price), stock: String(p.stock) })
    //setModal(p)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const b64 = await fileToBase64(file); const r = await profileApi.uploadImage(b64); setForm((f:any) => ({ ...f, images: [...f.images, r.data.imagePath] })); toast.success('Uploaded!') }
    catch { toast.error('Upload failed') } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error('Name and price required'); return }
    setSaving(true)
    console.log('form.categories', form.categories)
    try {
      const isEdit = !!(modal && (modal as VendorProduct).product_uuid)
      if (isEdit) {
        await vendorApi.editProduct({ product_uuid: (modal as VendorProduct).product_uuid, name: form.name, description: form.description, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 })
        toast.success('Updated!')
      } else {
        await vendorApi.addProduct({ name: form.name, description: form.description, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, images: form.images, categories: form.categories })
        toast.success('Product added!')
      }
      setModal(false); load()
    } catch (err:any) { toast.error(err?.message || 'Save failed') } finally { setSaving(false) }
  }

  const handleDelete = async (uuid: string) => {
    if (!confirm('Delete this product?')) return
    try { await vendorApi.deleteProduct(uuid); setProducts((p) => p.filter((x) => x.product_uuid !== uuid)); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  const CATEGORIES = [
    { slug: 'smartphones', label: 'Phones', icon: FaMobileAlt, color: '#0066CC' },
    { slug: 'laptops', label: 'Laptops', icon: FaLaptop, color: '#7C3AED' },
    { slug: 'womens-clothing', label: "Women's", icon: FaTshirt, color: '#E01D1D' },
    { slug: 'mens-clothing', label: "Men's", icon: FaMale, color: '#1A1A1A' },
    { slug: 'beauty', label: 'Beauty', icon: FaSprayCan, color: '#F85606' },
    { slug: 'groceries', label: 'Groceries', icon: FaShoppingCart, color: '#00853D' },
    { slug: 'home-decoration', label: 'Home', icon: MdHome, color: '#B45309' },
    { slug: 'sports-accessories', label: 'Sports', icon: FaDumbbell, color: '#0066CC' },
    { slug: 'fragrances', label: 'Fragrances', icon: FaLeaf, color: '#7C3AED' },
    { slug: 'skin-care', label: 'Skincare', icon: BsDropletFill, color: '#0891B2' },
  ]

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-[800]">My Products</h2>
          <p className="text-[13px] text-gray-500">{products.length} products listed</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-[10px] bg-[#00853D] text-white text-[13px] font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors">
          <Plus size={15} /> Add Product
        </button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
        className="w-full px-4 py-[11px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors bg-white mb-4" />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-[170px] rounded-[12px]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[14px] p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100">
          <Package size={44} className="mx-auto mb-4 text-gray-300" />
          <p className="font-[700] text-[15px] mb-2">{search ? 'No matches' : 'No products yet'}</p>
          {!search && <button onClick={openAdd} className="mt-2 px-5 py-[10px] bg-[#00853D] text-white font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors text-[13px]">Add First Product</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((p:any) => (
            <div key={p.product_uuid} className="bg-white rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 group">
              <div className="h-[110px] sm:h-[130px] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                {JSON.parse(p.images)?.[0] ? <img src={JSON.parse(p.images)[0]} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-3xl opacity-20">📦</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100"><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(p.product_uuid)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[12px] sm:text-[13px] font-[700] truncate">{p.name}</p>
                <p className="text-[13px] sm:text-[15px] font-[900] text-[#00853D]">{ngn(p.price)}</p>
                <p className="text-[11px] text-gray-400">Stock: {p.stock}</p>
              </div>
            </div>
          ))}
        </div>
      )}

   {/* Modal / Bottom Sheet */}
{modal !== false && (
  <div className="fixed inset-0 z-[400] flex items-end justify-center transition-opacity duration-300" style={{position:'absolute',bottom:0}}>
    
    {/* Backdrop: High-end blur + dim */}
    <div 
      className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
      onClick={() => setModal(false)} 
    />

    {/* The Sheet */}
    <div className="bg-white rounded-t-[32px] w-full sm:max-w-[540px] relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] 
                    animate-in slide-in-from-bottom-[100%] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    flex flex-col max-h-[96vh]">
      
      {/* iOS Drag Indicator Area */}
      <div className="flex flex-col items-center pt-3 pb-2 sticky top-0 bg-white z-20 rounded-t-[32px]">
        <div className="w-10 h-1.5 bg-gray-200 rounded-full mb-2" />
        
        {/* Header Content */}
        <div className="w-full px-6 flex items-center justify-between">
          <div>
            <h3 className="text-[22px] font-[900] tracking-tight text-gray-900">
              {(modal as VendorProduct).product_uuid ? 'Edit Product' : 'New Product'}
            </h3>
            <p className="text-[13px] text-gray-400 font-medium italic-none">Fill in the product details</p>
          </div>
          <button
            onClick={() => setModal(false)}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 active:scale-90 transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-7 custom-scrollbar pb-[120px]">
        
        {/* Basic Inputs */}
        <div className="grid grid-cols-1 gap-5">
          {[
            { label: 'Product Name *', key: 'name', placeholder: 'e.g. iPhone 15 Pro', type: 'text' },
            { label: 'Price (₦) *', key: 'price', placeholder: '0.00', type: 'number' },
            { label: 'Available Stock', key: 'stock', placeholder: '1', type: 'number' },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-[11px] font-[800] text-gray-400 uppercase tracking-widest ml-1">
                {label}
              </label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm((f:any) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[20px] text-[16px] font-semibold outline-none focus:border-[#00853D] focus:bg-white transition-all placeholder:text-gray-300"
              />
            </div>
          ))}
        </div>

        {/* Categories Section */}
        <div className="space-y-3">
          <label className="block text-[11px] font-[800] text-gray-400 uppercase tracking-widest ml-1">
            Select Category *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = form.categories.includes(cat.slug);
              return (
                <button
                  key={cat.slug}
                  onClick={() => setForm((f:any) => ({ ...f, categories: [cat.slug] }))}
                  className={`flex items-center gap-3 p-3.5 rounded-[22px] border-2 transition-all active:scale-95 ${isSelected
                    ? 'border-[#00853D] bg-[#00853D]/5 text-[#00853D]'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                >
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#00853D] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <cat.icon size={16} />
                  </div>
                  <span className="text-[14px] font-bold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-[800] text-gray-400 uppercase tracking-widest ml-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f:any) => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Tell customers about your product..."
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-[22px] text-[16px] font-semibold outline-none focus:border-[#00853D] focus:bg-white resize-none transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Image Upload Area */}
        <div className="space-y-3">
          <label className="block text-[11px] font-[800] text-gray-400 uppercase tracking-widest ml-1">
            Product Images
          </label>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 shrink-0 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#00853D] hover:text-[#00853D] transition-all bg-white active:scale-90"
            >
              <Upload size={24} />
              <span className="text-[10px] font-black uppercase">Add Image</span>
            </button>

            {form.images.map((url:any, i:any) => (
              <div key={i} className="relative shrink-0 group">
                <img src={url} alt="" className="w-24 h-24 rounded-[24px] object-cover border border-gray-100" />
                <button
                  onClick={() => setForm((f:any) => ({ ...f, images: f.images.filter((_:any, j: any) => j !== i) }))}
                  className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-75 transition-transform"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
      </div>

      {/* Floating Footer: Apple Music Style */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex gap-4 z-30">
        <button
          onClick={() => setModal(false)}
          className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-[22px] active:scale-95 transition-all"
        >
          Dismiss
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.price || form.categories.length === 0}
          className="flex-[2] py-4 bg-[#00853D] text-white font-[900] rounded-[22px] shadow-xl shadow-[#00853D]/20 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
        >
          {saving ? 'Processing...' : (modal as VendorProduct).product_uuid ? 'Update' : 'Publish'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

function OrderManagementView({ order, onBack, onAction, onChat }: any) {
  // Local state to track which specific button is loading
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = async (fn: () => Promise<unknown>, status: string) => {
    setActiveAction(status);
    await onAction(fn, order.order_uuid, status);
    setActiveAction(null);
    // Data is refreshed via the 'act' function in the parent OrdersTab
  };

  // Vendor gets 97% of the total
  const vendorEarnings = (order.price * order.quantity) * 0.97;

  return (
    <div className="animate-in slide-in-from-right duration-300 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm shrink-0">
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold text-gray-800">Order Details</h2>
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full animate-pulse",
              order.status === 'pending' ? 'bg-amber-500' : 'bg-green-500')}
            />
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none">
              Status: {order.status}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Management Sidebar */}
        <div className="space-y-4 order-first lg:order-last">
          <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Actions</h3>

            <div className="space-y-3">


              {order.status != 'completed' && (
                <button
                  disabled={!!activeAction}
                  onClick={() => handleAction(() => vendorApi.updateDelivery(order.order_uuid, 'shipping'), 'shipping')}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-[16px] flex items-center justify-center gap-2 active:scale-95 transition-all">
                  {activeAction === 'shipped' ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
                  Mark as Shipping
                </button>
              )}

              {order.status != 'completed' && (
                <button
                  disabled={!!activeAction}
                  onClick={() => handleAction(() => vendorApi.updateDelivery(order.order_uuid, 'completed'), 'completed')}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-[16px] flex items-center justify-center gap-2 active:scale-95 transition-all">
                  {activeAction === 'delivered' ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Confirm Delivered
                </button>
              )}

              <button onClick={onChat} className="w-full py-4 bg-gray-50 text-gray-600 font-bold rounded-[16px] flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                <MessageSquare size={18} /> Contact Customer
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-[24px] p-5 text-white shadow-xl shadow-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <ShieldCheck size={16} className="text-green-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount Paid</span>
            </div>
            <p className="text-[13px] font-semibold text-gray-300">Amount Received (97%)</p>
            <p className="text-[24px] font-bold text-green-400 mt-1">{ngn(vendorEarnings)}</p>
            <p className="text-[10px] text-gray-500 mt-2">Platform fee (3%) already deducted.</p>
          </div>
        </div>

        {/* 2. Items & Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Product Details</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[18px]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-[14px] border border-gray-100 p-1 shrink-0">
                  <img src={order.product_image} className="w-full h-full object-cover rounded-[10px]" alt="" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-gray-800 truncate">{order.product_name}</p>
                  <p className="text-[12px] text-gray-500 font-semibold">Qty: {order.quantity} × {ngn(order.price)}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[15px] font-bold text-gray-800">{ngn(order.price * order.quantity)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Logistics & Shipping</h3>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-gray-800">{order.customer_name}</p>
                <p className="text-[13px] text-gray-500 font-semibold">{order.customer_phone || 'No phone recorded'}</p>

                <div className="mt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Delivery Instructions</p>
                  <p className="text-[14px] text-gray-600 bg-gray-50 p-4 rounded-[16px] border border-gray-100 leading-relaxed font-medium">
                    {order.delivery_address || 'Standard delivery. No special notes.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}


function OrdersTab() {
  const [orders, setOrders] = useState<IncomingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null) // New View State
  const [chatOrder, setChatOrder] = useState<IncomingOrder | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = () => {
    setLoading(true)
    vendorApi.incomingOrders()
      .then((r) => setOrders(r.data.orders ?? []))
      .catch(() => { })
      .finally(() => setLoading(false))
  }

  const act = async (fn: () => Promise<unknown>, uuid: string, newStatus: string) => {
    try {
      await fn();
      setOrders((prev) => prev.map((o) => o.order_uuid === uuid ? { ...o, status: newStatus } : o));
      // Update selected order in real-time if open
      if (selectedOrder?.order_uuid === uuid) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Order ${newStatus}`)
    }
    catch { toast.error('Action failed') }
  }

  const FILTERS = ['all', 'pending', 'accepted', 'shipped', 'delivered', 'rejected']
  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  // If an order is selected, show the Management View instead of the list
  if (selectedOrder) {
    return <OrderManagementView
      order={selectedOrder}
      onBack={() => setSelectedOrder(null)}
      onAction={act}
      onChat={() => setChatOrder(selectedOrder)}
    />
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[24px] font-[900] tracking-tight">Incoming Orders</h2>
          <p className="text-[14px] text-gray-500 font-medium">{orders.length} total transactions</p>
        </div>
        <button onClick={fetchOrders} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-2 rounded-[12px] text-[12px] font-[800] whitespace-nowrap transition-all capitalize border-2',
              filter === f ? 'bg-[#00853D] border-[#00853D] text-white shadow-lg shadow-green-100' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200')}>
            {f} ({orders.filter((o) => f === 'all' ? true : o.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 w-full bg-gray-50 animate-pulse rounded-[20px]" />)}</div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-[24px] p-16 text-center border-2 border-dashed border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <ShoppingCart size={30} />
          </div>
          <p className="font-[800] text-gray-400 uppercase text-[12px] tracking-widest">No {filter !== 'all' ? filter : ''} orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {visible.map((o) => (
            <div
              key={o.order_uuid}
              onClick={() => setSelectedOrder(o)}
              className="bg-white rounded-[22px] p-5 border border-gray-100 hover:border-[#00853D] transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-[15px] flex items-center justify-center text-[#00853D] group-hover:bg-[#00853D] group-hover:text-white transition-colors">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-[14px] font-[900] text-gray-900">{o.customer_name}</p>
                    <p className="text-[12px] text-gray-400 font-bold uppercase tracking-tighter">ID: {o.order_uuid.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-[900] text-[#F85606]">{ngn(o.price * o.quantity)}</p>
                  <span className={cn("text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest", pill(o.status))}>
                    {o.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {chatOrder && <ChatModal order={chatOrder} onClose={() => setChatOrder(null)} />}
    </div>
  )
}

// ─── CHAT MODAL ───────────────────────────────────────────────────────────────
function ChatModal({ order, onClose }: { order: IncomingOrder; onClose: () => void }) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    vendorApi.getChat(order.order_uuid).then((r) => setMessages(r.data.messages ?? [])).catch(() => { })
  }, [order.order_uuid])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !user?.uuid) return
    setSending(true)
    try {
      await vendorApi.sendMessage({ order_uuid: order.order_uuid, sender_uuid: user.uuid, receiver_uuid: order.product_uuid, message: text.trim() })
      setMessages((m) => [...m, { order_uuid: order.order_uuid, sender_uuid: user.uuid, receiver_uuid: order.product_uuid, message: text.trim(), created_at: new Date().toISOString() }])
      setText('')
    } catch { toast.error('Send failed') } finally { setSending(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-[20px] sm:rounded-[20px] w-full sm:max-w-[460px] flex flex-col shadow-2xl" style={{ height: '80vh', maxHeight: '560px' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="font-[800] text-[15px]">{order.customer_name}</p>
            <p className="text-[12px] text-gray-400">Order {order.order_uuid.slice(0, 14)}…</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[8px] bg-gray-100 flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 && <p className="text-[13px] text-gray-400 text-center py-8">No messages yet</p>}
          {messages.map((m, i) => {
            const isMe = m.sender_uuid === user?.uuid
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] px-4 py-[9px] rounded-[14px] text-[13px] ${isMe ? 'bg-[#00853D] text-white rounded-br-[4px]' : 'bg-gray-100 text-gray-800 rounded-bl-[4px]'}`}>
                  <p>{m.message}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="flex-1 px-3 py-[10px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors" />
          <button onClick={handleSend} disabled={sending || !text.trim()}
            className="w-10 h-10 bg-[#00853D] text-white rounded-[10px] flex items-center justify-center hover:bg-[#006b31] disabled:opacity-50 transition-colors flex-shrink-0">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<VendorAnalytic[]>([])
  const [earnings, setEarnings] = useState(0)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    Promise.all([vendorApi.analytics(), vendorApi.earnings()])
      .then(([a, e]) => { setAnalytics(a.data.analytics ?? []); setEarnings(e.data.earnings ?? 0) })
      .catch(() => { }).finally(() => setLoading(false))
  }, [])

  const handleWithdraw = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    if (amt > earnings) { toast.error('Amount exceeds earnings'); return }
    setWithdrawing(true)
    try { await vendorApi.withdraw(amt); toast.success('Withdrawal requested!'); setEarnings((e) => e - amt); setAmount('') }
    catch { toast.error('Withdrawal failed') } finally { setWithdrawing(false) }
  }

  const maxRev = Math.max(...analytics.map((d) => d.revenue), 1)
  const totalRev = analytics.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-[800]">Sales Analytics</h2>
        <p className="text-[13px] text-gray-500">Track your revenue and withdraw earnings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: <DollarSign size={18} />, label: 'Available Earnings', value: ngn(earnings), color: '#00853D', bg: '#E8F7EF' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100">
            <div className="w-9 h-9 rounded-[8px] flex items-center justify-center mb-3" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <p className="text-[12px] font-[700] text-gray-500 uppercase tracking-[.05em]">{c.label}</p>
            {loading ? <div className="skeleton h-6 w-3/4 mt-1 rounded" /> : <p className="text-[22px] font-[800] mt-1" style={{ color: c.color }}>{c.value}</p>}
          </div>
        ))}
      </div>

      {/* Withdraw */}
      <div className="bg-gradient-to-r from-[#00853D] to-[#006b31] rounded-[14px] p-5">
        <h3 className="text-white font-[800] text-[16px] mb-1">Withdraw Earnings</h3>
        <p className="text-white/70 text-[13px] mb-4">Available: <strong className="text-white">{ngn(earnings)}</strong></p>
        <div className="flex gap-3 flex-wrap">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 min-w-[140px] px-4 py-[11px] bg-white/20 border border-white/30 rounded-[10px] text-white placeholder-white/60 text-[14px] outline-none focus:bg-white/30 transition-colors" />
          <button onClick={handleWithdraw} disabled={withdrawing || !amount}
            className="px-5 py-[11px] bg-[#FFC200] text-black font-[800] text-[13px] rounded-[10px] hover:bg-[#e6af00] transition-colors disabled:opacity-60">
            {withdrawing ? '…' : 'Withdraw →'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 p-5">
        <h3 className="font-[700] text-[15px] mb-4">Revenue by Date</h3>
        {loading ? <div className="skeleton h-[140px] rounded-[8px]" />
          : analytics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[140px] text-gray-400">
              <BarChart2 size={36} className="mb-2 opacity-30" />
              <p className="font-[600] text-[14px]">No sales data yet</p>
            </div>
          ) : (
            <div className="flex items-end gap-[3px] sm:gap-[4px] h-[140px]">
              {analytics.slice(-20).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-[700] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                    {ngn(d.revenue)}
                  </div>
                  <div className="w-full bg-[#00853D] rounded-t-[3px] hover:bg-[#006b31] transition-colors cursor-pointer"
                    style={{ height: `${Math.max((d.revenue / maxRev) * 100, 4)}%` }} />
                  <span className="text-[8px] text-gray-400 font-[600] hidden sm:block">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
function MessagesTab() {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<ChatMessage[]>([])
  const [selected, setSelected] = useState<ChatMessage | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'chat'>('list')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    vendorApi.recentChats().then((r) => setChats(r.data.messages ?? [])).catch(() => { }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected?.order_uuid) return
    vendorApi.getChat(selected.order_uuid).then((r) => setMessages(r.data.messages ?? [])).catch(() => { })
  }, [selected?.order_uuid])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const selectChat = (c: ChatMessage) => { setSelected(c); setView('chat') }

  const handleSend = async () => {
    if (!text.trim() || !selected || !user?.uuid) return
    setSending(true)
    const receiver = selected.sender_uuid === user.uuid ? selected.receiver_uuid : selected.sender_uuid
    try {
      await vendorApi.sendMessage({ order_uuid: selected.order_uuid, sender_uuid: user.uuid, receiver_uuid: receiver, message: text.trim() })
      setMessages((m) => [...m, { order_uuid: selected.order_uuid, sender_uuid: user.uuid, receiver_uuid: receiver, message: text.trim(), created_at: new Date().toISOString() }])
      setText('')
    } catch { toast.error('Send failed') } finally { setSending(false) }
  }

  const uniqueChats = Object.values(chats.reduce((acc, m) => { acc[m.order_uuid] = m; return acc }, {} as Record<string, ChatMessage>))

  const ConvoList = () => (
    <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="font-[700] text-[15px]">Conversations</p>
      </div>
      {loading && <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 rounded-[8px]" />)}</div>}
      {!loading && uniqueChats.length === 0 && (
        <div className="p-10 text-center text-gray-400">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-[600]">No conversations yet</p>
        </div>
      )}
      {uniqueChats.map((c) => (
        <button key={c.order_uuid} onClick={() => selectChat(c)}
          className={cn('w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 text-left transition-colors',
            selected?.order_uuid === c.order_uuid && 'bg-[#E8F7EF]')}>
          <div className="w-9 h-9 rounded-full bg-[#E8F7EF] flex items-center justify-center text-base flex-shrink-0">💬</div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-[700] truncate">Order {c.order_uuid.slice(0, 10)}…</p>
            <p className="text-[12px] text-gray-400 truncate">{c.message}</p>
          </div>
        </button>
      ))}
    </div>
  )

  const ChatView = () => (
    <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 overflow-hidden flex flex-col" style={{ height: '500px' }}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => setView('list')} className="md:hidden w-8 h-8 rounded-[8px] bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ChevronRight size={15} className="rotate-180" />
        </button>
        <p className="font-[700] text-[14px] truncate">Order {selected?.order_uuid.slice(0, 14)}…</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m, i) => {
          const isMe = m.sender_uuid === user?.uuid
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-4 py-[9px] rounded-[14px] text-[13px] ${isMe ? 'bg-[#00853D] text-white rounded-br-[4px]' : 'bg-gray-100 text-gray-800 rounded-bl-[4px]'}`}>
                <p>{m.message}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date(m.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message…"
          className="flex-1 px-3 py-[10px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors" />
        <button onClick={handleSend} disabled={sending || !text.trim()}
          className="w-10 h-10 bg-[#00853D] text-white rounded-[10px] flex items-center justify-center hover:bg-[#006b31] disabled:opacity-50 transition-colors flex-shrink-0">
          <Send size={15} />
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[20px] font-[800]">Messages</h2>
        <p className="text-[13px] text-gray-500">Chat with your customers</p>
      </div>
      {/* Mobile: show list or chat depending on state */}
      <div className="md:hidden">
        {view === 'list' ? <ConvoList /> : <ChatView />}
      </div>
      {/* Desktop: side by side */}
      <div className="hidden md:grid md:grid-cols-[240px_1fr] gap-4 items-start">
        <ConvoList />
        {selected ? <ChatView /> : (
          <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 h-[500px] flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare size={44} className="mx-auto mb-3 opacity-20" />
              <p className="font-[600]">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SPOTLIGHT ────────────────────────────────────────────────────────────────
function SpotlightTab() {
  const [active, setActive] = useState(false)
  return (
    <div className="max-w-[620px]">
      <div className="mb-4">
        <h2 className="text-[20px] font-[800]">Spotlight</h2>
        <p className="text-[13px] text-gray-500">Boost your store visibility across Vendoor</p>
        <p className="text-[13px] text-gray-500">COMING SOON ON VENDOOR!</p>
      </div>
      <div className={`rounded-[18px] p-6 text-white mb-5 ${active ? 'bg-gradient-to-br from-[#00853D] to-[#006b31]' : 'bg-gradient-to-br from-[#1a1a2e] to-[#0f3460]'}`}>
        <div className="text-3xl mb-3">{active ? '⭐' : '🚀'}</div>
        <h3 className="text-[20px] font-[800] mb-2">{active ? "You're a Spotlight Vendor!" : 'Boost with Spotlight'}</h3>
        <p className="text-white/80 text-[14px] leading-[1.7] mb-5">
          {active ? 'Your store is featured on the homepage, search results, and category pages.' : 'Get featured on the homepage, rank higher in search, and reach thousands more buyers daily.'}
        </p>
        {!active && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {['🏠 Homepage feature', '🔍 Priority in search', '✅ Verified badge', '📊 Analytics boost'].map((f) => (
              <div key={f} className="text-[13px] text-white/90 bg-white/10 px-3 py-2 rounded-[8px]">{f}</div>
            ))}
          </div>
        )}
        {!active
          ? <button onClick={() => {
            {
              toast.error("Not available at the moment")
              //setActive(true); toast.success('🌟 Spotlight activated!')
            }
          }} className="px-6 py-3 bg-[#FFC200] text-black font-[800] rounded-[10px] hover:bg-[#e6af00] transition-colors">Get Spotlight — ₦5,000/month</button>
          : <button className="px-6 py-3 bg-white/20 text-white font-[700] text-[13px] rounded-[10px]">Manage Subscription</button>}
      </div>
    </div>
  )
}


 function SettingsTab() {
  const { user, setAuth, token, tokenExpiry, refreshToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Data States
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', account_details: '', profile_photo: '' });
  const [store, setStore] = useState({ store_name: '', store_description: '', business_hours: '' });
  const [verif, setVerif] = useState({
    business_name: '', business_category: '', document_url: '',
    status: '', next_billing: '', payment_ref: '' 
  });

  const [uploading, setUploading] = useState(false)

  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'profile' | 'store' | 'verify'>('profile');
  const PK = import.meta.env.VITE_PAYSTACK_KEY || "";
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const t = toast.loading("Uploading photo...");
    try {
      const b64 = await fileToBase64(file);
      const r = await profileApi.uploadImage(b64);
      if (r.data?.imagePath) {
        setProfile(p => ({ ...p, profile_photo: r.data.imagePath }));
        toast.success('Photo uploaded!', { id: t });
      }
    } catch {
      toast.error('Upload failed', { id: t });
    } finally {
      setUploading(false);
    }
  };

  const init = async () => {
    try {
      setLoading(true);

      const res = await vendorApi.settingsData();
      if (res.data.status) {
        setProfile(res.data.data.profile);
        setStore(res.data.data.store);
        setVerif(res.data.data.verify);
      }
    } catch (e) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };
  // 1. Fetch Hydration Data
  useEffect(() => {
   
    init();
  }, []);

  // 2. Verification Submission Logic
  const [v, setV] = useState(false)
  const handleVerifSubmit = async (ref: string) => {
    setSaving(true);
    const t = toast.loading("Finalizing subscription...");
    try {
      const res = await vendorApi.submitVerification({ ...verif, payment_ref: ref });
      if (res.data.status) {
        toast.success("Submitted successfully!", { id: t });
        setVerif(v => ({ ...v, payment_ref: '', status: 'pending' }));
        init();
      } else {
        setVerif(v => ({ ...v, payment_ref: ref })); // Save ref for retry
        toast.error(res.data.message || "Failed to save details", { id: t });
      }
    } catch (err) {
      setVerif(v => ({ ...v, payment_ref: ref }));
      toast.error("Network error. Payment is safe, please retry.", { id: t });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#00853D]" size={32} />
      <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Loading Settings</p>
    </div>
  );

  const inp = "w-full px-4 py-[14px] bg-gray-50 border-2 border-transparent rounded-[16px] text-[15px] font-semibold outline-none focus:border-[#00853D] focus:bg-white transition-all placeholder:text-gray-300";

  return (
    <div className="max-w-[580px] pb-24">
      <div className="mb-8">
        <h2 className="text-[26px] font-[900] tracking-tight text-gray-900">Settings</h2>
        <p className="text-[14px] text-gray-500 font-medium">Manage your vendor profile and subscription</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-[20px] p-[6px] mb-8 shadow-inner">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'store', label: 'Store', icon: Store },
          { id: 'verify', label: 'Verify', icon: ShieldCheck }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-[10px] rounded-[15px] text-[13px] font-[800] transition-all",
              tab === t.id ? "bg-white shadow-md text-[#00853D]" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[28px] border border-gray-100 p-6 sm:p-8 shadow-sm">

        {/* TAB: PROFILE */}
        {tab === 'profile' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-4">

              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[32px] bg-gray-100 overflow-hidden border-4 border-white shadow-sm">
                    {profile.profile_photo ? (
                      <img src={profile.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#00853D] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-transform border-4 border-white">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                </div>
                <p className="mt-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Store Representative</p>
              </div>

              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email Address', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'Business Address', key: 'business_address', type: 'text' },
                { label: 'Withdrawal Acct (Bank - Name - Number)', key: 'account_details', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-2 ml-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(profile as any)[f.key]}
                    onChange={(e) => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                    className={inp}
                  />
                </div>
              ))}
            </div>
            <button
              disabled={saving || uploading}
              onClick={async () => {
                setSaving(true);
                try {
                  // This now sends the name, email, phone, address AND profile_photo
                  await profileApi.update(profile);
                  toast.success("Profile Updated!");
                } catch {
                  toast.error("Update failed");
                } finally {
                  setSaving(false);
                }
              }}
              className="w-full py-4 bg-[#00853D] text-white font-bold rounded-[20px] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* TAB: STORE */}
        {tab === 'store' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-2 ml-1">Store Name</label>
                <input value={store.store_name} onChange={(e) => setStore(s => ({ ...s, store_name: e.target.value }))} className={inp} placeholder="Brand name" />
              </div>
              <div>
                <label className="block text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-2 ml-1">Store Description</label>
                <textarea rows={3} value={store.store_description} onChange={(e) => setStore(s => ({ ...s, store_description: e.target.value }))} className={inp + " resize-none"} placeholder="What do you sell?" />
              </div>
              <div>
                <label className="block text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-2 ml-1">Business Hours</label>
                <input value={store.business_hours} onChange={(e) => setStore(s => ({ ...s, business_hours: e.target.value }))} className={inp} placeholder="Mon-Sat, 9am - 9pm" />
              </div>
            </div>
            <button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await vendorApi.updateStore(store);
                  toast.success("Store info saved!");
                } catch { toast.error("Update failed") }
                finally { setSaving(false) }
              }}
              className="w-full py-4 bg-[#00853D] text-white font-[900] rounded-[20px] shadow-lg shadow-green-100 active:scale-95 transition-all"
            >
              {saving ? 'Saving...' : 'Save Store Info'}
            </button>
          </div>
        )}

        {/* TAB: VERIFY */}
        {tab === 'verify' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Status Header */}
            <div className="p-5 bg-gray-50 rounded-[22px] flex items-center justify-between border border-gray-100">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[.15em] mb-1">Account Status</p>
                <p className={cn("text-[17px] font-[900] capitalize",
                  verif.status === 'approved' ? 'text-[#00853D]' :
                    verif.status === 'pending' ? 'text-amber-500' : 'text-red-500')}>
                  {verif.status || 'Not Verified'}
                </p>
              </div>
              {verif.next_billing && (
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[.15em] mb-1">Next Billing</p>
                  <p className="text-[14px] font-bold text-gray-700">{new Date(verif.next_billing).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-2 ml-1">Business Name *</label>
                <input value={verif.business_name} onChange={(e) => setVerif(v => ({ ...v, business_name: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="block text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-2 ml-1">Business Category *</label>
                <select value={verif.business_category} onChange={(e) => setVerif(v => ({ ...v, business_category: e.target.value }))} className={inp + " cursor-pointer font-bold"}>
                  <option value="">Select Category</option>
                  {['Food/Restaurant', 'Fashion', 'Electronics', 'Groceries', 'Beauty', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-[900] text-gray-400 uppercase tracking-widest mb-2 ml-1">ID/CAC Document Link</label>
                <input value={verif.document_url} onChange={(e) => setVerif(v => ({ ...v, document_url: e.target.value }))} className={inp} placeholder="https://..." />
              </div>
            </div>

            {/* Persistent Payment Info */}
            {verif.payment_ref && (
              <div className="p-4 bg-orange-50 rounded-[18px] border border-orange-100 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">PAID: {verif.payment_ref}</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              {(!verif.business_name || !verif.business_category) ? (
                <button
                  onClick={() => toast.error("Fill Business Name and Category")}
                  className="w-full py-4 bg-gray-100 text-gray-400 rounded-[20px] font-[900] uppercase tracking-widest cursor-not-allowed"
                >
                  Pay {ngn(1000)} & Subscribe
                </button>
              ) : verif.payment_ref ? (
                <button
                  disabled={saving}
                  onClick={() => handleVerifSubmit(verif.payment_ref)}
                  className="w-full py-4 bg-[#F85606] text-white rounded-[20px] font-[900] shadow-lg shadow-orange-100 active:scale-95 transition-all animate-pulse"
                >
                  {saving ? 'Finalizing...' : 'Finish Submission'}
                </button>
              ) : (
                <PaystackButton
                  {...{
                    email: user?.email || '',
                    amount: 1000 * 100,
                    publicKey: PK,
                    text: `PAY ${ngn(1000)} & SUBSCRIBE`,
                    onSuccess: (res: any) => handleVerifSubmit(res.reference),
                    onClose: () => toast.error("Payment closed")
                  }}
                  className="w-full py-4 bg-[#00853D] text-white rounded-[20px] font-[900] shadow-lg shadow-green-100 active:scale-95 transition-all"
                />
              )}
            </div>
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Monthly Billing via Paystack</p>
          </div>
        )}
      </div>
    </div>
  );
}
// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isVendor, clearAuth } = useAuthStore()
  const [tab, setTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/auth', { replace: true }); return }
    if (!isVendor()) { navigate('/buyer', { replace: true }) }
  }, []) // eslint-disable-line

  const handleLogout = () => { clearAuth(); navigate('/auth') }
  const changeTab = (t: string) => { setTab(t); setSidebarOpen(false) }

  const renderTab = () => {
    switch (tab) {
      case 'overview': return <OverviewTab />
      case 'products': return <ProductsTab />
      case 'orders': return <OrdersTab />
      case 'analytics': return <AnalyticsTab />
      case 'messages': return <MessagesTab />
      case 'spotlight': return <SpotlightTab />
      case 'settings': return <SettingsTab />
      default: return <OverviewTab />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r border-gray-100">
        <Sidebar active={tab} onChange={changeTab} onLogout={handleLogout} user={user} />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[200]" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-[260px] z-[201] shadow-2xl">
            <Sidebar active={tab} onChange={changeTab} onLogout={handleLogout} user={user} />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="h-[56px] bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1 rounded-[6px] hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="text-[16px] sm:text-[17px] font-[800]">
              {NAV.find((n) => n.id === tab)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500 hidden sm:block truncate max-w-[120px]">{user?.name}</span>
            <button onClick={() => changeTab('spotlight')}
              className="bg-[#FFC200] text-black text-[11px] sm:text-[12px] font-[800] px-2 sm:px-3 py-[5px] sm:py-[6px] rounded-[6px] hover:bg-[#e6af00] transition-colors">
              ⭐ Spotlight
            </button>
          </div>
        </div>

        {/* Page content — padding for mobile bottom nav */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 pb-[80px] md:pb-6">
          <div className="page-enter max-w-[1200px]">{renderTab()}</div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav active={tab} onChange={changeTab} />
    </div>
  )
}
