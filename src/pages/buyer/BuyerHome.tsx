import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdLocalShipping, MdVerified, MdStorefront,
  MdHome, MdChevronLeft, MdChevronRight,
} from 'react-icons/md'
import {
  FaMobileAlt, FaLaptop, FaTshirt, FaMale, FaSprayCan,
  FaShoppingCart, FaDumbbell, FaLeaf, FaStar,
} from 'react-icons/fa'
import { BsDropletFill } from 'react-icons/bs'
import { productsApi, vendorsApi } from '@/lib/api'
import type { Product, Vendor } from '@/types'
import ProductCard from '@/components/buyer/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { ngn, dedupe, cn } from '@/lib/utils'

// ── Slides: desktop SVG + mobile SVG ──────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    desktopSvg: '/banner1.svg',   // Vendor_ADS.svg  (1406×460)
    mobileSvg:  '/banner-mob1.svg', // Property_1_vendor_ads_mob_1.svg (353×151)
    cat: 'smartphones',
  },
  {
    id: 2,
    desktopSvg: '/banner2.svg',   // Vendor_ADS_2.svg (1406×460)
    mobileSvg:  '/banner-mob2.svg', // Property_1_vendor_ads_mob_2.svg (353×151)
    cat: 'laptops',
  },
]

const CATEGORIES = [
  { slug: 'smartphones',      label: 'Gadgets',      icon: FaMobileAlt,  color: '#7C3AED', bg: '#F3F0FF' },
  { slug: 'womens-clothing',  label: 'Clothing',     icon: FaTshirt,     color: '#E01D1D', bg: '#FFF0F0' },
  { slug: 'groceries',        label: 'Groceries',    icon: FaShoppingCart,color:'#00853D', bg: '#F0FFF6' },
  { slug: 'sports-accessories',label:'Sports',       icon: FaDumbbell,   color: '#0066CC', bg: '#F0F5FF' },
  { slug: 'beauty',           label: 'Beauty',       icon: FaSprayCan,   color: '#F85606', bg: '#FFF3EE' },
  { slug: 'laptops',          label: 'Electronics',  icon: FaLaptop,     color: '#7C3AED', bg: '#F3F0FF' },
  { slug: 'home-decoration',  label: 'Home & Acce...', icon: MdHome,     color: '#B45309', bg: '#FFF8EE' },
]

const SECTIONS = [
  { label: 'Phones & Tablets',    cat: 'smartphones'    },
  { label: 'Laptops & Computing', cat: 'laptops'        },
  { label: 'Fashion',             cat: 'womens-clothing'},
  { label: 'Beauty & Health',     cat: 'beauty'         },
  { label: 'Groceries & Food',    cat: 'groceries'      },
]

export default function BuyerHomePage() {
  const navigate = useNavigate()
  const [heroIdx, setHeroIdx]           = useState(0)
  const [prods, setProds]               = useState<Record<string, Product[]>>({})
  const [loading, setLoading]           = useState<Record<string, boolean>>({})
  const [vendors, setVendors]           = useState<Vendor[]>([])
  const [vendorsLoading, setVendorsLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setHeroIdx(i => (i + 1) % SLIDES.length), 4500)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    SECTIONS.forEach(async ({ cat }) => {
      setLoading(l => ({ ...l, [cat]: true }))
      try {
        const r = await productsApi.fetch({ category: cat, limit: 10 })
        setProds(p => ({ ...p, [cat]: dedupe(r.data.products ?? [], 'product_uuid') }))
      } catch { } finally { setLoading(l => ({ ...l, [cat]: false })) }
    })
    vendorsApi.browse()
      .then(r => setVendors(r.data.vendors ?? []))
      .catch(() => {})
      .finally(() => setVendorsLoading(false))
  }, [])

  const goSlide = (i: number) => { setHeroIdx(i); startTimer() }

  return (
    <div className="page-enter bg-[#F2F2F2] min-h-screen">

      {/* ── Hero Banner ──────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-3">
        <div className="relative overflow-hidden rounded-[18px]">
          {/* Each slide stacked — only active one visible */}
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className="transition-opacity duration-500"
              style={{ display: i === heroIdx ? 'block' : 'none' }}
              onClick={() => navigate(`/buyer/category/${s.cat}`)}
            >
              {/* Mobile */}
              <img
                src={s.mobileSvg}
                alt="banner"
                className="block sm:hidden w-full h-auto rounded-[18px] select-none cursor-pointer"
              />
              {/* Desktop */}
              <img
                src={s.desktopSvg}
                alt="banner"
                className="hidden sm:block w-full h-auto rounded-[18px] select-none cursor-pointer"
              />
            </div>
          ))}

          {/* Arrows */}
          <button
            onClick={() => goSlide((heroIdx - 1 + SLIDES.length) % SLIDES.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 backdrop-blur flex items-center justify-center text-white z-10"
          >
            <MdChevronLeft size={18} />
          </button>
          <button
            onClick={() => goSlide((heroIdx + 1) % SLIDES.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/20 backdrop-blur flex items-center justify-center text-white z-10"
          >
            <MdChevronRight size={18} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-[6px] mt-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className={cn(
                'h-[5px] rounded-full transition-all duration-300',
                heroIdx === i ? 'w-[22px] bg-[#F85606]' : 'w-[5px] bg-gray-300'
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Vendoor Stores ───────────────────────────────────────────── */}
      <div className="bg-white mx-3 rounded-[16px] mb-3 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-[800] text-[15px] flex items-center gap-2">
            <FaStar className="text-[#FFC200]" size={14} /> Vendoor Stores
          </h2>
          <button onClick={() => navigate('/buyer/vendors')} className="text-[12px] font-[700] text-[#F85606]">
            See all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {vendorsLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-[12px] border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-[90px] bg-gray-100 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />
                </div>
                <div className="p-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-gray-100 rounded w-1/2 mb-3" />
                  <div className="h-7 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))
          ) : vendors.length === 0 ? (
            <p className="col-span-2 text-[13px] text-gray-400 py-4 text-center">No vendors yet.</p>
          ) : (
            vendors.slice(0, 6).map(v => (
              <div
                key={v.uuid}
                className="rounded-[12px] border border-gray-100 overflow-hidden bg-white"
              >
                {/* Photo area */}
                <div className="h-[90px] bg-gray-50 flex items-center justify-center">
                  {v.profile_photo
                    ? <img src={v.profile_photo} alt={v.name} className="w-14 h-14 rounded-full object-cover" />
                    : <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                        <MdStorefront size={28} className="text-gray-400" />
                      </div>
                  }
                </div>
                {/* Info */}
                <div className="px-3 pt-2 pb-3">
                  <p className="text-[13px] font-[800] truncate">{v.name}</p>
                  <p className="text-[10px] text-gray-400 font-[500] flex items-center gap-[3px] mb-2">
                    <MdVerified size={10} className="text-[#00853D]" /> VERIFIED VENDOR
                  </p>
                  <button
                    onClick={() => navigate(`/buyer/vendor/${v.uuid}`)}
                    className="w-full text-[11px] font-[700] text-[#F85606] border border-[#F85606] rounded-full py-[5px] hover:bg-[#F85606] hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    Visit <span>→</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Shop by Category ─────────────────────────────────────────── */}
      <div className="bg-white mx-3 rounded-[16px] mb-3 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-[800] text-[15px]">Shop by Category</h2>
          <button onClick={() => navigate('/buyer/categories')} className="text-[12px] font-[700] text-[#F85606]">All →</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map(c => {
            const Icon = c.icon
            return (
              <button key={c.slug} onClick={() => navigate(`/buyer/category/${c.slug}`)}
                className="flex flex-col items-center gap-[6px]">
                <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center" style={{ background: c.bg }}>
                  <Icon size={22} style={{ color: c.color }} />
                </div>
                <span className="text-[10px] font-[600] text-center leading-[1.2] text-gray-700 w-full truncate">{c.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Trust badges ─────────────────────────────────────────────── */}
      <div className="bg-white mx-3 rounded-[16px] mb-3 px-4 py-4 grid grid-cols-3 gap-3">
        {[
          { icon: MdLocalShipping, label: 'Fast Delivery',   sub: 'Same-day orders',  color: '#0066CC' },
          { icon: MdVerified,      label: 'Verified Vendors',sub: 'Trusted sellers',  color: '#00853D' },
          { icon: FaStar,          label: '5-Star Service',  sub: 'Rated by buyers',  color: '#F85606' },
        ].map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: color + '18' }}>
              <Icon size={20} style={{ color }} />
            </div>
            <p className="text-[11px] font-[700]">{label}</p>
            <p className="text-[10px] text-[#757575]">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Product sections ─────────────────────────────────────────── */}
      {SECTIONS.map(({ label, cat }) => (
        <div key={cat} className="bg-white mx-3 rounded-[16px] mb-3">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="font-[800] text-[15px]">{label}</h2>
            <button
              onClick={() => navigate(`/buyer/category/${cat}`)}
              className="bg-[#F85606] text-white text-[11px] font-[800] px-[14px] py-[5px] rounded-full hover:bg-[#e84e05] transition-colors"
            >
              See all
            </button>
          </div>
          <div className="scroll-x px-4 pb-4 pt-1">
            {loading[cat]
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[170px]"><ProductCardSkeleton /></div>
                ))
              : (prods[cat] ?? []).map(p => (
                  <div key={p.product_uuid} className="flex-shrink-0 w-[170px]"><ProductCard product={p} /></div>
                ))
            }
          </div>
        </div>
      ))}

      <div className="h-4" />
    </div>
  )
}
