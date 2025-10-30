import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { paymentAPI, customerAPI } from '../lib/api.js'
import { loadList, saveList, upsertItem, loadGlobalList } from '../lib/store.js'

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
  const [bills, setBills] = useState([])
  const isStaff = (user?.role === 'admin' || user?.role === 'staff')

  useEffect(() => {
    if (!isAuthenticated) return
    loadAppointments()
    // load existing local bills
    setBills(loadList('bills'))

    // Listen for real-time updates from Admin
    const handleGlobalBookingsUpdate = (event) => {
      console.log('[Payment] Received bookings update event:', event.type, event.detail)
      setTimeout(() => {
        loadAppointments()
      }, 100) // Small delay to ensure localStorage is updated
    }

    const handleStorageUpdate = (event) => {
      // Only reload if bookings key changed
      if (event.key === 'bookings' || event.key === null) {
        console.log('[Payment] Received storage update for bookings')
        setTimeout(() => {
          loadAppointments()
        }, 100)
      }
    }

    window.addEventListener('local-bookings-updated', handleGlobalBookingsUpdate)
    window.addEventListener('storage', handleStorageUpdate)
    
    console.log('[Payment] Event listeners registered')

    return () => {
      window.removeEventListener('local-bookings-updated', handleGlobalBookingsUpdate)
      window.removeEventListener('storage', handleStorageUpdate)
      console.log('[Payment] Event listeners removed')
    }
  }, [isAuthenticated])

  const loadAppointments = async () => {
    try {
      console.log('[Payment] Loading appointments...')
      
      // Map appointments with service prices from our premium EV services
      const premiumEVServices = [
        { serviceId: 1, serviceName: "Bảo dưỡng định kỳ", basePrice: 500000 },
        { serviceId: 2, serviceName: "Thay pin lithium-ion", basePrice: 15000000 },
        { serviceId: 3, serviceName: "Sửa chữa hệ thống sạc", basePrice: 2500000 },
        { serviceId: 4, serviceName: "Thay motor điện", basePrice: 8000000 },
        { serviceId: 5, serviceName: "Kiểm tra BMS", basePrice: 1200000 },
        { serviceId: 6, serviceName: "Thay inverter", basePrice: 3500000 },
        { serviceId: 7, serviceName: "Bảo dưỡng hệ thống làm mát", basePrice: 800000 },
        { serviceId: 8, serviceName: "Cập nhật phần mềm", basePrice: 300000 }
      ]

      let userBookings = []
      
      // Try backend API first
      try {
        const apiAppointments = await customerAPI.getAppointments()
        console.log('[Payment] Loaded appointments from API:', apiAppointments)
        
        // Ensure it's an array
        if (Array.isArray(apiAppointments)) {
          userBookings = apiAppointments
        } else {
          console.warn('[Payment] API response is not an array:', apiAppointments)
          userBookings = []
        }
      } catch (apiError) {
        console.error('[Payment] API failed:', apiError)
        console.error('[Payment] Error details:', apiError.message)
        
        // API only - no fallback
        setMessage('⚠️ Không thể tải danh sách hóa đơn. Vui lòng thử lại.')
        userBookings = []
      }

      // Enhance with service information and filter out PAID appointments
      // Backend should filter, but double-check here for safety
      const enhancedAppointments = userBookings
        .filter(appointment => {
          // Only show appointments that are NOT completed (completed = paid)
          const isPaid = appointment.status === 'completed' || appointment.status === 'PAID' || appointment.paymentStatus === 'completed'
          return !isPaid
        })
        .map(appointment => {
          const service = premiumEVServices.find(s => s.serviceId === appointment.serviceId)
          return {
            ...appointment,
            serviceName: service?.serviceName || 'Dịch vụ không xác định',
            servicePrice: service?.basePrice || 100000
          }
        })
      
      setAppointments(enhancedAppointments)
      console.log('[Payment] Enhanced appointments (unpaid only) set to state:', enhancedAppointments)
    } catch (error) {
      console.error('[Payment] Error loading appointments:', error)
      setAppointments([])
    }
  }

  const handleConfirmOrder = () => {
    if (!selectedAppointment) return
    // Save override status locally
    const overrides = loadList('appointment_overrides')
    const nextOverrides = upsertItem('appointment_overrides', {
      appointmentId: selectedAppointment.appointmentId,
      status: 'Đã xác nhận'
    }, 'appointmentId')
    // Create or update a local bill
    const billId = `bill-${selectedAppointment.appointmentId}`
    const newBill = {
      id: billId,
      appointmentId: selectedAppointment.appointmentId,
      serviceName: selectedAppointment.serviceName,
      amount: selectedAppointment.servicePrice || 100000,
      status: 'Đã xác nhận',
      createdAt: new Date().toISOString()
    }
    const nextBills = upsertItem('bills', newBill)
    setBills(nextBills)
    // Reflect immediately in UI
    setAppointments(prev => prev.map(a => a.appointmentId === selectedAppointment.appointmentId ? { ...a, status: 'Đã xác nhận' } : a))
    setMessage('Đơn đã được xác nhận! Bạn có thể tiến hành thanh toán.')
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

  // Quick payment without verification (for demo/development)
  const handleQuickPayment = async () => {
    if (!selectedAppointment) return
    
    if (!confirm(`Xác nhận thanh toán ${(selectedAppointment.servicePrice || 100000).toLocaleString('vi-VN')} VNĐ?`)) {
      return
    }
    
    setIsProcessing(true)
    setMessage('')
    
    try {
      const appointmentId = selectedAppointment.appointmentId
      
      console.log('[QuickPayment] Calling API to mark appointment', appointmentId, 'as PAID')
      
      // Call backend API to mark as paid - 100% API-driven
      await customerAPI.markAppointmentAsPaid(appointmentId)
      
      console.log('[QuickPayment] ✅ API call successful - appointment marked as PAID')
      
      // Remove from appointments list immediately
      setAppointments(prev => prev.filter(apt => apt.appointmentId !== appointmentId))
      
      setMessage('✅ Thanh toán thành công! Hóa đơn đã được thanh toán.')
      setSelectedAppointment(null)
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('payment-completed', { detail: { appointmentId } }))
      
      // DO NOT reload - the paid appointment will not appear on next load from API
    } catch (error) {
      console.error('[QuickPayment] API Error:', error)
      setMessage('❌ Có lỗi xảy ra khi thanh toán: ' + (error.message || 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!currentPayment || !verificationCode) return
    
    setIsProcessing(true)
    
    try {
      await paymentAPI.verifyPayment(currentPayment.payment_id, verificationCode)
      
      // Mark appointment as PAID - this will hide it from the payment list
      const appointmentId = currentPayment.appointment_id || currentPayment.appointmentId || selectedAppointment?.appointmentId
      
      // Update global bookings list to mark as PAID - read directly from localStorage
      const bookingsString = localStorage.getItem('bookings')
      const globalBookings = bookingsString ? JSON.parse(bookingsString) : []
      
      console.log('[VerifyPayment] Current bookings in localStorage:', globalBookings)
      console.log('[VerifyPayment] Marking appointmentId', appointmentId, 'as PAID')
      
      const updatedBookings = globalBookings.map(booking => 
        booking.appointmentId === appointmentId 
          ? { ...booking, status: 'PAID', paymentStatus: 'completed', paidAt: new Date().toISOString() }
          : booking
      )
      
      console.log('[VerifyPayment] Updated bookings with PAID status:', updatedBookings)
      localStorage.setItem('bookings', JSON.stringify(updatedBookings))
      console.log('[VerifyPayment] ✅ Saved to localStorage.bookings')
      
      // Remove from appointments list immediately (since PAID appointments should not show)
      setAppointments(prev => prev.filter(apt => apt.appointmentId !== appointmentId))
      
      // Update local bill status
      const paidBill = {
        id: `bill-${appointmentId}`,
        appointmentId: appointmentId,
        status: 'Đã thanh toán',
        paidAt: new Date().toISOString(),
        amount: selectedAppointment?.servicePrice || 100000
      }
      upsertItem('bills', paidBill)
      setBills(loadList('bills'))
      
      setMessage('✅ Thanh toán thành công! Hóa đơn đã được thanh toán và ẩn khỏi danh sách.')
      setShowVerification(false)
      setCurrentPayment(null)
      setVerificationCode('')
      setSelectedAppointment(null)
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('payment-completed', { detail: { appointmentId } }))
      
      // DO NOT reload - keep the paid invoice hidden permanently
    } catch (error) {
      setMessage('❌ Mã xác thực không đúng')
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
                        <h4 className="font-semibold text-gray-900">{appointment.serviceName}</h4>
                        <p className="text-sm text-gray-600">Ngày: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-600">Ghi chú: {appointment.notes}</p>
                        )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{(appointment.servicePrice || 100000).toLocaleString('vi-VN')} VNĐ</p>
                          {(() => {
                            const status = String(appointment.status || 'PENDING').toUpperCase()
                            let badgeClass = 'bg-yellow-100 text-yellow-800'
                            let statusText = 'Chờ xử lý'
                            
                            if (status === 'PENDING') {
                              badgeClass = 'bg-yellow-100 text-yellow-800'
                              statusText = 'Chờ tiếp nhận'
                            } else if (status === 'RECEIVED') {
                              badgeClass = 'bg-blue-100 text-blue-800'
                              statusText = 'Đã tiếp nhận'
                            } else if (status === 'IN_MAINTENANCE') {
                              badgeClass = 'bg-orange-100 text-orange-800'
                              statusText = 'Đang bảo dưỡng'
                            } else if (status === 'DONE') {
                              badgeClass = 'bg-green-100 text-green-800'
                              statusText = 'Hoàn tất'
                            }
                            
                            return (
                              <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
                                {statusText}
                          </span>
                            )
                          })()}
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
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <h4 className="font-medium text-green-900">Hóa đơn đã chọn</h4>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{selectedAppointment.serviceName}</p>
                        <p className="text-sm text-gray-600">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 font-medium">Tổng tiền:</span>
                        <span className="text-2xl font-bold text-green-600">{(selectedAppointment.servicePrice || 100000).toLocaleString('vi-VN')} VNĐ</span>
                      </div>

                      {/* QR Code Section - Compact & Balanced */}
                      <div className="mb-4 p-3 bg-gradient-to-br from-green-50 via-white to-red-50 rounded-lg border-2 border-green-500 shadow-md">
                        <div className="text-center mb-2">
                          <h4 className="font-bold text-gray-900 text-base mb-1">💳 Quét mã thanh toán</h4>
                          <p className="text-xs text-gray-600">VietQR - Napas 247</p>
                      </div>
                      
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                          <div className="text-center">
                            {/* VPBank QR Code - Compact */}
                            <div className="relative mx-auto mb-2" style={{ maxWidth: '220px' }}>
                              <div className="bg-white p-2 rounded-lg border-3 border-green-500 mx-auto flex items-center justify-center shadow-md">
                                <img 
                                  src="/images/vpbank-qr.jpg" 
                                  alt="VPBank QR Code"
                                  className="w-full h-auto object-contain rounded"
                                  style={{ maxWidth: '200px' }}
                                  onError={(e) => {
                                    console.log('Real QR not loaded, trying SVG fallback')
                                    e.target.src = '/images/vpbank-qr.svg'
                                  }}
                                />
                      </div>
                    </div>

                            {/* Payment Info - Compact */}
                            <div className="mt-2 pt-2 border-t border-dashed border-gray-300">
                              <div className="space-y-1.5 text-left bg-gray-50 p-2 rounded">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600">Ngân hàng:</span>
                                  <span className="text-xs font-bold text-green-700">VPBank</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600">Số tiền:</span>
                                  <span className="text-sm font-bold text-red-600">{(selectedAppointment.servicePrice || 100000).toLocaleString('vi-VN')} VNĐ</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600">Nội dung:</span>
                                  <span className="text-xs font-mono font-bold text-blue-600">EVSC {selectedAppointment.appointmentId}</span>
                            </div>
                          </div>
                              
                              <div className="mt-2 p-1.5 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-xs text-yellow-800 flex items-center">
                                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                              </svg>
                                  <span className="text-xs">Ghi đúng nội dung để xác nhận tự động</span>
                                </p>
                              </div>
                            </div>
                            </div>
                          </div>
                      </div>
                    </div>

                    {/* Nút thanh toán duy nhất */}
                    <button
                      onClick={handleQuickPayment}
                      disabled={isProcessing}
                      className="w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý thanh toán...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Thanh toán {(selectedAppointment.servicePrice || 100000).toLocaleString('vi-VN')} VNĐ
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-xs text-gray-500 mt-3">
                      💡 Quét mã QR bên trên hoặc bấm nút để xác nhận thanh toán
                    </p>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
                      <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
                      </svg>
                      <h4 className="font-semibold text-gray-900 mb-2">👆 Chọn hóa đơn để thanh toán</h4>
                      <p className="text-sm text-gray-600 mb-4">Click vào bất kỳ hóa đơn nào bên trái để xem thông tin và thanh toán</p>
                      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                          <span>Hóa đơn đã chọn</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                          <span>Chưa chọn</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                      <div className="flex">
                        <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                        <div className="text-xs text-gray-700">
                          <p className="font-semibold mb-1">💡 Hướng dẫn thanh toán:</p>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Chọn hóa đơn cần thanh toán</li>
                            <li>Quét mã QR hoặc chọn phương thức</li>
                            <li>Bấm nút "💳 Thanh toán"</li>
                            <li>Hoàn tất!</li>
                          </ol>
                        </div>
                      </div>
                    </div>
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
