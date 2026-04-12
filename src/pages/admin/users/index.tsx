import React, { useEffect, useState } from 'react'
import { Card, Btn, StatusBadge, SearchBar, Modal, DR, Avatar, useToast, Empty } from '@/components/admin/ui'
import { adminUsers } from '@/lib/admin-api'
import { Users } from 'lucide-react'

export default function UsersPage() {
  const toast = useToast()
  const [users,   setUsers]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ]             = useState('')
  const [page, setPage]       = useState(1)
  const [viewId, setViewId]   = useState<string | null>(null)
  const [acting, setActing]   = useState(false)

  const load = (p = page, search = q) => {
    setLoading(true)
    adminUsers.list(p, 20, search)
      .then(r => { if (r.status) setUsers(r.data ?? []) })
        .catch(()=>{})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const viewing = viewId ? users.find(u => u.uuid === viewId) : null

  async function block(uuid: string) {
    setActing(true)
    try {
      const r = await adminUsers.block(uuid)
      toast(r.status ? '⚠️ User blocked for 7 days.' : `❌ ${r.message}`)
      if (r.status) load()
    } catch { toast('❌ Failed') }
    finally { setActing(false) }
  }

  function handleSearch(v: string) {
    setQ(v)
    setPage(1)
    load(1, v)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Users</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{users.length} users loaded.</p>
        </div>
      </div>

      <SearchBar placeholder="Search by name, email or phone…" value={q} onChange={handleSearch} />

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr><th>User</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-[#6B6A62]">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-10"><Empty icon={<Users size={18} />} title="No users found" /></td></tr>
              ) : users.map((u: any) => (
                <tr key={u.uuid}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name ?? '?'} />
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-[11px] text-[#6B6A62]">{u.email}</td>
                  <td className="text-[11px]">{u.phone}</td>
                  <td className="text-[11px] capitalize">{u.account_type ?? u.role}</td>
                  <td><StatusBadge status={u.is_blocked ? 'suspended' : 'active'} /></td>
                  <td className="text-[11px] text-[#6B6A62]">{u.created_at?.slice(0, 10)}</td>
                  <td>
                    <div className="flex gap-1.5">
                      <Btn v="outline" size="sm" onClick={() => setViewId(u.uuid)}>👁</Btn>
                      {!u.is_blocked && (
                        <Btn v="orange" size="sm" onClick={() => block(u.uuid)} disabled={acting}>Block</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex gap-2 p-3 border-t border-[#E2E0DA]">
          <Btn v="outline" size="sm" onClick={() => { setPage(p => Math.max(1, p-1)); load(Math.max(1, page-1)) }} disabled={page === 1}>← Prev</Btn>
          <span className="text-[12px] self-center px-2">Page {page}</span>
          <Btn v="outline" size="sm" onClick={() => { setPage(p => p+1); load(page+1) }}>Next →</Btn>
        </div>
      </Card>

      <Modal open={!!viewing} onClose={() => setViewId(null)} title="User Profile"
        footer={<Btn v="green" size="lg" onClick={() => setViewId(null)}>Close</Btn>}>
        {viewing && <>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E2E0DA]">
            <Avatar name={viewing.name ?? '?'} size={44} />
            <div>
              <div className="text-[16px] font-bold">{viewing.name}</div>
              <StatusBadge status={viewing.is_blocked ? 'suspended' : 'active'} />
            </div>
          </div>
          <DR label="Email"   value={viewing.email} />
          <DR label="Phone"   value={viewing.phone} />
          <DR label="Role"    value={viewing.account_type ?? viewing.role} />
          <DR label="Joined"  value={viewing.created_at?.slice(0, 10)} />
        </>}
      </Modal>
    </div>
  )
}
