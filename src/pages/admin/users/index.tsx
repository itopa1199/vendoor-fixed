import React, { useState } from 'react'
import {
  Card, Btn, StatusBadge, SearchBar, Select,
  Modal, DR, Badge, Avatar, useToast, Empty,
} from '@/components/admin/ui'
import { ngnKobo } from '@/lib/mock-data'
import { Users } from 'lucide-react'

const USERS = [
  { id:'u1', name:'Adaeze Mensah',  email:'ada@gmail.com',     phone:'08012345678', role:'buyer',  orders:7,  joined:'Jan 2024', status:'active',  spend:1_048_500 },
  { id:'u2', name:'Emeka Okonkwo',  email:'emeka@yahoo.com',   phone:'07023456789', role:'buyer',  orders:12, joined:'Feb 2024', status:'active',  spend:324_000   },
  { id:'u3', name:'Funmi Balogun',  email:'funmi@outlook.com', phone:'09034567890', role:'buyer',  orders:4,  joined:'Mar 2024', status:'active',  spend:220_500   },
  { id:'u4', name:'Ngozi Kalu',     email:'ngozi@kalu.ng',     phone:'08145678901', role:'buyer',  orders:9,  joined:'Apr 2024', status:'active',  spend:756_000   },
  { id:'u5', name:'Suspicious User',email:'hacker@temp.com',   phone:'01112223334', role:'buyer',  orders:0,  joined:'Dec 2024', status:'flagged', spend:0         },
  { id:'u6', name:'Tobi Lawson',    email:'tobi@tobi.ng',      phone:'07056789012', role:'buyer',  orders:3,  joined:'May 2024', status:'active',  spend:898_650   },
  { id:'u7', name:'Tunde Okafor',   email:'vendor@vendoor.ng', phone:'08098765432', role:'vendor', orders:0,  joined:'Dec 2023', status:'active',  spend:0         },
  { id:'u8', name:'Bola Tinubu Jr', email:'bola@bt.ng',        phone:'08187654321', role:'buyer',  orders:5,  joined:'Jun 2024', status:'active',  spend:432_000   },
  { id:'u9', name:'Chioma Eze',     email:'chioma@eze.ng',     phone:'09011223344', role:'buyer',  orders:8,  joined:'Jul 2024', status:'active',  spend:215_000   },
]

export default function UsersPage() {
  const toast = useToast()
  const [users, setUsers] = useState(USERS.map(u => ({ ...u })))
  const [q, setQ]         = useState('')
  const [roleF, setRoleF] = useState('')
  const [viewId, setViewId] = useState<string | null>(null)

  const filtered = users.filter(u => {
    const txt = (u.name + u.email + u.phone).toLowerCase()
    return txt.includes(q.toLowerCase()) && (!roleF || u.role === roleF)
  })

  const viewing = viewId ? users.find(u => u.id === viewId) : null

  function suspend(id: string) {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: 'flagged' } : u))
    toast('⚠️ User suspended.')
  }
  function restore(id: string) {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: 'active' } : u))
    toast('✅ User restored.')
  }

  const ROLE_BADGE: Record<string, 'red' | 'blue' | 'dim'> = { admin: 'red', vendor: 'blue', buyer: 'dim' }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Users</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{users.length} registered users.</p>
        </div>
        <Btn v="outline" size="sm">Export</Btn>
      </div>

      <div className="flex gap-2 flex-wrap">
        <SearchBar placeholder="Search users…" value={q} onChange={setQ} />
        <Select value={roleF} onChange={setRoleF} options={[
          { label: 'All Roles',  value: ''       },
          { label: 'Buyer',      value: 'buyer'  },
          { label: 'Vendor',     value: 'vendor' },
          { label: 'Admin',      value: 'admin'  },
        ]} />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Phone</th><th>Role</th>
                <th>Orders</th><th>Spent</th><th>Joined</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={u.name} />
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-[11px] text-[#6B6A62]">{u.email}</td>
                  <td className="text-[11px]">{u.phone}</td>
                  <td><Badge v={ROLE_BADGE[u.role] ?? 'dim'}>{u.role}</Badge></td>
                  <td className="text-center">{u.orders}</td>
                  <td className="font-semibold text-[#0A6E3F]">{u.spend > 0 ? ngnKobo(u.spend) : '—'}</td>
                  <td className="text-[11px] text-[#6B6A62]">{u.joined}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td>
                    <div className="flex gap-1.5">
                      <Btn v="outline" size="sm" onClick={() => setViewId(u.id)}>👁</Btn>
                      {u.status === 'active'
                        ? <Btn v="orange" size="sm" onClick={() => suspend(u.id)}>⚠️</Btn>
                        : <Btn v="green"  size="sm" onClick={() => restore(u.id)}>✓</Btn>
                      }
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-10"><Empty icon={<Users size={18} />} title="No users found" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewId(null)} title="User Profile"
        footer={<Btn v="green" size="lg" onClick={() => setViewId(null)}>Close</Btn>}>
        {viewing && <>
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E2E0DA]">
            <Avatar name={viewing.name} size={44} />
            <div>
              <div className="text-[16px] font-bold">{viewing.name}</div>
              <div className="mt-1"><StatusBadge status={viewing.status} /></div>
            </div>
          </div>
          <DR label="Email"    value={viewing.email} />
          <DR label="Phone"    value={viewing.phone} />
          <DR label="Role"     value={<Badge v={ROLE_BADGE[viewing.role] ?? 'dim'}>{viewing.role}</Badge>} />
          <DR label="Orders"   value={viewing.orders} />
          <DR label="Total Spent" value={<span className="text-[#0A6E3F]">{viewing.spend > 0 ? ngnKobo(viewing.spend) : '—'}</span>} />
          <DR label="Joined"   value={viewing.joined} />
        </>}
      </Modal>
    </div>
  )
}
