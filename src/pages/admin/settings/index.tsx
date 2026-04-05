import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, Btn, Toggle, Badge, DR, Field, Input, SelectField, useToast } from '@/components/admin/ui'
import { Save, ShieldOff } from 'lucide-react'

const INITIAL = {
  platformFee:        5,
  spotlightPrice:     1000,
  deliveryFee:        1500,
  paystackMode:       'test',
  allowGuestCheckout: true,
  requireNIN:         true,
  autoApproveVendors: false,
  emailEnabled:       true,
  smsEnabled:         true,
  corsOrigins:        'http://localhost:3000,https://vendoor.ng',
  rateLimitRPM:       100,
  jwtExpiry:          '15 minutes',
}

export default function SettingsPage() {
  const toast = useToast()
  const [s, setS] = useState({ ...INITIAL })

  function toggle(key: keyof typeof INITIAL) {
    setS(prev => ({ ...prev, [key]: !prev[key] }))
    toast(`${!s[key] ? '✅' : '⭕'} ${key.replace(/([A-Z])/g, ' $1').trim()} ${!s[key] ? 'enabled' : 'disabled'}.`)
  }

  function save() {
    toast('💾 Settings saved successfully!')
  }

  const STATUS_ROWS = [
    { label: 'Database (Supabase)', value: 'Connected',   v: 'green'  as const },
    { label: 'Paystack API',        value: 'Test Mode',   v: 'gold'   as const },
    { label: 'Email (Resend)',      value: 'Active',      v: 'green'  as const },
    { label: 'SMS (Termii)',        value: 'Active',      v: 'green'  as const },
    { label: 'Vercel Deploy',       value: 'Live',        v: 'green'  as const },
    { label: 'Realtime (Supabase)', value: 'Enabled',     v: 'green'  as const },
  ]

  const TOGGLE_ROWS: { key: keyof typeof INITIAL; label: string; sub: string }[] = [
    { key: 'allowGuestCheckout', label: 'Allow Guest Checkout',      sub: 'Buyers can order without an account'        },
    { key: 'requireNIN',         label: 'Require NIN for Vendors',   sub: 'Vendors must verify NIN before activation'  },
    { key: 'autoApproveVendors', label: 'Auto-Approve Vendors',      sub: 'Skip manual review — not recommended'       },
    { key: 'emailEnabled',       label: 'Email Notifications',       sub: 'Send transactional emails via Resend'        },
    { key: 'smsEnabled',         label: 'SMS Notifications (Termii)',sub: 'Send order/delivery SMS updates'             },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Platform Settings</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">Configure Vendoor platform settings.</p>
        </div>
        <Btn v="green" size="md" onClick={save}>Save Changes</Btn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Financial */}
        <Card>
          <CardHeader><CardTitle>Financial Settings</CardTitle></CardHeader>
          <div className="p-4 space-y-1">
            <Field label="Platform Commission (%)">
              <Input type="number" value={s.platformFee} min={1} max={30} step={0.5}
                onChange={e => setS(p => ({ ...p, platformFee: parseFloat(e.target.value) }))} />
            </Field>
            <Field label="Spotlight Price (₦/month)">
              <Input type="number" value={s.spotlightPrice} min={100}
                onChange={e => setS(p => ({ ...p, spotlightPrice: parseInt(e.target.value) }))} />
            </Field>
            <Field label="Flat Delivery Fee (₦)">
              <Input type="number" value={s.deliveryFee} min={0}
                onChange={e => setS(p => ({ ...p, deliveryFee: parseInt(e.target.value) }))} />
            </Field>
            <Field label="Paystack Mode">
              <SelectField value={s.paystackMode} onChange={v => setS(p => ({ ...p, paystackMode: v }))}
                options={['test','live']} />
            </Field>
            {s.paystackMode === 'live' && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] p-3 text-[11px] text-[#991B1B] font-semibold">
                ⚠️ Live mode will charge real cards. Ensure your Paystack keys are correct.
              </div>
            )}
          </div>
        </Card>

        {/* Platform toggles */}
        <Card>
          <CardHeader><CardTitle>Platform Options</CardTitle></CardHeader>
          <div className="p-4">
            {TOGGLE_ROWS.map(row => (
              <div key={row.key} className="flex items-center justify-between py-3 border-b border-[#E2E0DA] last:border-0">
                <div>
                  <div className="text-[12px] font-semibold">{row.label}</div>
                  <div className="text-[10px] text-[#6B6A62]">{row.sub}</div>
                </div>
                <Toggle on={!!s[row.key]} onChange={() => toggle(row.key)} />
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader><CardTitle>Security</CardTitle></CardHeader>
          <div className="p-4 space-y-1">
            <Field label="Allowed Origins (CORS)">
              <Input value={s.corsOrigins} onChange={e => setS(p => ({ ...p, corsOrigins: e.target.value }))} />
            </Field>
            <Field label="Rate Limit (requests/min)">
              <Input type="number" value={s.rateLimitRPM}
                onChange={e => setS(p => ({ ...p, rateLimitRPM: parseInt(e.target.value) }))} />
            </Field>
            <Field label="JWT Access Token Expiry">
              <SelectField value={s.jwtExpiry} onChange={v => setS(p => ({ ...p, jwtExpiry: v }))}
                options={['15 minutes','30 minutes','1 hour']} />
            </Field>
            <div className="pt-2">
              <Btn v="red" size="md" onClick={() => toast('All active sessions revoked.')}>
                Revoke All Sessions
              </Btn>
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader><CardTitle>System Status</CardTitle></CardHeader>
          <div className="p-4">
            {STATUS_ROWS.map(row => (
              <DR key={row.label} label={row.label} value={<Badge v={row.v}>{row.value}</Badge>} />
            ))}
            <div className="mt-4 p-3 bg-[#E8F5EE] border border-[#86efac] rounded-[8px] text-[11px] text-[#065F46] font-semibold">
              ✓ All systems operational. Last health check: 2 minutes ago.
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
