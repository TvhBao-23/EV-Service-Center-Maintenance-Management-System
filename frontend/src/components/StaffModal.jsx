// src/components/StaffModal.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api.js';

// Reusable InputField component (same as in CustomerModal/VehicleModal)
const InputField = ({ label, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={props.name}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
    />
  </div>
);
// Reusable SelectField component
const SelectField = ({ label, children, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      id={props.name}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
    >
      {children}
    </select>
  </div>
);


function StaffModal({ isOpen, onClose, staffMember, onSave }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff', // Default role
    position: 'receptionist', // Default position
    hireDate: '',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!staffMember;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          fullName: staffMember.fullName || '',
          email: staffMember.email || '',
          phone: staffMember.phone || '',
          password: '', // Never pre-fill password for editing
          role: staffMember.role || 'staff',
          position: staffMember.position || 'receptionist',
          hireDate: staffMember.hireDate ? staffMember.hireDate.split('T')[0] : '', // Format date
          isActive: staffMember.isActive !== undefined ? staffMember.isActive : true,
        });
      } else {
        // Reset form for adding new
        setFormData({
          fullName: '', email: '', phone: '', password: '',
          role: 'staff', position: 'receptionist', hireDate: '', isActive: true,
        });
      }
      setError('');
    }
  }, [staffMember, isOpen, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!isEditing && !formData.password) {
        setError('Mật khẩu là bắt buộc khi tạo mới.');
        setIsLoading(false);
        return;
    }

    try {
      const payload = { ...formData };
      // Ensure hireDate is null if empty
      if (!payload.hireDate) {
        payload.hireDate = null;
      }

      if (isEditing) {
        await adminAPI.updateStaff(staffMember.staffId, payload);
      } else {
        await adminAPI.createStaff(payload);
      }
      onSave(); // Callback to refresh list and close modal
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Possible Roles and Positions (adjust based on backend ENUMs)
  const roles = [
    { value: 'staff', label: 'Nhân viên (Staff)' },
    { value: 'technician', label: 'Kỹ thuật viên (Technician)' },
    { value: 'admin', label: 'Quản trị viên (Admin)' }
  ];
  const positions = [
    { value: 'receptionist', label: 'Lễ tân' },
    { value: 'technician', label: 'Kỹ thuật viên' },
    { value: 'manager', label: 'Quản lý' },
    { value: 'admin', label: 'Quản trị viên' }
  ];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-5">
          {isEditing ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}
        </h2>
        
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <InputField name="fullName" label="Họ tên *" value={formData.fullName} onChange={handleChange} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField name="email" label="Email *" type="email" value={formData.email} onChange={handleChange} required />
            <InputField name="phone" label="Số điện thoại" value={formData.phone} onChange={handleChange} />
          </div>
          <InputField
              name="password"
              label={isEditing ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu *"}
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditing ? "" : "Ít nhất 6 ký tự"}
              required={!isEditing}
          />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField name="role" label="Vai trò *" value={formData.role} onChange={handleChange} required>
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </SelectField>
              <SelectField name="position" label="Vị trí *" value={formData.position} onChange={handleChange} required>
                  {positions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </SelectField>
           </div>
          <InputField name="hireDate" label="Ngày vào làm" type="date" value={formData.hireDate} onChange={handleChange} />

          {isEditing && (
             <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Đang hoạt động
                </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-5 border-t mt-6">
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

export default StaffModal;