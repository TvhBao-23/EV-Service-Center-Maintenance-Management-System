import { useMemo } from 'react'

/**
 * Custom hook để tính toán dashboard statistics
 */
export const useDashboardStats = ({
  appointments,
  serviceOrders,
  assignments,
  serviceReceipts,
  maintenanceReports
}) => {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = appointments.filter(a => {
      const apptDate = new Date(a.appointmentDate).toISOString().split('T')[0]
      return apptDate === today
    })

    // Đếm service orders từ maintenance service
    const assignedOrders = serviceOrders.filter(
      so => so.assignedTechnicianId && so.assignedTechnicianId !== null && so.assignedTechnicianId !== 0
    )
    const inProgressOrders = serviceOrders.filter(
      so => so.status === 'in_progress' || so.status === 'queued'
    )
    const completedOrders = serviceOrders.filter(so => so.status === 'completed')

    return {
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
      receivedAppointments: appointments.filter(a => a.status === 'received').length,
      // Đang xử lý: đếm từ service orders với status 'in_progress' hoặc 'queued'
      inProgressAppointments: inProgressOrders.length || appointments.filter(a => a.status === 'received').length,
      completedToday: appointments.filter(a => {
        const apptDate = new Date(a.appointmentDate).toISOString().split('T')[0]
        return apptDate === today && a.status === 'completed'
      }).length + completedOrders.filter(so => {
        const apt = appointments.find(a => a.id === so.appointmentId)
        if (!apt) return false
        const apptDate = new Date(apt.appointmentDate).toISOString().split('T')[0]
        return apptDate === today
      }).length,
      totalServiceReceipts: serviceReceipts.length,
      // Tổng phân công: đếm từ service orders đã được phân công
      totalAssignments: assignedOrders.length || assignments.length,
      // Sửa: dùng status thay vì approved (status: 'draft', 'submitted', 'approved', 'rejected')
      pendingReports: maintenanceReports.filter(r => 
        r.status === 'draft' || r.status === 'submitted'
      ).length,
      approvedReports: maintenanceReports.filter(r => r.status === 'approved').length,
      // Kỹ thuật viên đang làm việc: đếm unique technicians từ service orders đã phân công và đang xử lý
      activeTechnicians: new Set(
        assignedOrders
          .filter(so => so.status === 'in_progress' || so.status === 'queued')
          .map(so => so.assignedTechnicianId)
          .filter(id => id != null)
      ).size || new Set(assignments.filter(a => a.status === 'in_progress').map(a => a.technicianId)).size
    }
  }, [appointments, serviceOrders, assignments, serviceReceipts, maintenanceReports])
}

