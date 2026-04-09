import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, Btn, Badge, DR, Field, Input, useToast } from '@/components/admin/ui'
import { adminAuth, adminFinance, clearAdminTokens } from '@/lib/admin-api'
import { useNavigate } from 'react-router-dom'
import { Save, ShieldOff } from 'lucide-react'

export default function SettingsPage() {
  const toast    = useToast()
  const navigate = useNavigate()

  // Commission
  const [rate,    setRate]    = useState('5')
  const [savingC, setSavingC] = useState(false)

  // Password change
  const [oldPass,  setOldPass]  = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [confPass, setConfPass] = useState('')
  const [savingP,  setSavingP]  = useState(false)

  // Profile
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [savingPr,setSavingPr]= useState(false)

  async function saveCommission() {
    setSavingC(true)
    try {
      const r = await adminFinance.setCommission(parseFloat(rate))
      toast(r.status ? '✅ Commission updated!' : `❌ ${r.message}`)
    } catch { toast('❌ Failed to update commission') }
    finally { setSavingC(false) }
  }

  async function changePassword() {
    if (newPass !== confPass) { toast('❌ Passwords do not match'); return }
    setSavingP(true)
    try {
      const r = await adminAuth.changePassword(oldPass, newPass, confPass)
      toast(r.status ? '✅ Password updated!' : `❌ ${r.message}`)
      if (r.status) { setOldPass(''); setNewPass(''); setConfPass('') }
    } catch { toast('❌ Failed to change password') }
    finally { setSavingP(false) }
  }

  async function saveProfile() {
    if (!name && !email) { toast('❌ Enter name or email'); return }
    setSavingPr(true)
    try {
      const r = await adminAuth.editProfile(name, email)
      toast(r.status ? '✅ Profile updated!' : `❌ ${r.message}`)
    } catch { toast('❌ Failed to update profile') }
    finally { setSavingPr(false) }
  }

  function logout() {
    clearAdminTokens()
    navigate('/admin/login', { replace: true })
  }

  const STATUS_ROWS = [
    { label: 'API Server',      value: 'vendoor.ng',  v: 'green' as const },
    { label: 'Paystack',        value: 'Connected',   v: 'green' as const },
    { label: 'Auth',            value: 'JWT Active',  v: 'green' as const },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Platform Settings</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Configure Vendoor platform settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Commission */}
        <Card>
          <CardHeader><CardTitle>Financial Settings</CardTitle></CardHeader>
          <div className="p-4 space-y-3">
            <Field label="Platform Commission (%)">
              <Input type="number" value={rate} min={0} max={30} step={0.5}
                onChange={e => setRate(e.target.value)} />
            </Field>
            <Btn v="green" size="md" onClick={saveCommission} disabled={savingC}>
              <Save size={13} /> {savingC ? 'Saving…' : 'Save Commission'}
            </Btn>
          </div>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader><CardTitle>Admin Profile</CardTitle></CardHeader>
          <div className="p-4 space-y-3">
            <Field label="Name"><Input placeholder="Admin Name" value={name} onChange={e => setName(e.target.value)} /></Field>
            <Field label="Email"><Input type="email" placeholder="admin@vendoor.ng" value={email} onChange={e => setEmail(e.target.value)} /></Field>
            <Btn v="green" size="md" onClick={saveProfile} disabled={savingPr}>
              <Save size={13} /> {savingPr ? 'Saving…' : 'Update Profile'}
            </Btn>
          </div>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <div className="p-4 space-y-3">
            <Field label="Current Password"><Input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="••••••••" /></Field>
            <Field label="New Password"><Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" /></Field>
            <Field label="Confirm New Password"><Input type="password" value={confPass} onChange={e => setConfPass(e.target.value)} placeholder="••••••••" /></Field>
            <Btn v="green" size="md" onClick={changePassword} disabled={savingP}>
              <Save size={13} /> {savingP ? 'Updating…' : 'Change Password'}
            </Btn>
          </div>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader><CardTitle>System Status</CardTitle></CardHeader>
          <div className="p-4">
            {STATUS_ROWS.map(row => (
              <DR key={row.label} label={row.label} value={<Badge v={row.v}>{row.value}</Badge>} />
            ))}
            <div className="mt-4 pt-3 border-t border-[#E2E0DA] flex gap-2">
              <Btn v="red" size="md" onClick={logout}>
                <ShieldOff size={13} /> Sign Out
              </Btn>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
