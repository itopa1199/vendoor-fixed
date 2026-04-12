import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdStorefront, MdArrowBack } from 'react-icons/md'
import { FaShoppingBag } from 'react-icons/fa'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { isValidEmail, isValidPhone, getDeviceInfo } from '@/lib/utils'
import type { AccountType } from '@/types'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup' | 'otp' | 'forgot' | 'reset_password'

export default function AuthPage() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated, isVendor } = useAuthStore()

  const [mode, setMode] = useState<Mode>( 'signin')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form States
  const [su, setSu] = useState({ name: '', email: '', phone: '', password: '', confirm: '', account_type: 'user' as AccountType })
  const [si, setSi] = useState({ contact: '', password: '', by: 'email' as 'email' | 'phone' })
  const [otp, setOtp] = useState({ code: '', email: '', purpose: 'signup' as 'signup' | 'forgot' })
  const [reset, setReset] = useState({ password: '', confirm: '', uuid: '' })
  const [forgotEmail, setForgotEmail] = useState('')

  useEffect(() => {
    if (isAuthenticated()) navigate(isVendor() ? '/vendor/dashboard' : '/buyer', { replace: true })
  }, [isAuthenticated, isVendor, navigate])

  const go = (accountType: AccountType) => navigate(accountType === 'vendor' ? '/vendor/dashboard' : '/buyer')

  // --- VALIDATION ---
  const validateSu = () => {
    const e: Record<string, string> = {}
    if (!su.name.trim()) e.name = 'Required'
    if (!isValidEmail(su.email)) e.email = 'Valid email required'
    if (!isValidPhone(su.phone)) e.phone = 'Valid Nigerian phone required'
    if (su.password.length < 8) e.password = 'Min 8 characters'
    if (su.password !== su.confirm) e.confirm = 'Passwords do not match'
    setErrors(e); return !Object.keys(e).length
  }

  // --- ACTIONS ---
  const handleInitiateSignup = async () => {
    if (!validateSu()) {
        const firstError = Object.values(errors)[0] || 'Please check your details';
        toast.error(firstError);
        return;
    }
    setLoading(true)
    try {
      const res = await authApi.sendOtp(su.email)
      if (res.data.status) {
        setOtp({ code: '', email: su.email, purpose: 'signup' })
        setMode('otp')
        toast.success('Verification code sent')
      } else toast.error(res.data.message ?? 'Failed to send OTP')
    } catch (e: any) { toast.error(e.response?.data?.message ?? 'Service unavailable') } 
    finally { setLoading(false) }
  }

  const handleSignin = async () => {
    if (!si.contact.trim() || !si.password) { toast.error('Enter credentials'); return }
    setLoading(true)
    try {
      const res = await authApi.signIn({
        email: si.by === 'email' ? si.contact : '',
        phone: si.by === 'phone' ? si.contact : '',
        password: si.password,
        device_info: getDeviceInfo(),
      })
      if (res.data.status) {
        setAuth(res.data)
        toast.success(`Welcome back`)
        go(res.data.data.account_type)
      } else toast.error(res.data.message ?? 'Login failed')
    } catch (e: any) { toast.error('Invalid credentials') } 
    finally { setLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (otp.code.length < 4) { toast.error('Enter the code'); return }
    setLoading(true)
    try {
      const vRes : any = await authApi.verifyOtp({ email: otp.email, otp: otp.code })
      if (vRes.data.status && vRes.data.email_verification_uuid) {
        const uuid : any = vRes.data.email_verification_uuid
        if (otp.purpose === 'signup') {
          const sRes = await authApi.signUp({ ...su, email_verification_uuid: uuid })
          if (sRes?.data?.status) {
            toast.success(`Account created! Please login.`)
            setMode('signin')
          } else toast.error(sRes?.data?.message ?? 'Registration failed')
        } else {
          setReset(r => ({ ...r, uuid }))
          setMode('reset_password')
        }
      } else toast.error(vRes?.data?.message ?? 'Invalid OTP')
    } catch (e: any) { toast.error('Verification failed') } 
    finally { setLoading(false) }
  }

  const handleInitiateForgot = async () => {
    if (!isValidEmail(forgotEmail)) { toast.error('Enter a valid email'); return }
    setLoading(true)
    try {
      const res = await authApi.sendOtp(forgotEmail)
      if (res.data.status) {
        setOtp({ code: '', email: forgotEmail, purpose: 'forgot' })
        setMode('otp')
        toast.success('Reset code sent')
      } else toast.error('Failed to send code')
    } catch (e: any) { toast.error('Error sending code') } 
    finally { setLoading(false) }
  }

  const handleFinalReset = async () => {
    if (reset.password.length < 8) { toast.error('Min 8 characters'); return }
    if (reset.password !== reset.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await authApi.resetPassword({ 
        password: reset.password, 
        email_verification_uuid: reset.uuid 
      })
      if (res.data.status) {
        toast.success('Password updated! Please sign in.')
        setMode('signin')
      } else toast.error('Reset failed')
    } catch (e: any) { toast.error('Error resetting password') } 
    finally { setLoading(false) }
  }

  // --- SHARED UI STYLES ---
  const inputStyle = "w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[16px] font-medium outline-none focus:bg-white focus:border-orange-500 transition-all placeholder:text-gray-400 text-gray-900";
  const btnPrimary = "w-full py-4 bg-orange-600 text-white font-bold rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50 text-[16px]";
  const btnSecondary = "w-full py-3 bg-transparent text-orange-600 font-bold text-[14px]";

  return (
    <div className="min-h-screen bg-white md:bg-[#F2F2F7] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[34px] font-bold tracking-tight text-gray-900">
            Vend<span className="text-orange-500">oor</span>
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">Campus commerce, simplified.</p>
        </div>

        <div className="bg-white md:border md:border-gray-100 rounded-[32px] p-6 sm:p-8">
          
          {/* ── SIGN IN ── */}
          {mode === 'signin' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-[24px] font-bold mb-1">Sign In</h2>
              <p className="text-[14px] text-gray-500 mb-6 font-medium">
                New here? <button onClick={() => setMode('signup')} className="text-orange-600 font-bold">Create account</button>
              </p>
              
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                {(['email', 'phone'] as const).map((t) => (
                  <button key={t} onClick={() => setSi({ ...si, by: t, contact: '' })} 
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[13px] font-bold transition-all",
                      si.by === t ? "bg-white text-gray-900" : "text-gray-500"
                    )}>
                    {t === 'email' ? 'Email' : 'Phone'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <input type="text" value={si.contact} onChange={e => setSi({...si, contact: e.target.value})} placeholder={si.by === 'email' ? 'Email Address' : 'Phone Number'} className={inputStyle} />
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={si.password} onChange={e => setSi({...si, password: e.target.value})} placeholder="Password" className={inputStyle} />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-4 text-gray-400 text-xl">{showPass ? <MdVisibilityOff /> : <MdVisibility />}</button>
                </div>
              </div>

              <button onClick={() => setMode('forgot')} className="block w-full text-right text-[13px] text-orange-600 font-bold mt-3 mb-6">Forgot password?</button>
              <button onClick={handleSignin} disabled={loading} className={btnPrimary}>{loading ? 'Sign In...' : 'Sign In'}</button>
            </div>
          )}

          {/* ── SIGN UP ── */}
          {mode === 'signup' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[24px] font-bold mb-6">Create Account</h2>
              <div className="mb-6">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight mb-3 block ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'user', label: 'Buyer', icon: FaShoppingBag },
                    { value: 'vendor', label: 'Vendor', icon: MdStorefront },
                  ].map((at) => (
                    <button key={at.value} onClick={() => setSu((s) => ({ ...s, account_type: at.value as AccountType }))}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-2xl border transition-all",
                        su.account_type === at.value ? "border-orange-500 bg-orange-50/50" : "border-gray-100 bg-gray-50"
                      )}>
                      <at.icon size={22} className={su.account_type === at.value ? "text-orange-600" : "text-gray-400"} />
                      <span className={cn("text-[14px] font-bold mt-2", su.account_type === at.value ? "text-orange-700" : "text-gray-500")}>{at.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <input type="text" placeholder="Full Name" onChange={e => setSu({...su, name: e.target.value})} className={inputStyle} />
                <input type="email" placeholder="Email Address" onChange={e => setSu({...su, email: e.target.value})} className={inputStyle} />
                <input type="tel" placeholder="Phone Number" onChange={e => setSu({...su, phone: e.target.value})} className={inputStyle} />
                <input type="password" placeholder="Password" onChange={e => setSu({...su, password: e.target.value})} className={inputStyle} />
                <input type="password" placeholder="Confirm Password" onChange={e => setSu({...su, confirm: e.target.value})} className={inputStyle} />
              </div>

              <button onClick={handleInitiateSignup} disabled={loading} className={cn(btnPrimary, "mt-8")}>{loading ? 'Processing...' : 'Register'}</button>
              <button onClick={() => setMode('signin')} className={btnSecondary}>Already have an account? Sign in</button>
            </div>
          )}

          {/* ── OTP ── */}
          {mode === 'otp' && (
            <div className="text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdEmail size={28} className="text-orange-600" />
              </div>
              <h2 className="text-[22px] font-bold mb-2">Check your email</h2>
              <p className="text-[14px] text-gray-500 mb-8 font-medium">We sent a 6-digit code to <br/><span className="text-gray-900 font-bold">{otp.email}</span></p>
              <input type="text" value={otp.code} onChange={e => setOtp({...otp, code: e.target.value.replace(/\D/g, '')})} maxLength={6} 
                className="w-full bg-transparent text-center text-[42px] font-bold tracking-[0.2em] outline-none text-gray-900 mb-8 placeholder:text-gray-100" placeholder="000000" />
              <button onClick={handleVerifyOtp} disabled={loading || otp.code.length < 4} className={btnPrimary}>{loading ? 'Verifying...' : 'Verify Code'}</button>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <div className="text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdLock size={28} className="text-gray-900" />
              </div>
              <h2 className="text-[22px] font-bold mb-2">Forgot Password</h2>
              <p className="text-[14px] text-gray-500 mb-8 font-medium">Enter your email and we&apos;ll send you a code.</p>
              <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Email Address" className={inputStyle} />
              <button onClick={handleInitiateForgot} disabled={loading} className={cn(btnPrimary, "mt-6")}>{loading ? 'Sending...' : 'Send Code'}</button>
              <button onClick={() => setMode('signin')} className={btnSecondary}>Back to Sign In</button>
            </div>
          )}

          {/* ── RESET PASSWORD ── */}
          {mode === 'reset_password' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-[22px] font-bold text-center mb-6">New Password</h2>
              <div className="space-y-4">
                <input type="password" value={reset.password} onChange={e => setReset({...reset, password: e.target.value})} placeholder="New Password" className={inputStyle} />
                <input type="password" value={reset.confirm} onChange={e => setReset({...reset, confirm: e.target.value})} placeholder="Confirm Password" className={inputStyle} />
              </div>
              <button onClick={handleFinalReset} disabled={loading} className={cn(btnPrimary, "mt-8")}>{loading ? 'Updating...' : 'Update Password'}</button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button onClick={() => navigate('/buyer')} className="text-[14px] text-gray-400 font-semibold hover:text-gray-600 transition-colors">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}