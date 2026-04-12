import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAuth, isAdminLoggedIn, saveAdminToken } from '@/lib/admin-api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (isAdminLoggedIn()) navigate('/admin', { replace: true })
  }, [navigate])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminAuth.login(email, password)
      if (res.status && res.token) {
        saveAdminToken(res.token, res.refresh_token ?? '')
        navigate('/admin', { replace: true })
      } else {
        setError(res.message || 'Login failed. Check your credentials.')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to reach server. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(150deg, #052A18 0%, #0A6E3F 100%)' }}>
      <div className="bg-white rounded-[16px] p-8 w-full max-w-[360px] shadow-[0_24px_80px_rgba(0,0,0,.3)]">
        <div className="text-[22px] font-black text-[#0A6E3F] mb-1">
          Vend<span className="text-[#D97706]">oor</span>
        </div>
        <div className="inline-block bg-[#FEF2F2] text-[#DC2626] text-[9px] font-bold px-2 py-0.5 rounded-full tracking-[.04em] mb-5">
          🔐 ADMIN PORTAL
        </div>

        <h1 className="text-[19px] font-bold mb-1">Admin Sign In</h1>
        <p className="text-[12px] text-[#6B6A62] mb-5">Secure access for administrators only.</p>

        <form onSubmit={login} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[.07em] text-[#6B6A62] mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@vendoor.ng"
              className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E0DA] rounded-[8px] text-[13px] outline-none focus:border-[#0A6E3F] transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[.07em] text-[#6B6A62] mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E0DA] rounded-[8px] text-[13px] outline-none focus:border-[#0A6E3F] transition-colors" />
          </div>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] px-3 py-2 text-[12px] text-[#DC2626]">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#0A6E3F] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#0D8A4F] transition-colors disabled:opacity-60 mt-2">
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  )
}
