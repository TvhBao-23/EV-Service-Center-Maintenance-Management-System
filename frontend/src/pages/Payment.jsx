import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getCurrentUserId, loadList } from '../lib/store'
import { saveList } from '../lib/store'

function Payment() {
  const { user } = useAuth()
  const userId = getCurrentUserId()
  const [pendingBookings, setPendingBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('banking')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!userId) return
    const bookings = loadList('bookings', [])
    // Filter bookings that need payment (pending status)
    const pending = bookings.filter(b => b.status === 'pending')
    setPendingBookings(pending)
  }, [userId])

  const handlePayment = async () => {
    if (!selectedBooking) return
    
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update booking status to received (paid and ready for service)
    const bookings = loadList('bookings', [])
    const updatedBookings = bookings.map(b => 
      b.id === selectedBooking.id ? { ...b, status: 'received' } : b
    )
    // IMPORTANT: persist using namespaced store key
    saveList('bookings', updatedBookings)
    
    setIsProcessing(false)
    setMessage('Thanh toán thành công! Lịch đặt của bạn đã được xác nhận.')
    
    // Update local state
    setPendingBookings(updatedBookings.filter(b => b.status === 'pending'))
    setSelectedBooking(null)
    
    // Clear message after 5 seconds
    setTimeout(() => setMessage(''), 5000)
  }

  const getVehicleInfo = (vehicleId) => {
    const vehicles = loadList('vehicles', [])
    return vehicles.find(v => v.id === vehicleId)
  }

  const totalDue = pendingBookings.reduce((sum, b) => sum + (Number(b.cost) || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Thanh toán</h2>
          <p className="text-gray-600 mt-2">Thanh toán cho các lịch đặt dịch vụ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tổng cần thanh toán</h3>
            <p className="text-3xl font-bold text-green-600">{totalDue.toLocaleString('vi-VN')} VNĐ</p>
            <p className="text-sm text-gray-500 mt-1">Từ các lịch đặt chờ thanh toán</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-medium">{message}</p>
          </div>
        )}

        {pendingBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có lịch đặt nào cần thanh toán</h3>
            <p className="text-gray-600">Tất cả lịch đặt của bạn đã được thanh toán hoặc chưa có lịch đặt nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking List */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch đặt chờ thanh toán</h3>
              <div className="space-y-4">
                {pendingBookings.map((booking) => {
                  const vehicle = getVehicleInfo(booking.vehicleId)
                  return (
                    <div
                      key={booking.id}
                      className={`bg-white rounded-lg shadow-md p-4 border-2 cursor-pointer transition-all ${
                        selectedBooking?.id === booking.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{vehicle?.model || 'Unknown Vehicle'}</h4>
                          <p className="text-sm text-gray-600">VIN: {vehicle?.vin || 'N/A'}</p>
                          <p className="text-sm text-gray-600 mt-1">Dịch vụ: {booking.serviceType}</p>
                          <p className="text-sm text-gray-600">Thời gian: {booking.date} {booking.time}</p>
                          <p className="text-sm text-gray-600">Trung tâm: {booking.center}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{booking.cost?.toLocaleString('vi-VN')} VNĐ</p>
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Chờ thanh toán
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thanh toán</h3>
                
                {selectedBooking ? (
                  <>
                    <div className="mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900">Chi tiết lịch đặt</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {getVehicleInfo(selectedBooking.vehicleId)?.model} - {selectedBooking.serviceType}
                        </p>
                        <p className="text-sm text-gray-600">{selectedBooking.date} {selectedBooking.time}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Tổng tiền:</span>
                        <span className="text-xl font-bold text-green-600">
                          {selectedBooking.cost?.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</label>
                      <div className="space-y-3">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="banking"
                            checked={paymentMethod === 'banking'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              <span className="font-medium">Chuyển khoản ngân hàng</span>
                            </div>
                            <p className="text-sm text-gray-600">Thanh toán qua internet banking</p>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="ewallet"
                            checked={paymentMethod === 'ewallet'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="flex items-center">
                              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span className="font-medium">Ví điện tử</span>
                            </div>
                            <p className="text-sm text-gray-600">MoMo, ZaloPay, VNPay</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Thanh toán {selectedBooking.cost?.toLocaleString('vi-VN')} VNĐ
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-600">Chọn lịch đặt để thanh toán</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Payment
