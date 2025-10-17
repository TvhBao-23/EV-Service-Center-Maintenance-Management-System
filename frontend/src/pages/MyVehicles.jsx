import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadList } from '../lib/store'

function MyVehicles() {
  const [vehicles] = useState(() => loadList('vehicles', []))
  const [viewing, setViewing] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // View-only: vehicles are managed by staff/admin
  }, [])

  const handleBook = (id) => {
    navigate(`/booking?vehicleId=${encodeURIComponent(id)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content (header moved to layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Xe của tôi</h2>
            <p className="text-gray-600">Thông tin xe được quản lý bởi nhân viên</p>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có xe nào</h3>
            <p className="text-gray-600">Vui lòng liên hệ nhân viên trung tâm để thêm xe vào hồ sơ.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 flex-1">{vehicle.model}</h3>
                  <button
                    onClick={()=>setViewing(vehicle)}
                    className="ml-2 p-2 rounded-md hover:bg-gray-100 text-gray-600"
                    title="Xem chi tiết"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">VIN:</span> {vehicle.vin}</p>
                  <p><span className="font-medium">Ngày mua:</span> {vehicle.purchaseDate}</p>
                  <p><span className="font-medium">Km hiện tại:</span> {vehicle.currentKm.toLocaleString()} km</p>
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={()=>handleBook(vehicle.id)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Đặt lịch</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {viewing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chi tiết xe</h3>
              <button onClick={()=>setViewing(null)} className="p-2 rounded-md hover:bg-gray-100" title="Đóng">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-medium">Model:</span> {viewing.model}</p>
              <p><span className="font-medium">VIN:</span> {viewing.vin}</p>
              <p><span className="font-medium">Ngày mua:</span> {viewing.purchaseDate || '—'}</p>
              <p><span className="font-medium">Km hiện tại:</span> {Number(viewing.currentKm || 0).toLocaleString()} km</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={()=>setViewing(null)} className="px-4 py-2 rounded-lg border">Đóng</button>
              <button onClick={()=>{ const id=viewing.id; setViewing(null); handleBook(id) }} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Đặt lịch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyVehicles
