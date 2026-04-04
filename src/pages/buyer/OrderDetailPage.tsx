import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  MdArrowBack, MdReceipt, MdLocalShipping, MdCheckCircle, 
  MdAccessTime, MdLocationOn, MdStorefront, MdChat, MdPrint,
  MdErrorOutline, MdPhone, MdEmail
} from 'react-icons/md'
import { orderApi } from '@/lib/api'
import { ngn, parseImages } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function OrderDetailsPage() {
  const { uuid } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetails()
  }, [uuid])

  const fetchOrderDetails = async () => {
    try {
      const res = await orderApi.history()
      if (res.data.status) {
        // Find the specific order from the array
        const foundOrder = res.data.orders.find((o: any) => o.order_uuid === uuid)
        setOrder(foundOrder)
      }
    } catch (err) {
      toast.error("Could not load order details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-12 h-12 border-4 border-[#F85606] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8F9FA]">
        <MdErrorOutline size={60} className="text-gray-200" />
        <p className="font-bold text-gray-500">Order Record Not Found</p>
        <button onClick={() => navigate(-1)} className="text-[#F85606] font-black underline text-[13px]">Return to History</button>
      </div>
    )
  }

  // Progress logic based on your API fields
  const steps = [
    { label: 'Paid', icon: <MdCheckCircle />, completed: order.status === 'paid' },
    { label: 'Processing', icon: <MdAccessTime />, completed: ['processing', 'shipped', 'delivered'].includes(order.logistics_status) },
    { label: 'Shipped', icon: <MdLocalShipping />, completed: ['shipped', 'delivered'].includes(order.logistics_status) },
    { label: 'Delivered', icon: <MdStorefront />, completed: order.logistics_status === 'delivered' },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <MdArrowBack size={24} />
          </button>
          <h1 className="font-[900] text-[13px] tracking-[2px] uppercase text-gray-400">Order Invoice</h1>
        
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Success Banner */}
        <div className="bg-white rounded-[32px] p-8 border border-green-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
            <MdCheckCircle size={48} />
          </div>
          <h2 className="text-[24px] font-[900] text-gray-900 tracking-tight">Payment {order.status}</h2>
          <p className="text-gray-500 text-[13px] mt-1 font-medium">Ref: <span className="font-mono text-black">{order.payment_txn}</span></p>
          <div className="mt-4 px-4 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
             ID: {uuid?.toString().slice(0, 15)}
          </div>
        </div>

        {/* Status Stepper */}
        <div className="bg-white rounded-[32px] p-8 border shadow-sm overflow-x-auto">
          <div className="flex justify-between relative min-w-[320px]">
            <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -z-0" />
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${step.completed ? 'bg-[#F85606] text-white scale-110' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                  {step.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step.completed ? 'text-[#F85606]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-[32px] overflow-hidden border shadow-sm">
          <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-black text-[12px] flex items-center gap-2 uppercase tracking-[2px] text-gray-400">
              <MdReceipt className="text-[#F85606]" size={18} /> Order Summary
            </h3>
            <span className="text-[12px] font-black text-gray-900 bg-white px-3 py-1 rounded-lg border">{order.items?.length || 0} Items</span>
          </div>
          
          <div className="divide-y divide-gray-100">
            {order.items?.map((item: any, idx: number) => {
              const images = parseImages(item.product_images);
              return (
                <div key={idx} className="p-6 flex gap-5 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                     <img 
                       src={images[0]} 
                       className="w-full h-full object-cover" 
                       alt={item.product_name} 
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-[800] truncate text-gray-900">{item.product_name}</h4>
                    <p className="text-[12px] font-bold text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-[900] text-gray-900">{ngn(item.price)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Final Pricing */}
          <div className="p-8 bg-gray-50/50 space-y-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-[14px] font-bold text-gray-400 uppercase tracking-widest">Total Amount Paid</span>
              <span className="text-[28px] font-[900] text-[#F85606]">{ngn(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[32px] p-8 border shadow-sm">
            <h3 className="text-[11px] font-black mb-5 uppercase tracking-[2px] text-gray-400 flex items-center gap-2">
              <MdLocationOn /> Delivery Address
            </h3>
            <p className="text-[15px] text-gray-800 leading-relaxed font-[700] italic border-l-4 border-[#F85606] pl-5 bg-gray-50 py-3 rounded-r-2xl">
              {order.billing_address}
            </p>
          </div>

          <div className="bg-white rounded-[32px] p-8 border shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[11px] font-black mb-4 uppercase tracking-[2px] text-gray-400 flex items-center gap-2">
                <MdStorefront /> Store Owner
              </h3>
              <p className="text-[18px] font-[900] text-gray-900">{order.items[0]?.vendor_name || 'Vendor'}</p>
              <div className="mt-3 space-y-1">
                <p className="text-[12px] font-bold text-gray-400 flex items-center gap-2"><MdEmail /> {order.items[0]?.vendor_email}</p>
                <p className="text-[12px] font-bold text-gray-400 flex items-center gap-2"><MdPhone /> {order.items[0]?.vendor_phone}</p>
              </div>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  )
}