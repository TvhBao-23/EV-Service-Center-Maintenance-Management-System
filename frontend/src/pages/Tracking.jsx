import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { customerAPI } from '../lib/api.js'

function Tracking() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [editingKm, setEditingKm] = useState(null)
  const [newKm, setNewKm] = useState('')

  const params = new URLSearchParams(location.search)
  const success = params.get('success') === '1'

  useEffect(() => {
    if (!isAuthenticated) return
    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [vehiclesData, appointmentsData] = await Promise.all([
        customerAPI.getVehicles(),
        customerAPI.getAppointments()
      ])
      setVehicles(vehiclesData)
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentAppointment = useMemo(() => {
    if (!appointments.length) return null
    // Find pending or confirmed appointments
    const activeAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed')
    if (activeAppointments.length > 0) {
      return activeAppointments.sort((a,b)=> new Date(b.requestedDateTime) - new Date(a.requestedDateTime))[0]
    }
    return appointments.sort((a,b)=> new Date(b.requestedDateTime) - new Date(a.requestedDateTime))[0] || null
  }, [appointments])

  const currentVehicle = useMemo(() => {
    if (!currentAppointment) return null
    return vehicles.find(v => v.vehicleId === currentAppointment.vehicleId) || null
  }, [vehicles, currentAppointment])

  const activeAppointments = useMemo(() => {
    return appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
  }, [appointments])

  // Filtered and sorted appointments for the table
  const filteredAppointments = useMemo(() => {
    let filtered = appointments

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus)
    }

    // Sort appointments
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.requestedDateTime) - new Date(a.requestedDateTime)
        case 'status':
          const statusOrder = { 'pending': 0, 'confirmed': 1, 'completed': 2, 'cancelled': 3 }
          return statusOrder[a.status] - statusOrder[b.status]
        default:
          return 0
      }
    })

    return filtered
  }, [appointments, filterStatus, sortBy])

  // Payment reminders for service plans
  const paymentReminders = useMemo(() => {
    const pendingAppointments = appointments.filter(a => a.status === 'pending')
    const totalAmount = pendingAppointments.length * 750000 // Default amount per appointment
    
    return {
      count: pendingAppointments.length,
      totalAmount,
      hasReminders: pendingAppointments.length > 0
    }
  }, [appointments])

  // AI-powered Smart reminders: periodic maintenance by km or time
  const reminders = useMemo(() => {
    if (!vehicles.length) return []
    const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6
    const DUE_SOON_MS = 1000 * 60 * 60 * 24 * 30 // 1 month
    const KM_INTERVAL = 10000
    const KM_SOON = 9000

    const now = Date.now()

    const getLastMaintenanceDate = (vehicleId) => {
      const completedAppointments = appointments.filter(a => 
        a.vehicleId === vehicleId && a.status === 'completed'
      )
      if (completedAppointments.length) {
        const d = new Date(completedAppointments[completedAppointments.length - 1].requestedDateTime)
        return isNaN(d.getTime()) ? null : d
      }
      const v = vehicles.find(v => v.vehicleId === vehicleId)
      if (v?.year) {
        const d = new Date(v.year, 0, 1)
        return isNaN(d.getTime()) ? null : d
      }
      return null
    }

    // Check if vehicle has active appointments (pending, confirmed)
    const hasActiveAppointment = (vehicleId) => {
      return appointments.some(a => 
        a.vehicleId === vehicleId && 
        ['pending', 'confirmed'].includes(a.status)
      )
    }

    // AI Analysis: Calculate maintenance urgency based on multiple factors
    const calculateMaintenanceUrgency = (vehicle) => {
      const lastDate = getLastMaintenanceDate(vehicle.vehicleId)
      const km = Number(vehicle.odometerKm || 0)
      const hasAppointment = hasActiveAppointment(vehicle.vehicleId)
      
      // Base urgency score (0-100)
      let urgencyScore = 0
      let reasons = []

      // Time-based analysis
      if (lastDate) {
        const nextDue = lastDate.getTime() + SIX_MONTHS_MS
        const diff = nextDue - now
        const daysOverdue = Math.abs(diff) / (1000 * 60 * 60 * 24)
        
        if (diff <= 0) {
          urgencyScore += Math.min(50, daysOverdue * 2) // Max 50 points for time overdue
          reasons.push(`Quá hạn ${Math.ceil(daysOverdue)} ngày`)
        } else if (diff <= DUE_SOON_MS) {
          urgencyScore += Math.max(10, 30 - (daysOverdue * 0.5)) // 10-30 points for soon due
          reasons.push(`Còn ${Math.ceil(daysOverdue)} ngày`)
        }
      }

      // KM-based analysis
      const kmModulo = km % KM_INTERVAL
      if (kmModulo >= KM_INTERVAL - 1) {
        urgencyScore += Math.min(40, (kmModulo - KM_INTERVAL + 1) * 0.1) // Max 40 points for km overdue
        reasons.push(`Vượt ${(kmModulo - KM_INTERVAL + 1).toLocaleString()} km`)
      } else if (kmModulo >= KM_SOON) {
        urgencyScore += Math.max(5, 20 - ((KM_INTERVAL - kmModulo) * 0.01)) // 5-20 points for km soon
        reasons.push(`Còn ${(KM_INTERVAL - kmModulo).toLocaleString()} km`)
      }

      // Vehicle age factor (older vehicles need more frequent maintenance)
      if (vehicle.year) {
        const age = new Date().getFullYear() - vehicle.year
        if (age > 5) urgencyScore += 10
        if (age > 10) urgencyScore += 15
      }

      // Usage frequency analysis (if we have maintenance history)
      const maintenanceCount = appointments.filter(a => a.vehicleId === vehicle.vehicleId).length
      if (maintenanceCount > 0) {
        const avgInterval = km / Math.max(1, maintenanceCount)
        if (avgInterval > KM_INTERVAL * 1.5) urgencyScore += 15 // Heavy usage
      }

      return {
        score: Math.min(100, urgencyScore),
        reasons,
        hasAppointment,
        priority: urgencyScore > 70 ? 'high' : urgencyScore > 40 ? 'medium' : 'low'
      }
    }

    const items = []
    for (const v of vehicles) {
      const analysis = calculateMaintenanceUrgency(v)
      
      // Skip if urgency is too low or already has appointment
      if (analysis.score < 10) continue

      // Determine status based on analysis and existing appointments
      let status, label, detail
      
      if (analysis.hasAppointment) {
        status = 'booked'
        label = 'Đã đặt lịch bảo dưỡng'
        detail = 'Xe đã có lịch đặt trong hệ thống'
      } else if (analysis.score >= 70) {
        status = 'overdue'
        label = 'Cần bảo dưỡng khẩn cấp'
        detail = analysis.reasons.join(', ')
      } else if (analysis.score >= 40) {
        status = 'soon'
        label = 'Nên bảo dưỡng sớm'
        detail = analysis.reasons.join(', ')
      } else {
        status = 'suggested'
        label = 'Gợi ý bảo dưỡng'
        detail = analysis.reasons.join(', ')
      }

      items.push({
        vehicleId: v.vehicleId,
        vehicleModel: v.model,
        type: 'ai_analysis',
        label,
        status,
        detail,
        urgencyScore: analysis.score,
        priority: analysis.priority,
        hasAppointment: analysis.hasAppointment
      })
    }

    // Sort by urgency score (highest first)
    return items.sort((a, b) => b.urgencyScore - a.urgencyScore)
  }, [vehicles, appointments])

  // Update vehicle km
  const handleUpdateKm = (vehicleId) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId)
    if (!vehicle) return

    setEditingKm(vehicleId)
    setNewKm(vehicle.odometerKm || '')
  }

  const handleSaveKm = async (vehicleId) => {
    if (!newKm || isNaN(Number(newKm))) return

    try {
      await customerAPI.updateVehicle(vehicleId, { odometerKm: Number(newKm) })
      loadData() // Reload data from backend
      setEditingKm(null)
      setNewKm('')
    } catch (error) {
      console.error('Error updating vehicle km:', error)
    }
  }

  const handleCancelKm = () => {
    setEditingKm(null)
    setNewKm('')
  }

  // Read-only for customer; statuses are shown but not editable here.

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Theo dõi & Nhắc nhở</h2>

        {success && currentVehicle && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-medium">Đặt lịch thành công!</p>
            <p className="text-sm mt-1">Xe {currentVehicle.model} ({currentVehicle.vin}) đã được đặt lịch vào {new Date(currentAppointment?.requestedDateTime).toLocaleDateString()}.</p>
          </div>
        )}

        {/* Payment Reminders */}
        {paymentReminders.hasReminders && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-900">Nhắc thanh toán gói bảo dưỡng định kỳ</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Bạn có {paymentReminders.count} lịch đặt chờ thanh toán với tổng số tiền {paymentReminders.totalAmount.toLocaleString()} VNĐ
                </p>
              </div>
              <Link
                to="/payment"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
              >
                Thanh toán
              </Link>
            </div>
          </div>
        )}

        {/* AI-Powered Smart Reminders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nhắc nhở thông minh (AI)</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Khẩn cấp</span>
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Sớm</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Gợi ý</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Đã đặt lịch</span>
            </div>
          </div>
          
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Chưa có nhắc nhở nào. Hãy cập nhật km hiện tại của xe và thêm lịch sử sau bảo dưỡng để AI phân tích chính xác.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((it, idx) => (
                <div key={idx} className={`border rounded-lg p-4 ${
                  it.priority === 'high' ? 'border-red-200 bg-red-50' :
                  it.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  it.status === 'booked' ? 'border-green-200 bg-green-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{it.vehicleModel}</p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          it.status === 'booked' ? 'bg-green-100 text-green-700' :
                          it.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          it.status === 'soon' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {it.label}
                        </span>
                        {it.urgencyScore > 0 && (
                          <span className="text-xs text-gray-500">
                            Độ ưu tiên: {it.urgencyScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{it.detail}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {it.status === 'booked' ? (
                        <span className="text-xs px-3 py-1 rounded-md bg-green-600 text-white">
                          ✓ Đã đặt lịch
                        </span>
                      ) : (
                        <Link
                          to={`/booking?vehicleId=${encodeURIComponent(it.vehicleId)}`}
                          className={`text-xs px-3 py-1 rounded-md text-white hover:opacity-90 ${
                            it.priority === 'high' ? 'bg-red-600 hover:bg-red-700' :
                            it.priority === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                            'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          Đặt lịch bảo dưỡng
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xe đang bảo dưỡng</h3>
          {activeAppointments.length === 0 ? (
            <p className="text-gray-600">Hiện chưa có xe nào đang trong quá trình bảo dưỡng.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAppointments.map((appointment) => {
                const v = vehicles.find(x => x.vehicleId === appointment.vehicleId)
                if (!v) return null
                const badge = appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                const label = appointment.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'
                return (
                  <div key={appointment.appointmentId} className="border rounded-lg p-4">
                    <p className="text-gray-900 font-medium">{v.model}</p>
                    <p className="text-sm text-gray-600">VIN: {v.vin}</p>
                    <p className="text-sm text-gray-600 mt-1">Lịch đặt: #{appointment.appointmentId}</p>
                    <p className="text-sm text-gray-600">Thời gian: {new Date(appointment.requestedDateTime).toLocaleDateString()}</p>
                    <span className={`inline-block mt-3 px-2 py-1 text-xs font-semibold rounded-full ${badge}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Vehicle Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tổng số xe</h3>
            <p className="text-3xl font-bold text-green-600">{vehicles.length}</p>
            <p className="text-gray-600 text-sm">Xe đang được quản lý</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chờ thanh toán</h3>
            <p className="text-3xl font-bold text-orange-600">{paymentReminders.count}</p>
            <p className="text-gray-600 text-sm">Lịch chờ thanh toán</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Đang bảo dưỡng</h3>
            <p className="text-3xl font-bold text-blue-600">{activeAppointments.length}</p>
            <p className="text-gray-600 text-sm">Xe đang được bảo dưỡng</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nhắc nhở</h3>
            <p className="text-3xl font-bold text-red-600">{reminders.length}</p>
            <p className="text-gray-600 text-sm">Cần bảo dưỡng</p>
          </div>
        </div>

        {/* Vehicle List with KM Update */}
        {vehicles.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xe & Cập nhật km</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{vehicle.model}</p>
                      <p className="text-sm text-gray-600">VIN: {vehicle.vin}</p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {vehicle.year || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Km hiện tại
                    </label>
                    {editingKm === vehicle.vehicleId ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newKm}
                          onChange={(e) => setNewKm(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Nhập km"
                        />
                        <button
                          onClick={() => handleSaveKm(vehicle.vehicleId)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={handleCancelKm}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          {vehicle.odometerKm ? vehicle.odometerKm.toLocaleString() : 'Chưa cập nhật'} km
                        </span>
                        <button
                          onClick={() => handleUpdateKm(vehicle.vehicleId)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Cập nhật
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách lịch đặt</h3>
            
            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn tất</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Sắp xếp theo ngày</option>
                  <option value="status">Sắp xếp theo trạng thái</option>
                  <option value="service">Sắp xếp theo dịch vụ</option>
                </select>
              </div>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {appointments.length === 0 
                  ? 'Chưa có lịch đặt nào.' 
                  : 'Không có lịch đặt nào phù hợp với bộ lọc đã chọn.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lịch đặt</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => {
                    const v = vehicles.find(x => x.vehicleId === appointment.vehicleId)
                    const statusClass =
                      appointment.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    return (
                      <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{v ? v.model : 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{v ? v.vin : appointment.vehicleId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">#{appointment.appointmentId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(appointment.requestedDateTime).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{appointment.notes || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                            {appointment.status === 'pending' && 'Chờ xác nhận'}
                            {appointment.status === 'confirmed' && 'Đã xác nhận'}
                            {appointment.status === 'completed' && 'Hoàn tất'}
                            {appointment.status === 'cancelled' && 'Đã hủy'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Tracking
