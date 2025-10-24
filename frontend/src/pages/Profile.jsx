import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { customerAPI, paymentAPI } from '../lib/api.js'

function Profile() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [appointments, setAppointments] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const handleCustomerClick = () => {
    navigate('/personal-profile')
  }

  const handlePaymentClick = () => {
    navigate('/payment')
  }

  useEffect(() => {
    if (!isAuthenticated) return
    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      const [vehiclesData, appointmentsData, paymentsData] = await Promise.all([
        customerAPI.getVehicles(),
        customerAPI.getAppointments(),
        paymentAPI.getMyPayments()
      ])
      
      setVehicles(vehiclesData)
      setAppointments(appointmentsData)
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics from payments
  const totalCost = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  
  const totalServices = payments.filter(p => p.status === 'completed').length
  
  const statistics = {
    totalCost,
    totalServices,
    avgCostPerService: totalServices > 0 ? Math.round(totalCost / totalServices) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is handled by DashboardLayout */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ & Chi phí</h2>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleCustomerClick}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold group-hover:bg-green-700 transition-colors">
                {(user?.fullName || user?.email || 'KH').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                <p className="text-sm text-gray-600">{user?.fullName || user?.email || 'Khách hàng'}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Xem và chỉnh sửa thông tin cá nhân</p>
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Tổng chi phí</h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{totalCost.toLocaleString('vi-VN')} VNĐ</p>
                <p className="text-sm text-gray-600">{statistics.totalServices} dịch vụ</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Trung bình/dịch vụ</p>
                <p className="font-semibold">{statistics.avgCostPerService.toLocaleString('vi-VN')} VNĐ</p>
              </div>
              <div>
                <p className="text-gray-500">Số xe</p>
                <p className="font-semibold">{statistics.costByVehicle.length} xe</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handlePaymentClick}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thanh toán</h3>
                <p className="text-sm text-gray-600">E-wallet, Banking</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Thanh toán các lịch đặt chờ</p>
          </button>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Lịch sử thanh toán</h3>
          
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-gray-600">Chưa có lịch sử thanh toán nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{payment.payment_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(payment.amount || 0).toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {payment.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                          </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                      </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Profile
