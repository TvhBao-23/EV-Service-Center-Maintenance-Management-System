import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { paymentAPI, customerAPI } from '../lib/api.js'

function Payment() {
  const { user, isAuthenticated } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [currentPayment, setCurrentPayment] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) return
    loadAppointments()
  }, [isAuthenticated])

  const loadAppointments = async () => {
    try {
      const data = await customerAPI.getAppointments()
      setAppointments(data)
      console.log('Loaded appointments:', data)
    } catch (error) {
      console.error('Error loading appointments:', error)
      setAppointments([])
    }
  }

  const handlePayment = async () => {
    if (!selectedAppointment) return
    
    setIsProcessing(true)
    setMessage('')
    
    try {
      // Get service price from the appointment's service
      const servicePrice = selectedAppointment.servicePrice || 100000 // Default to basic package
      
      // Create payment
      const paymentData = {
        appointmentId: selectedAppointment.appointmentId,
        amount: servicePrice,
        paymentMethod: paymentMethod,
        notes: `Payment for appointment ${selectedAppointment.appointmentId}`
      }
      
      const payment = await paymentAPI.initiatePayment(paymentData)
      setCurrentPayment(payment)
      setShowVerification(true)
      setMessage(`Mã xác thực: ${payment.verification_code}`)
    } catch (error) {
      setMessage('Có lỗi xảy ra khi tạo thanh toán')
    } finally {
    setIsProcessing(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!currentPayment || !verificationCode) return
    
    setIsProcessing(true)
    
    try {
      await paymentAPI.verifyPayment(currentPayment.payment_id, verificationCode)
      setMessage('Thanh toán thành công! Lịch đặt của bạn đã được xác nhận.')
      setShowVerification(false)
      setCurrentPayment(null)
      setVerificationCode('')
      setSelectedAppointment(null)
      // Reload appointments to update the list and remove paid appointments
      await loadAppointments()
    } catch (error) {
      setMessage('Mã xác thực không đúng')
    } finally {
      setIsProcessing(false)
    }
  }

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
              <p className="text-3xl font-bold text-green-600">
                {appointments.length > 0 ? appointments.reduce((total, apt) => total + (apt.servicePrice || 100000), 0).toLocaleString('vi-VN') : '0'} VNĐ
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {appointments.length > 0 ? `Từ ${appointments.length} lịch đặt chờ thanh toán` : 'Không có lịch đặt nào'}
              </p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 rounded-lg border p-4 ${message.includes('thành công') ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            <p className="font-medium">{message}</p>
          </div>
        )}

        {showVerification && currentPayment && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác thực thanh toán</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">Mã xác thực đã được gửi. Vui lòng nhập mã 6 số để hoàn tất thanh toán.</p>
                <p className="font-mono text-lg text-blue-900 mt-2">{currentPayment.verification_code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã xác thực</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg font-mono"
                  placeholder="Nhập mã 6 số"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVerifyPayment}
                  disabled={isProcessing || verificationCode.length !== 6}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Đang xác thực...' : 'Xác thực thanh toán'}
                </button>
                <button
                  onClick={() => {
                    setShowVerification(false)
                    setCurrentPayment(null)
                    setVerificationCode('')
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có lịch đặt nào</h3>
            <p className="text-gray-600">Bạn chưa có lịch đặt dịch vụ nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch đặt của bạn</h3>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                    <div
                    key={appointment.appointmentId}
                      className={`bg-white rounded-lg shadow-md p-4 border-2 cursor-pointer transition-all ${
                      selectedAppointment?.appointmentId === appointment.appointmentId 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedAppointment(appointment)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Lịch đặt #{appointment.appointmentId}</h4>
                        <p className="text-sm text-gray-600">Ngày: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Trạng thái: {appointment.status}</p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600">Ghi chú: {appointment.notes}</p>
                        )}
                        </div>
                        <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{(appointment.servicePrice || 100000).toLocaleString('vi-VN')} VNĐ</p>
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Chờ thanh toán
                          </span>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thanh toán</h3>
                
                {selectedAppointment ? (
                  <>
                    <div className="mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-gray-900">Chi tiết lịch đặt</h4>
                        <p className="text-sm text-gray-600 mt-1">Lịch đặt #{selectedAppointment.appointmentId}</p>
                        <p className="text-sm text-gray-600">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Tổng tiền:</span>
                            <span className="text-xl font-bold text-green-600">{(selectedAppointment.servicePrice || 100000).toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Phương thức thanh toán</label>
                      <div className="space-y-3">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <span className="font-medium">Thẻ tín dụng</span>
                            </div>
                        </label>

                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank_transfer"
                            checked={paymentMethod === 'bank_transfer'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <span className="font-medium">Chuyển khoản</span>
                          </div>
                        </label>

                        <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="e_wallet"
                            checked={paymentMethod === 'e_wallet'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <div className="ml-3">
                              <span className="font-medium">Ví điện tử</span>
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
                            `Thanh toán ${(selectedAppointment.servicePrice || 100000).toLocaleString('vi-VN')} VNĐ`
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
