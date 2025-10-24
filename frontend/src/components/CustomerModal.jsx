// CustomerModal.js
import React, { useState, useEffect } from 'react';
// Giả sử bạn tạo file apiService.js
import { createCustomer, updateCustomer } from './apiService'; 

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
        await updateCustomer(customer.customerId, formData);
      } else {
        // Gọi API tạo mới
        await createCustomer(formData);
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
    // Đây là JSX cho Modal (Overlay, content, form)
    // Ví dụ đơn giản:
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
        </h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Các trường input cho fullName, email, phone, address */}
          <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ tên" className="... mb-2" />
          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="... mb-2" />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" className="... mb-2" />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ" className="... mb-2" />
          
          {!isEditing && (
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mật khẩu" className="... mb-2" required />
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="... bg-gray-300">Hủy</button>
            <button type="submit" disabled={isLoading} className="... bg-blue-600 text-white">
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerModal;