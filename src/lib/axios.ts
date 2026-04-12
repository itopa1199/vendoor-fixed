import axios from 'axios'
import Cookies from 'js-cookie'

export const BASE_URL = 'https://vendoor.ng/store/api'

export const getToken = () => Cookies.get('vd_jwt') ?? null
export const getRefreshToken = () => Cookies.get('vd_refresh') ?? null
export const getExpiry = () => parseInt(Cookies.get('vd_expiry') ?? '0', 10)
export const getUserUuid = () => Cookies.get('vd_uuid') ?? null

export const saveTokens = (jwt: string, expiry: number, refresh: string, uuid: string) => {
  Cookies.set('vd_jwt', jwt, { expires: 7, sameSite: 'lax' })
  Cookies.set('vd_expiry', String(expiry), { expires: 7, sameSite: 'lax' })
  Cookies.set('vd_refresh', refresh, { expires: 30, sameSite: 'lax' })
  Cookies.set('vd_uuid', uuid, { expires: 30, sameSite: 'lax' })
}

export const clearTokens = () => {
  ['vd_jwt', 'vd_expiry', 'vd_refresh', 'vd_uuid'].forEach((k) => Cookies.remove(k))
}

let refreshing: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  if (refreshing) return refreshing

  const uuid = getUserUuid()
  const refresh = getRefreshToken()
  if (!uuid || !refresh) return null

  refreshing = axios.post(`${BASE_URL}/refresh-jwt`, { uuid }, {
    headers: { Authorization: `Bearer ${refresh}` },
  })
  .then(res => {
    const { jwt_token, jwt_expiry } = res.data.data
    Cookies.set('vd_jwt', jwt_token, { expires: 7, sameSite: 'lax' })
    Cookies.set('vd_expiry', String(jwt_expiry), { expires: 7, sameSite: 'lax' })
    return jwt_token
  })
  .catch(err => {
    clearTokens()
    return null
  })
  .finally(() => { refreshing = null })

  return refreshing
}

// Create axios client
const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT before request
client.interceptors.request.use(async (cfg) => {
  let token = getToken()
  const expiry = getExpiry()
  const now = Math.floor(Date.now() / 1000)

  // Refresh if expiring in <5 min
  if (token && expiry - now < 300) {
    const fresh = await refreshToken()
    if (fresh) token = fresh
  }

  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Retry once on 401
client.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      const fresh = await refreshToken()
      if (fresh) {
        orig.headers.Authorization = `Bearer ${fresh}`
        return client(orig)
      }
    }
    return Promise.reject(err)
  }
)

export { client }