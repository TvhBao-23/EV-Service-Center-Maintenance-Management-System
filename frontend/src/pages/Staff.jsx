import { useEffect, useMemo, useState } from 'react'
import { getCurrentUserId, loadList, saveList } from '../lib/store'

function Staff() {
  const staffId = useMemo(() => getCurrentUserId(), [])
  const [activeTab, setActiveTab] = useState('customers') // customers | schedule | process | billing | parts

  // Shared data
  const [users, setUsers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quotes, setQuotes] = useState([])
  const [invoices, setInvoices] = useState([])
  const [parts, setParts] = useState([])
  const [partLogs, setPartLogs] = useState([])

  useEffect(() => {
    // users stored globally for mock (localStorage key 'users')
    try { setUsers(JSON.parse(localStorage.getItem('users') || '[]')) } catch { setUsers([]) }
    setVehicles(loadList('vehicles', []))
    setBookings(loadList('bookings', []))
    setAssignments(loadList('assignments', []))
    setQuotes(loadList('quotes', []))
    setInvoices(loadList('invoices', []))
    setParts(loadList('parts', []))
    setPartLogs(loadList('partLogs', []))
  }, [staffId])

  // Customers & Vehicles
  const customers = useMemo(() => users.filter(u => (u.role||'customer') === 'customer'), [users])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const customerVehicles = useMemo(() => vehicles.filter(v => !selectedCustomer ? true : v.ownerId === selectedCustomer.id), [vehicles, selectedCustomer])

  // Schedule & Services
  const pending = useMemo(() => bookings.filter(b => b.status === 'pending'), [bookings])
  const received = useMemo(() => bookings.filter(b => b.status === 'received'), [bookings])
  const technicians = useMemo(() => users.filter(u => ['technican','technician'].includes(u.role)), [users])

  const receiveBooking = (id) => {
    const next = bookings.map(b => b.id === id ? { ...b, status: 'received' } : b)
    setBookings(next); saveList('bookings', next)
  }

  const assignTech = (bookingId, techId) => {
    const b = bookings.find(x => x.id === bookingId)
    if (!b) return
    const newAssign = { id: `as_${Date.now()}`, bookingId, vehicleId: b.vehicleId, techId }
    const next = [...assignments, newAssign]
    setAssignments(next); saveList('assignments', next)
  }

  // Process board (simple lists)
  const inMaintenance = useMemo(() => bookings.filter(b => b.status === 'in_maintenance'), [bookings])
  const done = useMemo(() => bookings.filter(b => b.status === 'done'), [bookings])

  const moveStatus = (bookingId, status) => {
    const next = bookings.map(b => b.id === bookingId ? { ...b, status } : b)
    setBookings(next); saveList('bookings', next)
  }

  // Quotes & Invoices
  const createQuote = (bookingId) => {
    const q = { id: `q_${Date.now()}`, bookingId, items: [], amount: 0 }
    const next = [...quotes, q]
    setQuotes(next); saveList('quotes', next)
  }
  const addQuoteItem = (quoteId, name, price) => {
    const next = quotes.map(q => q.id === quoteId ? { ...q, items: [...q.items, { name, price: Number(price)||0 }], amount: (q.amount||0) + (Number(price)||0) } : q)
    setQuotes(next); saveList('quotes', next)
  }
  const createInvoice = (quoteId, method='offline') => {
    const q = quotes.find(q => q.id === quoteId)
    if (!q) return
    const inv = { id: `inv_${Date.now()}`, quoteId, bookingId: q.bookingId, amount: q.amount, method, status: 'unpaid' }
    const next = [...invoices, inv]
    setInvoices(next); saveList('invoices', next)
  }
  const markInvoicePaid = (invoiceId) => {
    const next = invoices.map(i => i.id === invoiceId ? { ...i, status: 'paid' } : i)
    setInvoices(next); saveList('invoices', next)
  }

  // Parts management
  const adjustPart = (code, delta) => {
    const list = parts.some(p => p.code === code) ? parts.map(p => p.code === code ? { ...p, stock: (Number(p.stock)||0) + delta } : p) : [...parts, { code, name: code, stock: delta, min: 0, price: 0 }]
    setParts(list); saveList('parts', list)
    const logs = [...partLogs, { id: `pl_${Date.now()}`, code, delta, at: new Date().toISOString() }]
    setPartLogs(logs); saveList('partLogs', logs)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Bảng điều khiển Nhân viên (Staff)</h2>

        <div className="flex gap-2 mb-6">
          {['customers','schedule','process','billing','parts'].map(t => (
            <button key={t} onClick={()=>setActiveTab(t)} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab===t ? 'bg-green-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>
              {t==='customers'?'Khách hàng & Xe':t==='schedule'?'Lịch hẹn & Dịch vụ':t==='process'?'Quy trình bảo dưỡng':t==='billing'?'Báo giá & Hóa đơn':'Quản lý phụ tùng'}
            </button>
          ))}
        </div>

        {activeTab==='customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-4 lg:col-span-1">
              <h3 className="font-semibold mb-3">Khách hàng</h3>
              <ul className="divide-y">
                {customers.map(c => (
                  <li key={c.id} className={`py-2 cursor-pointer ${selectedCustomer?.id===c.id?'text-green-700 font-medium':''}`} onClick={()=>setSelectedCustomer(c)}>
                    {c.fullName || c.email}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
              <h3 className="font-semibold mb-3">Xe của khách hàng</h3>
              {customerVehicles.length===0 ? <p className="text-gray-600 text-sm">Chưa có xe.</p> : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Model</th>
                      <th className="px-3 py-2 text-left">VIN</th>
                      <th className="px-3 py-2 text-left">Km</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {customerVehicles.map(v => (
                      <tr key={v.id}><td className="px-3 py-2">{v.model}</td><td className="px-3 py-2">{v.vin}</td><td className="px-3 py-2">{(Number(v.currentKm)||0).toLocaleString()}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab==='schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Hàng chờ (Pending)</h3>
              {pending.length===0 ? <p className="text-gray-600 text-sm">Không có.</p> : (
                <ul className="space-y-2">
                  {pending.map(b => (
                    <li key={b.id} className="border rounded-md p-3 flex items-center justify-between">
                      <span className="text-sm">{b.serviceType} • {b.date} {b.time}</span>
                      <button onClick={()=>receiveBooking(b.id)} className="px-3 py-1 rounded-md bg-green-600 text-white text-xs">Tiếp nhận</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Phân công kỹ thuật viên</h3>
              {received.length===0 ? <p className="text-gray-600 text-sm">Không có booking đã tiếp nhận.</p> : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Booking</th><th className="px-3 py-2 text-left">Kỹ thuật viên</th><th className="px-3 py-2"></th></tr></thead>
                  <tbody className="bg-white divide-y">
                    {received.map(b => (
                      <tr key={b.id}>
                        <td className="px-3 py-2">{b.serviceType} • {b.date} {b.time}</td>
                        <td className="px-3 py-2">
                          <select id={`tech_${b.id}`} className="border rounded-md px-2 py-1">
                            {technicians.map(t => (<option key={t.id} value={t.id}>{t.fullName || t.email}</option>))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right"><button onClick={()=>{
                          const sel = document.getElementById(`tech_${b.id}`)
                          assignTech(b.id, sel ? sel.value : '')
                        }} className="px-3 py-1 rounded-md bg-blue-600 text-white">Phân công</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab==='process' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatusColumn title="Đã tiếp nhận" data={received} onMove={(id)=>moveStatus(id,'in_maintenance')} moveLabel="Bắt đầu" />
            <StatusColumn title="Đang bảo dưỡng" data={inMaintenance} onMove={(id)=>moveStatus(id,'done')} moveLabel="Hoàn tất" />
            <StatusColumn title="Hoàn tất" data={done} onMove={null} />
          </div>
        )}

        {activeTab==='billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Báo giá</h3>
              <button onClick={()=>createQuote((bookings[0]||{}).id)} className="px-3 py-1 rounded-md border mb-3">Tạo báo giá từ booking đầu tiên (demo)</button>
              <ul className="space-y-2">
                {quotes.map(q => (
                  <li key={q.id} className="border rounded-md p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Quote {q.id} • Booking {q.bookingId}</span>
                      <button onClick={()=>createInvoice(q.id)} className="px-3 py-1 rounded-md bg-blue-600 text-white">Tạo hóa đơn</button>
                    </div>
                    <div className="mt-2">
                      <button onClick={()=>addQuoteItem(q.id,'Phí dịch vụ',200000)} className="text-xs px-2 py-1 rounded-md border">+ Thêm hạng mục (demo)</button>
                      <p className="mt-2">Tổng: {Number(q.amount||0).toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Hóa đơn</h3>
              <ul className="space-y-2">
                {invoices.map(inv => (
                  <li key={inv.id} className="border rounded-md p-3 text-sm flex items-center justify-between">
                    <span>Invoice {inv.id} • {Number(inv.amount||0).toLocaleString('vi-VN')} VNĐ • {inv.status==='paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
                    {inv.status!=='paid' && <button onClick={()=>markInvoicePaid(inv.id)} className="px-3 py-1 rounded-md bg-green-600 text-white">Xác nhận thanh toán</button>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab==='parts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Kho phụ tùng</h3>
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Mã</th><th className="px-3 py-2 text-left">Tồn</th><th className="px-3 py-2 text-left">Tối thiểu</th><th className="px-3 py-2"></th></tr></thead>
                <tbody className="bg-white divide-y">
                  {parts.map(p => (
                    <tr key={p.code}>
                      <td className="px-3 py-2">{p.code}</td>
                      <td className="px-3 py-2">{Number(p.stock||0)}</td>
                      <td className="px-3 py-2">{Number(p.min||0)}</td>
                      <td className="px-3 py-2 text-right flex gap-2 justify-end">
                        <button onClick={()=>adjustPart(p.code, 1)} className="px-2 py-1 rounded-md border">+1</button>
                        <button onClick={()=>adjustPart(p.code, -1)} className="px-2 py-1 rounded-md border">-1</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex gap-2">
                <input id="newPartCode" placeholder="Mã phụ tùng" className="border rounded-md px-2 py-1 text-sm" />
                <button onClick={()=>{ const el=document.getElementById('newPartCode'); if(el&&el.value) adjustPart(el.value, 0) }} className="px-3 py-1 rounded-md border">Thêm mã</button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Nhật ký xuất/nhập</h3>
              <ul className="space-y-2 text-sm">
                {partLogs.map(l => (<li key={l.id} className="border rounded-md p-2">{l.at} • {l.code} • {l.delta>0?'+':''}{l.delta}</li>))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatusColumn({ title, data, onMove, moveLabel }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      {data.length===0 ? <p className="text-gray-600 text-sm">Không có.</p> : (
        <ul className="space-y-2">
          {data.map(b => (
            <li key={b.id} className="border rounded-md p-3 flex items-center justify-between text-sm">
              <span>{b.serviceType} • {b.date} {b.time}</span>
              {onMove && <button onClick={()=>onMove(b.id)} className="px-3 py-1 rounded-md border">{moveLabel||'Chuyển'}</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Staff


