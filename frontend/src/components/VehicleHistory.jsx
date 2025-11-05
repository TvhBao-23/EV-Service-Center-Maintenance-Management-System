import { useEffect, useState } from 'react'
import { staffAPI } from '../lib/api'

function VehicleHistory({ vehicleId, onClose }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vehicle, setVehicle] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadVehicleHistory()
  }, [vehicleId])

  const loadVehicleHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const [vehicleData, historyData] = await Promise.all([
        staffAPI.getVehicle(vehicleId),
        staffAPI.getVehicleHistory(vehicleId)
      ])
      setVehicle(vehicleData)
      setHistory(historyData)
    } catch (err) {
      setError('Không thể tải lịch sử: ' + err.message)
      console.error('Load vehicle history error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Lịch sử bảo dưỡng xe</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải lịch sử...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Lỗi:</p>
              <p className="text-sm">{error}</p>
              <button onClick={loadVehicleHistory} className="mt-2 text-sm underline">
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && vehicle && (
            <>
              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin xe</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Model</p>
                    <p className="font-medium">{vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Biển số</p>
                    <p className="font-medium">{vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">VIN</p>
                    <p className="font-medium text-xs">{vehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Km hiện tại</p>
                    <p className="font-medium">{vehicle.currentKm?.toLocaleString()} km</p>
                  </div>
                </div>
              </div>

              {/* Maintenance History Timeline */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Lịch sử bảo dưỡng</h4>
                
                {history.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">Chưa có lịch sử bảo dưỡng</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((item, index) => (
                      <div key={index} className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-0 w-4 h-4 bg-green-600 rounded-full -translate-x-[9px]"></div>
                        
                        <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {item.serviceType || 'Bảo dưỡng định kỳ'}
                              </span>
                              {item.appointmentId && (
                                <span className="ml-2 text-xs text-gray-500">
                                  Lịch hẹn #{item.appointmentId}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          {item.description && (
                            <p className="text-sm text-gray-700 mb-2">{item.description}</p>
                          )}

                          {item.technician && (
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Kỹ thuật viên:</span> {item.technician}
                            </p>
                          )}

                          {item.km && (
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Km lúc bảo dưỡng:</span> {item.km.toLocaleString()} km
                            </p>
                          )}

                          {item.partsReplaced && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-gray-600 font-medium mb-1">Phụ tùng thay thế:</p>
                              <p className="text-xs text-gray-700">{item.partsReplaced}</p>
                            </div>
                          )}

                          {item.notes && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-gray-600 font-medium mb-1">Ghi chú:</p>
                              <p className="text-xs text-gray-700">{item.notes}</p>
                            </div>
                          )}

                          {item.status && (
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'completed' ? 'bg-green-100 text-green-800' :
                              item.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status === 'completed' ? 'Hoàn thành' :
                               item.status === 'in_progress' ? 'Đang thực hiện' :
                               item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default VehicleHistory

