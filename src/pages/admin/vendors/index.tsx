import React, { useState } from 'react'
import { Card, Btn, StatusBadge, SearchBar, Select, Modal, DR, Badge, Field, Input, SelectField, useToast } from '@/components/admin/ui'
import { useAdminStore } from '@/store/admin'
import { ngnKobo } from '@/lib/mock-data'

export default function VendorsPage() {
  const { vendors, suspendVendor, restoreVendor, banVendor } = useAdminStore()
  const toast  = useToast()
  const [q, setQ]          = useState('')
  const [statusF, setStatusF] = useState('')
  const [catF, setCatF]    = useState('')
  const [viewId, setViewId]  = useState<string | null>(null)
  const [suspId, setSuspId]  = useState<string | null>(null)
  const [banId, setBanId]    = useState<string | null>(null)
  const [addOpen, setAddOpen]= useState(false)

  const filtered = vendors.filter(v => {
    const txt = (v.store_name + v.owner_name + v.category).toLowerCase()
    return txt.includes(q.toLowerCase()) &&
           (!statusF || v.status === statusF) &&
           (!catF    || v.category === catF)
  })

  const viewing   = viewId ? vendors.find(v => v.id === viewId)  : null
  const suspending = suspId ? vendors.find(v => v.id === suspId) : null
  const banning   = banId  ? vendors.find(v => v.id === banId)   : null

  const cats = [...new Set(vendors.map(v => v.category))]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[18px] font-black">Vendors</h1>
          <p className="text-[11px] text-[#6B6A62] mt-0.5">{vendors.length} vendors on the platform.</p>
        </div>
        <Btn v="green" size="md" onClick={() => setAddOpen(true)}>+ Add Vendor</Btn>
      </div>

      <div className="flex gap-2 flex-wrap">
        <SearchBar placeholder="Search vendors…" value={q} onChange={setQ} />
        <Select value={statusF} onChange={setStatusF} options={[
          { label:'All Status', value:'' },
          { label:'Active',    value:'active'    },
          { label:'Suspended', value:'suspended' },
          { label:'Banned',    value:'banned'    },
        ]} />
        <Select value={catF} onChange={setCatF} options={[
          { label:'All Categories', value:'' },
          ...cats.map(c => ({ label: c, value: c })),
        ]} />
      </div>

      <Card>
        <div className="px-4 py-2.5 border-b border-[#E2E0DA] flex items-center justify-between">
          <span className="text-[13px] font-bold">
            All Vendors <span className="text-[11px] text-[#6B6A62] font-normal">{vendors.filter(v=>v.status==='active').length} active</span>
          </span>
          <Btn v="outline" size="sm">Export</Btn>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Vendor</th><th>Owner</th><th>Category</th><th>Products</th>
                <th>Orders</th><th>Revenue</th><th>Rating</th><th>Status</th><th>Spotlight</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="font-bold">{v.store_name}</div>
                    <div className="text-[10px] text-[#6B6A62]">{v.created_at.slice(0,10)}</div>
                  </td>
                  <td>{v.owner_name}</td>
                  <td><Badge v="dim">{v.category}</Badge></td>
                  <td className="text-center font-semibold">{v.product_count ?? 0}</td>
                  <td className="text-center">{v.order_count ?? 0}</td>
                  <td className="font-bold text-[#0A6E3F]">{ngnKobo(v.revenue ?? 0)}</td>
                  <td>
                    {v.rating > 0
                      ? <span>{'★'.repeat(Math.round(v.rating)).slice(0,5)} <span className="text-[10px] text-[#6B6A62]">{v.rating}</span></span>
                      : '—'
                    }
                  </td>
                  <td><StatusBadge status={v.status} /></td>
                  <td>
                    {v.spotlight_active
                      ? <Badge v="gold">⭐ Active</Badge>
                      : <span className="text-[#A8A79F] text-[11px]">—</span>
                    }
                  </td>
                  <td>
                    <div className="flex gap-1.5 flex-wrap">
                      <Btn v="outline" size="sm" onClick={() => setViewId(v.id)}>👁</Btn>
                      {v.status === 'active'
                        ? <Btn v="orange" size="sm" onClick={() => setSuspId(v.id)}>⚠️</Btn>
                        : v.status === 'suspended'
                          ? <Btn v="green" size="sm" onClick={() => { restoreVendor(v.id); toast(`✅ ${v.store_name} restored.`) }}>✓</Btn>
                          : null
                      }
                      {v.status !== 'banned' && (
                        <Btn v="red" size="sm" onClick={() => setBanId(v.id)}>🚫</Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center py-10 text-[#6B6A62]">No vendors found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewId(null)} title={`Vendor — ${viewing?.store_name}`}
        footer={<Btn v="green" size="lg" onClick={() => setViewId(null)}>Close</Btn>}>
        {viewing && <>
          <DR label="Store Name"  value={viewing.store_name} />
          <DR label="Owner"       value={viewing.owner_name ?? '—'} />
          <DR label="Email"       value={viewing.owner_email ?? '—'} />
          <DR label="Category"    value={viewing.category} />
          <DR label="Status"      value={<StatusBadge status={viewing.status} />} />
          <DR label="Products"    value={viewing.product_count ?? 0} />
          <DR label="Orders"      value={viewing.order_count ?? 0} />
          <DR label="Revenue"     value={<span className="text-[#0A6E3F]">{ngnKobo(viewing.revenue ?? 0)}</span>} />
          <DR label="Spotlight"   value={viewing.spotlight_active ? '⭐ Active' : 'Inactive'} />
          <DR label="Joined"      value={viewing.created_at.slice(0,10)} />
          <DR label="Rating"      value={viewing.rating > 0 ? `${viewing.rating} / 5 (${viewing.review_count} reviews)` : 'No ratings yet'} />
        </>}
      </Modal>

      {/* Suspend Modal */}
      <Modal open={!!suspending} onClose={() => setSuspId(null)} title="Suspend Vendor"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setSuspId(null)}>Cancel</Btn>
          <Btn v="orange" size="lg" onClick={() => { suspendVendor(suspending!.id); setSuspId(null); toast(`⚠️ ${suspending!.store_name} suspended.`) }}>⚠️ Confirm Suspend</Btn>
        </>}>
        {suspending && <>
          <p className="text-[13px] mb-4">Suspend <strong>{suspending.store_name}</strong>? Their products will be hidden from buyers.</p>
          <Field label="Reason">
            <SelectField value="" onChange={() => {}} options={['Policy violation','Customer complaints','Fraudulent activity','Inaccurate listings']} />
          </Field>
        </>}
      </Modal>

      {/* Ban Modal */}
      <Modal open={!!banning} onClose={() => setBanId(null)} title="Ban Vendor"
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setBanId(null)}>Cancel</Btn>
          <Btn v="red" size="lg" onClick={() => { banVendor(banning!.id); setBanId(null); toast(`🚫 ${banning!.store_name} banned.`) }}>🚫 Confirm Ban</Btn>
        </>}>
        {banning && (
          <p className="text-[13px]">Permanently ban <strong>{banning.store_name}</strong>? This cannot be undone. All products will be removed from the marketplace.</p>
        )}
      </Modal>

      {/* Add Vendor Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Vendor Manually" wide
        footer={<>
          <Btn v="outline" size="lg" onClick={() => setAddOpen(false)}>Cancel</Btn>
          <Btn v="green" size="lg" onClick={() => { setAddOpen(false); toast('✅ Vendor added successfully!') }}>Save Vendor</Btn>
        </>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Store Name"><Input placeholder="e.g. TechDeals NG" /></Field>
          <Field label="Category">
            <SelectField value="" onChange={() => {}} options={['Electronics','Fashion','Food & Meals','Beauty','Sports','Beverages','Groceries']} />
          </Field>
          <Field label="Owner Name"><Input placeholder="Full name" /></Field>
          <Field label="Email"><Input type="email" placeholder="owner@store.ng" /></Field>
        </div>
        <Field label="NIN"><Input placeholder="11-digit NIN" /></Field>
        <Field label="Initial Status">
          <SelectField value="active" onChange={() => {}} options={['active','pending']} />
        </Field>
      </Modal>
    </div>
  )
}
