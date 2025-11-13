import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { customerAPI } from '../lib/api.js'
import { loadList, saveList, loadGlobalList, saveGlobalList } from '../lib/store.js'

function Booking() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const searchParams = new URLSearchParams(location.search)
  const vehicleIdFromQuery = searchParams.get('vehicleId') || ''

  const [vehicles, setVehicles] = useState([])
  const [services, setServices] = useState([])
  const [serviceCenters, setServiceCenters] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 🆕 STATE MỚI: Loại dịch vụ và services theo category
  const [serviceCategories, setServiceCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  
  // 🆕 STATE MỚI: Phụ tùng được filter theo service
  const [availableParts, setAvailableParts] = useState([])
  const [loadingParts, setLoadingParts] = useState(false)
  const [selectedParts, setSelectedParts] = useState([])

  // Dữ liệu dịch vụ xe điện cao cấp - ĐÃ COMMENT, SỬ DỤNG DATA TỪ DATABASE
  // const premiumEVServices = [
  //   {
  //     serviceId: 1,
  //     serviceName: "Bảo dưỡng định kỳ",
  //     description: "Kiểm tra tổng thể hệ thống điện, pin và các bộ phận chính",
  //     basePrice: 500000,
  //     estimatedDurationMinutes: 120,
  //     category: "maintenance"
  //   },
  //   {
  //     serviceId: 2,
  //     serviceName: "Thay pin lithium-ion",
  //     description: "Thay thế pin lithium-ion cao cấp cho xe điện",
  //     basePrice: 15000000,
  //     estimatedDurationMinutes: 480,
  //     category: "battery"
  //   },
  //   {
  //     serviceId: 3,
  //     serviceName: "Sửa chữa hệ thống sạc",
  //     description: "Kiểm tra và sửa chữa hệ thống sạc nhanh DC",
  //     basePrice: 2500000,
  //     estimatedDurationMinutes: 180,
  //     category: "charging"
  //   },
  //   {
  //     serviceId: 4,
  //     serviceName: "Thay motor điện",
  //     description: "Thay thế motor điện cao cấp cho xe điện",
  //     basePrice: 8000000,
  //     estimatedDurationMinutes: 360,
  //     category: "motor"
  //   },
  //   {
  //     serviceId: 5,
  //     serviceName: "Kiểm tra BMS",
  //     description: "Kiểm tra và cập nhật hệ thống quản lý pin (Battery Management System)",
  //     basePrice: 1200000,
  //     estimatedDurationMinutes: 90,
  //     category: "software"
  //   },
  //   {
  //     serviceId: 6,
  //     serviceName: "Thay inverter",
  //     description: "Thay thế bộ chuyển đổi điện DC/AC cao cấp",
  //     basePrice: 3500000,
  //     estimatedDurationMinutes: 240,
  //     category: "electronics"
  //   },
  //   {
  //     serviceId: 7,
  //     serviceName: "Bảo dưỡng hệ thống làm mát",
  //     description: "Kiểm tra và bảo dưỡng hệ thống làm mát pin và motor",
  //     basePrice: 800000,
  //     estimatedDurationMinutes: 150,
  //     category: "cooling"
  //   },
  //   {
  //     serviceId: 8,
  //     serviceName: "Cập nhật phần mềm",
  //     description: "Cập nhật phần mềm hệ thống và tối ưu hiệu suất",
  //     basePrice: 300000,
  //     estimatedDurationMinutes: 60,
  //     category: "software"
  //   }
  // ]

  // Dữ liệu trung tâm dịch vụ
  const premiumServiceCenters = [
    {
      centerId: 1,
      centerName: "EV Service Center Quận 1",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "028 1234 5678",
      services: ["maintenance", "battery", "charging", "motor", "software", "electronics", "cooling"]
    },
    {
      centerId: 2,
      centerName: "EV Service Center Quận 7",
      address: "456 Nguyễn Thị Thập, Quận 7, TP.HCM",
      phone: "028 2345 6789",
      services: ["maintenance", "battery", "charging", "motor", "software", "electronics", "cooling"]
    },
    {
      centerId: 3,
      centerName: "EV Service Center Quận 12",
      address: "789 Đường Tân Thới Hiệp, Quận 12, TP.HCM",
      phone: "028 3456 7890",
      services: ["maintenance", "battery", "charging", "motor", "software", "electronics", "cooling"]
    }
  ]
  const [form, setForm] = useState({
    vehicleId: '',
    serviceCategory: '', // Loại dịch vụ (Pin, Motor, Sạc...)
    serviceId: '', // Service cụ thể trong loại đó
    centerId: '',
    appointmentDate: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      // Load vehicles and service categories from API
      const [vehiclesData, categoriesData] = await Promise.all([
        customerAPI.getVehicles(),
        customerAPI.getServiceCategories()
      ])
      
      // Map category codes to Vietnamese names
      const categoryMap = {
        'battery': 'Pin',
        'charging': 'Sạc',
        'motor': 'Motor',
        'electronic': 'Điện tử',
        'cooling': 'Làm mát',
        'maintenance': 'Bảo dưỡng',
        'software': 'Phần mềm'
      }
      
      const mappedCategories = (categoriesData || []).map(cat => ({
        value: cat,
        label: categoryMap[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)
      }))
      
      setServiceCategories(mappedCategories)
      setServiceCenters(premiumServiceCenters)
      setVehicles(vehiclesData || [])
      
      // Set default vehicle if provided in query
      if (vehicleIdFromQuery && vehiclesData && vehiclesData.length > 0) {
        setForm(prev => ({ ...prev, vehicleId: vehicleIdFromQuery }))
      } else if (vehiclesData && vehiclesData.length > 0) {
        setForm(prev => ({ ...prev, vehicleId: vehiclesData[0].vehicleId }))
      }
    } catch (error) {
      console.error('[Booking] Error loading data:', error)
      setVehicles([])
      setServiceCategories([])
      setServiceCenters(premiumServiceCenters)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }
  
  // Load services when category is selected
  const loadServicesByCategory = async (category) => {
    if (!category) {
      setServices([])
      setForm(prev => ({ ...prev, serviceId: '' }))
      return
    }
    
    try {
      const servicesData = await customerAPI.getServicesByCategory(category)
      // Map services from API to format compatible with existing code
      const mappedServices = (servicesData || []).map(service => ({
        serviceId: service.serviceId || service.service_id,
        serviceName: service.name,
        description: service.description || '',
        basePrice: service.basePrice || service.base_price || 0,
        estimatedDurationMinutes: service.estimatedDurationMinutes || service.estimated_duration_minutes || 60,
        category: service.category || category
      }))
      setServices(mappedServices)
      console.log('[Booking] Loaded services for category:', category, mappedServices.length)
    } catch (error) {
      console.error('[Booking] Error loading services by category:', error)
      setServices([])
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại.')
    }
  }

  const handleChange = async (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    
    // 🆕 KHI CHỌN LOẠI DỊCH VỤ → LOAD CÁC SERVICE TRONG LOẠI ĐÓ
    if (name === 'serviceCategory') {
      setSelectedCategory(value)
      setForm(prev => ({ ...prev, serviceId: '' })) // Reset service selection
      await loadServicesByCategory(value)
    }
    
    // 🆕 KHI CHỌN SERVICE CỤ THỂ → TỰ ĐỘNG LOAD PHỤ TÙNG THEO SERVICE ĐÓ
    if (name === 'serviceId' && value) {
      const selectedService = services.find(s => s.serviceId === Number(value))
      if (selectedService && selectedService.category) {
        await loadPartsForService(selectedService.category)
      }
    }
  }
  
  // 🆕 HÀM MỚI: Load phụ tùng theo service category
  const loadPartsForService = async (category) => {
    setLoadingParts(true)
    try {
      const response = await fetch(`http://localhost:8083/api/staff/parts/for-service/${category}`)
      if (response.ok) {
        const parts = await response.json()
        setAvailableParts(parts)
        console.log(`✅ Loaded ${parts.length} parts for ${category} service`)
      } else {
        setAvailableParts([])
        console.warn('Failed to load parts for service')
      }
    } catch (error) {
      console.error('Error loading parts:', error)
      setAvailableParts([])
    } finally {
      setLoadingParts(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    try {
      if (!form.vehicleId || !form.serviceId || !form.centerId || !form.appointmentDate) {
        setError('Vui lòng điền đầy đủ thông tin')
        setSubmitting(false)
        return
      }
      
      // Format date and time for backend
      const appointmentDateTime = `${form.appointmentDate}T10:00:00`
      
      const appointmentData = {
        vehicleId: Number(form.vehicleId),
        serviceId: Number(form.serviceId),
        centerId: Number(form.centerId),
        appointmentDate: appointmentDateTime,
        notes: form.notes
      }
      
      // API only - no localStorage mirroring
      const result = await customerAPI.createAppointment(appointmentData)
      
      if (result.success || result.appointmentId) {
        alert('Đặt lịch thành công!')
        navigate('/tracking?success=1')
      } else {
        setError(result.message || 'Có lỗi xảy ra khi đặt lịch')
      }
    } catch (error) {
      // API only - no fallback
      console.error('[Booking] Failed to create appointment:', error)
      setError(error.message || 'Không thể tạo lịch hẹn. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const getSelectedService = () => {
    return services.find(s => s.serviceId === Number(form.serviceId))
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Đặt lịch dịch vụ</h2>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn xe của bạn</label>
              <select
                name="vehicleId"
                value={form.vehicleId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">-- Chọn xe --</option>
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.brand} {v.model} ({v.vin})
                  </option>
                ))}
              </select>
            </div>

            {/* 🆕 DROPDOWN 1: Chọn loại dịch vụ (Pin, Motor, Sạc...) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại dịch vụ</label>
              <select
                name="serviceCategory"
                value={form.serviceCategory}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                required
              >
                <option value="">-- Chọn loại dịch vụ --</option>
                {serviceCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 🆕 DROPDOWN 2: Chọn dịch vụ cụ thể trong loại đã chọn */}
            {form.serviceCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dịch vụ cụ thể {services.length > 0 && `(${services.length} dịch vụ)`}
                </label>
                <select
                  name="serviceId"
                  value={form.serviceId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  required
                  disabled={services.length === 0}
                >
                  <option value="">
                    {services.length === 0 ? 'Đang tải...' : '-- Chọn dịch vụ --'}
                  </option>
                  {services.map((service) => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.serviceName} - {service.basePrice?.toLocaleString('vi-VN')} VNĐ
                    </option>
                  ))}
                </select>
              </div>
            )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày mong muốn</label>
                <input
                  type="date"
                name="appointmentDate"
                value={form.appointmentDate}
                  onChange={handleChange}
                  min={(() => {
                    // Giới hạn min date: không được đặt trước năm mua xe
                    const selectedVehicle = vehicles.find(v => v.vehicleId === Number(form.vehicleId))
                    if (selectedVehicle && selectedVehicle.year) {
                      // Chỉ được đặt lịch từ năm mua xe trở đi (bắt đầu từ 01/01 của năm mua xe)
                      return `${selectedVehicle.year}-01-01`
                    }
                    return '' // Không giới hạn nếu không có xe được chọn
                  })()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn trung tâm dịch vụ</label>
              <select
                name="centerId"
                value={form.centerId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">-- Chọn trung tâm --</option>
                {serviceCenters.map((center) => (
                  <option key={center.centerId} value={center.centerId}>
                    {center.centerName} - {center.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Mô tả vấn đề hoặc yêu cầu đặc biệt..."
              />
            </div>

            {getSelectedService() && (
              <div className="border border-green-200 rounded-lg p-6 bg-gradient-to-r from-green-50 to-blue-50">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin dịch vụ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Tên dịch vụ:</span>
                      <p className="text-gray-900 font-semibold">{getSelectedService().serviceName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Mô tả:</span>
                      <p className="text-gray-600">{getSelectedService().description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Giá cơ bản:</span>
                      <p className="text-green-600 font-bold text-lg">{getSelectedService().basePrice?.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Thời gian dự kiến:</span>
                      <p className="text-gray-900 font-semibold">{getSelectedService().estimatedDurationMinutes} phút</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Giá có thể thay đổi tùy theo tình trạng thực tế của xe
                  </div>
                </div>
              </div>
              )}

            {/* 🆕 DANH SÁCH PHỤ TÙNG ĐÃ ĐƯỢC FILTER THEO SERVICE - CHỈ CHO STAFF VÀ ADMIN */}
            {form.serviceId && user?.role && (user.role === 'STAFF' || user.role === 'ADMIN') && (
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    🎯 Phụ tùng cho dịch vụ này
                  </span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {loadingParts ? '...' : availableParts.length} phụ tùng
                  </span>
                </h4>
                
                {loadingParts ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang tải phụ tùng...</p>
                  </div>
                ) : availableParts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {availableParts.map((part) => (
                      <div key={part.partId} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-mono text-xs text-blue-600 font-semibold">{part.partCode}</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">{part.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{part.manufacturer}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-sm font-bold text-green-600">{part.price?.toLocaleString('vi-VN')} ₫</p>
                            <p className="text-xs text-gray-500">Tồn: {part.stockQuantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Không có phụ tùng cho dịch vụ này</p>
                )}
                
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    💡 Danh sách này CHỈ hiển thị phụ tùng phù hợp với dịch vụ bạn đã chọn
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {submitting ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Booking
