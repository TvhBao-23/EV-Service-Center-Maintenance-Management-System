// CustomerDetailModal.js
import React, { useState, useEffect, useCallback } from 'react';
import { getCustomerDetails, deleteVehicle } from './apiService';
import VehicleModal from './VehicleModal';
import DeleteConfirmModal from './DeleteConfirmModal';

function CustomerDetailModal({ isOpen, onClose, customerId }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State cho modal CRUD xe
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Dùng để Sửa
  
  // State cho modal Xóa xe
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null); // Dùng để Xóa
  const [isDeleting, setIsDeleting] = useState(false);


  // Hàm tải chi tiết khách hàng (và danh sách xe)
  const fetchDetails = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getCustomerDetails(customerId);
      setCustomer(data);
    } catch (err) {
      setError(err.message || 'Không thể tải chi tiết khách hàng.');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  // Tải dữ liệu khi modal mở hoặc customerId thay đổi
  useEffect(() => {
    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, fetchDetails]);

  // --- Hàm xử lý CRUD cho XE ---

  const handleAddNewVehicle = () => {
    setSelectedVehicle(null); // Đảm bảo là thêm mới
    setIsVehicleModalOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  // Xác nhận xóa xe
  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteVehicle(vehicleToDelete.vehicleId);
      // Tải lại danh sách sau khi xóa
      fetchDetails();
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
    } catch (err) {
      alert(`Xóa xe thất bại: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Callback khi lưu (thêm/sửa) xe thành công
  const onVehicleSave = () => {
    setIsVehicleModalOpen(false);
    fetchDetails(); // Tải lại dữ liệu
  };


  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl z-50 w-full max-w-3xl max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Chi tiết khách hàng
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto">
            {isLoading && <p>Đang tải...</p>}
            {error && <p className="text-red-500">{error}</p>}
            
            {customer && (
              <>
                {/* Thông tin khách hàng */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{customer.fullName}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Email:</strong> {customer.email}</p>
                    <p><strong>Phone:</strong> {customer.phone}</p>
                    <p><strong>Địa chỉ:</strong> {customer.address}</p>
                    <p><strong>Trạng thái:</strong> 
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {customer.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Quản lý xe */}
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-800">Danh sách xe</h3>
                    <button
                      onClick={handleAddNewVehicle}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      + Thêm xe mới
                    </button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hãng/Mẫu xe</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số VIN</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Năm</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Odometer</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customer.vehicles.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-4 py-3 text-center text-sm text-gray-500">
                              Chưa có xe nào.
                            </td>
                          </tr>
                        ) : (
                          customer.vehicles.map((vehicle) => (
                            <tr key={vehicle.vehicleId}>
                              <td className="px-4 py-3 text-sm text-gray-900">{vehicle.brand} {vehicle.model}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{vehicle.vin}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{vehicle.year}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{vehicle.odometerKm?.toLocaleString()} km</td>
                              <td className="px-4 py-3 text-sm">
                                <button onClick={() => handleEditVehicle(vehicle)} className="text-green-600 hover:text-green-900 mr-3">Sửa</button>
                                <button onClick={() => handleDeleteVehicle(vehicle)} className="text-red-600 hover:text-red-900">Xóa</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Thêm/Sửa Xe (lồng bên trong) */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={onVehicleSave}
        vehicle={selectedVehicle}
        customerId={customerId}
      />

      {/* Modal Xác nhận Xóa Xe (lồng bên trong) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteVehicle}
        isLoading={isDeleting}
        title="Xóa xe"
        message={`Bạn có chắc muốn xóa xe "${vehicleToDelete?.brand} ${vehicleToDelete?.model}" (VIN: ${vehicleToDelete?.vin})?`}
      />
    </>
  );
}

export default CustomerDetailModal;