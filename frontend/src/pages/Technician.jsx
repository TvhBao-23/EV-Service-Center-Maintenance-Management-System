import { useEffect, useMemo, useState } from 'react'
import { getCurrentUserId, loadList, saveList } from '../lib/store'

function Technician() {
  const techId = useMemo(() => getCurrentUserId(), [])
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [assignments, setAssignments] = useState([])
  const [reports, setReports] = useState([])
  const [checklists, setChecklists] = useState([])
  const [activeTab, setActiveTab] = useState('queue') // 'queue' | 'assigned'

  useEffect(() => {
    if (!techId) return
    setVehicles(loadList('vehicles', []))
    setBookings(loadList('bookings', []))
    setAssignments(loadList('assignments', []))
    setReports(loadList('techReports', []))
    setChecklists(loadList('checklists', []))
  }, [techId])

  const assigned = useMemo(() => {
    if (!assignments.length) return []
    return assignments
      .filter(a => a.techId === techId)
      .map(a => {
        const booking = bookings.find(b => b.id === a.bookingId)
        const vehicle = vehicles.find(v => v.id === a.vehicleId)
        return { ...a, booking, vehicle }
      })
      .filter(x => x.booking && x.vehicle)
  }, [assignments, bookings, vehicles, techId])

  const queue = useMemo(() => {
    // Jobs without assignment yet
    const assignedIds = new Set(assignments.map(a => a.bookingId))
    return bookings
      .filter(b => !assignedIds.has(b.id) && (b.status === 'received' || b.status === 'in_maintenance' || b.status === 'pending'))
      .map(b => ({
        booking: b,
        vehicle: vehicles.find(v => v.id === b.vehicleId)
      }))
      .filter(x => x.vehicle)
  }, [assignments, bookings, vehicles])

  const updateStatus = (bookingId, nextStatus) => {
    const next = bookings.map(b => b.id === bookingId ? { ...b, status: nextStatus } : b)
    setBookings(next)
    saveList('bookings', next)
  }

  const submitReport = (bookingId, vehicleId, form) => {
    const newReport = {
      id: `tr_${Date.now()}`,
      bookingId,
      vehicleId,
      techId,
      message: form.message || '',
      parts: form.parts || '',
      createdAt: new Date().toISOString()
    }
    const next = [...reports, newReport]
    setReports(next)
    saveList('techReports', next)
  }

  const assignToMe = (bookingId, vehicleId) => {
    const next = [...assignments, { id: `as_${Date.now()}`, bookingId, vehicleId, techId }]
    setAssignments(next)
    saveList('assignments', next)
  }

  const saveChecklist = (bookingId, data) => {
    const list = [...checklists.filter(c => c.bookingId !== bookingId), { bookingId, ...data }]
    setChecklists(list)
    saveList('checklists', list)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8"></h2>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={()=>setActiveTab('queue')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab==='queue' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >Hàng chờ</button>
            <button
              onClick={()=>setActiveTab('assigned')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab==='assigned' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >Được phân công</button>
          </div>

          {activeTab === 'queue' && (
            <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hàng chờ tiếp nhận</h3>
          {queue.length === 0 ? (
            <p className="text-gray-600 text-sm">Không có công việc chờ.</p>
          ) : (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {queue.map(row => (
                    <tr key={row.booking.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.vehicle.model} ({row.vehicle.vin})</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.booking.serviceType}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.booking.date} {row.booking.time}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.booking.status}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={()=>assignToMe(row.booking.id, row.vehicle.id)} className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700">Nhận việc</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </>
          )}

          {activeTab === 'assigned' && (
            <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xe được phân công</h3>
          {assigned.length === 0 ? (
            <p className="text-gray-600">Chưa có xe nào được phân công.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trung tâm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assigned.map((row) => (
                    <tr key={row.booking.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.vehicle.model} ({row.vehicle.vin})</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.booking.serviceType}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.booking.date} {row.booking.time}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.booking.center}</td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          className="border rounded-md px-2 py-1 text-sm"
                          value={row.booking.status}
                          onChange={(e)=>updateStatus(row.booking.id, e.target.value)}
                        >
                          <option value="pending">Chờ tiếp nhận</option>
                          <option value="received">Đã tiếp nhận</option>
                          <option value="in_maintenance">Đang bảo dưỡng</option>
                          <option value="done">Hoàn tất</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right text-sm flex items-center gap-2 justify-end">
                        <ChecklistButton
                          defaultValue={checklists.find(c => c.bookingId === row.booking.id)}
                          onSave={(data)=>saveChecklist(row.booking.id, data)}
                        />
                        <ReportButton onSubmit={(form)=>submitReport(row.booking.id, row.vehicle.id, form)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Báo cáo đã gửi</h3>
          {reports.length === 0 ? (
            <p className="text-gray-600 text-sm">Chưa có báo cáo nào.</p>
          ) : (
            <ul className="space-y-3">
              {reports.map(r => (
                <li key={r.id} className="border rounded-md p-3 text-sm text-gray-800">
                  <div className="flex justify-between">
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                    <span className="text-gray-600">Booking: {r.bookingId}</span>
                  </div>
                  <p className="mt-2">{r.message}</p>
                  {r.parts && <p className="mt-1 text-gray-700">Đề xuất phụ tùng: {r.parts}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

function ReportButton({ onSubmit }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ message: '', parts: '' })
  const canSubmit = form.message.trim().length > 0
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-3 py-1 rounded-md border text-gray-700 hover:bg-gray-50">Báo cáo / Đề xuất</button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Báo cáo sự cố / Đề xuất phụ tùng</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nội dung báo cáo</label>
                <textarea value={form.message} onChange={(e)=>setForm({ ...form, message: e.target.value })} rows={4} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Mô tả sự cố, hạng mục cần xử lý..." />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Đề xuất phụ tùng (tuỳ chọn)</label>
                <input value={form.parts} onChange={(e)=>setForm({ ...form, parts: e.target.value })} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="VD: Má phanh, lọc gió..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setOpen(false)} className="px-3 py-2 rounded-md border">Hủy</button>
              <button disabled={!canSubmit} onClick={()=>{ onSubmit(form); setOpen(false); setForm({ message:'', parts:'' }) }} className="px-3 py-2 rounded-md bg-green-600 text-white disabled:opacity-50">Gửi báo cáo</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ChecklistButton({ defaultValue, onSave }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(() => defaultValue || { battery: false, brakes: false, tires: false, lights: false, note: '' })
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-3 py-1 rounded-md border text-gray-700 hover:bg-gray-50">Checklist</button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Checklist EV</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.battery} onChange={(e)=>setForm({ ...form, battery: e.target.checked })} /> Pin</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.brakes} onChange={(e)=>setForm({ ...form, brakes: e.target.checked })} /> Phanh</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.tires} onChange={(e)=>setForm({ ...form, tires: e.target.checked })} /> Lốp</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.lights} onChange={(e)=>setForm({ ...form, lights: e.target.checked })} /> Đèn</label>
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-700 mb-1">Ghi chú</label>
              <textarea value={form.note} onChange={(e)=>setForm({ ...form, note: e.target.value })} rows={3} className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setOpen(false)} className="px-3 py-2 rounded-md border">Hủy</button>
              <button onClick={()=>{ onSave(form); setOpen(false) }} className="px-3 py-2 rounded-md bg-green-600 text-white">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Technician


