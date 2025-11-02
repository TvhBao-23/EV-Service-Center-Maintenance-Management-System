/**
 * Export Utilities for EV Service Center
 * Supports PDF and Excel exports for reports
 */

import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Export payment history to PDF
 * @param {Array} payments - Array of payment objects
 * @param {Object} user - User information
 * @param {Object} statistics - Payment statistics
 */
export const exportPaymentHistoryToPDF = (payments, user, statistics) => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('BÁO CÁO LỊCH SỬ THANH TOÁN', 105, 15, { align: 'center' })
    
    // Add customer info
    doc.setFontSize(12)
    doc.text(`Khách hàng: ${user?.fullName || user?.email || 'N/A'}`, 14, 30)
    doc.text(`Email: ${user?.email || 'N/A'}`, 14, 37)
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 14, 44)
    
    // Add statistics
    doc.setFontSize(11)
    doc.text('THỐNG KÊ TỔNG QUAN', 14, 55)
    doc.setFontSize(10)
    doc.text(`Tổng chi phí: ${statistics.totalCost.toLocaleString('vi-VN')} VNĐ`, 14, 62)
    doc.text(`Số dịch vụ: ${statistics.totalServices}`, 14, 69)
    doc.text(`Chi phí TB/dịch vụ: ${statistics.avgCostPerService.toLocaleString('vi-VN')} VNĐ`, 14, 76)
    
    // Prepare table data
    const tableData = payments.map((payment, index) => [
      index + 1,
      new Date(payment.createdAt).toLocaleDateString('vi-VN'),
      payment.transactionId || 'N/A',
      getPaymentMethodLabel(payment.paymentMethod),
      getPaymentStatusLabel(payment.status),
      `${Number(payment.amount).toLocaleString('vi-VN')} VNĐ`
    ])
    
    // Add table
    doc.autoTable({
      startY: 85,
      head: [['STT', 'Ngày', 'Mã GD', 'Phương thức', 'Trạng thái', 'Số tiền']],
      body: tableData,
      styles: { 
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] 
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 35, halign: 'right' }
      }
    })
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Trang ${i}/${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }
    
    // Save PDF
    const fileName = `LichSuThanhToan_${new Date().getTime()}.pdf`
    doc.save(fileName)
    
    return { success: true, fileName }
  } catch (error) {
    console.error('Export PDF error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Export service history to Excel
 * @param {Array} appointments - Array of appointment objects
 * @param {Array} payments - Array of payment objects
 * @param {Object} user - User information
 */
export const exportServiceHistoryToExcel = (appointments, payments, user) => {
  try {
    // Prepare appointments data
    const appointmentsData = appointments.map((apt, index) => ({
      'STT': index + 1,
      'Ngày đặt': new Date(apt.appointmentDate).toLocaleDateString('vi-VN'),
      'Dịch vụ': apt.serviceName || 'N/A',
      'Trung tâm': apt.centerName || 'N/A',
      'Xe': apt.vehicleBrand ? `${apt.vehicleBrand} ${apt.vehicleModel}`.trim() : 'N/A',
      'Trạng thái': getAppointmentStatusLabel(apt.status),
      'Ghi chú': apt.notes || ''
    }))
    
    // Prepare payments data
    const paymentsData = payments.map((payment, index) => ({
      'STT': index + 1,
      'Ngày thanh toán': new Date(payment.createdAt).toLocaleDateString('vi-VN'),
      'Mã giao dịch': payment.transactionId || 'N/A',
      'Phương thức': getPaymentMethodLabel(payment.paymentMethod),
      'Số tiền (VNĐ)': Number(payment.amount),
      'Trạng thái': getPaymentStatusLabel(payment.status)
    }))
    
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Add appointments sheet
    const wsAppointments = XLSX.utils.json_to_sheet(appointmentsData)
    XLSX.utils.book_append_sheet(wb, wsAppointments, 'Lịch sử dịch vụ')
    
    // Add payments sheet
    const wsPayments = XLSX.utils.json_to_sheet(paymentsData)
    XLSX.utils.book_append_sheet(wb, wsPayments, 'Lịch sử thanh toán')
    
    // Add summary sheet
    const totalCost = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0)
    
    const summaryData = [
      { 'Chỉ số': 'Tổng số dịch vụ', 'Giá trị': appointments.length },
      { 'Chỉ số': 'Dịch vụ hoàn thành', 'Giá trị': appointments.filter(a => a.status === 'completed').length },
      { 'Chỉ số': 'Tổng chi phí (VNĐ)', 'Giá trị': totalCost },
      { 'Chỉ số': 'Khách hàng', 'Giá trị': user?.fullName || user?.email || 'N/A' },
      { 'Chỉ số': 'Email', 'Giá trị': user?.email || 'N/A' },
      { 'Chỉ số': 'Ngày xuất báo cáo', 'Giá trị': new Date().toLocaleDateString('vi-VN') }
    ]
    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan')
    
    // Save Excel file
    const fileName = `LichSuDichVu_${new Date().getTime()}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    return { success: true, fileName }
  } catch (error) {
    console.error('Export Excel error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Export vehicle maintenance summary to PDF
 * @param {Array} vehicles - Array of vehicle objects
 * @param {Array} appointments - Array of appointment objects
 * @param {Object} statistics - Statistics object
 */
export const exportVehicleMaintenanceToPDF = (vehicles, appointments, statistics) => {
  try {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.text('BÁO CÁO BẢO DƯỠNG XE', 105, 15, { align: 'center' })
    
    // Add date
    doc.setFontSize(12)
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 14, 30)
    
    // Add statistics
    doc.setFontSize(11)
    doc.text('THỐNG KÊ TỔNG QUAN', 14, 40)
    doc.setFontSize(10)
    doc.text(`Tổng số xe: ${vehicles.length}`, 14, 47)
    doc.text(`Tổng chi phí: ${statistics.totalCost.toLocaleString('vi-VN')} VNĐ`, 14, 54)
    
    // Prepare vehicle data with maintenance history
    const tableData = vehicles.map((vehicle, index) => {
      const vehicleAppointments = appointments.filter(
        apt => apt.vehicleId === vehicle.vehicleId && apt.status === 'completed'
      )
      const vehicleCost = statistics.costByVehicle.find(c => c.vehicleId === vehicle.vehicleId)
      
      return [
        index + 1,
        `${vehicle.brand} ${vehicle.model}`,
        vehicle.year || 'N/A',
        vehicle.odometerKm ? `${vehicle.odometerKm.toLocaleString()} km` : 'N/A',
        vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString('vi-VN') : 'N/A',
        vehicleAppointments.length,
        vehicleCost ? `${vehicleCost.totalCost.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'
      ]
    })
    
    // Add table
    doc.autoTable({
      startY: 65,
      head: [['STT', 'Xe', 'Năm', 'Km', 'BD cuối', 'Số lần', 'Chi phí']],
      body: tableData,
      styles: { 
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] 
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25 },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 35, halign: 'right' }
      }
    })
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(
        `Trang ${i}/${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }
    
    // Save PDF
    const fileName = `BaoCaoBaoDuongXe_${new Date().getTime()}.pdf`
    doc.save(fileName)
    
    return { success: true, fileName }
  } catch (error) {
    console.error('Export vehicle maintenance PDF error:', error)
    return { success: false, error: error.message }
  }
}

// Helper functions
const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: 'Tiền mặt',
    card: 'Thẻ',
    bank_transfer: 'Chuyển khoản',
    e_wallet: 'Ví điện tử'
  }
  return labels[method] || method
}

const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xử lý',
    completed: 'Hoàn thành',
    failed: 'Thất bại',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const getAppointmentStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

