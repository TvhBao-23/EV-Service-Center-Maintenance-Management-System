import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUserId, loadList } from '../lib/store'

function Profile() {
  const navigate = useNavigate()
  const userId = useMemo(() => getCurrentUserId(), [])
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } })()
  const [vehicles, setVehicles] = useState([])
  const [records, setRecords] = useState([])

  const handleCustomerClick = () => {
    navigate('/personal-profile')
  }

  const handlePaymentClick = () => {
    navigate('/payment')
  }

  useEffect(() => {
    if (!userId) return
    setVehicles(loadList('vehicles', []))
    setRecords(loadList('records', []))
  }, [userId])

  // Chỉ tính chi phí và hiển thị lịch sử cho những dịch vụ đã hoàn tất
  const completedRecords = useMemo(() => 
    records.filter(r => r.status === 'done' || r.status === 'Hoàn tất'), [records])
  
  const totalCost = useMemo(() => 
    completedRecords.reduce((sum, r) => sum + (Number(r.cost) || 0), 0), [completedRecords])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is handled by DashboardLayout */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ & Chi phí</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleCustomerClick}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Khách hàng</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                {(user?.fullName || user?.email || 'KH').split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <p className="text-xl font-bold text-gray-900">{user?.fullName || user?.email || 'Khách hàng'}</p>
            </div>
            <p className="text-sm text-gray-600 mt-2">Click để xem chi tiết thông tin cá nhân</p>
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tổng chi phí bảo dưỡng</h3>
            <p className="text-3xl font-bold text-green-600">{totalCost.toLocaleString('vi-VN')} VNĐ</p>
            <p className="text-sm text-gray-600 mt-2">Chi phí từ các dịch vụ đã hoàn tất</p>
          </div>
          
          <button
            onClick={handlePaymentClick}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thanh toán</h3>
            <p className="text-lg font-bold text-purple-600">Online (E-wallet, Banking,..)</p>
            <p className="text-sm text-gray-600 mt-2">Click để thanh toán các lịch đặt</p>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử bảo dưỡng xe</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dịch vụ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      Chưa có lịch sử bảo dưỡng nào.
                    </td>
                  </tr>
                ) : completedRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.vehicleModel || record.vehicle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.serviceType || record.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{Number(record.cost || 0).toLocaleString('vi-VN')} VNĐ</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'Hoàn tất' || record.status === 'done' ? 'bg-green-100 text-green-800' :
                        record.status === 'Đang bảo dưỡng' || record.status === 'in_maintenance' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Hoàn tất
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile
