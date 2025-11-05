import { useState } from 'react'

// Add Part Modal Component
export function AddPartModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    partCode: '',
    name: '',
    category: 'battery',
    manufacturer: '',
    unitPrice: '',
    stockQuantity: '',
    minStockLevel: '10',
    location: '',
    status: 'available',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate
    if (!formData.partCode || !formData.name || !formData.unitPrice || !formData.stockQuantity) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!')
      return
    }

    // Convert to numbers
    const submitData = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      stockQuantity: parseInt(formData.stockQuantity),
      minStockLevel: parseInt(formData.minStockLevel)
    }

    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-green-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">➕ Thêm phụ tùng mới</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Part Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã phụ tùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.partCode}
                onChange={(e) => setFormData({ ...formData, partCode: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: BAT-LI-003"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên phụ tùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: Pin Lithium-Ion 60kWh"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="battery">Battery (Pin)</option>
                <option value="motor">Motor (Động cơ)</option>
                <option value="charging">Charging (Sạc)</option>
                <option value="electronics">Electronics (Điện tử)</option>
                <option value="cooling">Cooling (Làm mát)</option>
                <option value="software">Software (Phần mềm)</option>
                <option value="other">Other (Khác)</option>
              </select>
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhà sản xuất
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: Samsung, LG, Tesla..."
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: 15000000"
                required
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: 50"
                required
              />
            </div>

            {/* Min Stock Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức tồn kho tối thiểu
              </label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: 10"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vị trí kho
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: Kho A-01, Kho B-02..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="available">Còn hàng</option>
                <option value="low_stock">Sắp hết</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Mô tả về phụ tùng, thông số kỹ thuật..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              ✅ Thêm phụ tùng
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Part Modal Component
export function EditPartModal({ part, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    partCode: part.partCode || '',
    name: part.name || '',
    category: part.category || 'battery',
    manufacturer: part.manufacturer || '',
    unitPrice: part.unitPrice || '',
    stockQuantity: part.stockQuantity || '',
    minStockLevel: part.minStockLevel || '10',
    location: part.location || '',
    status: part.status || 'available',
    description: part.description || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate
    if (!formData.partCode || !formData.name || !formData.unitPrice || !formData.stockQuantity) {
      alert('⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!')
      return
    }

    // Convert to numbers
    const submitData = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      stockQuantity: parseInt(formData.stockQuantity),
      minStockLevel: parseInt(formData.minStockLevel)
    }

    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">✏️ Chỉnh sửa phụ tùng: {part.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">ID:</span> #{part.id} | 
              <span className="font-medium ml-3">Mã hiện tại:</span> {part.partCode}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Part Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã phụ tùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.partCode}
                onChange={(e) => setFormData({ ...formData, partCode: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: BAT-LI-001"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên phụ tùng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: Pin Lithium-Ion 60kWh"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="battery">Battery (Pin)</option>
                <option value="motor">Motor (Động cơ)</option>
                <option value="charging">Charging (Sạc)</option>
                <option value="electronics">Electronics (Điện tử)</option>
                <option value="cooling">Cooling (Làm mát)</option>
                <option value="software">Software (Phần mềm)</option>
                <option value="other">Other (Khác)</option>
              </select>
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhà sản xuất
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: Samsung, LG, Tesla..."
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá bán (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: 15000000"
                required
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng tồn kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: 50"
                required
              />
            </div>

            {/* Min Stock Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức tồn kho tối thiểu
              </label>
              <input
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: 10"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vị trí kho
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: Kho A-01, Kho B-02..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Còn hàng</option>
                <option value="low_stock">Sắp hết</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mô tả về phụ tùng, thông số kỹ thuật..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              💾 Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

