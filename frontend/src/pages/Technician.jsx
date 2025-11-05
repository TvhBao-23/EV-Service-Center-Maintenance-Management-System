import { useEffect, useState } from 'react'
import { staffAPI } from '../lib/api'
import RoleBasedNav from '../components/RoleBasedNav'

function Technician() {
  const [activeTab, setActiveTab] = useState('assignments') // assignments | checklists | reports
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Data states
  const [assignments, setAssignments] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [appointments, setAppointments] = useState([])
  const [checklists, setChecklists] = useState([])
  const [maintenanceReports, setMaintenanceReports] = useState([])

  // UI states
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  // Get current user ID from localStorage (tech user)
  const currentUserId = parseInt(localStorage.getItem('userId')) || null

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [assigns, vehs, appts, checks, reports] = await Promise.all([
        staffAPI.getAssignments(),
        staffAPI.getVehicles(),
        staffAPI.getAppointments(),
        staffAPI.getChecklists(),
        staffAPI.getMaintenanceReports()
      ])
      setAssignments(assigns)
      setVehicles(vehs)
      setAppointments(appts)
      setChecklists(checks)
      setMaintenanceReports(reports)
    } catch (err) {
      setError('Không thể tải dữ liệu: ' + err.message)
      console.error('Load data error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter assignments for current technician
  const myAssignments = assignments.filter(a => a.technicianId === currentUserId)

  // Get vehicle info by ID
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? `${vehicle.model} (${vehicle.licensePlate})` : 'N/A'
  }

  // Get appointment info by ID
  const getAppointmentInfo = (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    return appointment
  }

  // Handle start work on assignment
  const handleStartWork = async (assignmentId) => {
    try {
      await staffAPI.updateAssignmentStatus(assignmentId, 'in_progress')
      loadData() // Reload data
      alert('Đã bắt đầu làm việc!')
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  // Handle complete assignment
  const handleCompleteWork = async (assignmentId) => {
    if (!confirm('Xác nhận hoàn thành công việc?')) return
    
    try {
      await staffAPI.updateAssignmentStatus(assignmentId, 'completed')
      loadData() // Reload data
      alert('Đã hoàn thành công việc!')
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  // Handle create/update checklist
  const handleOpenChecklist = (assignment) => {
    setSelectedAssignment(assignment)
    setShowChecklistModal(true)
  }

  const submitChecklist = async (checklistData) => {
    try {
      // Check if checklist exists for this assignment
      const existing = checklists.find(c => c.assignmentId === selectedAssignment.id)
      
      if (existing) {
        await staffAPI.updateChecklist(existing.id, checklistData)
      } else {
        await staffAPI.createChecklist({
          assignmentId: selectedAssignment.id,
          ...checklistData
        })
      }
      
      setShowChecklistModal(false)
      setSelectedAssignment(null)
      loadData() // Reload data
      alert('Đã lưu checklist!')
    } catch (err) {
      alert('Lỗi lưu checklist: ' + err.message)
    }
  }

  // Handle create maintenance report
  const handleOpenReport = (assignment) => {
    setSelectedAssignment(assignment)
    setShowReportModal(true)
  }

  const submitReport = async (reportData) => {
    try {
      await staffAPI.createMaintenanceReport({
        assignmentId: selectedAssignment.id,
        technicianId: currentUserId,
        ...reportData
      })
      
      setShowReportModal(false)
      setSelectedAssignment(null)
      loadData() // Reload data
      alert('Đã gửi báo cáo bảo dưỡng!')
    } catch (err) {
      alert('Lỗi gửi báo cáo: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Navigation */}
      <RoleBasedNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Bảng điều khiển Kỹ thuật viên</h2>
          <p className="text-gray-600 mt-2">Quản lý công việc, checklist và báo cáo bảo dưỡng</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Lỗi:</p>
            <p className="text-sm">{error}</p>
            <button onClick={loadData} className="mt-2 text-sm underline">Thử lại</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
          {[
            { key: 'assignments', label: 'Công việc của tôi' },
            { key: 'checklists', label: 'Checklists' },
            { key: 'reports', label: 'Báo cáo của tôi' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Công việc được phân công</h3>
              <button onClick={loadData} className="px-3 py-1 border rounded-md hover:bg-gray-50">
                🔄 Làm mới
              </button>
            </div>

            {myAssignments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">Chưa có công việc nào được phân công</p>
            ) : (
              <div className="space-y-4">
                {myAssignments.map(assign => {
                  const appointment = getAppointmentInfo(assign.appointmentId)
                  return (
                    <div key={assign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-lg font-medium text-gray-900">Phân công #{assign.id}</span>
                          <span className="ml-3 text-sm text-gray-500">Lịch hẹn #{assign.appointmentId}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          assign.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          assign.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          assign.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {assign.status === 'assigned' ? 'Chờ bắt đầu' :
                           assign.status === 'in_progress' ? 'Đang thực hiện' :
                           assign.status === 'completed' ? 'Hoàn thành' : assign.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-600">Xe:</p>
                          <p className="font-medium">{getVehicleInfo(assign.vehicleId)}</p>
                        </div>
                        {appointment && (
                          <div>
                            <p className="text-gray-600">Thời gian hẹn:</p>
                            <p className="font-medium">
                              {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} {appointment.appointmentTime}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        {assign.status === 'assigned' && (
                          <button
                            onClick={() => handleStartWork(assign.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            🚀 Bắt đầu làm việc
                          </button>
                        )}
                        
                        {assign.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => handleOpenChecklist(assign)}
                              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                            >
                              📋 Checklist
                            </button>
                            <button
                              onClick={() => handleOpenReport(assign)}
                              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                            >
                              📝 Báo cáo
                            </button>
                            <button
                              onClick={() => handleCompleteWork(assign.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm ml-auto"
                            >
                              ✓ Hoàn thành
                            </button>
            </>
          )}

                        {assign.status === 'completed' && (
                          <span className="text-sm text-gray-600 italic">Đã hoàn thành công việc</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Checklists Tab */}
        {activeTab === 'checklists' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Danh sách Checklists</h3>
              <button onClick={loadData} className="px-3 py-1 border rounded-md hover:bg-gray-50">
                🔄 Làm mới
              </button>
            </div>

            {checklists.filter(c => myAssignments.some(a => a.id === c.assignmentId)).length === 0 ? (
              <p className="text-gray-600 text-center py-8">Chưa có checklist nào</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklists
                  .filter(c => myAssignments.some(a => a.id === c.assignmentId))
                  .map(checklist => (
                    <div key={checklist.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-900">Checklist #{checklist.id}</span>
                        <span className="text-xs text-gray-500">
                          Phân công #{checklist.assignmentId}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={checklist.batteryCheck} disabled />
                          <span className={checklist.batteryCheck ? 'text-green-700' : 'text-gray-600'}>
                            Kiểm tra pin
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={checklist.brakeCheck} disabled />
                          <span className={checklist.brakeCheck ? 'text-green-700' : 'text-gray-600'}>
                            Kiểm tra phanh
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={checklist.tireCheck} disabled />
                          <span className={checklist.tireCheck ? 'text-green-700' : 'text-gray-600'}>
                            Kiểm tra lốp
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={checklist.lightsCheck} disabled />
                          <span className={checklist.lightsCheck ? 'text-green-700' : 'text-gray-600'}>
                            Kiểm tra đèn
                          </span>
                        </label>

                        {checklist.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-gray-600 font-medium">Ghi chú:</p>
                            <p className="text-gray-700">{checklist.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Báo cáo bảo dưỡng của tôi</h3>
              <button onClick={loadData} className="px-3 py-1 border rounded-md hover:bg-gray-50">
                🔄 Làm mới
              </button>
            </div>

            {maintenanceReports.filter(r => r.technicianId === currentUserId).length === 0 ? (
              <p className="text-gray-600 text-center py-8">Chưa có báo cáo nào</p>
            ) : (
              <div className="space-y-4">
                {maintenanceReports
                  .filter(r => r.technicianId === currentUserId)
                  .map(report => (
                    <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-lg font-medium text-gray-900">Báo cáo #{report.id}</span>
                          <span className="ml-3 text-sm text-gray-500">Phân công #{report.assignmentId}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.approved ? '✓ Đã phê duyệt' : '⏳ Chờ phê duyệt'}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        {report.issuesFound && (
                          <div>
                            <p className="font-medium text-gray-900">Sự cố phát hiện:</p>
                            <p className="text-gray-700">{report.issuesFound}</p>
            </div>
          )}
                        
                        {report.workPerformed && (
                          <div>
                            <p className="font-medium text-gray-900">Công việc thực hiện:</p>
                            <p className="text-gray-700">{report.workPerformed}</p>
                          </div>
                        )}
                        
                        {report.partsReplaced && (
                          <div>
                            <p className="font-medium text-gray-900">Phụ tùng thay thế:</p>
                            <p className="text-gray-700">{report.partsReplaced}</p>
        </div>
                        )}
                        
                        {report.recommendations && (
                          <div>
                            <p className="font-medium text-gray-900">Đề xuất:</p>
                            <p className="text-gray-700">{report.recommendations}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 pt-2 border-t">
                          Ngày tạo: {new Date(report.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                  </div>
              ))}
              </div>
          )}
        </div>
        )}
      </main>

      {/* Checklist Modal */}
      {showChecklistModal && selectedAssignment && (
        <ChecklistModal
          assignment={selectedAssignment}
          existingChecklist={checklists.find(c => c.assignmentId === selectedAssignment.id)}
          onClose={() => {
            setShowChecklistModal(false)
            setSelectedAssignment(null)
          }}
          onSubmit={submitChecklist}
          getVehicleInfo={getVehicleInfo}
        />
      )}

      {/* Maintenance Report Modal */}
      {showReportModal && selectedAssignment && (
        <ReportModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowReportModal(false)
            setSelectedAssignment(null)
          }}
          onSubmit={submitReport}
          getVehicleInfo={getVehicleInfo}
        />
      )}
    </div>
  )
}

// Checklist Modal Component
function ChecklistModal({ assignment, existingChecklist, onClose, onSubmit, getVehicleInfo }) {
  const [formData, setFormData] = useState({
    batteryCheck: existingChecklist?.batteryCheck || false,
    brakeCheck: existingChecklist?.brakeCheck || false,
    tireCheck: existingChecklist?.tireCheck || false,
    lightsCheck: existingChecklist?.lightsCheck || false,
    notes: existingChecklist?.notes || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Checklist bảo dưỡng</h3>
              </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
            <p className="text-sm text-gray-600"><span className="font-medium">Phân công:</span> #{assignment.id}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Xe:</span> {getVehicleInfo(assignment.vehicleId)}</p>
              </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.batteryCheck}
                onChange={(e) => setFormData({ ...formData, batteryCheck: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium">Kiểm tra pin (dung lượng, nhiệt độ)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.brakeCheck}
                onChange={(e) => setFormData({ ...formData, brakeCheck: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium">Kiểm tra phanh (má phanh, dầu phanh)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tireCheck}
                onChange={(e) => setFormData({ ...formData, tireCheck: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium">Kiểm tra lốp (áp suất, độ mòn)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.lightsCheck}
                onChange={(e) => setFormData({ ...formData, lightsCheck: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium">Kiểm tra đèn (pha, cos, xi-nhan)</span>
            </label>
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ghi chú thêm về tình trạng xe..."
            />
            </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              💾 Lưu checklist
            </button>
          </div>
        </form>
          </div>
        </div>
  )
}

// Maintenance Report Modal Component
function ReportModal({ assignment, onClose, onSubmit, getVehicleInfo }) {
  const [formData, setFormData] = useState({
    issuesFound: '',
    workPerformed: '',
    partsReplaced: '',
    recommendations: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.issuesFound && !formData.workPerformed) {
      alert('Vui lòng điền ít nhất một trong hai trường: Sự cố phát hiện hoặc Công việc thực hiện')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Báo cáo bảo dưỡng</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600"><span className="font-medium">Phân công:</span> #{assignment.id}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Xe:</span> {getVehicleInfo(assignment.vehicleId)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sự cố phát hiện <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.issuesFound}
              onChange={(e) => setFormData({ ...formData, issuesFound: e.target.value })}
              rows={3}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Mô tả các sự cố, hư hỏng phát hiện trong quá trình bảo dưỡng..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Công việc thực hiện <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.workPerformed}
              onChange={(e) => setFormData({ ...formData, workPerformed: e.target.value })}
              rows={3}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Mô tả các công việc đã thực hiện (bảo dưỡng, sửa chữa, thay thế...)..."
            />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phụ tùng thay thế</label>
            <textarea
              value={formData.partsReplaced}
              onChange={(e) => setFormData({ ...formData, partsReplaced: e.target.value })}
              rows={2}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Danh sách phụ tùng đã thay thế (nếu có)..."
            />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đề xuất</label>
            <textarea
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              rows={2}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Đề xuất bảo dưỡng, thay thế trong tương lai..."
            />
            </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              📤 Gửi báo cáo
            </button>
          </div>
        </form>
          </div>
        </div>
  )
}

export default Technician
