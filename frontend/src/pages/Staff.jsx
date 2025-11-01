import { useEffect, useMemo, useState } from 'react'
import { getCurrentUserId } from '../lib/store'
import { maintenanceAPI } from '../lib/api'

function Staff() {
  const staffId = useMemo(() => getCurrentUserId(), [])
  const [activeTab, setActiveTab] = useState('customers') // customers | schedule | process | parts
  const [loading, setLoading] = useState(true)

  // Shared data from API
  const [vehicles, setVehicles] = useState([])
  const [appointments, setAppointments] = useState([])
  const [serviceOrders, setServiceOrders] = useState([])
  const [parts, setParts] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    fetchMaintenanceData()
  }, [staffId])

  const fetchMaintenanceData = async () => {
    try {
      setLoading(true)
      const [vehiclesData, appointmentsData, serviceOrdersData, partsData, servicesData] = await Promise.all([
        maintenanceAPI.getVehicles().catch(() => []),
        maintenanceAPI.getAppointments().catch(() => []),
        maintenanceAPI.getServiceOrders().catch(() => []),
        maintenanceAPI.getParts().catch(() => []),
        maintenanceAPI.getServices().catch(() => [])
      ])
      setVehicles(vehiclesData || [])
      setAppointments(appointmentsData || [])
      setServiceOrders(serviceOrdersData || [])
      setParts(partsData || [])
      setServices(servicesData || [])
    } catch (error) {
      console.error('Error fetching maintenance data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper để normalize status từ database
  const normalizeStatus = (status) => {
    if (!status) return ''
    return status.toUpperCase().replace(/-/g, '_')
  }

  // Customers & Vehicles - Group by customer_id
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const customerIds = useMemo(() => [...new Set(vehicles.map(v => v.customerId).filter(Boolean))], [vehicles])
  const customerVehicles = useMemo(() => 
    vehicles.filter(v => !selectedCustomerId ? true : v.customerId === selectedCustomerId), 
    [vehicles, selectedCustomerId]
  )

  // Schedule & Services - Map appointments and service orders
  const pending = useMemo(() => 
    appointments.filter(a => normalizeStatus(a.status) === 'PENDING'), 
    [appointments]
  )
  const confirmed = useMemo(() => 
    appointments.filter(a => normalizeStatus(a.status) === 'CONFIRMED'), 
    [appointments]
  )
  
  // Service Orders
  const queuedOrders = useMemo(() => 
    serviceOrders.filter(o => normalizeStatus(o.status) === 'QUEUED'), 
    [serviceOrders]
  )
  const inProgressOrders = useMemo(() => 
    serviceOrders.filter(o => normalizeStatus(o.status) === 'IN_PROGRESS'), 
    [serviceOrders]
  )
  const completedOrders = useMemo(() => 
    serviceOrders.filter(o => normalizeStatus(o.status) === 'COMPLETED'), 
    [serviceOrders]
  )

  const confirmAppointment = async (appointmentId) => {
    try {
      await maintenanceAPI.confirmAppointment(appointmentId)
      fetchMaintenanceData()
    } catch (error) {
      console.error('Error confirming appointment:', error)
      alert('Lỗi khi xác nhận lịch hẹn')
    }
  }

  const assignTechnician = async (orderId, technicianId) => {
    try {
      await maintenanceAPI.assignTechnician(orderId, technicianId)
      fetchMaintenanceData()
    } catch (error) {
      console.error('Error assigning technician:', error)
      alert('Lỗi khi phân công kỹ thuật viên')
    }
  }

  const updateServiceOrderStatus = async (orderId, status) => {
    try {
      await maintenanceAPI.updateServiceOrderStatus(orderId, status)
      fetchMaintenanceData()
    } catch (error) {
      console.error('Error updating service order status:', error)
      alert('Lỗi khi cập nhật trạng thái')
    }
  }

  const createServiceOrderFromAppointment = async (appointmentId) => {
    try {
      await maintenanceAPI.createServiceOrderFromAppointment(appointmentId)
      fetchMaintenanceData()
    } catch (error) {
      console.error('Error creating service order:', error)
      alert('Lỗi khi tạo phiếu bảo dưỡng')
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
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Bảng điều khiển Nhân viên (Staff)</h2>

        <div className="flex gap-2 mb-6">
          {['customers','schedule','process','parts'].map(t => (
            <button key={t} onClick={()=>setActiveTab(t)} className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab===t ? 'bg-green-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>
              {t==='customers'?'Khách hàng & Xe':t==='schedule'?'Lịch hẹn':t==='process'?'Quy trình bảo dưỡng':'Quản lý phụ tùng'}
            </button>
          ))}
        </div>

        {activeTab==='customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-4 lg:col-span-1">
              <h3 className="font-semibold mb-3">Khách hàng (ID)</h3>
              <ul className="divide-y">
                {customerIds.map(customerId => (
                  <li 
                    key={customerId} 
                    className={`py-2 cursor-pointer ${selectedCustomerId===customerId?'text-green-700 font-medium':''}`} 
                    onClick={()=>setSelectedCustomerId(customerId)}
                  >
                    Customer ID: {customerId}
                  </li>
                ))}
                {customerIds.length === 0 && <li className="py-2 text-gray-500 text-sm">Chưa có khách hàng</li>}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
              <h3 className="font-semibold mb-3">Xe của khách hàng</h3>
              {customerVehicles.length===0 ? (
                <p className="text-gray-600 text-sm">Chưa có xe.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Brand</th>
                      <th className="px-3 py-2 text-left">Model</th>
                      <th className="px-3 py-2 text-left">VIN</th>
                      <th className="px-3 py-2 text-left">Odometer (km)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {customerVehicles.map(v => (
                      <tr key={v.vehicleId}>
                        <td className="px-3 py-2">{v.brand || '-'}</td>
                        <td className="px-3 py-2">{v.model || '-'}</td>
                        <td className="px-3 py-2">{v.vin || '-'}</td>
                        <td className="px-3 py-2">{v.odometerKm ? Number(v.odometerKm).toLocaleString() : '-'}</td>
                      </tr>
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
              <h3 className="font-semibold mb-3">Lịch hẹn chờ xác nhận</h3>
              {pending.length===0 ? (
                <p className="text-gray-600 text-sm">Không có.</p>
              ) : (
                <ul className="space-y-2">
                  {pending.map(apt => (
                    <li key={apt.appointmentId} className="border rounded-md p-3 flex items-center justify-between">
                      <div className="text-sm">
                        <div>ID: {apt.appointmentId} • Vehicle: {apt.vehicleId}</div>
                        <div className="text-gray-500">{new Date(apt.requestedDateTime).toLocaleString('vi-VN')}</div>
                      </div>
                      <button 
                        onClick={()=>confirmAppointment(apt.appointmentId)} 
                        className="px-3 py-1 rounded-md bg-green-600 text-white text-xs"
                      >
                        Xác nhận
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Lịch hẹn đã xác nhận</h3>
              {confirmed.length===0 ? (
                <p className="text-gray-600 text-sm">Không có.</p>
              ) : (
                <ul className="space-y-2">
                  {confirmed.map(apt => (
                    <li key={apt.appointmentId} className="border rounded-md p-3">
                      <div className="text-sm mb-2">
                        <div>ID: {apt.appointmentId} • Vehicle: {apt.vehicleId}</div>
                        <div className="text-gray-500">{new Date(apt.requestedDateTime).toLocaleString('vi-VN')}</div>
                      </div>
                      <button 
                        onClick={()=>createServiceOrderFromAppointment(apt.appointmentId)} 
                        className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs"
                      >
                        Tạo phiếu bảo dưỡng
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab==='process' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatusColumn 
              title="Chờ xử lý" 
              data={queuedOrders} 
              onMove={(id)=>updateServiceOrderStatus(id,'in_progress')} 
              moveLabel="Bắt đầu" 
            />
            <StatusColumn 
              title="Đang bảo dưỡng" 
              data={inProgressOrders} 
              onMove={(id)=>updateServiceOrderStatus(id,'completed')} 
              moveLabel="Hoàn tất" 
            />
            <StatusColumn 
              title="Hoàn tất" 
              data={completedOrders} 
              onMove={null} 
            />
          </div>
        )}

        {activeTab==='parts' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">Danh sách phụ tùng</h3>
            {parts.length === 0 ? (
              <p className="text-gray-600 text-sm">Chưa có phụ tùng.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Mã</th>
                    <th className="px-3 py-2 text-left">Tên</th>
                    <th className="px-3 py-2 text-left">Danh mục</th>
                    <th className="px-3 py-2 text-left">Giá (VNĐ)</th>
                    <th className="px-3 py-2 text-left">Nhà sản xuất</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {parts.map(p => (
                    <tr key={p.partId}>
                      <td className="px-3 py-2">{p.partCode || '-'}</td>
                      <td className="px-3 py-2">{p.name || '-'}</td>
                      <td className="px-3 py-2">{p.category || '-'}</td>
                      <td className="px-3 py-2">{p.unitPrice ? Number(p.unitPrice).toLocaleString('vi-VN') : '-'}</td>
                      <td className="px-3 py-2">{p.manufacturer || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
      {data.length===0 ? (
        <p className="text-gray-600 text-sm">Không có.</p>
      ) : (
        <ul className="space-y-2">
          {data.map(order => (
            <li key={order.orderId} className="border rounded-md p-3 flex items-center justify-between text-sm">
              <div>
                <div>Order ID: {order.orderId}</div>
                <div className="text-gray-500">Vehicle: {order.vehicleId}</div>
                {order.totalAmount && (
                  <div className="text-gray-500">Tổng: {Number(order.totalAmount).toLocaleString('vi-VN')} VNĐ</div>
                )}
              </div>
              {onMove && (
                <button onClick={()=>onMove(order.orderId)} className="px-3 py-1 rounded-md border hover:bg-gray-50">
                  {moveLabel||'Chuyển'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Staff


