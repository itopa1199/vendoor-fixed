import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  MdClose, MdShoppingCart, MdAdd, MdRemove, MdDelete,
  MdCloudUpload, MdLocationOn, MdArrowForward, MdInfoOutline,
  MdErrorOutline, MdRefresh
} from 'react-icons/md'
import { PaystackButton } from 'react-paystack'
import toast from 'react-hot-toast'
import { useUIStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'
import { useCart } from '@/hooks/useCart'
import { cartApi, billingApi, orderApi } from '@/lib/api'
import { parseImages, ngn } from '@/lib/utils'

type CartTab = 'local' | 'vendoor' | 'checkout'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { cartOpen, closeCart } = useUIStore()
  const { items: localItems, updateQuantity, removeFromCart, clearCart } = useCart()

  const [activeTab, setActiveTab] = useState<CartTab>('local')
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [vendoorItems, setVendoorItems] = useState<any[]>([])
  const [billingAddress, setBillingAddress] = useState('')

  const PK =  'pk_live_51a5bad8becf97ce624cdae76deced680a8b6695'

  const refreshData = useCallback(async (showLoader = false) => {
    if (!isAuthenticated()) return
    if (showLoader) setIsInitialLoading(true)
    try {
      const [cRes, bRes] = await Promise.all([cartApi.get(), billingApi.get()])
      if (cRes.data.status) setVendoorItems(cRes.data.cart)
      if ((bRes.data as any).status) setBillingAddress((bRes.data as any).billing_address || '')
    } catch { toast.error('Failed to sync with server') }
    finally { setIsInitialLoading(false) }
  }, [isAuthenticated])

  useEffect(() => {
    if (cartOpen) {
      if (isAuthenticated()) refreshData(true)
      if (localItems.length === 0 && isAuthenticated()) setActiveTab('vendoor')
    }
  }, [cartOpen, isAuthenticated, refreshData])

  const vendoorTotal = useMemo(() =>
    vendoorItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0),
  [vendoorItems])

  const handleSyncToVendoor = async () => {
    if (!isAuthenticated()) return navigate('/auth')
    setIsProcessing(true)
    const tid = toast.loading('Moving items to Vendoor...')
    try {
      for (const item of localItems) await cartApi.add(item.product_uuid, item.quantity)
      await refreshData()
      clearCart()
      setActiveTab('vendoor')
      toast.success('All items moved!', { id: tid })
    } catch { toast.error('Partial sync failure', { id: tid }) }
    finally { setIsProcessing(false) }
  }

  const handleVendoorUpdate = async (uuid: string, qty: number) => {
    if (qty < 1) return handleVendoorRemove(uuid)
    setUpdatingId(uuid)
    try { await cartApi.update(uuid, qty); await refreshData() }
    finally { setUpdatingId(null) }
  }

  const handleVendoorRemove = async (uuid: string) => {
    setUpdatingId(uuid)
    try { await cartApi.remove(uuid); await refreshData() }
    finally { setUpdatingId(null) }
  }

  const saveAddress = async () => {
    setIsProcessing(true)
    try { await billingApi.save(billingAddress); toast.success('Delivery address updated') }
    finally { setIsProcessing(false) }
  }

  const paystackConfig = {
    reference: `VND_${Date.now()}`,
    email: user?.email || '',
    amount: vendoorTotal * 100,
    publicKey: PK,
    text: 'SECURE PAYMENT',
    onSuccess: async (ref: any) => {
      setIsProcessing(true)
      const t = toast.loading('Verifying transaction...')
      try {
        const res = await orderApi.checkout(ref.reference)
        if (res.data.status) {
          toast.success('Order Placed!', { id: t })
          closeCart()
          navigate('/buyer/orders')
        }
      } finally { setIsProcessing(false) }
    },
    onClose: () => toast.error('Payment closed'),
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeCart} />
      <div className={`fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-[#F4F7F9] z-[501] flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.07,1)] ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-[700] flex flex-col items-center justify-center">
            <div className="w-14 h-14 border-4 border-gray-200 border-t-[#F85606] rounded-full animate-spin mb-4" />
            <span className="text-[14px] font-black text-gray-800 tracking-widest">PROCESSING</span>
          </div>
        )}

        <div className="bg-white p-5 border-b flex items-center justify-between shrink-0">
          <h2 className="text-[20px] font-[900] text-[#1A1A1A] flex items-center gap-2">
            <MdShoppingCart className="text-[#F85606]" /> Shopping Cart
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-all"><MdClose size={28} /></button>
        </div>

        <div className="flex bg-white p-2 border-b gap-1 shrink-0">
          {(['local', 'vendoor', 'checkout'] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 rounded-xl text-[11px] font-[900] uppercase tracking-tighter transition-all ${activeTab === t ? 'bg-[#F85606] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <MdRefresh size={40} className="animate-spin mb-2" />
              <p className="text-[13px] font-bold">Fetching your Vendoor Cart...</p>
            </div>
          ) : (
            <>
              {activeTab === 'local' && (
                <div className="space-y-4">
                  {localItems.length > 0 ? (
                    <>
                      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3">
                        <MdInfoOutline className="text-orange-500 shrink-0" size={20} />
                        <p className="text-[12px] text-orange-800 leading-tight">These items are saved in your browser. Move them to Vendoor to pay.</p>
                      </div>
                      {localItems.map(item => (
                        <ItemRow key={item.product_uuid} item={item} onUpdate={updateQuantity} onRemove={removeFromCart} />
                      ))}
                      <button onClick={handleSyncToVendoor}
                        className="w-full h-14 bg-[#F85606] text-white rounded-2xl font-black text-[14px]  flex items-center justify-center gap-2 mt-6">
                        CONTINUE
                      </button>
                    </>
                  ) : <EmptyState title="Local Cart Empty" />}
                </div>
              )}

              {activeTab === 'vendoor' && (
                <div className="space-y-4">
                  {vendoorItems.length > 0 ? (
                    <>
                      {vendoorItems.map(item => (
                        <ItemRow key={item.product_uuid} item={item}
                          isUpdating={updatingId === item.product_uuid}
                          onUpdate={handleVendoorUpdate} onRemove={handleVendoorRemove} />
                      ))}
                      <button onClick={() => setActiveTab('checkout')}
                        className="w-full h-14 bg-black text-white rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 mt-4">
                        PROCEED TO CHECKOUT <MdArrowForward />
                      </button>
                    </>
                  ) : <EmptyState title="Vendoor Cart Empty" />}
                </div>
              )}

              {activeTab === 'checkout' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="text-[14px] font-black mb-4 flex items-center gap-2"><MdLocationOn className="text-[#F85606]" /> DELIVERY ADDRESS</h3>
                    <div className="space-y-3">
                      <textarea
                        className="w-full bg-gray-50 border rounded-xl p-4 text-[13px] min-h-[100px] outline-none focus:ring-2 ring-orange-500/20"
                        placeholder="Hostel name, room number, and phone..."
                        value={billingAddress} onChange={e => setBillingAddress(e.target.value)} />
                      <button onClick={saveAddress} className="w-full bg-black text-white py-3 rounded-xl font-bold text-[12px]">Update Address</button>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border">
                    <h3 className="text-[14px] font-black mb-4">TOTAL PAYABLE</h3>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[32px] font-black text-[#F85606]">{ngn(vendoorTotal)}</span>
                      <span className="text-[12px] font-bold text-gray-400">{vendoorItems.length} Items</span>
                    </div>
                    {billingAddress && vendoorItems.length > 0 ? (
                      <PaystackButton {...paystackConfig}
                        className="w-full h-14 bg-[#00853D] text-white rounded-2xl font-black text-[16px] hover:scale-[1.02] transition-transform" />
                    ) : (
                      <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 text-red-600">
                        <MdErrorOutline size={20} />
                        <span className="text-[11px] font-bold">Complete address and add items to pay</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function ItemRow({ item, onUpdate, onRemove, isUpdating }: any) {
  const imgs = parseImages(item.images)
  return (
    <div className={`relative bg-white p-3 rounded-2xl border flex gap-4 transition-all ${isUpdating ? 'opacity-50 grayscale pointer-events-none' : 'hover:border-orange-200'}`}>
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/40">
          <div className="w-5 h-5 border-2 border-[#F85606] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
        {imgs[0] && <img src={imgs[0]} className="w-full h-full object-cover" alt={item.name} />}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <h4 className="text-[13px] font-black truncate">{item.name}</h4>
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-black text-[#F85606]">{ngn(item.price * item.quantity)}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 border rounded-lg overflow-hidden">
              <button onClick={() => onUpdate(item.product_uuid, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100"><MdRemove size={14} /></button>
              <span className="w-6 text-center text-[12px] font-black">{item.quantity}</span>
              <button onClick={() => onUpdate(item.product_uuid, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100"><MdAdd size={14} /></button>
            </div>
            <button onClick={() => onRemove(item.product_uuid)} className="p-1.5 text-gray-300 hover:text-red-500"><MdDelete size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center text-gray-300">
      <MdShoppingCart size={60} className="mb-4" />
      <span className="text-[14px] font-black uppercase tracking-widest">{title}</span>
    </div>
  )
}
