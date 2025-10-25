// src/components/CustomerModal.jsx
import React, { useState, useEffect } from 'react';
// Sửa import
import { adminAPI } from '../lib/api.js'; 

// Component InputField nội bộ để style cho đẹp
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

function CustomerModal({ isOpen, onClose, customer, onSave }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!customer;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          fullName: customer.fullName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          password: '', // Không tải mật khẩu
        });
      } else {
        // Reset form khi thêm mới
        setFormData({
          fullName: '', email: '', phone: '', address: '', password: '',
        });
      }
      setError('');
    }
  }, [customer, isOpen, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isEditing) {
        // Gọi API cập nhật
        await adminAPI.updateCustomer(customer.customerId, formData);
      } else {
        // Gọi API tạo mới
        await adminAPI.createCustomer(formData);
      }
      onSave(); // Gọi callback để refresh và đóng modal
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-5">
          {isEditing ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
        </h2>
        
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField 
            name="fullName" 
            label="Họ tên"
            value={formData.fullName} 
            onChange={handleChange} 
            placeholder="Nguyễn Văn A" 
            required 
          />
          <InputField 
            name="email" 
            label="Email"
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="example@gmail.com" 
            required 
          />
          <InputField 
            name="phone" 
            label="Số điện thoại"
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="090xxxxxxx" 
          />
          <InputField 
            name="address" 
            label="Địa chỉ"
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Số 1, đường ABC,..." 
          />
          
          {!isEditing && (
            <InputField 
              name="password" 
              label="Mật khẩu"
              type="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Tạo mật khẩu" 
              required 
            />
          )}

          <div className="flex justify-end gap-3 pt-5">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerModal;