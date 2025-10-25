// src/components/StaffManagementTab.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api.js';
import StaffModal from './StaffModal';
import DeleteConfirmModal from './DeleteConfirmModal';

function StaffManagementTab() {
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null); // For edit/delete

  // Fetch data on mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminAPI.getAllStaff();
      setStaffList(data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nhân sự.');
      setStaffList([]); // Clear list on error
    } finally {
      setIsLoading(false);
    }
  };

  // --- Modal Handlers ---
  const handleAddNew = () => {
    setSelectedStaff(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsFormModalOpen(true);
  };

  const handleDelete = (staffMember) => {
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStaff) return;
    try {
      await adminAPI.deleteStaff(selectedStaff.staffId);
      fetchStaff(); // Refresh list
      setIsDeleteModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error('Failed to delete staff:', error);
      alert(`Xóa thất bại: ${error.message}`);
    }
  };

  const handleSave = () => {
    fetchStaff(); // Refresh list after save
    setIsFormModalOpen(false);
  };

  // Separate staff and technicians for display
  const staffMembers = staffList.filter(s => s.role === 'staff');
  const technicians = staffList.filter(s => s.role === 'technician');
  // You might want to include 'admin' role in one of the lists or a separate one

  return (
    <div className="space-y-6">
       <div className="flex justify-end mb-4">
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Thêm nhân sự
          </button>
        </div>

        {isLoading && <p>Đang tải danh sách nhân sự...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column for Staff */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhân viên (Staff)</h3>
            {staffMembers.length === 0 && !isLoading ? (
                 <p className="text-gray-500 text-sm">Chưa có nhân viên nào.</p>
            ) : (
                <div className="space-y-3">
                {staffMembers.map((staff) => (
                    <StaffCard key={staff.staffId} staffMember={staff} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
                </div>
            )}
          </div>

          {/* Column for Technicians */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kỹ thuật viên</h3>
             {technicians.length === 0 && !isLoading ? (
                 <p className="text-gray-500 text-sm">Chưa có kỹ thuật viên nào.</p>
            ) : (
                <div className="space-y-3">
                {technicians.map((tech) => (
                    <StaffCard key={tech.staffId} staffMember={tech} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
                </div>
             )}
          </div>
        </div>

      {/* Modals */}
      <StaffModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        staffMember={selectedStaff}
        onSave={handleSave}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa nhân sự"
        message={`Bạn có chắc muốn xóa "${selectedStaff?.fullName}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}

// Internal component for displaying a staff card
function StaffCard({ staffMember, onEdit, onDelete }) {
 return (
     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div>
            <p className="font-medium text-gray-900">{staffMember.fullName}</p>
            <p className="text-sm text-gray-600">{staffMember.email}</p>
            <p className="text-xs text-gray-500 mt-1">Vị trí: {staffMember.position} - Trạng thái:
                <span className={`ml-1 ${staffMember.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {staffMember.isActive ? 'Hoạt động' : 'Vô hiệu'}
                </span>
             </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 ml-4">
            <button onClick={() => onEdit(staffMember)} className="text-blue-600 hover:text-blue-900 text-sm">Sửa</button>
            <button onClick={() => onDelete(staffMember)} className="text-red-600 hover:text-red-900 text-sm">Xóa</button>
        </div>
    </div>
 );
}


export default StaffManagementTab;