// src/components/ServiceOrderManagementTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../lib/api.js';
import DeleteConfirmModal from './DeleteConfirmModal'; // Reuse delete modal

// Helper to format date/time
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

// Status options based on backend ENUM
const statusOptions = [
    { value: 'queued', label: 'Chờ xử lý' },
    { value: 'in_progress', label: 'Đang xử lý' },
    { value: 'completed', label: 'Hoàn tất' },
    { value: 'delayed', label: 'Tạm hoãn' },
    // Add other statuses if needed
];


function ServiceOrderManagementTab() {
  const [serviceOrders, setServiceOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [ordersData, techsData] = await Promise.all([
        adminAPI.getAllServiceOrders(),
        adminAPI.getActiveTechnicians()
      ]);
      setServiceOrders(ordersData);
      setTechnicians(techsData);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu.');
      setServiceOrders([]);
      setTechnicians([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
     // Add confirmation or visual feedback
    try {
        await adminAPI.updateServiceOrderStatus(orderId, newStatus);
        // Optimistic update or refetch
        setServiceOrders(prevOrders =>
            prevOrders.map(order =>
                order.orderId === orderId ? { ...order, status: newStatus } : order
            )
        );
        // Or call fetchData() to reload everything
    } catch (err) {
        alert(`Lỗi cập nhật trạng thái: ${err.message}`);
    }
  };

  const handleAssignTechnician = async (orderId, technicianId) => {
      if (!technicianId) return; // Prevent assigning 'null' or empty string
      try {
          await adminAPI.assignTechnicianToOrder(orderId, parseInt(technicianId, 10));
          // Optimistic update or refetch
          const tech = technicians.find(t => t.staffId === parseInt(technicianId, 10));
          setServiceOrders(prevOrders =>
            prevOrders.map(order =>
                order.orderId === orderId ? {
                    ...order,
                    assignedTechnicianId: tech?.staffId,
                    assignedTechnicianName: tech?.fullName
                } : order
            )
          );
          // Or call fetchData()
      } catch (err) {
          alert(`Lỗi phân công kỹ thuật viên: ${err.message}`);
      }
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (order) => {
      setOrderToDelete(order);
      setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
      if (!orderToDelete) return;
      try {
          await adminAPI.deleteServiceOrder(orderToDelete.orderId);
          fetchData(); // Refresh list
          setIsDeleteModalOpen(false);
          setOrderToDelete(null);
      } catch (error) {
          console.error('Failed to delete service order:', error);
          alert(`Xóa thất bại: ${error.message}`);
      }
  };


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quản lý lịch hẹn & dịch vụ (Service Orders)
        </h3>

        {isLoading && <p>Đang tải dữ liệu...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày hẹn</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kỹ thuật viên</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {serviceOrders.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-4 text-gray-500">Không có lịch hẹn/dịch vụ nào.</td></tr>
                ) : (
                    serviceOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.customerName || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.vehicleModel || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.serviceName || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{formatDateTime(order.requestedDateTime)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <select
                            value={order.assignedTechnicianId || ''}
                            onChange={(e) => handleAssignTechnician(order.orderId, e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm text-sm p-1 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                            disabled={order.status === 'completed'} // Disable if completed
                        >
                            <option value="">-- Chọn KTV --</option>
                            {technicians.map(tech => (
                            <option key={tech.staffId} value={tech.staffId}>
                                {tech.fullName}
                            </option>
                            ))}
                        </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <select
                            value={order.status || ''}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                             className="w-full border-gray-300 rounded-md shadow-sm text-sm p-1 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                             <option value="" disabled>-- Trạng thái --</option>
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        </td>
                         <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {/* Add View/Edit details button if needed */}
                            {/* <button className="text-blue-600 hover:text-blue-900 mr-2">Xem</button> */}
                            <button
                                onClick={() => handleDeleteClick(order)}
                                className="text-red-600 hover:text-red-900"
                                title="Xóa Service Order"
                            >
                                Xóa
                            </button>
                         </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
       {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa Lịch Dịch Vụ"
        message={`Bạn có chắc muốn xóa lịch dịch vụ #${orderToDelete?.orderId} cho xe ${orderToDelete?.vehicleModel}?`}
      />
    </div>
  );
}

export default ServiceOrderManagementTab;