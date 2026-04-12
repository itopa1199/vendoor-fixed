import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdSearch, MdShoppingCart, MdPerson, MdStorefront, MdMenu, MdClose } from 'react-icons/md'
import { useCartStore } from '@/store/cart'
import { useUIStore } from '@/store/ui'
import { cn } from '@/lib/utils'

const CATS = [
  { slug: 'smartphones',        label: 'Phones'     },
  { slug: 'laptops',            label: 'Laptops'    },
  { slug: 'womens-clothing',    label: 'Fashion'    },
  { slug: 'beauty',             label: 'Beauty'     },
  { slug: 'groceries',          label: 'Groceries'  },
  { slug: 'home-decoration',    label: 'Home'       },
  { slug: 'sports-accessories', label: 'Sports'     },
  { slug: 'fragrances',         label: 'Fragrances' },
]

export default function BuyerHeader() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const count = useCartStore((s) => s.count())
  const { openCart, openSignIn } = useUIStore()
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) navigate(`/buyer/search?q=${encodeURIComponent(q.trim())}`)
  }

  const closeMenu = () => setMenuOpen(false)
  const goTo = (path: string) => { navigate(path); closeMenu() }

  return (
    <>
      <div className="bg-[#F85606] sticky top-0 z-[300]">

        {/* ── Row 1: hamburger | logo | cart (mobile) / full icons (desktop) ── */}
        <div className="flex items-center px-4 h-[52px] gap-3">

          {/* Hamburger — mobile only */}
          <button onClick={() => setMenuOpen(true)} className="md:hidden text-white flex-shrink-0">
            <MdMenu size={26} />
          </button>

          {/* Logo */}
          <button onClick={() => navigate('/buyer')}
            className="text-[22px] font-[900] text-white tracking-tight flex-shrink-0 leading-none">
            Vend<span className="text-[#FFC200]">oor</span>
          </button>

          <div className="flex-1" />

          {/* Desktop icons */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { icon: MdPerson,       label: 'Account', action: openSignIn,                          badge: 0     },
              { icon: MdShoppingCart, label: 'Cart',    action: openCart,                            badge: count },
              { icon: MdStorefront,   label: 'Sell',    action: () => navigate('/vendor/dashboard'), badge: 0     },
            ].map(({ icon: Icon, label, action, badge }) => (
              <button key={label} onClick={action}
                className="flex flex-col items-center gap-[1px] px-[10px] py-[5px] rounded-[6px] text-white hover:bg-white/15 transition-colors text-[10px] font-[800] whitespace-nowrap relative">
                <span className="relative">
                  <Icon size={23} />
                  {badge > 0 && (
                    <span className="absolute -top-[3px] -right-[3px] bg-[#FFC200] text-black text-[9px] font-[900] min-w-[15px] h-[15px] rounded-full px-[3px] flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Mobile: cart icon only */}
          <button onClick={openCart} className="md:hidden relative text-white flex-shrink-0">
            <MdShoppingCart size={26} />
            {count > 0 && (
              <span className="absolute -top-[4px] -right-[4px] bg-[#FFC200] text-black text-[9px] font-[900] min-w-[16px] h-[16px] rounded-full px-[3px] flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* ── Row 2: search bar (full width) ── */}
        <div className="px-4 pb-3">
          <form onSubmit={handleSearch}
            className="flex items-center bg-white rounded-[10px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,.15)]">
            <input
              type="text" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search Venddoor..."
              className="flex-1 border-none outline-none px-4 py-[10px] text-[14px] text-[#333] placeholder-[#ABABAB] min-w-0 bg-transparent"
            />
            <button type="submit"
              className="px-4 flex items-center justify-center text-[#ABABAB] hover:text-[#F85606] transition-colors flex-shrink-0">
              <MdSearch size={22} />
            </button>
          </form>
        </div>

        {/* ── Row 3: category strip — desktop only ── */}
        <div className="hidden md:block bg-white border-b border-[#E8E8E8]">
          <div className="max-w-[1280px] mx-auto px-[14px] flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATS.map((c) => (
              <button key={c.slug} onClick={() => navigate(`/buyer/category/${c.slug}`)}
                className={cn(
                  'px-[14px] py-[9px] text-[13px] font-[700] whitespace-nowrap border-b-2 transition-all flex-shrink-0',
                  pathname.includes(`/buyer/category/${c.slug}`)
                    ? 'text-[#F85606] border-[#F85606]'
                    : 'text-[#757575] border-transparent hover:text-[#F85606]'
                )}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Hamburger Drawer ───────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-[500]" onClick={closeMenu} />
      )}

      <div className={cn(
        'md:hidden fixed top-0 left-0 h-full w-[75vw] max-w-[320px] bg-white z-[600] flex flex-col transition-transform duration-300 ease-in-out',
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
          <span className="text-[20px] font-[900] text-[#F85606]">Menu</span>
          <button onClick={closeMenu} className="text-[#ABABAB]">
            <MdClose size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Categories */}
          <div className="px-5 pt-5 pb-2">
            <p className="text-[11px] font-[800] tracking-[.1em] text-[#ABABAB] uppercase mb-3">
              Categories
            </p>
            {CATS.map((c) => {
              const active = pathname.includes(`/buyer/category/${c.slug}`)
              return (
                <button key={c.slug} onClick={() => goTo(`/buyer/category/${c.slug}`)}
                  className={cn(
                    'w-full text-left px-4 py-[14px] rounded-[10px] text-[16px] font-[600] mb-1 transition-colors',
                    active ? 'bg-[#FFF3EE] text-[#F85606]' : 'text-[#1A1A1A] hover:bg-[#F8F8F8]'
                  )}>
                  {c.label}
                </button>
              )
            })}
          </div>

          <div className="h-[1px] bg-[#F0F0F0] mx-5 my-2" />

          {/* Account */}
          <div className="px-5 py-3">
            <button onClick={() => { openSignIn(); closeMenu() }}
              className="w-full flex items-center gap-3 px-4 py-[14px] bg-[#F8F8F8] rounded-[12px] text-[15px] font-[700] text-[#1A1A1A] hover:bg-[#F0F0F0] transition-colors">
              <MdPerson size={22} className="text-[#F85606]" />
              Account Settings
            </button>
          </div>

          {/* Become a Seller */}
          <div className="px-5 pb-5">
            <button onClick={() => goTo('/vendor/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-[14px] bg-[#F85606] rounded-[12px] text-[15px] font-[800] text-white hover:bg-[#e84e05] transition-colors">
              <MdStorefront size={22} />
              Become a Seller
            </button>
          </div>
        </div>

        <div className="border-t border-[#F0F0F0] py-3 text-center text-[11px] text-[#ABABAB]">
          vendoor.ng
        </div>
      </div>
    </>
  )
}
