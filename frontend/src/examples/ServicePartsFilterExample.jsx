import { useState, useEffect } from 'react'

/**
 * Example: Service-Parts Mapping Integration
 * 
 * Khi user chọn dịch vụ, hệ thống tự động lọc phụ tùng liên quan
 * thay vì hiển thị tất cả 24 phụ tùng.
 */
export function ServicePartsFilterExample() {
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [availableParts, setAvailableParts] = useState([])
  const [selectedParts, setSelectedParts] = useState([])
  const [loading, setLoading] = useState(false)

  // Danh sách dịch vụ (giống như trong Booking.jsx)
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
      description: "Kiểm tra và cập nhật hệ thống quản lý pin",
      basePrice: 1200000,
      estimatedDurationMinutes: 90,
      category: "electronic"
    },
    {
      serviceId: 6,
      serviceName: "Thay inverter",
      description: "Thay thế bộ chuyển đổi điện DC/AC cao cấp",
      basePrice: 3500000,
      estimatedDurationMinutes: 240,
      category: "electronic"
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
      category: "electronic"
    }
  ]

  useEffect(() => {
    setServices(premiumEVServices)
  }, [])

  // Fetch parts khi chọn service
  const handleServiceChange = async (e) => {
    const serviceId = parseInt(e.target.value)
    const service = services.find(s => s.serviceId === serviceId)
    
    if (!service) {
      setSelectedService(null)
      setAvailableParts([])
      return
    }

    setSelectedService(service)
    setLoading(true)

    try {
      // 🔥 API MỚI: Lấy parts theo service category
      const response = await fetch(
        `http://localhost:8090/api/staff/parts/for-service/${service.category}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch parts')
      }

      const parts = await response.json()
      setAvailableParts(parts)
      
      console.log(`✅ Service: ${service.serviceName} (${service.category})`)
      console.log(`📦 Found ${parts.length} relevant parts`)
    } catch (error) {
      console.error('Error fetching parts:', error)
      setAvailableParts([])
    } finally {
      setLoading(false)
    }
  }

  const handlePartToggle = (partId) => {
    setSelectedParts(prev => {
      if (prev.includes(partId)) {
        return prev.filter(id => id !== partId)
      } else {
        return [...prev, partId]
      }
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getTotalPrice = () => {
    const serviceCost = selectedService?.basePrice || 0
    const partsCost = availableParts
      .filter(p => selectedParts.includes(p.partId))
      .reduce((sum, p) => sum + p.unitPrice, 0)
    
    return serviceCost + partsCost
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">
          🔧 Đặt Lịch Dịch Vụ & Chọn Phụ Tùng
        </h2>

        {/* Service Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại dịch vụ *
          </label>
          <select
            onChange={handleServiceChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn loại dịch vụ --</option>
            {services.map(service => (
              <option key={service.serviceId} value={service.serviceId}>
                {service.serviceName} - {formatPrice(service.basePrice)}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Service Info */}
        {selectedService && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 {selectedService.serviceName}
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              {selectedService.description}
            </p>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">
                ⏱️ {selectedService.estimatedDurationMinutes} phút
              </span>
              <span className="text-gray-600">
                💰 {formatPrice(selectedService.basePrice)}
              </span>
              <span className="text-blue-600 font-medium">
                🏷️ Category: {selectedService.category}
              </span>
            </div>
          </div>
        )}

        {/* Parts Selection */}
        {selectedService && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phụ tùng cần thay (tùy chọn)
            </label>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Đang tải phụ tùng...</p>
              </div>
            ) : availableParts.length > 0 ? (
              <div>
                <div className="mb-3 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-800">
                    ✅ Tìm thấy <strong>{availableParts.length} phụ tùng</strong> phù hợp với dịch vụ này
                    <br/>
                    <span className="text-xs text-gray-600">
                      (Thay vì hiển thị tất cả 24 phụ tùng, hệ thống chỉ hiển thị những gì bạn cần)
                    </span>
                  </p>
                </div>
                
                <div className="border border-gray-300 rounded-md max-h-96 overflow-y-auto">
                  {availableParts.map(part => (
                    <label
                      key={part.partId}
                      className="flex items-start p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedParts.includes(part.partId)}
                        onChange={() => handlePartToggle(part.partId)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-sm text-blue-600">
                              {part.partCode}
                            </span>
                            <h4 className="font-semibold text-gray-900">
                              {part.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {part.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(part.unitPrice)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Kho: {part.location}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                            {part.category}
                          </span>
                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            Tồn kho: {part.stockQuantity}
                          </span>
                          {part.stockQuantity <= part.minStockLevel && (
                            <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                              ⚠️ Sắp hết
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có phụ tùng nào cho dịch vụ này
              </div>
            )}
          </div>
        )}

        {/* Total Price */}
        {selectedService && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Dịch vụ:</span>
              <span className="font-medium">
                {formatPrice(selectedService.basePrice)}
              </span>
            </div>
            {selectedParts.length > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">
                  Phụ tùng ({selectedParts.length}):
                </span>
                <span className="font-medium">
                  {formatPrice(
                    availableParts
                      .filter(p => selectedParts.includes(p.partId))
                      .reduce((sum, p) => sum + p.unitPrice, 0)
                  )}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-300 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                Tổng cộng:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          disabled={!selectedService}
          className="mt-6 w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Xác nhận đặt lịch
        </button>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && selectedService && (
        <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded font-mono text-sm">
          <div className="font-bold mb-2">🐛 Debug Info:</div>
          <div>Service Category: {selectedService.category}</div>
          <div>API Endpoint: /api/staff/parts/for-service/{selectedService.category}</div>
          <div>Parts Found: {availableParts.length}</div>
          <div>Selected Parts: {selectedParts.length}</div>
        </div>
      )}
    </div>
  )
}

export default ServicePartsFilterExample

