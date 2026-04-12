import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function ngn(v: number | string) {
  // 1. Force the value to be a number (handles strings from API)
  const value = typeof v === 'string' ? parseFloat(v) : v;
  
  // 2. Handle NaN or null cases
  if (isNaN(value) || value === null) return '₦0';

  // 3. Use standard Intl formatter for perfect currency spacing and commas
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('NGN', '₦').trim();
}

export function parseImages(raw: string): string[] {
  if (!raw) return []
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p.filter(Boolean) : [raw].filter(Boolean) }
  catch { return raw.split(',').map((s) => s.trim()).filter(Boolean) }
}

export function getDeviceInfo() {
 return 'web'
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res((r.result as string).split(',')[1])
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
export function isValidPhone(v: string) { return /^(\+234|0)[789][01]\d{8}$/.test(v.replace(/\s/g, '')) }
export function truncate(s: string, n = 60) { return s?.length > n ? s.slice(0, n) + '…' : s }

/** Deduplicate an array by a string key. Safe to use on any API response. */
export function dedupe<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>()
  return arr.filter((item) => {
    const k = item[key]
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
