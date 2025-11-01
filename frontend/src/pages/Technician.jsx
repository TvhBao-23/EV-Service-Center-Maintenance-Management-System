import { useEffect, useMemo, useState } from 'react'
import { getCurrentUserId } from '../lib/store'
import { maintenanceAPI } from '../lib/api'

function Technician() {
  const techId = useMemo(() => getCurrentUserId(), [])
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [serviceOrders, setServiceOrders] = useState([])
  const [checklists, setChecklists] = useState([])
  const [activeTab, setActiveTab] = useState('queue') // 'queue' | 'assigned'

  useEffect(() => {
    if (techId) {
      fetchTechnicianData()
    }
  }, [techId])

  const fetchTechnicianData = async () => {
    try {
      setLoading(true)
      // Fetch all service orders for this technician
      const ordersData = techId ? await maintenanceAPI.getServiceOrdersByTechnician(techId).catch(() => []) : []
      const allOrders = await maintenanceAPI.getServiceOrders().catch(() => [])
      
      // Get all vehicles
      const vehiclesData = await maintenanceAPI.getVehicles().catch(() => [])
      
      setVehicles(vehiclesData || [])
      setServiceOrders(allOrders || [])
      
      // Fetch checklists for assigned orders
      if (ordersData.length > 0) {
        const checklistPromises = ordersData.map(order => 
          maintenanceAPI.getChecklistsByOrderId(order.orderId).catch(() => [])
        )
        const allChecklists = await Promise.all(checklistPromises)
        setChecklists(allChecklists.flat())
      }
    } catch (error) {
      console.error('Error fetching technician data:', error)
    } finally {
      setLoading(false)
    }
  }

  const normalizeStatus = (status) => {
    if (!status) return ''
    return status.toUpperCase().replace(/-/g, '_')
  }

  const assigned = useMemo(() => {
    if (!techId || !serviceOrders.length) return []
    return serviceOrders
      .filter(order => order.assignedTechnicianId === techId)
      .map(order => {
        const vehicle = vehicles.find(v => v.vehicleId === order.vehicleId)
        const orderChecklists = checklists.filter(c => c.orderId === order.orderId)
        return { order, vehicle, checklists: orderChecklists }
      })
      .filter(x => x.vehicle)
  }, [serviceOrders, vehicles, checklists, techId])

  const queue = useMemo(() => {
    // Orders queued or in progress without assigned technician
    return serviceOrders
      .filter(order => {
        const status = normalizeStatus(order.status)
        return (status === 'QUEUED' || status === 'IN_PROGRESS') && !order.assignedTechnicianId
      })
      .map(order => {
        const vehicle = vehicles.find(v => v.vehicleId === order.vehicleId)
        return { order, vehicle }
      })
      .filter(x => x.vehicle)
  }, [serviceOrders, vehicles])

  const updateStatus = async (orderId, nextStatus) => {
    try {
      await maintenanceAPI.updateServiceOrderStatus(orderId, nextStatus)
      fetchTechnicianData()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Lỗi khi cập nhật trạng thái')
    }
  }

  const assignToMe = async (orderId) => {
    if (!techId) {
      alert('Không có thông tin kỹ thuật viên')
      return
    }
    try {
      await maintenanceAPI.assignTechnician(orderId, techId)
      fetchTechnicianData()
    } catch (error) {
      console.error('Error assigning to me:', error)
      alert('Lỗi khi nhận công việc')
    }
  }

  const saveChecklist = async (orderId, checklistData) => {
    try {
      // Create checklist items
      const items = []
      if (checklistData.battery) items.push({ itemName: 'Kiểm tra pin', isCompleted: true })
      if (checklistData.brakes) items.push({ itemName: 'Kiểm tra phanh', isCompleted: true })
      if (checklistData.tires) items.push({ itemName: 'Kiểm tra lốp', isCompleted: true })
      if (checklistData.lights) items.push({ itemName: 'Kiểm tra đèn', isCompleted: true })
      if (checklistData.note) items.push({ itemName: 'Ghi chú', notes: checklistData.note })

      for (const item of items) {
        await maintenanceAPI.createServiceChecklist({
          orderId,
          ...item
        })
      }
      fetchTechnicianData()
    } catch (error) {
      console.error('Error saving checklist:', error)
      alert('Lỗi khi lưu checklist')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Bảng điều khiển Kỹ thuật viên</h2>

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
                  {queue.map(({ order, vehicle }) => (
                    <tr key={order.orderId}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || `Vehicle ${vehicle.vehicleId}` : `Vehicle ${order.vehicleId}`}
                        {vehicle?.vin && ` (${vehicle.vin})`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">Order #{order.orderId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.checkInTime ? new Date(order.checkInTime).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{order.status || 'queued'}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={()=>assignToMe(order.orderId)} 
                          className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
                        >
                          Nhận việc
                        </button>
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
                  {assigned.map(({ order, vehicle, checklists: orderChecklists }) => (
                    <tr key={order.orderId}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || `Vehicle ${vehicle.vehicleId}` : `Vehicle ${order.vehicleId}`}
                        {vehicle?.vin && ` (${vehicle.vin})`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">Order #{order.orderId}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {order.checkInTime ? new Date(order.checkInTime).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">-</td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          className="border rounded-md px-2 py-1 text-sm"
                          value={order.status || 'queued'}
                          onChange={(e)=>updateStatus(order.orderId, e.target.value)}
                        >
                          <option value="queued">Chờ xử lý</option>
                          <option value="in_progress">Đang bảo dưỡng</option>
                          <option value="completed">Hoàn tất</option>
                          <option value="delayed">Bị trễ</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right text-sm flex items-center gap-2 justify-end">
                        <ChecklistButton
                          orderId={order.orderId}
                          defaultValue={orderChecklists.length > 0 ? orderChecklists : null}
                          onSave={(data)=>saveChecklist(order.orderId, data)}
                        />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Checklist đã tạo</h3>
          {checklists.length === 0 ? (
            <p className="text-gray-600 text-sm">Chưa có checklist nào.</p>
          ) : (
            <ul className="space-y-3">
              {checklists.map(c => (
                <li key={c.checklistId} className="border rounded-md p-3 text-sm text-gray-800">
                  <div className="flex justify-between">
                    <span className="font-medium">{c.itemName}</span>
                    <span className={`px-2 py-1 rounded ${c.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {c.isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                    </span>
                  </div>
                  {c.notes && <p className="mt-2 text-gray-600">Ghi chú: {c.notes}</p>}
                  {c.completedAt && (
                    <p className="mt-1 text-xs text-gray-500">
                      Hoàn thành: {new Date(c.completedAt).toLocaleString('vi-VN')}
                    </p>
                  )}
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

function ChecklistButton({ orderId, defaultValue, onSave }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(() => {
    if (defaultValue && Array.isArray(defaultValue)) {
      // Map existing checklists to form
      return {
        battery: defaultValue.some(c => c.itemName.includes('pin')),
        brakes: defaultValue.some(c => c.itemName.includes('phanh')),
        tires: defaultValue.some(c => c.itemName.includes('lop')),
        lights: defaultValue.some(c => c.itemName.includes('den')),
        note: defaultValue.find(c => c.notes)?.notes || ''
      }
    }
    return { battery: false, brakes: false, tires: false, lights: false, note: '' }
  })
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


