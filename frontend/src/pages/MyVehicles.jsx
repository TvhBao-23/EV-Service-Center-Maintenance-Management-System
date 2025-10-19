import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUserId } from '../lib/store'
import { getVehicles, createVehicle, deleteVehicle as apiDeleteVehicle } from '../lib/api'

function AddEditVehicleModal({ open, onClose, initial }) {
  const [form, setForm] = useState(() => initial || { model: '', vin: '', purchaseDate: '', odometerKm: 0, brand: 'Tesla', year: new Date().getFullYear() })

  useEffect(() => {
    if (open) setForm(initial || { model: '', vin: '', purchaseDate: '', odometerKm: 0, brand: 'Tesla', year: new Date().getFullYear() })
  }, [open, initial])

  const isFormValid = useMemo(() => form.model && form.vin && form.vin.length >= 10, [form])

  const handleSave = async () => {
    if (!isFormValid) return
    
    // Chuẩn bị dữ liệu cho API
    const vehicleData = {
      ...form,
      odometerKm: Number(form.odometerKm) || 0,
      year: Number(form.year) || new Date().getFullYear(),
      // Các trường khác như brand có thể thêm vào form
    }

    // TODO: Xử lý edit sau, hiện tại chỉ làm create
    const newVehicle = await createVehicle(vehicleData);
    // Gọi onClose với vehicle mới để cập nhật list ở component cha
    onClose(newVehicle, 'add');
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{initial ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tên xe / Model</label>
            <input name="model" value={form.model} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="VD: Tesla Model 3" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Số VIN</label>
            <input name="vin" value={form.vin} onChange={handleChange} maxLength={17} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="17 ký tự" />
            {form.vin && form.vin.length < 10 && (
              <p className="text-xs text-red-500 mt-1">Số VIN phải có ít nhất 10 ký tự.</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Ngày mua</label>
              <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Km hiện tại</label>
              <input type="number" name="odometerKm" value={form.odometerKm} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={()=>onClose()} className="px-4 py-2 rounded-lg border">Hủy</button>
          <button 
            onClick={handleSave} 
            disabled={!isFormValid}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >Lưu
          </button>
        </div>
      </div>
    </div>
  )
}

function MyVehicles() {
  const userId = useMemo(() => getCurrentUserId(), [])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await getVehicles();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        // TODO: Hiển thị lỗi cho người dùng
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchVehicles();
  }, [userId])

  const openAdd = () => { setEditing(null); setOpenModal(true) }
  const openEdit = (v) => { setEditing(v); setOpenModal(true) }
  const onCloseModal = (newItem, type) => {
    setOpenModal(false)
    if (newItem && type === 'add') {
      setVehicles(prev => [...prev, newItem]);
    }
    // TODO: Xử lý 'edit'
  }
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      await apiDeleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.vehicleId !== id));
    }
  }

  const handleBook = (id) => {
    navigate(`/booking?vehicleId=${encodeURIComponent(id)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content (header moved to layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Xe của tôi</h2>
            <p className="text-gray-600">Quản lý và theo dõi xe điện của bạn</p>
          </div>
          <button onClick={openAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
            </svg>
            Thêm xe
          </button>
        </div>

        {loading ? <p>Đang tải dữ liệu xe...</p> : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có xe nào</h3>
            <p className="text-gray-600 mb-6">Thêm xe điện của bạn để bắt đầu quản lý lịch bảo dưỡng</p>
            <button onClick={openAdd} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Thêm xe đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.vehicleId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{vehicle.model}</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">VIN:</span> {vehicle.vin}</p>
                  <p><span className="font-medium">Ngày mua:</span> {vehicle.purchaseDate}</p>
                  <p><span className="font-medium">Km hiện tại:</span> {(vehicle.odometerKm || 0).toLocaleString()} km</p>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button onClick={()=>handleBook(vehicle.vehicleId)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">Đặt lịch</button>
                  <button onClick={()=>openEdit(vehicle)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">Sửa</button>
                  <button onClick={()=>handleDelete(vehicle.vehicleId)} className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <AddEditVehicleModal open={openModal} onClose={onCloseModal} initial={editing} />
    </div>
  )
}

export default MyVehicles
