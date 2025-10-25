// src/components/VehicleModal.jsx
import React, { useState, useEffect } from 'react';
// 1. SỬA IMPORT: Trỏ đến adminAPI trong lib/api.js
import { adminAPI } from '../lib/api.js';

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {function} props.onSave - Callback để tải lại danh sách xe
 * @param {object} [props.vehicle] - Dữ liệu xe (nếu là Sửa)
 * @param {number} props.customerId - ID của khách hàng (nếu là Thêm mới)
 */
function VehicleModal({ isOpen, onClose, onSave, vehicle, customerId }) {
  const [formData, setFormData] = useState({
    vin: '',
    brand: '',
    model: '',
    year: 2020,
    batteryCapacityKwh: '',
    odometerKm: '',
    lastServiceDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!vehicle;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          vin: vehicle.vin || '',
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          year: vehicle.year || 2020,
          batteryCapacityKwh: vehicle.batteryCapacityKwh || '',
          odometerKm: vehicle.odometerKm || '',
          // Đảm bảo định dạng YYYY-MM-DD cho input type="date"
          lastServiceDate: vehicle.lastServiceDate ? vehicle.lastServiceDate.split('T')[0] : '',
        });
      } else {
        // Reset form khi Thêm mới
        setFormData({
          vin: '', brand: '', model: '', year: 2020,
          batteryCapacityKwh: '', odometerKm: '', lastServiceDate: '',
        });
      }
      setError('');
    }
  }, [vehicle, isOpen, isEditing]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Chuyển đổi các trường số và null
    const payload = {
      ...formData,
      year: parseInt(formData.year, 10) || null,
      batteryCapacityKwh: formData.batteryCapacityKwh ? parseFloat(formData.batteryCapacityKwh) : null,
      odometerKm: formData.odometerKm ? parseFloat(formData.odometerKm) : null,
      lastServiceDate: formData.lastServiceDate || null, // Đảm bảo null nếu rỗng
    };

    try {
      if (isEditing) {
        // 2. SỬA LỜI GỌI API
        await adminAPI.updateVehicle(vehicle.vehicleId, payload);
      } else {
        // 3. SỬA LỜI GỌI API
        await adminAPI.createVehicle(customerId, payload);
      }
      onSave(); // Gọi callback để tải lại và đóng modal
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-5">
          {isEditing ? 'Cập nhật xe' : 'Thêm xe mới'}
        </h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField name="vin" label="Số VIN *" value={formData.vin} onChange={handleChange} maxLength={17} required />
            <InputField name="brand" label="Hãng xe *" value={formData.brand} onChange={handleChange} required />
            <InputField name="model" label="Mẫu xe *" value={formData.model} onChange={handleChange} required />
            <InputField name="year" label="Năm sản xuất" type="number" value={formData.year} onChange={handleChange} min="2000" max={new Date().getFullYear() + 1} />
            <InputField name="odometerKm" label="Số Odometer (km)" type="number" value={formData.odometerKm} onChange={handleChange} step="0.1" min="0" />
            <InputField name="batteryCapacityKwh" label="Dung lượng pin (kWh)" type="number" value={formData.batteryCapacityKwh} onChange={handleChange} step="0.1" min="0" />
            <InputField name="lastServiceDate" label="Ngày bảo dưỡng cuối" type="date" value={formData.lastServiceDate} onChange={handleChange} />
          </div>

          <div className="flex justify-end gap-3 pt-5">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Hủy</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component input nội bộ (Giữ nguyên)
const InputField = ({ label, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={props.name}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

export default VehicleModal;