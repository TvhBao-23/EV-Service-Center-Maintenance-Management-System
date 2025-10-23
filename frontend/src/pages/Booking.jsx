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
      const [vehiclesData, servicesData, centersData] = await Promise.all([
        customerAPI.getVehicles(),
        customerAPI.getServices(),
        customerAPI.getServiceCenters()
      ])
      
      setVehicles(vehiclesData)
      setServices(servicesData)
      setServiceCenters(centersData)
      
      // Set default vehicle if provided in query
      if (vehicleIdFromQuery && vehiclesData.length > 0) {
        setForm(prev => ({ ...prev, vehicleId: vehicleIdFromQuery }))
      } else if (vehiclesData.length > 0) {
        setForm(prev => ({ ...prev, vehicleId: vehiclesData[0].vehicleId }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Có lỗi xảy ra khi tải dữ liệu')
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">-- Chọn loại dịch vụ --</option>
                {services.map((service) => (
                  <option key={service.serviceId} value={service.serviceId}>
                    {service.serviceName} - {service.basePrice?.toLocaleString('vi-VN')} VNĐ
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
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin dịch vụ</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Tên dịch vụ:</span> {getSelectedService().serviceName}</p>
                  <p><span className="font-medium">Mô tả:</span> {getSelectedService().description}</p>
                  <p><span className="font-medium">Giá cơ bản:</span> {getSelectedService().basePrice?.toLocaleString('vi-VN')} VNĐ</p>
                  <p><span className="font-medium">Thời gian dự kiến:</span> {getSelectedService().estimatedDurationMinutes} phút</p>
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
