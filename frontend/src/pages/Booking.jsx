import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUserId, loadList, upsertItem } from '../lib/store'

function Booking() {
  const location = useLocation()
  const navigate = useNavigate()
  const userId = useMemo(() => getCurrentUserId(), [])

  const searchParams = new URLSearchParams(location.search)
  const vehicleIdFromQuery = searchParams.get('vehicleId') || ''

  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState({
    vehicleId: '',
    serviceType: '',
    date: '',
    time: '',
    center: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [quote, setQuote] = useState({ items: [], total: 0 })

  // Định nghĩa gói phụ tùng theo loại dịch vụ (mock)
  const SERVICE_PACKS = useMemo(() => ({
    'Bảo dưỡng định kỳ': [
      { name: 'Thay lọc gió', price: 200000 },
      { name: 'Dung dịch vệ sinh hệ thống', price: 150000 },
      { name: 'Công kiểm tra tổng quát', price: 350000 },
    ],
    'Sửa chữa': [
      { name: 'Công sửa chữa tiêu chuẩn', price: 500000 },
    ],
    'Kiểm tra pin': [
      { name: 'Chẩn đoán pin chuyên sâu', price: 400000 },
      { name: 'Báo cáo tình trạng pin', price: 100000 },
    ],
    'Đảo lốp': [
      { name: 'Đảo lốp 4 bánh', price: 200000 },
    ],
  }), [])

  useEffect(() => {
    if (!userId) {
      navigate('/login', { replace: true })
      return
    }
    const list = loadList('vehicles', [])
    setVehicles(list)
  }, [userId])

  useEffect(() => {
    if (!vehicles.length) return
    setForm((prev) => ({
      ...prev,
      vehicleId: vehicleIdFromQuery || prev.vehicleId || vehicles[0]?.id || ''
    }))
  }, [vehicleIdFromQuery, vehicles])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Tự động tính báo giá theo loại dịch vụ đã chọn
  useEffect(() => {
    const pack = SERVICE_PACKS[form.serviceType] || []
    const total = pack.reduce((s, i) => s + (Number(i.price) || 0), 0)
    setQuote({ items: pack, total })
  }, [form.serviceType, SERVICE_PACKS])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) return
    if (!form.vehicleId || !form.serviceType || !form.date || !form.time || !form.center) return
    setSubmitting(true)
    // Simulate latency
    await new Promise((r) => setTimeout(r, 800))
    const bookingId = `b_${Date.now()}`
    const booking = {
      id: bookingId,
      vehicleId: form.vehicleId,
      serviceType: form.serviceType,
      date: form.date,
      time: form.time,
      center: form.center,
      cost: Number(quote.total || 0),
      status: 'pending'
    }
    upsertItem('bookings', booking)
    setSubmitting(false)
    navigate(`/tracking?success=1&bookingId=${encodeURIComponent(bookingId)}`)
  }

  const vehicleOptions = vehicles.map((v) => ({
    value: v.id,
    label: `${v.model} (${v.vin})`
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Đặt lịch dịch vụ</h2>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn xe của bạn</label>
              <select
                name="vehicleId"
                value={form.vehicleId}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Chọn xe --</option>
                {vehicleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại dịch vụ</label>
              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Chọn loại dịch vụ --</option>
                <option value="Bảo dưỡng định kỳ">Bảo dưỡng định kỳ</option>
                <option value="Sửa chữa">Sửa chữa</option>
                <option value="Kiểm tra pin">Kiểm tra pin</option>
                <option value="Đảo lốp">Đảo lốp</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày mong muốn</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ mong muốn</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn trung tâm dịch vụ</label>
              <select
                name="center"
                value={form.center}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Chọn trung tâm --</option>
                <option value="EV Care Center - Quận 1">EV Care Center - Quận 1</option>
                <option value="Green Auto Service - Quận 7">Green Auto Service - Quận 7</option>
                <option value="Electric Motors Hub - Thủ Đức">Electric Motors Hub - Thủ Đức</option>
              </select>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold text-gray-900 mb-3">Báo giá dự kiến</h4>
              {quote.items.length === 0 ? (
                <p className="text-sm text-gray-600">Chọn loại dịch vụ để xem báo giá dự kiến.</p>
              ) : (
                <>
                  <ul className="space-y-2 mb-3">
                    {quote.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between text-sm text-gray-700">
                        <span>{it.name}</span>
                        <span>{Number(it.price).toLocaleString('vi-VN')} VNĐ</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-sm font-medium text-gray-900">Tạm tính</span>
                    <span className="text-base font-bold text-green-600">{quote.total.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Giá có thể thay đổi sau kiểm tra thực tế tại trung tâm.</p>
                </>
              )}
            </div>

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
