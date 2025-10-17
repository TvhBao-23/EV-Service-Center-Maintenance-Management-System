import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getCurrentUserId, loadList, saveList } from '../lib/store'

function Tracking() {
  const location = useLocation()
  const userId = useMemo(() => getCurrentUserId(), [])
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [records, setRecords] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [editingKm, setEditingKm] = useState(null)
  const [newKm, setNewKm] = useState('')

  const params = new URLSearchParams(location.search)
  const success = params.get('success') === '1'
  const successBookingId = params.get('bookingId') || ''

  useEffect(() => {
    if (!userId) return
    setVehicles(loadList('vehicles', []))
    setBookings(loadList('bookings', []))
    setRecords(loadList('records', []))
  }, [userId])

  const currentBooking = useMemo(() => {
    if (!bookings.length) return null
    // Show the booking from success param first, otherwise find active maintenance
    const byId = bookings.find(b => b.id === successBookingId)
    if (byId) return byId
    
    // Tìm xe đang bảo dưỡng (received hoặc in_maintenance)
    const activeMaintenance = bookings.filter(b => b.status === 'received' || b.status === 'in_maintenance')
    if (activeMaintenance.length > 0) {
      return activeMaintenance.sort((a,b)=> (b.id > a.id ? 1 : -1))[0]
    }
    
    // Nếu không có xe đang bảo dưỡng, hiển thị xe chờ tiếp nhận gần nhất
    const pending = bookings.filter(b => b.status === 'pending')
    return pending.sort((a,b)=> (b.id > a.id ? 1 : -1))[0] || null
  }, [bookings, successBookingId])

  const currentVehicle = useMemo(() => {
    if (!currentBooking) return null
    return vehicles.find(v => v.id === currentBooking.vehicleId) || null
  }, [vehicles, currentBooking])

  const activeBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'received' || b.status === 'in_maintenance')
  }, [bookings])

  // Filtered and sorted bookings for the table
  const filteredBookings = useMemo(() => {
    let filtered = bookings

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus)
    }

    // Sort bookings
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
        case 'status':
          const statusOrder = { 'pending': 0, 'received': 1, 'in_maintenance': 2, 'done': 3, 'cancelled': 4 }
          return statusOrder[a.status] - statusOrder[b.status]
        case 'service':
          return a.serviceType.localeCompare(b.serviceType)
        default:
          return 0
      }
    })

    return filtered
  }, [bookings, filterStatus, sortBy])

  // Payment reminders for service plans
  const paymentReminders = useMemo(() => {
    const pendingBookings = bookings.filter(b => b.status === 'pending')
    const totalAmount = pendingBookings.reduce((sum, b) => sum + (b.estimatedPrice || 0), 0)
    
    return {
      count: pendingBookings.length,
      totalAmount,
      hasReminders: pendingBookings.length > 0
    }
  }, [bookings])

  // AI-powered Smart reminders: periodic maintenance by km or time
  const reminders = useMemo(() => {
    if (!vehicles.length) return []
    const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6
    const DUE_SOON_MS = 1000 * 60 * 60 * 24 * 30 // 1 month
    const KM_INTERVAL = 10000
    const KM_SOON = 9000

    const now = Date.now()

    const getLastMaintenanceDate = (vehicleId) => {
      const done = (records || []).filter(r => (r.vehicleId === vehicleId) && (r.status === 'done' || r.status === 'Hoàn tất'))
      if (done.length) {
        // assume r.date is yyyy-MM-dd
        const d = new Date(done[done.length - 1].date)
        return isNaN(d.getTime()) ? null : d
      }
      const v = vehicles.find(v => v.id === vehicleId)
      if (v?.purchaseDate) {
        const d = new Date(v.purchaseDate)
        return isNaN(d.getTime()) ? null : d
      }
      return null
    }

    // Check if vehicle has active bookings (pending, received, in_maintenance)
    const hasActiveBooking = (vehicleId) => {
      return bookings.some(b => 
        b.vehicleId === vehicleId && 
        ['pending', 'received', 'in_maintenance'].includes(b.status)
      )
    }

    // AI Analysis: Calculate maintenance urgency based on multiple factors
    const calculateMaintenanceUrgency = (vehicle) => {
      const lastDate = getLastMaintenanceDate(vehicle.id)
      const km = Number(vehicle.currentKm || 0)
      const hasBooking = hasActiveBooking(vehicle.id)
      
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
      const maintenanceCount = records.filter(r => r.vehicleId === vehicle.id).length
      if (maintenanceCount > 0) {
        const avgInterval = km / Math.max(1, maintenanceCount)
        if (avgInterval > KM_INTERVAL * 1.5) urgencyScore += 15 // Heavy usage
      }

      return {
        score: Math.min(100, urgencyScore),
        reasons,
        hasBooking,
        priority: urgencyScore > 70 ? 'high' : urgencyScore > 40 ? 'medium' : 'low'
      }
    }

    const items = []
    for (const v of vehicles) {
      const analysis = calculateMaintenanceUrgency(v)
      
      // Skip if urgency is too low or already has booking
      if (analysis.score < 10) continue

      // Determine status based on analysis and existing bookings
      let status, label, detail
      
      if (analysis.hasBooking) {
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
        vehicleId: v.id,
        vehicleModel: v.model,
        type: 'ai_analysis',
        label,
        status,
        detail,
        urgencyScore: analysis.score,
        priority: analysis.priority,
        hasBooking: analysis.hasBooking
      })
    }

    // Sort by urgency score (highest first)
    return items.sort((a, b) => b.urgencyScore - a.urgencyScore)
  }, [vehicles, records, bookings])

  // Update vehicle km
  const handleUpdateKm = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    if (!vehicle) return

    setEditingKm(vehicleId)
    setNewKm(vehicle.currentKm || '')
  }

  const handleSaveKm = (vehicleId) => {
    if (!newKm || isNaN(Number(newKm))) return

    const updatedVehicles = vehicles.map(v => 
      v.id === vehicleId 
        ? { ...v, currentKm: Number(newKm) }
        : v
    )
    
    setVehicles(updatedVehicles)
    saveList('vehicles', updatedVehicles)
    setEditingKm(null)
    setNewKm('')
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
            <p className="text-sm mt-1">Xe {currentVehicle.model} ({currentVehicle.vin}) đã được đặt lịch {currentBooking?.serviceType?.toLowerCase()} vào {currentBooking?.date} lúc {currentBooking?.time}.</p>
          </div>
        )}

        {/* Vehicle Status Cards - moved to top */}
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
            <p className="text-3xl font-bold text-blue-600">{activeBookings.length}</p>
            <p className="text-gray-600 text-sm">Xe đang được bảo dưỡng</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nhắc nhở</h3>
            <p className="text-3xl font-bold text-red-600">{reminders.length}</p>
            <p className="text-gray-600 text-sm">Cần bảo dưỡng</p>
          </div>
        </div>

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
          {activeBookings.length === 0 ? (
            <p className="text-gray-600">Hiện chưa có xe nào đang trong quá trình bảo dưỡng.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBookings.map((ab) => {
                const v = vehicles.find(x => x.id === ab.vehicleId)
                if (!v) return null
                const badge = ab.status === 'received' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                const label = ab.status === 'received' ? 'Đã tiếp nhận' : 'Đang bảo dưỡng'
                return (
                  <div key={ab.id} className="border rounded-lg p-4">
                    <p className="text-gray-900 font-medium">{v.model}</p>
                    <p className="text-sm text-gray-600">VIN: {v.vin}</p>
                    <p className="text-sm text-gray-600 mt-1">Dịch vụ: {ab.serviceType}</p>
                    <p className="text-sm text-gray-600">Thời gian: {ab.date} {ab.time}</p>
                    <span className={`inline-block mt-3 px-2 py-1 text-xs font-semibold rounded-full ${badge}`}>{label}</span>
                  </div>
                )
              })}
            </div>
          )}
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
                    {editingKm === vehicle.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newKm}
                          onChange={(e) => setNewKm(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Nhập km"
                        />
                        <button
                          onClick={() => handleSaveKm(vehicle.id)}
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
                          {vehicle.currentKm ? vehicle.currentKm.toLocaleString() : 'Chưa cập nhật'} km
                        </span>
                        <button
                          onClick={() => handleUpdateKm(vehicle.id)}
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
                  <option value="pending">Chờ tiếp nhận</option>
                  <option value="received">Đã tiếp nhận</option>
                  <option value="in_maintenance">Đang bảo dưỡng</option>
                  <option value="done">Hoàn tất</option>
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

          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {bookings.length === 0 
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trung tâm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá dự kiến</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((b) => {
                    const v = vehicles.find(x => x.id === b.vehicleId)
                    const statusClass =
                      b.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                      b.status === 'received' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'in_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'done' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{v ? v.model : 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{v ? v.vin : b.vehicleId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.serviceType}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div>{b.date}</div>
                          <div className="text-gray-500 text-xs">{b.time}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.center || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {b.estimatedPrice ? `${b.estimatedPrice.toLocaleString()} VNĐ` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                            {b.status === 'pending' && 'Chờ tiếp nhận'}
                            {b.status === 'received' && 'Đã tiếp nhận'}
                            {b.status === 'in_maintenance' && 'Đang bảo dưỡng'}
                            {b.status === 'done' && 'Hoàn tất'}
                            {b.status === 'cancelled' && 'Đã hủy'}
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
