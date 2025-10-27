import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { customerAPI } from '../lib/api.js'

function Booking() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const searchParams = new URLSearchParams(location.search)
  const vehicleIdFromQuery = searchParams.get('vehicleId') || ''

  const [vehicles, setVehicles] = useState([])
  const [services, setServices] = useState([])
  const [serviceCenters, setServiceCenters] = useState([])
  const [loading, setLoading] = useState(true)

  // Dữ liệu dịch vụ xe điện cao cấp
  const premiumEVServices = [
    {
      serviceId: 1,
      serviceName: "Bảo dưỡng định kỳ",
      description: "Kiểm tra tổng thể hệ thống điện, pin và các bộ phận chính",
      basePrice: 500000,
      estimatedDurationMinutes: 120,
      category: "maintenance"
    },
    {
      serviceId: 2,
      serviceName: "Thay pin lithium-ion",
      description: "Thay thế pin lithium-ion cao cấp cho xe điện",
      basePrice: 15000000,
      estimatedDurationMinutes: 480,
      category: "battery"
    },
    {
      serviceId: 3,
      serviceName: "Sửa chữa hệ thống sạc",
      description: "Kiểm tra và sửa chữa hệ thống sạc nhanh DC",
      basePrice: 2500000,
      estimatedDurationMinutes: 180,
      category: "charging"
    },
    {
      serviceId: 4,
      serviceName: "Thay motor điện",
      description: "Thay thế motor điện cao cấp cho xe điện",
      basePrice: 8000000,
      estimatedDurationMinutes: 360,
      category: "motor"
    },
    {
      serviceId: 5,
      serviceName: "Kiểm tra BMS",
      description: "Kiểm tra và cập nhật hệ thống quản lý pin (Battery Management System)",
      basePrice: 1200000,
      estimatedDurationMinutes: 90,
      category: "software"
    },
    {
      serviceId: 6,
      serviceName: "Thay inverter",
      description: "Thay thế bộ chuyển đổi điện DC/AC cao cấp",
      basePrice: 3500000,
      estimatedDurationMinutes: 240,
      category: "electronics"
    },
    {
      serviceId: 7,
      serviceName: "Bảo dưỡng hệ thống làm mát",
      description: "Kiểm tra và bảo dưỡng hệ thống làm mát pin và motor",
      basePrice: 800000,
      estimatedDurationMinutes: 150,
      category: "cooling"
    },
    {
      serviceId: 8,
      serviceName: "Cập nhật phần mềm",
      description: "Cập nhật phần mềm hệ thống và tối ưu hiệu suất",
      basePrice: 300000,
      estimatedDurationMinutes: 60,
      category: "software"
    }
  ]

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
    serviceId: '',
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
      // Load vehicles from API
      const vehiclesData = await customerAPI.getVehicles()
      
      // Use local premium EV services data
      setServices(premiumEVServices)
      setServiceCenters(premiumServiceCenters)
      setVehicles(vehiclesData)
      
      // Set default vehicle if provided in query
      if (vehicleIdFromQuery && vehiclesData.length > 0) {
        setForm(prev => ({ ...prev, vehicleId: vehicleIdFromQuery }))
      } else if (vehiclesData.length > 0) {
        setForm(prev => ({ ...prev, vehicleId: vehiclesData[0].vehicleId }))
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
      // Still set services and centers even if vehicles fail
      setServices(premiumEVServices)
      setServiceCenters(premiumServiceCenters)
      setError('Có lỗi xảy ra khi tải danh sách xe')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
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
      
      const result = await customerAPI.createAppointment(appointmentData)
      if (result.success) {
        alert('Đặt lịch thành công!')
        navigate('/tracking?success=1')
      } else {
        setError(result.message || 'Có lỗi xảy ra khi đặt lịch')
      }
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi đặt lịch')
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại dịch vụ</label>
                     <select
                       name="serviceId"
                       value={form.serviceId}
                       onChange={handleChange}
                       className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                       required
                     >
                       <option value="">-- Chọn loại dịch vụ --</option>
                       {services.map((service) => (
                         <option key={service.serviceId} value={service.serviceId}>
                           {service.serviceName}
                         </option>
                       ))}
                     </select>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày mong muốn</label>
                <input
                  type="date"
                name="appointmentDate"
                value={form.appointmentDate}
                  onChange={handleChange}
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
