import { useEffect, useMemo, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { getCurrentUserId, loadList } from '../lib/store'

function Tracking() {
  const location = useLocation()
  const userId = useMemo(() => getCurrentUserId(), [])
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [records, setRecords] = useState([])

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

  // Smart reminders: periodic maintenance by km or time
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

    const items = []
    for (const v of vehicles) {
      // Time-based
      const lastDate = getLastMaintenanceDate(v.id)
      if (lastDate) {
        const nextDue = lastDate.getTime() + SIX_MONTHS_MS
        const diff = nextDue - now
        if (diff <= 0) {
          items.push({ vehicleId: v.id, vehicleModel: v.model, type: 'time', label: 'Bảo dưỡng định kỳ theo thời gian', status: 'overdue', detail: 'Quá hạn 6 tháng' })
        } else if (diff <= DUE_SOON_MS) {
          items.push({ vehicleId: v.id, vehicleModel: v.model, type: 'time', label: 'Bảo dưỡng định kỳ theo thời gian', status: 'soon', detail: 'Sắp đến hạn 6 tháng' })
        }
      }

      // Km-based
      const km = Number(v.currentKm || 0)
      const modulo = km % KM_INTERVAL
      if (modulo >= KM_INTERVAL - 1) {
        items.push({ vehicleId: v.id, vehicleModel: v.model, type: 'km', label: 'Bảo dưỡng định kỳ theo km', status: 'overdue', detail: `Vượt ${KM_INTERVAL.toLocaleString()} km` })
      } else if (modulo >= KM_SOON) {
        items.push({ vehicleId: v.id, vehicleModel: v.model, type: 'km', label: 'Bảo dưỡng định kỳ theo km', status: 'soon', detail: `Sắp chạm ${KM_INTERVAL.toLocaleString()} km` })
      }
    }
    return items
  }, [vehicles, records])

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

        {/* Smart Reminders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhắc nhở thông minh</h3>
          {reminders.length === 0 ? (
            <p className="text-gray-600 text-sm">Chưa có nhắc nhở nào. Hãy cập nhật km hiện tại của xe và thêm lịch sử sau bảo dưỡng để hệ thống nhắc chính xác.</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((it, idx) => (
                <div key={idx} className="flex items-start justify-between border rounded-md p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{it.vehicleModel} • {it.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{it.detail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      it.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {it.status === 'overdue' ? 'Đã quá hạn' : 'Sắp đến hạn'}
                    </span>
                    <Link
                      to={`/booking?vehicleId=${encodeURIComponent(it.vehicleId)}`}
                      className="text-xs px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700"
                    >
                      Đặt lịch bảo dưỡng
                    </Link>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tổng số xe</h3>
            <p className="text-3xl font-bold text-green-600">{vehicles.length}</p>
            <p className="text-gray-600 text-sm">Xe đang được quản lý</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bảo dưỡng sắp tới</h3>
            <p className="text-3xl font-bold text-yellow-600">{bookings.filter(b=>b.status==='pending').length}</p>
            <p className="text-gray-600 text-sm">Các lịch đang chờ</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lịch gần nhất</h3>
            {bookings.length ? (
              <>
                <p className="text-3xl font-bold text-green-600">{bookings[bookings.length-1].date}</p>
                <p className="text-gray-600 text-sm">{bookings[bookings.length-1].serviceType}</p>
              </>
            ) : (
              <p className="text-gray-600 text-sm">Chưa có lịch nào</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách lịch đặt</h3>
          {bookings.length === 0 ? (
            <p className="text-gray-600">Chưa có lịch đặt nào.</p>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((b) => {
                    const v = vehicles.find(x => x.id === b.vehicleId)
                    const statusClass =
                      b.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                      b.status === 'received' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'in_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'done' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    return (
                      <tr key={b.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{v ? `${v.model} (${v.vin})` : b.vehicleId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.serviceType}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.date} {b.time}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.center || '-'}</td>
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
