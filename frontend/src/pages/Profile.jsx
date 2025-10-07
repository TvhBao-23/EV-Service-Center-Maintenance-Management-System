import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUserId, loadList } from '../lib/store'

function Profile() {
  const navigate = useNavigate()
  const userId = useMemo(() => getCurrentUserId(), [])
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } })()
  const [vehicles, setVehicles] = useState([])
  const [records, setRecords] = useState([])
  const [bookings, setBookings] = useState([])
  const [filterVehicle, setFilterVehicle] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState('table') // table or cards

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
    setBookings(loadList('bookings', []))
  }, [userId])

  // Chỉ tính chi phí và hiển thị lịch sử cho những dịch vụ đã hoàn tất
  const completedRecords = useMemo(() => 
    records.filter(r => r.status === 'done' || r.status === 'Hoàn tất'), [records])
  
  const totalCost = useMemo(() => 
    completedRecords.reduce((sum, r) => sum + (Number(r.cost) || 0), 0), [completedRecords])

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    let filtered = completedRecords

    // Filter by vehicle
    if (filterVehicle !== 'all') {
      filtered = filtered.filter(r => r.vehicleId === filterVehicle)
    }

    // Filter by year
    if (filterYear !== 'all') {
      filtered = filtered.filter(r => {
        const recordYear = new Date(r.date).getFullYear()
        return recordYear.toString() === filterYear
      })
    }

    // Sort records
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date)
        case 'cost':
          return (Number(b.cost) || 0) - (Number(a.cost) || 0)
        case 'vehicle':
          return (a.vehicleModel || a.vehicle || '').localeCompare(b.vehicleModel || b.vehicle || '')
        case 'service':
          return (a.serviceType || a.service || '').localeCompare(b.serviceType || b.service || '')
        default:
          return 0
      }
    })

    return filtered
  }, [completedRecords, filterVehicle, filterYear, sortBy])

  // Statistics
  const statistics = useMemo(() => {
    const totalServices = completedRecords.length
    const avgCostPerService = totalServices > 0 ? totalCost / totalServices : 0
    
    // Cost by vehicle
    const costByVehicle = vehicles.map(vehicle => {
      const vehicleRecords = completedRecords.filter(r => r.vehicleId === vehicle.id)
      const vehicleCost = vehicleRecords.reduce((sum, r) => sum + (Number(r.cost) || 0), 0)
      return {
        vehicleId: vehicle.id,
        vehicleModel: vehicle.model,
        count: vehicleRecords.length,
        totalCost: vehicleCost,
        avgCost: vehicleRecords.length > 0 ? vehicleCost / vehicleRecords.length : 0
      }
    }).filter(v => v.count > 0)

    // Cost by year
    const costByYear = {}
    completedRecords.forEach(record => {
      const year = new Date(record.date).getFullYear()
      if (!costByYear[year]) {
        costByYear[year] = { count: 0, totalCost: 0 }
      }
      costByYear[year].count++
      costByYear[year].totalCost += Number(record.cost) || 0
    })

    // Service types
    const serviceTypes = {}
    completedRecords.forEach(record => {
      const service = record.serviceType || record.service
      if (!serviceTypes[service]) {
        serviceTypes[service] = { count: 0, totalCost: 0 }
      }
      serviceTypes[service].count++
      serviceTypes[service].totalCost += Number(record.cost) || 0
    })

    return {
      totalServices,
      avgCostPerService,
      costByVehicle,
      costByYear,
      serviceTypes
    }
  }, [completedRecords, vehicles, totalCost])

  // Available years for filter
  const availableYears = useMemo(() => {
    const years = [...new Set(completedRecords.map(r => new Date(r.date).getFullYear()))]
    return years.sort((a, b) => b - a)
  }, [completedRecords])

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

        {/* Statistics Overview */}
        {statistics.totalServices > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Chi phí theo xe</h4>
              <div className="space-y-2">
                {statistics.costByVehicle.slice(0, 3).map((vehicle) => (
                  <div key={vehicle.vehicleId} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 truncate">{vehicle.vehicleModel}</span>
                    <span className="text-sm font-semibold text-gray-900">{vehicle.totalCost.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                ))}
                {statistics.costByVehicle.length > 3 && (
                  <p className="text-xs text-gray-500">+{statistics.costByVehicle.length - 3} xe khác</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Chi phí theo năm</h4>
              <div className="space-y-2">
                {Object.entries(statistics.costByYear).slice(0, 3).map(([year, data]) => (
                  <div key={year} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{year}</span>
                    <span className="text-sm font-semibold text-gray-900">{data.totalCost.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Loại dịch vụ</h4>
              <div className="space-y-2">
                {Object.entries(statistics.serviceTypes).slice(0, 3).map(([service, data]) => (
                  <div key={service} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 truncate">{service}</span>
                    <span className="text-sm font-semibold text-gray-900">{data.count} lần</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Tổng quan</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Tổng dịch vụ</span>
                  <span className="text-sm font-semibold text-gray-900">{statistics.totalServices}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Trung bình/dịch vụ</span>
                  <span className="text-sm font-semibold text-gray-900">{statistics.avgCostPerService.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Số xe</span>
                  <span className="text-sm font-semibold text-gray-900">{statistics.costByVehicle.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Lịch sử bảo dưỡng xe</h3>
            
            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
              <div className="flex gap-2">
                <select
                  value={filterVehicle}
                  onChange={(e) => setFilterVehicle(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả xe</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.model}</option>
                  ))}
                </select>
                
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả năm</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Sắp xếp theo ngày</option>
                  <option value="cost">Sắp xếp theo chi phí</option>
                  <option value="vehicle">Sắp xếp theo xe</option>
                  <option value="service">Sắp xếp theo dịch vụ</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm rounded-md ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bảng
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 text-sm rounded-md ${
                    viewMode === 'cards' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Thẻ
                </button>
              </div>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="text-gray-600">
                {completedRecords.length === 0 
                  ? 'Chưa có lịch sử bảo dưỡng nào.' 
                  : 'Không có lịch sử nào phù hợp với bộ lọc đã chọn.'
                }
              </p>
            </div>
          ) : viewMode === 'table' ? (
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
                  {filteredRecords.map((record) => {
                    const vehicle = vehicles.find(v => v.id === record.vehicleId)
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>
                            <div className="font-medium text-gray-900">{vehicle?.model || record.vehicleModel || record.vehicle}</div>
                            <div className="text-gray-500 text-xs">{vehicle?.vin || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.serviceType || record.service}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{Number(record.cost || 0).toLocaleString('vi-VN')} VNĐ</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Hoàn tất
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record) => {
                const vehicle = vehicles.find(v => v.id === record.vehicleId)
                return (
                  <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{vehicle?.model || record.vehicleModel || record.vehicle}</h4>
                        <p className="text-sm text-gray-600">{vehicle?.vin || 'N/A'}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Hoàn tất
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dịch vụ:</span>
                        <span className="font-medium">{record.serviceType || record.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ngày:</span>
                        <span className="font-medium">{record.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Chi phí:</span>
                        <span className="font-semibold text-green-600">{Number(record.cost || 0).toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Profile
