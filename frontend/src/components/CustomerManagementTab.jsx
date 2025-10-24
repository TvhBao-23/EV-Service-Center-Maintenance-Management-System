// CustomerManagementTab.js
import React, { useState } from 'react';
// Giả sử bạn tạo file apiService.js
import { deleteCustomer } from './apiService'; 
// Import các Modal (sẽ tạo bên dưới)
import CustomerModal from './CustomerModal';
import CustomerDetailModal from './CustomerDetailModal';
import DeleteConfirmModal from './DeleteConfirmModal';

function CustomerManagementTab({ customers, isLoading, onRefresh }) {
  // State quản lý modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State quản lý dữ liệu đang được chọn
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Mở modal Thêm mới
  const handleAddNew = () => {
    setSelectedCustomer(null); // Không có customer nào, nghĩa là thêm mới
    setIsFormModalOpen(true);
  };

  // Mở modal Xem chi tiết
  const handleViewDetails = (customer) => {
    // Cần gọi API /api/admin/customers/{id} để lấy chi tiết (gồm cả xe)
    // (Trong ví dụ này, ta tạm dùng dữ liệu có sẵn)
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  // Mở modal Sửa
  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormModalOpen(true);
  };

  // Mở modal Xóa
  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  // Xác nhận xóa
  const confirmDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await deleteCustomer(selectedCustomer.customerId);
      onRefresh(); // Tải lại danh sách
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Xóa thất bại!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Quản lý khách hàng & xe
          </h3>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Thêm khách hàng
          </button>
        </div>

        {isLoading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số xe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.customerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-gray-900">{customer.email}</div>
                       <div className="text-sm text-gray-500">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.vehicleCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleViewDetails(customer)}
                        className="text-blue-600 hover:text-blue-900 mr-3">Xem</button>
                      <button 
                        onClick={() => handleEdit(customer)}
                        className="text-green-600 hover:text-green-900 mr-3">Sửa</button>
                      <button 
                        onClick={() => handleDelete(customer)}
                        className="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa Khách hàng */}
      <CustomerModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        customer={selectedCustomer}
        onSave={() => {
          onRefresh();
          setIsFormModalOpen(false);
        }}
      />

      {/* Modal Xem chi tiết (Chứa danh sách xe) */}
      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        customerId={selectedCustomer?.customerId}
      />
      
      {/* Modal Xác nhận Xóa */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa khách hàng"
        message={`Bạn có chắc muốn xóa khách hàng "${selectedCustomer?.fullName}"? Mọi dữ liệu (bao gồm cả xe) của khách hàng này sẽ bị mất.`}
      />
    </div>
  );
}

export default CustomerManagementTab;