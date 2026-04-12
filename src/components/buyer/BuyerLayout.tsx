import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import BuyerHeader from './BuyerHeader'
import BottomNav from './BottomNav'
import CartDrawer from './CartDrawer'
import SignInSheet from './SignInSheet'
import { useAuthStore } from '@/store/auth'

export default function BuyerLayout() {
  const refreshIfNeeded = useAuthStore((s) => s.refreshIfNeeded)
  useEffect(() => {
    refreshIfNeeded()
    const t = setInterval(refreshIfNeeded, 60_000)
    return () => clearInterval(t)
  }, [refreshIfNeeded])

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <BuyerHeader />
      <main className="pb-[72px]">
        <Outlet />
      </main>
      <BottomNav />
      <CartDrawer />
      <SignInSheet />
    </div>
  )
}
