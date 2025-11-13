import { useState, useEffect } from 'react'
import { staffAPI, customerAPI, maintenanceAPI } from '../lib/api'

// Helper function to convert snake_case to camelCase
const snakeToCamel = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeToCamel(v))
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = snakeToCamel(obj[key])
      return result
    }, {})
  }
  return obj
}

// Transform data helper
const transformData = (data, idField, extraTransform = {}) => {
  return snakeToCamel(data || []).map(item => ({
    ...item,
    id: item[idField] || item.id,
    ...Object.keys(extraTransform).reduce((acc, key) => {
      if (extraTransform[key]) {
        acc[key] = extraTransform[key](item)
      }
      return acc
    }, {})
  }))
}

/**
 * Custom hook để quản lý data loading cho Staff page
 */
export const useStaffData = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Data states
  const [appointments, setAppointments] = useState([])
  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [assignments, setAssignments] = useState([])
  const [serviceReceipts, setServiceReceipts] = useState([])
  const [maintenanceReports, setMaintenanceReports] = useState([])
  const [parts, setParts] = useState([])
  const [partRequests, setPartRequests] = useState([])
  const [services, setServices] = useState([])
  const [users, setUsers] = useState([])
  const [serviceOrders, setServiceOrders] = useState([])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [appts, custs, vehs, techs, assigns, receipts, reports, partsData, partReqs, servicesData, serviceOrdersData] = await Promise.all([
        staffAPI.getAppointments(),
        staffAPI.getCustomers(),
        staffAPI.getVehicles(),
        staffAPI.getTechnicians(),
        staffAPI.getAssignments(),
        staffAPI.getServiceReceipts(),
        staffAPI.getMaintenanceReports(),
        staffAPI.getParts(),
        staffAPI.getPartRequests(),
        customerAPI.getServices(),
        maintenanceAPI.getServiceOrders().catch(err => {
          console.warn('Maintenance service not available:', err)
          return []
        })
      ])

      // Transform data
      setAppointments(transformData(appts, 'appointmentId', {
        appointmentTime: (item) => item.appointmentDate 
          ? new Date(item.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          : 'N/A'
      }))
      
      setCustomers(transformData(custs, 'customerId'))
      setVehicles(transformData(vehs, 'vehicleId', {
        licensePlate: (item) => item.vin || item.licensePlate
      }))
      setTechnicians(transformData(techs, 'technicianId'))
      setAssignments(transformData(assigns, 'assignmentId'))
      setServiceReceipts(transformData(receipts, 'receiptId'))
      setMaintenanceReports(transformData(reports, 'reportId'))
      setParts(transformData(partsData, 'partId'))
      setPartRequests(transformData(partReqs, 'requestId'))
      setServices(transformData(servicesData, 'serviceId'))
      setUsers(transformData([], 'userId'))
      setServiceOrders(transformData(serviceOrdersData, 'orderId'))

    } catch (err) {
      setError('Không thể tải dữ liệu: ' + err.message)
      console.error('Load data error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    loading,
    error,
    loadData,
    // Data
    appointments,
    customers,
    vehicles,
    technicians,
    assignments,
    serviceReceipts,
    maintenanceReports,
    parts,
    partRequests,
    services,
    users,
    serviceOrders,
    // Setters (nếu cần update từ bên ngoài)
    setAppointments,
    setCustomers,
    setVehicles,
    setTechnicians,
    setAssignments,
    setServiceReceipts,
    setMaintenanceReports,
    setParts,
    setPartRequests,
    setServices,
    setUsers,
    setServiceOrders
  }
}

