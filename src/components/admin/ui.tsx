'use client'
import React from 'react'
import { clsx } from 'clsx'

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'red' | 'gold' | 'blue' | 'orange' | 'purple' | 'dim'

const BADGE_STYLES: Record<BadgeVariant, string> = {
  green:  'bg-[#E8F5EE] text-[#065F46]',
  red:    'bg-[#FEF2F2] text-[#991B1B]',
  gold:   'bg-[#FEF3C7] text-[#92400E]',
  blue:   'bg-[#EFF6FF] text-[#1E40AF]',
  orange: 'bg-[#FFF7ED] text-[#9A3412]',
  purple: 'bg-[#F5F3FF] text-[#5B21B6]',
  dim:    'bg-[#ECEAE4] text-[#6B6A62]',
}

export function Badge({ v, children }: { v: BadgeVariant; children: React.ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap', BADGE_STYLES[v])}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    active: 'green', approved: 'green', confirmed: 'green', delivered: 'green',
    done: 'green', success: 'green', paid: 'green',
    pending: 'gold', preparing: 'gold',
    processing: 'blue', out_for_delivery: 'blue',
    suspended: 'orange', refunded: 'orange',
    banned: 'red', cancelled: 'red', flagged: 'red', failed: 'red',
    expired: 'dim', inactive: 'dim',
  }
  const label = status.replace(/_/g, ' ')
  return <Badge v={map[status] || 'dim'}>{label}</Badge>
}

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'green' | 'red' | 'gold' | 'blue' | 'orange' | 'outline' | 'ghost'

const BTN_STYLES: Record<BtnVariant, string> = {
  green:   'bg-[#0A6E3F] text-white hover:bg-[#0D8A4F]',
  red:     'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#fee2e2]',
  gold:    'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] hover:bg-[#fef08a]',
  blue:    'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] hover:bg-[#dbeafe]',
  orange:  'bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA] hover:bg-[#ffedd5]',
  outline: 'bg-white text-[#6B6A62] border border-[#E2E0DA] hover:border-[#0A6E3F] hover:text-[#0A6E3F]',
  ghost:   'text-[#6B6A62] hover:bg-[#ECEAE4]',
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  v?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
}

export function Btn({ v = 'outline', size = 'sm', className, children, ...props }: BtnProps) {
  const sizes = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3 py-1.5 text-[12px]', lg: 'px-4 py-2 text-[13px]' }
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-1 rounded-md font-semibold transition-all duration-100 whitespace-nowrap',
        BTN_STYLES[v], sizes[size], className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white border border-[#E2E0DA] rounded-[10px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,.06),0_2px_8px_rgba(0,0,0,.04)]', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('px-4 py-3 border-b border-[#E2E0DA] flex items-center justify-between flex-wrap gap-2', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-bold">{children}</div>
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon:    React.ReactNode
  value:   string
  label:   string
  delta?:  number
  accent?: 'green' | 'gold' | 'red' | 'blue' | 'purple'
}

const ACCENT: Record<string, string> = {
  green:  'border-t-[#0A6E3F]',
  gold:   'border-t-[#D97706]',
  red:    'border-t-[#DC2626]',
  blue:   'border-t-[#2563EB]',
  purple: 'border-t-[#7C3AED]',
}

export function StatCard({ icon, value, label, delta, accent = 'green' }: StatCardProps) {
  const up = delta !== undefined && delta >= 0
  return (
    <div className={clsx('bg-white border border-[#E2E0DA] border-t-[3px] rounded-[10px] px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,.06)]', ACCENT[accent])}>
      <div className="text-lg mb-1.5">{icon}</div>
      <div className="text-[20px] font-extrabold leading-none">{value}</div>
      <div className="text-[11px] text-[#6B6A62] mt-1">{label}</div>
      {delta !== undefined && (
        <div className={clsx('text-[10px] font-semibold mt-1', up ? 'text-[#0A6E3F]' : 'text-[#DC2626]')}>
          {up ? '↑' : '↓'} {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto -webkit-overflow-scrolling-touch">{children}</div>
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AV_COLORS = ['#0A6E3F','#2563EB','#7C3AED','#D97706','#DC2626','#EA580C']
function avColor(name: string): string {
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return AV_COLORS[h % AV_COLORS.length]
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-[7px] flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: avColor(name), fontSize: Math.round(size * 0.4) }}
    >
      {name[0]?.toUpperCase()}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function Empty({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-[13px] font-semibold text-[#6B6A62]">{title}</div>
      {sub && <div className="text-[11px] text-[#A8A79F] mt-1">{sub}</div>}
    </div>
  )
}

// ─── Search + Filter bar ──────────────────────────────────────────────────────
export function SearchBar({
  placeholder, value, onChange,
}: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-[#E2E0DA] rounded-[8px] px-3 py-1.5 flex-1 min-w-[140px] focus-within:border-[#0A6E3F] transition-colors">
      <span className="text-[#A8A79F] text-[13px]">🔍</span>
      <input
        className="flex-1 border-none outline-none bg-transparent text-[12px] min-w-0"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button className="text-[#A8A79F] hover:text-[#6B6A62]" onClick={() => onChange('')}>✕</button>
      )}
    </div>
  )
}

export function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select
      className="px-3 py-2 border border-[#E2E0DA] rounded-[8px] text-[12px] bg-white text-[#1A1A18] outline-none cursor-pointer focus:border-[#0A6E3F] transition-colors"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open:     boolean
  onClose:  () => void
  title:    string
  wide?:    boolean
  children: React.ReactNode
  footer?:  React.ReactNode
}

export function Modal({ open, onClose, title, wide, children, footer }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/45 z-[800] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={clsx('bg-white rounded-[14px] flex flex-col overflow-hidden max-h-[88vh] animate-fadeIn', wide ? 'w-full max-w-[620px]' : 'w-full max-w-[480px]')}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-[#E2E0DA] flex items-center justify-between flex-shrink-0">
          <span className="text-[15px] font-bold">{title}</span>
          <button className="w-7 h-7 rounded-md bg-[#ECEAE4] flex items-center justify-center text-[13px] text-[#6B6A62] hover:bg-[#E2E0DA] transition-colors" onClick={onClose}>✕</button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-[#E2E0DA] flex gap-2 justify-end flex-shrink-0">{footer}</div>
        )}
      </div>
    </div>
  )
}

// ─── Details Row ──────────────────────────────────────────────────────────────
export function DR({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-[#E2E0DA] last:border-0 text-[12px]">
      <span className="text-[#6B6A62]">{label}</span>
      <span className="font-semibold text-right max-w-[60%]">{value}</span>
    </div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-bold uppercase tracking-[.07em] text-[#6B6A62] mb-1">{label}</label>
      {children}
    </div>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full px-3 py-2 border-[1.5px] border-[#E2E0DA] rounded-[8px] text-[12px] outline-none transition-colors focus:border-[#0A6E3F] bg-white"
      {...props}
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full px-3 py-2 border-[1.5px] border-[#E2E0DA] rounded-[8px] text-[12px] outline-none transition-colors focus:border-[#0A6E3F] bg-white resize-y min-h-[70px]"
      {...props}
    />
  )
}

export function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] | { label: string; value: string }[] }) {
  const normalized = options.map(o => typeof o === 'string' ? { label: o, value: o } : o)
  return (
    <select
      className="w-full px-3 py-2 border-[1.5px] border-[#E2E0DA] rounded-[8px] text-[12px] outline-none transition-colors focus:border-[#0A6E3F] bg-white cursor-pointer"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {normalized.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={clsx('toggle', on && 'on')} onClick={() => onChange(!on)} />
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
export function ProgBar({ pct, color = '#0A6E3F' }: { pct: number; color?: string }) {
  return (
    <div className="prog-bar">
      <div className="prog-fill" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  )
}

// ─── NIN Box ──────────────────────────────────────────────────────────────────
export function NINBox({ nin, verified }: { nin: string; verified: boolean }) {
  return (
    <div className="bg-[#F5F4F0] border-2 border-dashed border-[#E2E0DA] rounded-[10px] p-5 text-center mb-4">
      <div className="text-[10px] uppercase tracking-[.1em] text-[#6B6A62] font-bold">National Identity Number</div>
      <div className="text-[22px] font-black tracking-[4px] mt-2">{nin}</div>
      <div className="mt-3">
        {verified
          ? <Badge v="green">✓ NIN Verified</Badge>
          : <Badge v="gold">⏳ NIN Pending Verification</Badge>
        }
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs:    { id: string; label: string; count?: number }[]
  active:  string
  onChange:(id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex border-b-2 border-[#E2E0DA] mb-4 overflow-x-auto scrollbar-hidden gap-0.5">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={clsx(
            'px-3.5 py-2 text-[12px] font-semibold border-b-2 mb-[-2px] whitespace-nowrap transition-all flex-shrink-0',
            active === t.id
              ? 'text-[#0A6E3F] border-b-[#0A6E3F]'
              : 'text-[#6B6A62] border-transparent hover:text-[#1A1A18]'
          )}
        >
          {t.label}{t.count !== undefined && ` (${t.count})`}
        </button>
      ))}
    </div>
  )
}

// ─── Toast context ────────────────────────────────────────────────────────────
const ToastCtx = React.createContext<(msg: string) => void>(() => {})
export const useToast = () => React.useContext(ToastCtx)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = React.useState('')
  const [visible, setVisible] = React.useState(false)
  const tmr = React.useRef<ReturnType<typeof setTimeout>>()

  const toast = React.useCallback((m: string) => {
    setMsg(m); setVisible(true)
    clearTimeout(tmr.current)
    tmr.current = setTimeout(() => setVisible(false), 2800)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={clsx(
        'fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1A1A18] text-white px-4 py-2.5 rounded-full text-[12px] font-semibold z-[2000] pointer-events-none whitespace-nowrap max-w-[90vw] transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      )}>
        {msg}
      </div>
    </ToastCtx.Provider>
  )
}
