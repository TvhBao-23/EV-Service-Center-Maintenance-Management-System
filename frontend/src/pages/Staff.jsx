import { useEffect, useState, useMemo } from 'react'
import { staffAPI, customerAPI, maintenanceAPI } from '../lib/api'
import VehicleHistory from '../components/VehicleHistory'
import RoleBasedNav from '../components/RoleBasedNav'
import { AddPartModal, EditPartModal } from './Staff-PartModals'

function Staff() {
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard | appointments | receipts | assignments | reports
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Service catalog được load từ database (bảng services)
  // Không cần hardcode vì đã có trong state 'services'

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
  const [services, setServices] = useState([]) // 🆕 Services list
  const [users, setUsers] = useState([]) // 🆕 Users list for phone numbers
  const [serviceOrders, setServiceOrders] = useState([]) // 🆕 Service orders from maintenance service

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // Mặc định hiển thị tất cả
  const [dateFilter, setDateFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all') // 🆕 Filter phụ tùng theo dịch vụ

  // UI states
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)
  const [showVehicleHistory, setShowVehicleHistory] = useState(false)
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Parts management states
  const [showAddPartModal, setShowAddPartModal] = useState(false)
  const [showEditPartModal, setShowEditPartModal] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

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

  // Helper function to normalize service order status (handle both uppercase and lowercase)
  const normalizeServiceOrderStatus = (status) => {
    if (!status) return ''
    const normalized = status.toString().toUpperCase()
    // Map common variations
    if (normalized === 'QUEUED' || normalized === 'QUEUE') return 'QUEUED'
    if (normalized === 'IN_PROGRESS' || normalized === 'INPROGRESS' || normalized === 'IN PROGRESS') return 'IN_PROGRESS'
    if (normalized === 'COMPLETED' || normalized === 'COMPLETE') return 'COMPLETED'
    if (normalized === 'DELAYED' || normalized === 'DELAY') return 'DELAYED'
    return normalized
  }

  // Helper function to get service order status display info
  const getServiceOrderStatusDisplay = (status) => {
    const normalized = normalizeServiceOrderStatus(status)
    switch (normalized) {
      case 'QUEUED':
        return { label: '⏳ Chờ', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', display: '⏳ Chờ phân công' }
      case 'IN_PROGRESS':
        return { label: '🔧 Đang làm', bgColor: 'bg-blue-100', textColor: 'text-blue-800', display: '🔧 Đang làm' }
      case 'COMPLETED':
        return { label: '✅ Hoàn tất', bgColor: 'bg-green-100', textColor: 'text-green-800', display: '✅ Hoàn tất' }
      case 'DELAYED':
        return { label: '⚠️ Trễ', bgColor: 'bg-red-100', textColor: 'text-red-800', display: '⚠️ Trễ' }
      default:
        return { label: status || 'N/A', bgColor: 'bg-gray-100', textColor: 'text-gray-800', display: status || 'N/A' }
    }
  }

  // 🆕 Load parts filtered by service category
  const loadPartsForService = async (category) => {
    try {
      if (category === 'all') {
        const allParts = await staffAPI.getParts()
        setParts(snakeToCamel(allParts || []).map(p => ({
          ...p,
          id: p.partId || p.id
        })))
      } else {
        const response = await fetch(`http://localhost:8083/api/staff/parts/for-service/${category}`)
        if (response.ok) {
          const filteredParts = await response.json()
          setParts(snakeToCamel(filteredParts || []).map(p => ({
            ...p,
            id: p.partId || p.id
          })))
          console.log(`✅ Loaded ${filteredParts.length} parts for ${category} service`)
        } else {
          setParts([])
        }
      }
    } catch (error) {
      console.error('Error loading filtered parts:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [appts, custs, vehs, techs, assigns, receipts, reports, partsData, partReqs, servicesData, serviceOrders] = await Promise.all([
        staffAPI.getAppointments(),
        staffAPI.getCustomers(),
        staffAPI.getVehicles(),
        staffAPI.getTechnicians(),
        staffAPI.getAssignments(),
        staffAPI.getServiceReceipts(),
        staffAPI.getMaintenanceReports(),
        staffAPI.getParts(),
        staffAPI.getPartRequests(),
        customerAPI.getServices(), // 🆕 Load services
        maintenanceAPI.getServiceOrders().catch(err => {
          console.warn('Maintenance service not available:', err)
          return [] // Return empty array if service is not available
        }) // 🆕 Load service orders from maintenance service
      ])
      
      // 🆕 Try to get phone numbers by fetching user info from AuthService
      // Since StaffService doesn't return phone, we'll need to fetch it
      // For now, we'll enhance getUserPhone to fetch on-demand
      const mergedCustomers = custs || []
      
      // Initialize usersData as empty array (phone is already in customer object from backend)
      const usersData = []
      
      console.log('[Staff] Data loaded:', {
        appointments: appts?.length || 0,
        customers: custs?.length || 0,
        vehicles: vehs?.length || 0,
        technicians: techs?.length || 0,
        assignments: assigns?.length || 0,
        receipts: receipts?.length || 0,
        reports: reports?.length || 0,
        parts: partsData?.length || 0,
        partRequests: partReqs?.length || 0
      })
      
      // Debug: Log raw data
      console.log('[Staff] Raw receipts:', receipts)
      console.log('[Staff] Raw assignments:', assigns)
      console.log('[Staff] Raw reports:', reports)
      
      // Transform data: convert snake_case to camelCase and add id field
      const transformedAppts = snakeToCamel(appts || []).map(a => ({
        ...a,
        id: a.appointmentId || a.id,
        appointmentDate: a.appointmentDate || a.requestedDateTime || a.requested_date_time, // Support multiple field names
        createdAt: a.createdAt || a.created_at, // Include created_at for filtering
        appointmentTime: (a.appointmentDate || a.requestedDateTime || a.requested_date_time) ? new Date(a.appointmentDate || a.requestedDateTime || a.requested_date_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
      }))
      
      const transformedCusts = snakeToCamel(mergedCustomers || []).map(c => {
        const transformed = {
        ...c,
        id: c.customerId || c.id
        }
        // Debug: Log to see if phone is in the response
        if (c.phone || c.phoneNumber) {
          console.log('[Staff] Customer with phone:', { id: transformed.id, phone: c.phone || c.phoneNumber })
        }
        return transformed
      })
      
      const transformedVehs = snakeToCamel(vehs || []).map(v => ({
        ...v,
        id: v.vehicleId || v.id,
        licensePlate: v.vin // Use VIN as license plate if not available
      }))
      
      const transformedTechs = snakeToCamel(techs || []).map(t => {
        // Tìm ID từ nhiều fields có thể có
        const techId = t.technicianId || t.staffId || t.id || t.userId
        console.log('[Staff] Transforming technician:', { 
          original: t, 
          technicianId: t.technicianId, 
          staffId: t.staffId, 
          id: t.id, 
          userId: t.userId,
          finalId: techId 
        })
        return {
        ...t,
          id: techId,
          technicianId: techId,
          staffId: techId
        }
      })
      
      const transformedAssigns = snakeToCamel(assigns || []).map(a => ({
        ...a,
        id: a.assignmentId || a.id
      }))
      
      const transformedReceipts = snakeToCamel(receipts || []).map(r => ({
        ...r,
        id: r.receiptId || r.id
      }))
      
      const transformedReports = snakeToCamel(reports || []).map(r => ({
        ...r,
        id: r.reportId || r.id
      }))
      
      const transformedParts = snakeToCamel(partsData || []).map(p => ({
        ...p,
        id: p.partId || p.id
      }))
      
      const transformedPartRequests = snakeToCamel(partReqs || []).map(pr => ({
        ...pr,
        id: pr.requestId || pr.id
      }))
      
      const transformedServices = snakeToCamel(servicesData || []).map(s => ({
        ...s,
        id: s.serviceId || s.id
      }))
      
      const transformedUsers = snakeToCamel(usersData.filter(u => u !== null)).map(u => ({
        ...u,
        id: u.userId || u.id
      }))
      
      console.log('[Staff] Transformed sample:', {
        appointment: transformedAppts[0],
        customer: transformedCusts[0],
        vehicle: transformedVehs[0],
        services: transformedServices.length,
        users: transformedUsers.length
      })
      
      setAppointments(transformedAppts)
      setCustomers(transformedCusts)
      setVehicles(transformedVehs)
      setTechnicians(transformedTechs)
      setAssignments(transformedAssigns)
      setServiceReceipts(transformedReceipts)
      setMaintenanceReports(transformedReports)
      setParts(transformedParts)
      setPartRequests(transformedPartRequests)
      setServices(transformedServices) // 🆕 Set services
      setUsers(transformedUsers) // 🆕 Set users
      
      // Transform service orders from maintenance service
      const transformedServiceOrders = snakeToCamel(serviceOrders || []).map(so => ({
        ...so,
        id: so.orderId || so.id
      }))
      setServiceOrders(transformedServiceOrders)
    } catch (err) {
      setError('Không thể tải dữ liệu: ' + err.message)
      console.error('Load data error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.fullName || customer.email : 'N/A'
  }

  // Get vehicle info by ID
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? `${vehicle.model} (${vehicle.licensePlate})` : 'N/A'
  }

  // Handle view vehicle history
  const handleViewHistory = (vehicleId) => {
    setSelectedVehicleId(vehicleId)
    setShowVehicleHistory(true)
  }

  // Get technician name by ID
  const getTechnicianName = (techId) => {
    const tech = technicians.find(t => t.id === techId)
    return tech ? tech.fullName || tech.email : 'N/A'
  }

  // 🆕 Get service name by ID
  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId)
    return service ? service.name : serviceId ? `Dịch vụ #${serviceId}` : 'N/A'
  }

  // 🆕 Get user phone by customer ID - fetch on demand if not available
  const getUserPhone = async (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    if (!customer || !customer.userId) return 'N/A'
    
    // Try to get phone from customer object first
    if (customer.phone) return customer.phone
    
    // Try to get from users list
    const user = users.find(u => u.id === customer.userId)
    if (user?.phone) return user.phone
    
    // Try to fetch from AuthService on demand
    try {
      const response = await fetch(`http://localhost:8081/api/auth/users/${customer.userId}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      if (response.ok) {
        const userData = await response.json()
        // Cache it in users list
        if (userData.phone && !users.find(u => u.id === customer.userId)) {
          setUsers([...users, { id: customer.userId, phone: userData.phone }])
        }
        return userData.phone || 'N/A'
      }
    } catch (err) {
      console.warn('[Staff] Could not fetch user phone:', err)
    }
    
    return 'N/A'
  }
  
  // Synchronous version for display (will show 'N/A' initially, then update)
  const getUserPhoneSync = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return 'N/A'
    if (customer.phone) return customer.phone
    const user = users.find(u => u.id === customer.userId)
    return user?.phone || 'N/A'
  }

  // Dashboard Statistics
  const dashboardStats = useMemo(() => {
    // Get today's date in local timezone (YYYY-MM-DD format)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    
    // Helper function to get date string in local timezone
    const getLocalDateString = (dateValue) => {
      if (!dateValue) return null
      const date = new Date(dateValue)
      // Handle invalid dates
      if (isNaN(date.getTime())) return null
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    
    const todayAppointments = appointments.filter(a => {
      // Check both requested_date_time (appointment date) and created_at (when created)
      const requestedDate = a.appointmentDate || a.requestedDateTime || a.requested_date_time
      const createdDate = a.createdAt || a.created_at
      
      // Helper to check if date is today
      const isDateToday = (dateValue) => {
        if (!dateValue) return false
        const dateStr = getLocalDateString(dateValue)
        return dateStr === today
      }
      
      // Include appointments that:
      // 1. Have requested_date_time = today (scheduled for today), OR
      // 2. Were created today (created_at = today) - for newly created appointments
      const requestedIsToday = isDateToday(requestedDate)
      const createdIsToday = isDateToday(createdDate)
      
      if (requestedIsToday || createdIsToday) {
        console.log('[Dashboard] ✅ Today appointment found:', { 
          appointmentId: a.id, 
          requestedDate: requestedDate,
          requestedIsToday: requestedIsToday,
          createdDate: createdDate,
          createdIsToday: createdIsToday,
          today: today,
          status: a.status
        })
        return true
      }
      
      // Log appointments that don't match for debugging
      if (requestedDate) {
        const reqDateStr = getLocalDateString(requestedDate)
        console.log('[Dashboard] Appointment not today:', { 
          appointmentId: a.id, 
          requestedDate: requestedDate,
          requestedDateLocal: reqDateStr,
          today: today,
          match: reqDateStr === today
        })
      }
      
      return false
    })
    
    console.log('[Dashboard] 📊 Today appointments:', {
      count: todayAppointments.length,
      total: appointments.length,
      today: today,
      appointments: todayAppointments.map(a => ({ id: a.id, date: a.appointmentDate, status: a.status }))
    })

    // Đếm service orders từ maintenance service
    // Sử dụng helper function để normalize status
    const assignedOrders = serviceOrders.filter(so => so.assignedTechnicianId && so.assignedTechnicianId !== null && so.assignedTechnicianId !== 0)
    const inProgressOrders = serviceOrders.filter(so => {
      const normalized = normalizeServiceOrderStatus(so.status)
      return normalized === 'IN_PROGRESS' || normalized === 'QUEUED'
    })
    const completedOrders = serviceOrders.filter(so => {
      const normalized = normalizeServiceOrderStatus(so.status)
      return normalized === 'COMPLETED'
    })

    return {
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
      receivedAppointments: appointments.filter(a => a.status === 'received').length,
      // Đang xử lý: đếm từ service orders với status IN_PROGRESS hoặc QUEUED
      // Chỉ dùng service orders làm nguồn chính xác, không fallback
      inProgressAppointments: inProgressOrders.length,
      // Hoàn thành hôm nay: đếm service orders completed hôm nay
      // Sử dụng completedAt từ service order nếu có, nếu không thì dùng appointment date
      completedToday: completedOrders.filter(so => {
        // Helper function to get local date string
        const getLocalDateString = (dateValue) => {
          if (!dateValue) return null
          const date = new Date(dateValue)
          if (isNaN(date.getTime())) return null
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        }
        
        // Nếu có completedAt, dùng nó
        if (so.completedAt) {
          const completedDate = getLocalDateString(so.completedAt)
          return completedDate === today
        }
        // Nếu không, tìm appointment và dùng appointment date
        const apt = appointments.find(a => a.id === so.appointmentId)
        if (!apt || !apt.appointmentDate) return false
        const apptDate = getLocalDateString(apt.appointmentDate)
        return apptDate === today
      }).length,
      totalServiceReceipts: serviceReceipts.length,
      // Tổng phân công: đếm từ service orders đã được phân công
      // Chỉ dùng service orders làm nguồn chính xác
      totalAssignments: assignedOrders.length,
      // Sửa: dùng status thay vì approved (status: 'draft', 'submitted', 'approved', 'rejected')
      pendingReports: maintenanceReports.filter(r => 
        r.status === 'draft' || r.status === 'submitted'
      ).length,
      approvedReports: maintenanceReports.filter(r => r.status === 'approved').length,
      // Kỹ thuật viên đang làm việc: đếm unique technicians từ service orders đã phân công và đang xử lý
      // Chỉ dùng service orders làm nguồn chính xác
      activeTechnicians: new Set(
        assignedOrders
          .filter(so => {
            const normalized = normalizeServiceOrderStatus(so.status)
            return normalized === 'IN_PROGRESS' || normalized === 'QUEUED'
          })
          .map(so => so.assignedTechnicianId)
          .filter(id => id != null && id !== 0)
      ).size
    }
  }, [appointments, assignments, serviceReceipts, maintenanceReports, serviceOrders])

  // Notifications
  const notifications = useMemo(() => {
    const notifs = []
    const today = new Date().toISOString().split('T')[0]

    // New appointments today
    const newAppointmentsToday = appointments.filter(a => {
      const apptDate = new Date(a.appointmentDate).toISOString().split('T')[0]
      return apptDate === today && (a.status === 'pending' || a.status === 'confirmed')
    })
    if (newAppointmentsToday.length > 0) {
      notifs.push({
        id: 'new-appts-today',
        type: 'info',
        icon: '📅',
        title: `${newAppointmentsToday.length} lịch hẹn hôm nay`,
        message: 'Cần xác nhận và xử lý',
        timestamp: new Date(),
        action: () => {
          setActiveTab('appointments')
          setDateFilter('today')
          setShowNotifications(false)
        }
      })
    }

    // Pending reports (status: 'draft' hoặc 'submitted')
    const pendingReports = maintenanceReports.filter(r => 
      r.status === 'draft' || r.status === 'submitted'
    )
    if (pendingReports.length > 0) {
      notifs.push({
        id: 'pending-reports',
        type: 'warning',
        icon: '📋',
        title: `${pendingReports.length} báo cáo chờ phê duyệt`,
        message: 'Cần xem xét và phê duyệt',
        timestamp: new Date(),
        action: () => {
          setActiveTab('reports')
          setShowNotifications(false)
        }
      })
    }

    // Low stock parts (sử dụng stockQuantity và minStockLevel sau khi transform)
    const lowStockParts = parts.filter(p => {
      const stock = p.stockQuantity || p.quantity || 0
      const minStock = p.minStockLevel || p.minQuantity || 10
      return stock < minStock
    })
    if (lowStockParts.length > 0) {
      notifs.push({
        id: 'low-stock',
        type: 'error',
        icon: '⚠️',
        title: `${lowStockParts.length} phụ tùng sắp hết`,
        message: 'Cần bổ sung kho',
        timestamp: new Date(),
        action: () => {
          setActiveTab('parts')
          setShowNotifications(false)
        }
      })
    }

    // In-progress assignments
    const inProgressCount = assignments.filter(a => a.status === 'in_progress').length
    if (inProgressCount > 0) {
      notifs.push({
        id: 'in-progress',
        type: 'info',
        icon: '⚙️',
        title: `${inProgressCount} công việc đang thực hiện`,
        message: 'KTV đang làm việc',
        timestamp: new Date(),
        action: () => {
          setActiveTab('assignments')
          setShowNotifications(false)
        }
      })
    }

    return notifs
  }, [appointments, maintenanceReports, parts, assignments])

  const unreadNotificationsCount = notifications.length

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(appt => {
        const customer = customers.find(c => c.id === appt.customerId)
        const vehicle = vehicles.find(v => v.id === appt.vehicleId)
        return (
          appt.id?.toString().includes(term) ||
          customer?.fullName?.toLowerCase().includes(term) ||
          customer?.email?.toLowerCase().includes(term) ||
          vehicle?.licensePlate?.toLowerCase().includes(term) ||
          vehicle?.model?.toLowerCase().includes(term)
        )
      })
    }

    // Status filter - chỉ có 3 lựa chọn: pending, completed, cancelled
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appt => appt.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTime = today.getTime()

      filtered = filtered.filter(appt => {
        // Kiểm tra appointmentDate có tồn tại không
        if (!appt.appointmentDate) {
          return false
        }

        const apptDate = new Date(appt.appointmentDate)
        // Kiểm tra date có hợp lệ không
        if (isNaN(apptDate.getTime())) {
          return false
        }
        
        apptDate.setHours(0, 0, 0, 0)
        const apptTime = apptDate.getTime()

        switch (dateFilter) {
          case 'today':
            return apptTime === todayTime
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(today.getDate() - 7)
            weekAgo.setHours(0, 0, 0, 0)
            const weekAgoTime = weekAgo.getTime()
            return apptTime >= weekAgoTime && apptTime <= todayTime
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setDate(today.getDate() - 30)
            monthAgo.setHours(0, 0, 0, 0)
            const monthAgoTime = monthAgo.getTime()
            return apptTime >= monthAgoTime && apptTime <= todayTime
          default:
            return true
        }
      })
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
  }, [appointments, customers, vehicles, searchTerm, statusFilter, dateFilter])

  // Handle view appointment details
  const handleViewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentDetails(true)
  }

  // Handle create service receipt
  const handleCreateReceipt = async (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    if (!appointment) return

    setSelectedAppointment(appointment)
    setShowReceiptModal(true)
  }

  // Xác nhận appointment (pending → confirmed)
  const handleConfirmAppointment = async (appointmentId) => {
    if (!confirm('Xác nhận lịch hẹn này?')) return
    
    try {
      await maintenanceAPI.confirmAppointment(appointmentId)
      loadData() // Reload data
      alert('✅ Đã xác nhận lịch hẹn thành công!')
    } catch (err) {
      console.error('Error confirming appointment:', err)
      alert('❌ Lỗi xác nhận lịch hẹn: ' + (err.message || 'Vui lòng thử lại'))
    }
  }

  const submitReceipt = async (formData) => {
    try {
      // WORKFLOW: Tiếp nhận appointment và tạo phiếu bảo dưỡng (Service Order)
      // API receiveAppointment tự động:
      // 1. Chuyển appointment status từ CONFIRMED → RECEIVED
      // 2. Tạo Service Order từ appointment
      const response = await maintenanceAPI.receiveAppointment(selectedAppointment.id)
      
      // response chứa: { appointment, serviceOrder, message }
      const serviceOrder = response.serviceOrder
      if (!serviceOrder) {
        throw new Error('Không thể tạo phiếu bảo dưỡng từ appointment này')
      }
      
      // Bước 4: Lưu thông tin chi tiết vào service receipt (staff service) để tracking
      // Service receipt lưu: odometer, condition, complaints, notes
    try {
      await staffAPI.createServiceReceipt({
        appointmentId: selectedAppointment.id,
        vehicleId: selectedAppointment.vehicleId,
        customerId: selectedAppointment.customerId,
          odometerReading: formData.mileage ? parseInt(formData.mileage) : null,
          fuelLevel: formData.fuelLevel || '50',
          exteriorCondition: formData.vehicleCondition || 'good',
          estimatedCompletion: formData.estimatedDuration || null,
          notes: formData.notes || ''
        })
      } catch (receiptErr) {
        console.warn('Could not create service receipt (optional):', receiptErr)
        // Continue anyway - service order is created, main workflow continues
      }
      
      // Bước 5: Cập nhật vehicle odometer nếu có
      if (formData.mileage) {
        try {
          await customerAPI.patchVehicle(selectedAppointment.vehicleId, {
            odometerKm: parseInt(formData.mileage)
          })
        } catch (vehicleErr) {
          console.warn('Could not update vehicle odometer:', vehicleErr)
        }
      }
      
      // Bước 6: Sau khi tiếp nhận thành công, tự động load technicians từ Maintenance Service và mở modal phân công
      try {
        // Load technicians từ Maintenance Service (gọi Staff Service nội bộ)
        let techs = technicians
        if (techs.length === 0) {
          // Gọi Maintenance Service API để lấy technicians (Maintenance Service sẽ gọi Staff Service)
          techs = await maintenanceAPI.getTechnicians()
          const transformedTechs = techs.map(t => ({
            ...t,
            id: t.technicianId || t.id || t.userId
          }))
          setTechnicians(transformedTechs)
          techs = transformedTechs
        }
        
        if (techs.length === 0) {
          alert('⚠️ Chưa có kỹ thuật viên nào trong hệ thống. Vui lòng thêm kỹ thuật viên trước khi phân công.')
      setShowReceiptModal(false)
      setSelectedAppointment(null)
          loadData()
          return
        }
        
        // Đóng modal tiếp nhận
        setShowReceiptModal(false)
        setSelectedAppointment(null)
        
        // Reload data để cập nhật danh sách
        loadData()
        
        // Tự động chuyển sang tab "Phân công" để phân công technician
        setActiveTab('assignments')
        
        alert('✅ Đã tiếp nhận lịch hẹn và tạo phiếu bảo dưỡng thành công!\n\nVui lòng phân công kỹ thuật viên trong tab "Phân công".')
      } catch (techErr) {
        console.error('Error loading technicians:', techErr)
        // Nếu không load được technicians, vẫn đóng modal và thông báo
        setShowReceiptModal(false)
        setSelectedAppointment(null)
        loadData()
        alert('✅ Đã tạo phiếu bảo dưỡng thành công!\n\n⚠️ Không thể tải danh sách kỹ thuật viên. Vui lòng phân công thủ công sau.')
      }
    } catch (err) {
      console.error('Error creating service order:', err)
      alert('❌ Lỗi tạo phiếu bảo dưỡng: ' + (err.message || 'Vui lòng thử lại'))
    }
  }

  // Handle create assignment
  const handleCreateAssignment = async (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId)
    if (!appointment) return

    // Load technicians từ API nếu chưa có (getTechnicians đã được gọi trong loadData, nhưng kiểm tra lại)
    if (technicians.length === 0) {
      try {
        const techs = await staffAPI.getTechnicians()
        const transformedTechs = techs.map(t => ({
          ...t,
          id: t.technicianId || t.id || t.userId
        }))
        setTechnicians(transformedTechs)
      } catch (err) {
        console.error('Error loading technicians:', err)
        alert('Không thể tải danh sách kỹ thuật viên: ' + err.message)
        return
      }
    }

    setSelectedAppointment(appointment)
    setShowAssignmentModal(true)
  }

  const submitAssignment = async (technicianId) => {
    try {
      console.log('[Staff] submitAssignment called with technicianId:', technicianId, 'Type:', typeof technicianId)
      console.log('[Staff] Available technicians:', technicians.map(t => ({ id: t.id, name: t.fullName || t.email })))
      
      // Tìm service order từ appointment
      let serviceOrder
      
      // Nếu đã có serviceOrderId từ việc tiếp nhận (receive appointment)
      if (selectedAppointment.serviceOrderId) {
        try {
          serviceOrder = await maintenanceAPI.getServiceOrder(selectedAppointment.serviceOrderId)
        } catch (err) {
          console.warn('Could not get service order by ID, trying to find by appointment:', err)
        }
      }
      
      // Nếu chưa có, tìm service order từ appointment
      if (!serviceOrder) {
        try {
          const serviceOrders = await maintenanceAPI.getServiceOrders()
          serviceOrder = serviceOrders.find(so => so.appointmentId === selectedAppointment.id)
        } catch (orderErr) {
          console.warn('Could not get service orders:', orderErr)
        }
      }
      
      // Nếu vẫn chưa có service order, tạo mới
      if (!serviceOrder) {
        serviceOrder = await maintenanceAPI.createServiceOrderFromAppointment(selectedAppointment.id)
      }
      
      // Phân công technician vào service order (maintenance service)
      // Đảm bảo technicianId là số hợp lệ
      const technicianIdInt = typeof technicianId === 'number' ? technicianId : parseInt(technicianId)
      
      if (isNaN(technicianIdInt) || technicianIdInt <= 0) {
        throw new Error(`ID kỹ thuật viên không hợp lệ: ${technicianId}. Vui lòng chọn lại kỹ thuật viên.`)
      }
      
      console.log('[Staff] Assigning technician:', {
        serviceOrderId: serviceOrder.orderId,
        technicianId: technicianIdInt,
        technicianIdOriginal: technicianId,
        technicianIdType: typeof technicianId
      })
      
      const updatedServiceOrder = await maintenanceAPI.assignTechnician(serviceOrder.orderId, technicianIdInt)
      
      console.log('[Staff] API response:', updatedServiceOrder)
      
      // Kiểm tra xem assignment có thành công không
      if (!updatedServiceOrder) {
        throw new Error('Không thể phân công kỹ thuật viên. API không trả về kết quả.')
      }
      
      // Transform response nếu cần (snake_case -> camelCase)
      const transformedOrder = snakeToCamel(updatedServiceOrder)
      const assignedId = transformedOrder.assignedTechnicianId || updatedServiceOrder.assignedTechnicianId
      
      if (!assignedId || assignedId === null || assignedId === 0) {
        console.error('[Staff] Assignment failed - assignedTechnicianId is null/empty:', {
          original: updatedServiceOrder,
          transformed: transformedOrder
        })
        throw new Error('Không thể phân công kỹ thuật viên. assignedTechnicianId không được cập nhật.')
      }
      
      console.log('[Staff] Assignment successful. Updated service order:', {
        orderId: transformedOrder.orderId || updatedServiceOrder.orderId,
        assignedTechnicianId: assignedId
      })
      
      // Cập nhật status service order thành 'in_progress' (nếu chưa có)
      const currentStatus = normalizeServiceOrderStatus(updatedServiceOrder.status)
      if (currentStatus === 'QUEUED') {
        await maintenanceAPI.updateServiceOrderStatus(serviceOrder.orderId, 'in_progress')
      }
      
      // Cũng tạo assignment trong staff service để tracking (optional - có thể bỏ qua nếu lỗi)
    try {
      await staffAPI.createAssignment({
        appointmentId: selectedAppointment.id,
        technicianId: parseInt(technicianId),
        vehicleId: selectedAppointment.vehicleId,
        status: 'assigned'
      })
      } catch (assignErr) {
        console.warn('Could not create assignment in staff service (optional):', assignErr)
        // Continue anyway - technician is assigned in maintenance service
      }
      
      setShowAssignmentModal(false)
      setSelectedAppointment(null)
      
      // Cập nhật state ngay lập tức (optimistic update)
      setServiceOrders(prev => prev.map(so => 
        so.id === serviceOrder.orderId || so.orderId === serviceOrder.orderId
          ? { ...so, assignedTechnicianId: parseInt(technicianId) }
          : so
      ))
      
      // Reload data để đảm bảo đồng bộ
      await loadData()
      
      // Đảm bảo UI cập nhật ngay lập tức
      alert('✅ Đã phân công kỹ thuật viên thành công!')
      
      // Tự động chuyển sang tab "Phân công" nếu chưa ở đó
      if (activeTab !== 'assignments') {
        setActiveTab('assignments')
      }
    } catch (err) {
      alert('❌ Lỗi phân công kỹ thuật viên: ' + err.message)
    }
  }

  // Handle approve maintenance report
  const handleApproveReport = async (reportId) => {
    if (!confirm('Xác nhận phê duyệt báo cáo bảo dưỡng?')) return
    
    try {
      await staffAPI.approveMaintenanceReport(reportId)
      loadData() // Reload all data
      alert('Đã phê duyệt báo cáo!')
    } catch (err) {
      alert('Lỗi phê duyệt báo cáo: ' + err.message)
    }
  }

  // 🆕 Enhanced Receipt Workflow Handlers
  const handleViewProgress = (receipt) => {
    // Hiển thị modal chi tiết tiến độ
    setSelectedAppointment(appointments.find(a => a.id === receipt.appointmentId))
    setShowAppointmentDetails(true)
  }

  const handleCreateInvoice = async (receipt) => {
    if (!confirm('Tạo hóa đơn thanh toán cho phiếu tiếp nhận này?')) return
    
    try {
      // TODO: Implement invoice creation
      alert('🚧 Tính năng tạo hóa đơn đang được phát triển')
    } catch (err) {
      alert('❌ Lỗi tạo hóa đơn: ' + err.message)
    }
  }

  const [showTimelineModal, setShowTimelineModal] = useState(false)
  const [selectedReceiptForTimeline, setSelectedReceiptForTimeline] = useState(null)

  const handleViewTimeline = (receipt) => {
    setSelectedReceiptForTimeline(receipt)
    setShowTimelineModal(true)
  }

  // 🆕 Print Receipt Function
  const handlePrintReceipt = (receipt) => {
    const customer = customers.find(c => c.id === receipt.customerId)
    const vehicle = vehicles.find(v => v.id === receipt.vehicleId)
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Phiếu Tiếp Nhận #${receipt.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 10px 0;
          }
          .info-section {
            margin-bottom: 25px;
          }
          .info-section h3 {
            background: #f3f4f6;
            padding: 10px;
            margin: 0 0 15px 0;
            border-left: 4px solid #2563eb;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-label {
            font-weight: bold;
            color: #4b5563;
          }
          .info-value {
            color: #1f2937;
            margin-top: 5px;
          }
          .notes-section {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-top: 60px;
            text-align: center;
          }
          .signature-box {
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-top: 80px;
          }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚡ EV SERVICE CENTER</h1>
          <p>Phiếu Tiếp Nhận Xe Điện</p>
          <h2>Số: ${receipt.id}</h2>
          <p>Ngày: ${new Date(receipt.createdAt).toLocaleString('vi-VN')}</p>
        </div>

        <div class="info-section">
          <h3>👤 Thông tin khách hàng</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Họ và tên:</div>
              <div class="info-value">${customer?.fullName || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Số điện thoại:</div>
              <div class="info-value">${customer?.phoneNumber || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email:</div>
              <div class="info-value">${customer?.email || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Địa chỉ:</div>
              <div class="info-value">${customer?.address || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>🚗 Thông tin xe</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Biển số:</div>
              <div class="info-value">${vehicle?.licensePlate || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Loại xe:</div>
              <div class="info-value">${vehicle?.model || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Số VIN:</div>
              <div class="info-value">${vehicle?.vin || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Màu sắc:</div>
              <div class="info-value">${vehicle?.color || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>🔧 Thông tin tiếp nhận</h3>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Số km hiện tại:</div>
              <div class="info-value">${receipt.mileage ? receipt.mileage.toLocaleString() : 'N/A'} km</div>
            </div>
            <div class="info-item">
              <div class="info-label">Mức nhiên liệu:</div>
              <div class="info-value">${receipt.fuelLevel || 'N/A'}%</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tình trạng xe:</div>
              <div class="info-value">${receipt.vehicleCondition || 'N/A'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Ước tính chi phí:</div>
              <div class="info-value">${receipt.estimatedCost ? parseInt(receipt.estimatedCost).toLocaleString() : 'N/A'} VNĐ</div>
            </div>
            <div class="info-item">
              <div class="info-label">Thời gian ước tính:</div>
              <div class="info-value">${receipt.estimatedDuration || 'N/A'} giờ</div>
            </div>
          </div>
        </div>


        ${receipt.notes ? `
        <div class="notes-section">
          <div class="info-label">📌 Ghi chú:</div>
          <div class="info-value">${receipt.notes}</div>
        </div>
        ` : ''}

        <div class="signatures">
          <div>
            <p><strong>Nhân viên tiếp nhận</strong></p>
            <div class="signature-box">
              (Ký và ghi rõ họ tên)
            </div>
          </div>
          <div>
            <p><strong>Khách hàng</strong></p>
            <div class="signature-box">
              (Ký và ghi rõ họ tên)
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
          <p>📞 Hotline: 1900-xxxx | 📧 support@evservice.com</p>
        </div>

        <button onclick="window.print()" style="
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
          🖨️ In phiếu
        </button>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  // 🆕 Get enriched receipts with linked data
  const getEnrichedReceipts = () => {
    let enriched = serviceReceipts.map(receipt => {
      const appointment = appointments.find(a => a.id === receipt.appointmentId)
      const assignment = assignments.find(a => a.appointmentId === receipt.appointmentId)
      const report = maintenanceReport.find(r => r.assignmentId === assignment?.id)
      
      // Calculate status based on workflow
      let workflowStatus = 'waiting_assignment'
      if (report && report.status === 'completed') {
        workflowStatus = 'ready_for_payment'
      } else if (assignment?.status === 'completed') {
        workflowStatus = 'completed'
      } else if (assignment?.status === 'in_progress') {
        workflowStatus = 'in_progress'
      } else if (assignment) {
        workflowStatus = 'assigned'
      }

      return {
        ...receipt,
        appointment,
        assignment,
        report,
        workflowStatus
      }
    })

    // Apply filters
    if (searchTerm) {
      enriched = enriched.filter(r => {
        const vehicle = vehicles.find(v => v.id === r.vehicleId)
        const customer = customers.find(c => c.id === r.customerId)
        const searchLower = searchTerm.toLowerCase()
        
        return (
          vehicle?.licensePlate?.toLowerCase().includes(searchLower) ||
          customer?.fullName?.toLowerCase().includes(searchLower) ||
          customer?.phoneNumber?.includes(searchLower)
        )
      })
    }

    if (statusFilter !== 'all') {
      enriched = enriched.filter(r => r.workflowStatus === statusFilter)
    }

    if (dateFilter !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      enriched = enriched.filter(r => {
        const receiptDate = new Date(r.createdAt)
        receiptDate.setHours(0, 0, 0, 0)

        switch (dateFilter) {
          case 'today':
            return receiptDate.getTime() === today.getTime()
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(today.getDate() - 7)
            return receiptDate >= weekAgo && receiptDate <= today
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(today.getMonth() - 1)
            return receiptDate >= monthAgo && receiptDate <= today
          default:
            return true
        }
      })
    }

    // Sort by date (newest first)
    return enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Parts CRUD handlers
  const handleAddPart = () => {
    setShowAddPartModal(true)
  }

  const handleEditPart = (part) => {
    setSelectedPart(part)
    setShowEditPartModal(true)
  }

  const handleDeletePart = async (partId, partName) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phụ tùng "${partName}"?\n\nHành động này không thể hoàn tác!`)) {
      return
    }
    
    try {
      const response = await fetch(`http://localhost:8083/api/staff/parts/${partId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        alert('✅ Đã xóa phụ tùng thành công!')
        loadData() // Reload all data
      } else {
        const errorData = await response.json()
        alert('❌ Lỗi xóa phụ tùng: ' + (errorData.message || 'Unknown error'))
      }
    } catch (err) {
      alert('❌ Lỗi xóa phụ tùng: ' + err.message)
      console.error('Delete part error:', err)
    }
  }

  const handleSubmitAddPart = async (partData) => {
    try {
      const response = await fetch('http://localhost:8083/api/staff/parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(partData)
      })
      
      if (response.ok) {
        alert('✅ Đã thêm phụ tùng thành công!')
        setShowAddPartModal(false)
        loadData() // Reload all data
      } else {
        const errorData = await response.json()
        alert('❌ Lỗi thêm phụ tùng: ' + (errorData.message || 'Unknown error'))
      }
    } catch (err) {
      alert('❌ Lỗi thêm phụ tùng: ' + err.message)
      console.error('Add part error:', err)
    }
  }

  const handleSubmitEditPart = async (partData) => {
    try {
      const response = await fetch(`http://localhost:8083/api/staff/parts/${selectedPart.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(partData)
      })
      
      if (response.ok) {
        alert('✅ Đã cập nhật phụ tùng thành công!')
        setShowEditPartModal(false)
        setSelectedPart(null)
        loadData() // Reload all data
      } else {
        const errorData = await response.json()
        alert('❌ Lỗi cập nhật phụ tùng: ' + (errorData.message || 'Unknown error'))
      }
    } catch (err) {
      alert('❌ Lỗi cập nhật phụ tùng: ' + err.message)
      console.error('Edit part error:', err)
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Bảng điều khiển Nhân viên</h2>
            <p className="text-gray-600 mt-2">Quản lý lịch hẹn, phiếu tiếp nhận và phân công kỹ thuật viên</p>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-500"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      <div className="text-4xl mb-2">🎉</div>
                      <p>Không có thông báo mới</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={notif.action}
                          className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notif.type === 'error' ? 'bg-red-100' :
                              notif.type === 'warning' ? 'bg-yellow-100' :
                              'bg-blue-100'
                            }`}>
                              <span className="text-lg">{notif.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                              <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                            </div>
                          </div>
            </button>
          ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Đang tải dữ liệu...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Lỗi:</p>
            <p className="text-sm">{error}</p>
            <button onClick={loadData} className="mt-2 text-sm underline hover:text-red-900">Thử lại</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
          {[
            { key: 'dashboard', label: '📊 Tổng quan', icon: '📊' },
            { key: 'appointments', label: '📅 Lịch hẹn', icon: '📅' },
            { key: 'receipts', label: '📝 Phiếu tiếp nhận', icon: '📝' },
            { key: 'assignments', label: '👷 Phân công', icon: '👷' },
            // { key: 'reports', label: '📋 Báo cáo', icon: '📋' },
            { key: 'parts', label: '🔧 Phụ tùng', icon: '🔧' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
            </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Hôm nay</p>
                    <p className="text-3xl font-bold text-blue-900">{dashboardStats.todayAppointments}</p>
                    <p className="text-xs text-blue-600 mt-1">lịch hẹn</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Đang xử lý</p>
                    <p className="text-3xl font-bold text-green-900">{dashboardStats.inProgressAppointments}</p>
                    <p className="text-xs text-green-600 mt-1">công việc</p>
                  </div>
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Chờ phê duyệt</p>
                    <p className="text-3xl font-bold text-yellow-900">{dashboardStats.pendingReports}</p>
                    <p className="text-xs text-yellow-600 mt-1">báo cáo</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Hoàn thành</p>
                    <p className="text-3xl font-bold text-purple-900">{dashboardStats.completedToday}</p>
                    <p className="text-xs text-purple-600 mt-1">hôm nay</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái lịch hẹn</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Chờ xác nhận</span>
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold">
                      {dashboardStats.pendingAppointments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Đã xác nhận</span>
                    <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-semibold">
                      {dashboardStats.confirmedAppointments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Đã tiếp nhận</span>
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">
                      {dashboardStats.receivedAppointments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-yellow-700">Đang bảo dưỡng</span>
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-semibold">
                      {dashboardStats.inProgressAppointments}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan công việc</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📝</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phiếu tiếp nhận</p>
                        <p className="text-lg font-semibold text-gray-900">{dashboardStats.totalServiceReceipts}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">👷</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phân công KTV</p>
                        <p className="text-lg font-semibold text-gray-900">{dashboardStats.totalAssignments}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">🔧</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">KTV đang làm việc</p>
                        <p className="text-lg font-semibold text-gray-900">{dashboardStats.activeTechnicians}</p>
                      </div>
                    </div>
                  </div>
                  {/* Báo cáo đã duyệt - ĐÃ COMMENT */}
                  {/* <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📋</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Báo cáo đã duyệt</p>
                        <p className="text-lg font-semibold text-gray-900">{dashboardStats.approvedReports}</p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Quick Actions - ĐÃ COMMENT */}
            {/* <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all transform hover:scale-105 text-center group"
                >
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-sm font-medium text-gray-900">Xem lịch hẹn</div>
                  <div className="text-xs text-gray-600 mt-1 group-hover:text-green-600">
                    {appointments.length} lịch hẹn
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('receipts')}
                  className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all transform hover:scale-105 text-center group"
                >
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-sm font-medium text-gray-900">Phiếu tiếp nhận</div>
                  <div className="text-xs text-gray-600 mt-1 group-hover:text-blue-600">
                    {serviceReceipts.length} phiếu
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all transform hover:scale-105 text-center group"
                >
                  <div className="text-3xl mb-2">👷</div>
                  <div className="text-sm font-medium text-gray-900">Phân công KTV</div>
                  <div className="text-xs text-gray-600 mt-1 group-hover:text-purple-600">
                    {assignments.length} phân công
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-400 transition-all transform hover:scale-105 text-center group"
                >
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm font-medium text-gray-900">Báo cáo</div>
                  <div className="text-xs text-gray-600 mt-1 group-hover:text-yellow-600">
                    {maintenanceReports.length} báo cáo
                  </div>
                </button>
              </div>
            </div> */}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Tìm kiếm</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm theo ID, khách hàng, xe, biển số..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📊 Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">⏳ Chờ Xác nhận</option>
                    <option value="completed">✓ Hoàn thành</option>
                    <option value="cancelled">❌ Đã hủy</option>
                  </select>
                </div>
                {/* Menu Thời gian - Tạm thời comment do chưa hoạt động đúng */}
                {/*
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📅 Thời gian</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">Tất cả</option>
                    <option value="today">Hôm nay</option>
                    <option value="week">7 ngày qua</option>
                    <option value="month">30 ngày qua</option>
                  </select>
                </div>
                */}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold text-green-600">{filteredAppointments.length}</span> / {appointments.length} lịch hẹn
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setDateFilter('all')
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Danh sách lịch hẹn</h3>
                <button onClick={loadData} className="px-3 py-1 border rounded-md hover:bg-gray-50">
                  🔄 Làm mới
                </button>
              </div>

            {filteredAppointments.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Không tìm thấy lịch hẹn phù hợp' 
                  : 'Chưa có lịch hẹn nào'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày giờ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map(appt => (
                      <tr key={appt.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">#{appt.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{getCustomerName(appt.customerId)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <button
                            onClick={() => handleViewHistory(appt.vehicleId)}
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {getVehicleInfo(appt.vehicleId)}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(appt.appointmentDate).toLocaleDateString('vi-VN')} {appt.appointmentTime}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            appt.status === 'received' ? 'bg-green-100 text-green-800' :
                            appt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm space-x-1">
                          <button
                            onClick={() => handleViewAppointmentDetails(appt)}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs"
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>
                          {appt.status === 'pending' && (
                            <button
                              onClick={() => handleConfirmAppointment(appt.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                              title="Xác nhận lịch hẹn"
                            >
                              ✅ Xác nhận
                            </button>
                          )}
                          {appt.status === 'confirmed' && (
                              <button
                                onClick={() => handleCreateReceipt(appt.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                              >
                                Tiếp nhận
                              </button>
                          )}
                          {appt.status === 'received' && (() => {
                            // Kiểm tra xem appointment đã được phân công chưa
                            const serviceOrder = serviceOrders.find(so => so.appointmentId === appt.id)
                            const isAssigned = serviceOrder && serviceOrder.assignedTechnicianId && serviceOrder.assignedTechnicianId !== null && serviceOrder.assignedTechnicianId !== 0
                            
                            if (isAssigned) {
                              return (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                                  ✅ Đã phân công
                                </span>
                              )
                            } else {
                              return (
                            <button
                                  onClick={() => {
                                    // Chuyển sang tab Phân công và tự động mở modal
                                    setActiveTab('assignments')
                                    setTimeout(() => {
                                      const apt = appointments.find(a => a.id === appt.id)
                                      if (apt) {
                                        setSelectedAppointment({ ...apt, serviceOrderId: serviceOrder?.orderId })
                                        setShowAssignmentModal(true)
                                      }
                                    }, 100)
                                  }}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                                  title="Chuyển sang tab Phân công để phân công KTV"
                            >
                                  👷 Phân công
                            </button>
                              )
                            }
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        )}

        {/* Phiếu tiếp nhận Tab - Xác nhận tiếp nhận yêu cầu dịch vụ từ khách hàng */}
        {activeTab === 'receipts' && (
          <div className="bg-white rounded-lg shadow p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold">Phiếu tiếp nhận</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Lấy thông tin từ khách hàng khi đặt lịch (hẹn thời gian, xe, loại dịch vụ) và xác nhận có tiếp nhận hay không
                  </p>
                </div>
                <button onClick={loadData} className="px-3 py-1 border rounded-md hover:bg-gray-50 text-sm">
                  🔄 Làm mới
                </button>
              </div>

              {/* Danh sách appointments cần tiếp nhận (status = confirmed) */}
              {appointments.filter(a => a.status === 'confirmed').length > 0 && (
                <div className="mb-6 border-b pb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Lịch hẹn cần tiếp nhận</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appointments.filter(a => a.status === 'confirmed').map(appt => {
                      const customer = customers.find(c => c.id === appt.customerId)
                      const vehicle = vehicles.find(v => v.id === appt.vehicleId)
                      const service = services.find(s => s.id === appt.serviceId)
                      
                      return (
                        <div key={appt.id} className="border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">Lịch hẹn #{appt.id}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(appt.appointmentDate).toLocaleDateString('vi-VN')} {appt.appointmentTime}
                              </p>
                            </div>
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                              ⏳ Chờ tiếp nhận
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm mb-4">
                            <p><span className="font-medium">Khách hàng:</span> {customer?.fullName || 'N/A'}</p>
                            <p><span className="font-medium">Xe:</span> {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}</p>
                            <p><span className="font-medium">Dịch vụ:</span> {service?.name || appt.serviceId || 'N/A'}</p>
                            {appt.notes && (
                              <p className="text-gray-600 italic">📝 {appt.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCreateReceipt(appt.id)}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                            >
                              ✅ Tiếp nhận
                            </button>
                            <button
                              onClick={() => handleViewAppointmentDetails(appt)}
                              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                            >
                              👁️ Chi tiết
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Danh sách appointments đã tiếp nhận (status = received) */}
              {appointments.filter(a => a.status === 'received').length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">✅ Đã tiếp nhận - Chờ phân công</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {appointments.filter(a => a.status === 'received').map(appt => {
                      const customer = customers.find(c => c.id === appt.customerId)
                      const vehicle = vehicles.find(v => v.id === appt.vehicleId)
                      const service = services.find(s => s.id === appt.serviceId)
                      const serviceOrder = serviceOrders.find(so => so.appointmentId === appt.id)
                      
                      return (
                        <div key={appt.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">Lịch hẹn #{appt.id}</p>
                              {serviceOrder && (
                                <p className="text-xs text-gray-500">Phiếu bảo dưỡng #{serviceOrder.id}</p>
                              )}
                            </div>
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                              ✅ Đã tiếp nhận
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm mb-4">
                            <p><span className="font-medium">Khách hàng:</span> {customer?.fullName || 'N/A'}</p>
                            <p><span className="font-medium">Xe:</span> {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}</p>
                            <p><span className="font-medium">Dịch vụ:</span> {service?.name || appt.serviceId || 'N/A'}</p>
                            {serviceOrder && (
                              <p className="text-xs text-gray-500">
                                Trạng thái: {getServiceOrderStatusDisplay(serviceOrder.status).display}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewAppointmentDetails(appt)}
                              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                            >
                              👁️ Chi tiết
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Service Orders đã được tạo (để tham khảo) */}
              {serviceOrders.length > 0 && appointments.filter(a => a.status === 'received').length === 0 && (
                <div className="mb-6 border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Phiếu bảo dưỡng đã tạo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {serviceOrders.map(order => {
                      const appointment = appointments.find(a => a.id === order.appointmentId)
                      const vehicle = vehicles.find(v => v.id === order.vehicleId)
                      const customer = customers.find(c => c.id === appointment?.customerId)
                      const technician = technicians.find(t => t.id === order.assignedTechnicianId)
                      
                      return (
                        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">Phiếu #{order.id}</p>
                              <p className="text-xs text-gray-500">Appointment #{order.appointmentId}</p>
                            </div>
                            {(() => {
                              const statusInfo = getServiceOrderStatusDisplay(order.status)
                              return (
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                  {statusInfo.label}
                                </span>
                              )
                            })()}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Khách hàng:</span> {customer?.fullName || 'N/A'}</p>
                            <p><span className="font-medium">Xe:</span> {vehicle?.brand} {vehicle?.model}</p>
                            {technician && (
                              <p><span className="font-medium">KTV:</span> {technician.fullName || technician.email}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Search and Filters - Legacy (for service receipts) */}
              {serviceReceipts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="🔍 Tìm biển số xe, tên khách..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="waiting_assignment">⏳ Chờ phân công</option>
                    <option value="assigned">👷 Đã phân công</option>
                    <option value="in_progress">🔧 Đang sửa</option>
                    <option value="completed">✅ Hoàn thành</option>
                    <option value="ready_for_payment">💰 Chờ thanh toán</option>
                  </select>

                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="today">Hôm nay</option>
                    <option value="week">7 ngày qua</option>
                    <option value="month">30 ngày qua</option>
                  </select>

                  <div className="text-sm text-gray-600 flex items-center justify-center border rounded-md px-3 bg-gray-50">
                    📊 Tổng: {getEnrichedReceipts().length} phiếu
                  </div>
                </div>
              )}
            </div>

            {/* Empty state - chỉ hiển thị khi không có appointments cần tiếp nhận và không có appointments đã tiếp nhận */}
            {appointments.filter(a => a.status === 'confirmed' || a.status === 'received').length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch hẹn nào cần tiếp nhận</h4>
                <p className="text-gray-600 mb-4">
                  Vào tab "Lịch hẹn" để xem các lịch hẹn đã được xác nhận và thực hiện tiếp nhận
                </p>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Xem lịch hẹn
                </button>
              </div>
            )}

            {/* Legacy service receipts display (nếu có) */}
            {serviceReceipts.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết phiếu tiếp nhận</h4>
              <div className="space-y-4">
                {getEnrichedReceipts().map(receipt => (
                  <ReceiptWorkflowCard
                    key={receipt.id}
                    receipt={receipt}
                    customer={customers.find(c => c.id === receipt.customerId)}
                    vehicle={vehicles.find(v => v.id === receipt.vehicleId)}
                    appointment={appointments.find(a => a.id === receipt.appointmentId)}
                    assignment={assignments.find(a => a.appointmentId === receipt.appointmentId)}
                    technician={receipt.assignment ? technicians.find(t => t.id === receipt.assignment.technicianId) : null}
                    maintenanceReport={maintenanceReports.find(r => r.assignmentId === receipt.assignment?.id)}
                    onAssign={() => handleCreateAssignment(receipt.appointmentId)}
                    onViewProgress={() => handleViewProgress(receipt)}
                    onCreateInvoice={() => handleCreateInvoice(receipt)}
                    onViewTimeline={() => handleViewTimeline(receipt)}
                  />
                ))}
                </div>
              </div>
              )}
            </div>
        )}

        {/* Assignments Tab - Phân công technician cho Service Orders */}
        {activeTab === 'assignments' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold">Phân công kỹ thuật viên</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Phân công kỹ thuật viên cho các phiếu bảo dưỡng đã được tiếp nhận
                </p>
              </div>
              <button onClick={loadData} className="px-3 py-1 border rounded-md hover:bg-gray-50">
                🔄 Làm mới
              </button>
            </div>

            {/* Service Orders chưa được phân công (assignedTechnicianId = null/undefined/0) */}
            {serviceOrders.filter(so => !so.assignedTechnicianId || so.assignedTechnicianId === null || so.assignedTechnicianId === 0).length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">⏳ Phiếu bảo dưỡng chờ phân công</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceOrders.filter(so => !so.assignedTechnicianId || so.assignedTechnicianId === null || so.assignedTechnicianId === 0).map(order => {
                    const appointment = appointments.find(a => a.id === order.appointmentId)
                    const vehicle = vehicles.find(v => v.id === order.vehicleId)
                    const customer = customers.find(c => c.id === appointment?.customerId)
                    
                    return (
                      <div key={order.id} className="border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">Phiếu bảo dưỡng #{order.id}</p>
                            <p className="text-xs text-gray-500">Lịch hẹn #{order.appointmentId}</p>
                          </div>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                            ⏳ Chờ phân công
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-4">
                          <p><span className="font-medium">Khách hàng:</span> {customer?.fullName || 'N/A'}</p>
                          <p><span className="font-medium">Xe:</span> {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}</p>
                          {appointment && (
                            <p className="text-xs text-gray-500">
                              Ngày: {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} {appointment.appointmentTime}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => {
                            // Tìm appointment tương ứng
                            const apt = appointments.find(a => a.id === order.appointmentId)
                            if (apt) {
                              setSelectedAppointment({ ...apt, serviceOrderId: order.orderId })
                              setShowAssignmentModal(true)
                            }
                          }}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                        >
                          👷 Phân công KTV
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Service Orders đã được phân công */}
            {serviceOrders.filter(so => so.assignedTechnicianId && so.assignedTechnicianId !== null && so.assignedTechnicianId !== 0).length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">✅ Phiếu bảo dưỡng đã phân công</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceOrders.filter(so => so.assignedTechnicianId && so.assignedTechnicianId !== null && so.assignedTechnicianId !== 0).map(order => {
                    const appointment = appointments.find(a => a.id === order.appointmentId)
                    const vehicle = vehicles.find(v => v.id === order.vehicleId)
                    const customer = customers.find(c => c.id === appointment?.customerId)
                    const technician = technicians.find(t => t.id === order.assignedTechnicianId)
                    
                    return (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">Phiếu bảo dưỡng #{order.id}</p>
                            <p className="text-xs text-gray-500">Lịch hẹn #{order.appointmentId}</p>
                          </div>
                          {(() => {
                            const statusInfo = getServiceOrderStatusDisplay(order.status)
                            return (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                                {statusInfo.label}
                              </span>
                            )
                          })()}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Khách hàng:</span> {customer?.fullName || 'N/A'}</p>
                          <p><span className="font-medium">Xe:</span> {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A'}</p>
                          {technician && (
                            <p><span className="font-medium">Kỹ thuật viên:</span> {technician.fullName || technician.email || 'N/A'}</p>
                          )}
                          {!technician && order.assignedTechnicianId && (
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">KTV ID:</span> #{order.assignedTechnicianId}
                            </p>
                          )}
                        </div>
                        
                        {/* Badge hiển thị trạng thái đã phân công */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Đã phân công
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {serviceOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👷</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có phiếu bảo dưỡng nào</h4>
                <p className="text-gray-600 mb-4">
                  Phiếu bảo dưỡng sẽ được tạo sau khi tiếp nhận lịch hẹn ở tab "Phiếu tiếp nhận"
                </p>
                <button
                  onClick={() => setActiveTab('receipts')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Xem phiếu tiếp nhận
                </button>
              </div>
            )}

            {/* Legacy Assignments (hiển thị để tham khảo) */}
            {assignments.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Phân công cũ (Legacy)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lịch hẹn</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kỹ thuật viên</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map(assign => (
                      <tr key={assign.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">#{assign.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">#{assign.appointmentId}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{getVehicleInfo(assign.vehicleId)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{getTechnicianName(assign.technicianId)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            assign.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            assign.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            assign.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assign.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(assign.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
              )}
          </div>
        )}

        {/* Maintenance Reports Tab - Commented out */}
        {/* {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Báo cáo bảo dưỡng</h3>
              <button onClick={loadData} className="px-3 py-1 border rounded-md hover:bg-gray-50">
                🔄 Làm mới
              </button>
          </div>

            {maintenanceReports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có báo cáo bảo dưỡng nào</h4>
                <p className="text-gray-600 mb-4">
                  Báo cáo sẽ được tạo bởi kỹ thuật viên sau khi hoàn thành công việc
                </p>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Xem các phân công
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-900">Báo cáo #{report.id}</span>
                        <span className="ml-3 text-xs text-gray-500">
                          Phân công #{report.assignmentId}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.approved ? 'Đã phê duyệt' : 'Chờ phê duyệt'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Kỹ thuật viên:</span> {getTechnicianName(report.technicianId)}</p>
                      
                      {report.issuesFound && (
                        <p className="text-gray-700">
                          <span className="font-medium">Sự cố phát hiện:</span> {report.issuesFound}
                        </p>
                      )}
                      
                      {report.workPerformed && (
                        <p className="text-gray-700">
                          <span className="font-medium">Công việc thực hiện:</span> {report.workPerformed}
                        </p>
                      )}
                      
                      {report.partsReplaced && (
                        <p className="text-gray-700">
                          <span className="font-medium">Phụ tùng thay thế:</span> {report.partsReplaced}
                        </p>
                      )}
                      
                      {report.recommendations && (
                        <p className="text-gray-700">
                          <span className="font-medium">Đề xuất:</span> {report.recommendations}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        Ngày tạo: {new Date(report.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>

                    {!report.approved && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleApproveReport(report.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          ✓ Phê duyệt báo cáo
                        </button>
                    </div>
                    )}
            </div>
                ))}
            </div>
            )}
          </div>
        )} */}

        {/* Parts Management Tab */}
        {activeTab === 'parts' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold">Quản lý Phụ tùng</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Hiển thị: <strong>{parts.length}</strong> phụ tùng
                  {/* Yêu cầu chờ xử lý: {partRequests.filter(pr => pr.status === 'pending').length} */}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={loadData} className="px-3 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2">
                  🔄 Làm mới
                </button>
                <button 
                  onClick={handleAddPart}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  + Thêm phụ tùng
                </button>
              </div>
            </div>

            {/* 🆕 Service Filter */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                🎯 Lọc phụ tùng theo dịch vụ
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value)
                  loadPartsForService(e.target.value)
                }}
                className="w-full md:w-1/2 px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">Tất cả phụ tùng (không lọc)</option>
                {/* Hiển thị unique service categories từ services trong database */}
                {/* API endpoint /api/staff/parts/for-service/{serviceCategory} cần service category, không phải part category */}
                {Array.from(new Set(services
                  .filter(service => service.category)
                  .map(service => service.category)
                )).sort().map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {serviceFilter !== 'all' && (
                <p className="text-sm text-blue-700 mt-2">
                  💡 Đang hiển thị {parts.length} phụ tùng phù hợp với dịch vụ đã chọn
                </p>
              )}
            </div>

            {/* Parts Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{parts.filter(p => p.status === 'available').length}</div>
                <div className="text-sm text-blue-700 mt-1">Còn hàng</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{parts.filter(p => p.status === 'low_stock').length}</div>
                <div className="text-sm text-yellow-700 mt-1">Sắp hết</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{parts.filter(p => p.status === 'out_of_stock').length}</div>
                <div className="text-sm text-red-700 mt-1">Hết hàng</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{partRequests.filter(pr => pr.status === 'pending').length}</div>
                <div className="text-sm text-purple-700 mt-1">Yêu cầu mới</div>
              </div>
            </div>

            {/* Parts List */}
            {parts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔧</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có phụ tùng nào</h4>
                <p className="text-gray-600 mb-4">
                  Hệ thống chưa có phụ tùng nào. Thêm phụ tùng để bắt đầu quản lý kho.
                </p>
                <button
                  onClick={handleAddPart}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  + Thêm phụ tùng đầu tiên
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã PT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên phụ tùng</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vị trí</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parts.map((part) => (
                      <tr key={part.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {part.partCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="font-medium">{part.name}</div>
                          {part.manufacturer && (
                            <div className="text-xs text-gray-500">{part.manufacturer}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {part.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.unitPrice || 0)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className={`font-medium ${
                            part.stockQuantity === 0 ? 'text-red-600' :
                            part.stockQuantity <= part.minStockLevel ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {part.stockQuantity}
                          </div>
                          <div className="text-xs text-gray-500">Min: {part.minStockLevel}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          {part.location || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            part.status === 'available' ? 'bg-green-100 text-green-800' :
                            part.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                            part.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {part.status === 'available' ? 'Còn hàng' :
                             part.status === 'low_stock' ? 'Sắp hết' :
                             part.status === 'out_of_stock' ? 'Hết hàng' :
                             part.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditPart(part)}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium"
                              title="Chỉnh sửa phụ tùng"
                            >
                              ✏️ Sửa
                            </button>
                            <button 
                              onClick={() => handleDeletePart(part.id, part.name)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-medium"
                              title="Xóa phụ tùng"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}

            {/* Part Requests Section */}
            {/* Commented out - Yêu cầu phụ tùng từ khách hàng */}
            {/*
            <div className="mt-8 border-t pt-6">
              <h4 className="text-lg font-semibold mb-4">Yêu cầu phụ tùng từ khách hàng</h4>
              
              {partRequests.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-600">Chưa có yêu cầu phụ tùng nào từ khách hàng</p>
            </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phụ tùng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {partRequests.map((request) => {
                        // Tìm appointment của khách hàng dựa trên customerId và vehicleId (nếu có)
                        const appointment = appointments.find(apt => 
                          apt.customerId === request.customerId && 
                          (request.vehicleId ? apt.vehicleId === request.vehicleId : true)
                        )
                        
                        // Lấy service từ appointment
                        const service = appointment ? services.find(s => s.id === appointment.serviceId) : null
                        
                        // Lấy tên phụ tùng từ dịch vụ bảo dưỡng mà khách hàng đã đặt lịch
                        let partName = null
                        let serviceInfo = null
                        
                        if (appointment && service) {
                          serviceInfo = service
                          // Tìm parts liên quan đến service category
                          // Sử dụng mapping: service category -> part categories (qua bảng service_part_categories)
                          // Tạm thời filter trực tiếp theo category, sau có thể dùng API để lấy chính xác hơn
                          const relatedParts = parts.filter(p => {
                            // Nếu service category trùng với part category
                            if (p.category === service.category) return true
                            // Có thể mở rộng thêm logic mapping ở đây
                            return false
                          })
                          
                          if (relatedParts.length > 0) {
                            // Ưu tiên part từ request.partId nếu có trong danh sách related parts
                            const requestedPart = relatedParts.find(p => p.id === request.partId)
                            partName = requestedPart ? requestedPart.name : relatedParts[0].name
                          } else {
                            // Nếu không có parts liên quan, hiển thị tên service
                            partName = `Phụ tùng cho ${service.name}`
                          }
                        }
                        
                        // Fallback: nếu không tìm được appointment/service, dùng part trực tiếp từ request
                        if (!partName) {
                          const part = parts.find(p => p.id === request.partId)
                          partName = part ? part.name : `Part #${request.partId}`
                        }
                        
                        return (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{request.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {getCustomerName(request.customerId)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {partName}
                              {service && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Dịch vụ: {service.name}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {request.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {request.requestType === 'purchase' ? 'Mua' :
                                 request.requestType === 'quote' ? 'Báo giá' :
                                 request.requestType === 'warranty' ? 'Bảo hành' :
                                 request.requestType}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                request.status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.status === 'pending' ? 'Chờ duyệt' :
                                 request.status === 'approved' ? 'Đã duyệt' :
                                 request.status === 'rejected' ? 'Từ chối' :
                                 request.status === 'fulfilled' ? 'Đã giao' :
                                 request.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {request.status === 'pending' && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => alert('Phê duyệt yêu cầu #' + request.id)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    ✓ Duyệt
                                  </button>
                                  <button 
                                    onClick={() => alert('Từ chối yêu cầu #' + request.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✗ Từ chối
                                  </button>
            </div>
                              )}
                              {request.status === 'approved' && (
                                <button 
                                  onClick={() => alert('Hoàn thành giao hàng #' + request.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  📦 Giao hàng
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
          </div>
        )}
            </div>
            */}
          </div>
        )}

      </main>

      {/* Modals */}
      {/* Service Receipt Modal */}
      {showReceiptModal && selectedAppointment && (
        <ReceiptModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowReceiptModal(false)
            setSelectedAppointment(null)
          }}
          onSubmit={submitReceipt}
          getCustomerName={getCustomerName}
          getVehicleInfo={getVehicleInfo}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedAppointment && (
        <AssignmentModal
          appointment={selectedAppointment}
          technicians={technicians}
          onClose={() => {
            setShowAssignmentModal(false)
            setSelectedAppointment(null)
          }}
          onSubmit={submitAssignment}
          getCustomerName={getCustomerName}
          getVehicleInfo={getVehicleInfo}
        />
      )}

      {/* Vehicle History Modal */}
      {showVehicleHistory && selectedVehicleId && (
        <VehicleHistory
          vehicleId={selectedVehicleId}
          onClose={() => {
            setShowVehicleHistory(false)
            setSelectedVehicleId(null)
          }}
        />
      )}

      {/* Appointment Details Modal */}
      {showAppointmentDetails && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          customer={customers.find(c => c.id === selectedAppointment.customerId)}
          vehicle={vehicles.find(v => v.id === selectedAppointment.vehicleId)}
          getUserPhone={getUserPhone}
          getUserPhoneSync={getUserPhoneSync}
          getServiceName={getServiceName}
          onClose={() => {
            setShowAppointmentDetails(false)
            setSelectedAppointment(null)
          }}
          onCreateReceipt={() => {
            setShowAppointmentDetails(false)
            handleCreateReceipt(selectedAppointment.id)
          }}
          onCreateAssignment={() => {
            setShowAppointmentDetails(false)
            handleCreateAssignment(selectedAppointment.id)
          }}
        />
      )}

      {/* Add Part Modal */}
      {showAddPartModal && (
        <AddPartModal
          onClose={() => setShowAddPartModal(false)}
          onSubmit={handleSubmitAddPart}
        />
      )}

      {/* Edit Part Modal */}
      {showEditPartModal && selectedPart && (
        <EditPartModal
          part={selectedPart}
          onClose={() => {
            setShowEditPartModal(false)
            setSelectedPart(null)
          }}
          onSubmit={handleSubmitEditPart}
        />
      )}

      {/* 🆕 Timeline Modal */}
      {showTimelineModal && selectedReceiptForTimeline && (
        <TimelineModal
          receipt={selectedReceiptForTimeline}
          appointment={appointments.find(a => a.id === selectedReceiptForTimeline.appointmentId)}
          assignment={assignments.find(a => a.appointmentId === selectedReceiptForTimeline.appointmentId)}
          technician={selectedReceiptForTimeline.assignment ? technicians.find(t => t.id === selectedReceiptForTimeline.assignment.technicianId) : null}
          maintenanceReport={maintenanceReports.find(r => r.assignmentId === selectedReceiptForTimeline.assignment?.id)}
          onClose={() => {
            setShowTimelineModal(false)
            setSelectedReceiptForTimeline(null)
          }}
        />
      )}
    </div>
  )
}

// 🆕 Receipt Workflow Card Component - Enhanced with Progress Tracking
function ReceiptWorkflowCard({ 
  receipt, 
  customer, 
  vehicle, 
  appointment, 
  assignment, 
  technician, 
  maintenanceReport,
  onAssign, 
  onViewProgress, 
  onCreateInvoice,
  onViewTimeline 
}) {
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!assignment) return 0
    if (assignment.status === 'completed') return 100
    if (assignment.status === 'in_progress') return 60
    if (assignment.status === 'assigned') return 30
    return 0
  }

  const progress = calculateProgress()

  // Get status display
  const getStatusDisplay = () => {
    switch (receipt.workflowStatus) {
      case 'waiting_assignment':
        return { icon: '⏳', text: 'Chờ phân công', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
      case 'assigned':
        return { icon: '👷', text: 'Đã phân công', color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'in_progress':
        return { icon: '🔧', text: 'Đang sửa', color: 'bg-purple-100 text-purple-800 border-purple-200' }
      case 'completed':
        return { icon: '✅', text: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200' }
      case 'ready_for_payment':
        return { icon: '💰', text: 'Chờ thanh toán', color: 'bg-orange-100 text-orange-800 border-orange-200' }
      default:
        return { icon: '📝', text: 'Mới tạo', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const status = getStatusDisplay()

  // Check if overdue
  const isOverdue = () => {
    if (!receipt.estimatedDuration) return false
    const estimatedEnd = new Date(receipt.createdAt)
    estimatedEnd.setHours(estimatedEnd.getHours() + parseInt(receipt.estimatedDuration))
    return new Date() > estimatedEnd && receipt.workflowStatus !== 'completed' && receipt.workflowStatus !== 'ready_for_payment'
  }

  return (
    <div className={`border-2 rounded-lg p-5 hover:shadow-lg transition-all ${status.color.replace('bg-', 'border-').split(' ')[0]}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">📝 Phiếu #{receipt.id}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
              {status.icon} {status.text}
            </span>
            {isOverdue() && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-200">
                ⚠️ Quá giờ
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Tạo lúc: {new Date(receipt.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Customer & Vehicle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 mb-1">👤 Khách hàng</p>
          <p className="font-semibold text-gray-900">{customer?.fullName || 'N/A'}</p>
          <p className="text-sm text-gray-600">📞 {customer?.phoneNumber || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">🚗 Phương tiện</p>
          <p className="font-semibold text-gray-900">{vehicle?.model || 'N/A'}</p>
          <p className="text-sm text-gray-600">🔖 {vehicle?.licensePlate || 'N/A'}</p>
        </div>
      </div>

      {/* Progress Section */}
      {assignment && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Tiến độ công việc</p>
            <p className="text-sm font-bold text-blue-600">{progress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-600">
              👷 <span className="font-medium">{technician?.fullName || 'Chưa phân'}</span>
            </p>
            {receipt.estimatedDuration && (
              <p className="text-gray-600">
                ⏱️ Dự kiến: {receipt.estimatedDuration}h
              </p>
            )}
          </div>
        </div>
      )}

      {/* Service Info */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">📍 Số km:</span>
          <span className="font-medium">{receipt.mileage ? `${receipt.mileage.toLocaleString()} km` : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">⛽ Mức nhiên liệu:</span>
          <span className="font-medium">{receipt.fuelLevel ? `${receipt.fuelLevel}%` : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">🔧 Tình trạng:</span>
          <span className="font-medium capitalize">{receipt.vehicleCondition || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">💰 Ước tính:</span>
          <span className="font-medium text-green-600">
            {receipt.estimatedCost ? `${parseInt(receipt.estimatedCost).toLocaleString()} VNĐ` : 'Chưa có'}
          </span>
        </div>
      </div>


      {/* Notes */}
      {receipt.notes && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-1">📌 Ghi chú:</p>
          <p className="text-sm text-gray-700">{receipt.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        {receipt.workflowStatus === 'waiting_assignment' && (
          <button
            onClick={onAssign}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            ⚡ Phân công KTV
          </button>
        )}
        
        {(receipt.workflowStatus === 'assigned' || receipt.workflowStatus === 'in_progress') && (
          <button
            onClick={onViewProgress}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium text-sm transition-colors"
          >
            📊 Xem tiến độ
          </button>
        )}
        
        {(receipt.workflowStatus === 'completed' || receipt.workflowStatus === 'ready_for_payment') && (
          <button
            onClick={onCreateInvoice}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm transition-colors"
          >
            💵 Tạo hóa đơn
          </button>
        )}
        
        <button
          onClick={onViewTimeline}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors"
        >
          📅 Timeline
        </button>
        
        <button
          onClick={() => handlePrintReceipt(receipt)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors"
        >
          🖨️ In phiếu
        </button>
      </div>
    </div>
  )
}

// Phone Number Display Component (async loading)
function PhoneNumberDisplay({ customerId, getUserPhone, getUserPhoneSync }) {
  const [phone, setPhone] = useState(() => getUserPhoneSync ? getUserPhoneSync(customerId) : 'N/A')
  
  useEffect(() => {
    if (phone === 'N/A' && getUserPhone && customerId) {
      getUserPhone(customerId).then(p => {
        if (p && p !== 'N/A') setPhone(p)
      }).catch(() => {})
    }
  }, [customerId, getUserPhone, phone])
  
  return <p className="font-medium text-gray-900">{phone}</p>
}

// Appointment Details Modal Component
function AppointmentDetailsModal({ appointment, customer, vehicle, getUserPhone, getUserPhoneSync, getServiceName, onClose, onCreateReceipt, onCreateAssignment }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">📋 Chi tiết lịch hẹn #{appointment.id}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
            </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-500">Trạng thái</h4>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
              appointment.status === 'received' ? 'bg-green-100 text-green-800' :
              appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {appointment.status === 'pending' ? '⏳ Chờ xác nhận' :
               appointment.status === 'confirmed' ? '✅ Đã xác nhận' :
               appointment.status === 'received' ? '🚗 Đã tiếp nhận' :
               appointment.status === 'completed' ? '✔️ Hoàn thành' :
               appointment.status}
            </span>
            </div>

          {/* Customer Info */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">👤 Thông tin khách hàng</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Họ tên:</p>
                <p className="font-medium text-gray-900">{customer?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Email:</p>
                <p className="font-medium text-gray-900">{customer?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Số điện thoại:</p>
                <PhoneNumberDisplay customerId={customer?.id} getUserPhone={getUserPhone} getUserPhoneSync={getUserPhoneSync} />
              </div>
              <div>
                <p className="text-gray-500">Địa chỉ:</p>
                <p className="font-medium text-gray-900">{customer?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">🚗 Thông tin xe</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Loại xe:</p>
                <p className="font-medium text-gray-900">{vehicle?.model || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Biển số:</p>
                <p className="font-medium text-gray-900">{vehicle?.licensePlate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">VIN:</p>
                <p className="font-medium text-gray-900 text-xs">{vehicle?.vin || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Năm sản xuất:</p>
                <p className="font-medium text-gray-900">{vehicle?.year || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Màu sắc:</p>
                <p className="font-medium text-gray-900">{vehicle?.color || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Số km hiện tại:</p>
                <p className="font-medium text-gray-900">{vehicle?.odometerKm ? `${vehicle.odometerKm.toLocaleString()} km` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Appointment Info */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">📅 Thông tin lịch hẹn</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Ngày hẹn:</p>
                <p className="font-medium text-gray-900">
                  {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Giờ hẹn:</p>
                <p className="font-medium text-gray-900">{appointment.appointmentTime || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Dịch vụ:</p>
                <p className="font-medium text-gray-900">{getServiceName ? getServiceName(appointment.serviceId) : (appointment.serviceId || 'N/A')}</p>
              </div>
              {appointment.notes && (
                <div className="col-span-2">
                  <p className="text-gray-500">Ghi chú:</p>
                  <p className="font-medium text-gray-900">{appointment.notes}</p>
          </div>
        )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Đóng
            </button>
            {appointment.status === 'confirmed' && (
              <>
                <button
                  onClick={onCreateReceipt}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  📝 Tạo phiếu tiếp nhận
                </button>
                <button
                  onClick={onCreateAssignment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  👷 Phân công KTV
                </button>
              </>
            )}
            {appointment.status === 'received' && (
              <button
                onClick={onCreateAssignment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                👷 Phân công KTV
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Service Receipt Modal Component - Enhanced (Xác nhận tiếp nhận)
function ReceiptModal({ appointment, onClose, onSubmit, getCustomerName, getVehicleInfo }) {
  // Lấy số km hiện tại từ vehicle nếu có
  const [vehicle, setVehicle] = useState(null)
  useEffect(() => {
    if (appointment?.vehicleId) {
      fetch(`http://localhost:8083/api/staff/vehicles/${appointment.vehicleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
        .then(r => r.ok ? r.json() : null)
        .then(v => {
          if (v) {
            const transformed = Object.keys(v).reduce((acc, key) => {
              const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
              acc[camelKey] = v[key]
              return acc
            }, {})
            setVehicle(transformed)
          }
        })
        .catch(() => {})
    }
  }, [appointment])
  
  const [formData, setFormData] = useState({
    mileage: vehicle?.odometerKm || '',
    fuelLevel: '50',
    vehicleCondition: 'good',
    estimatedCost: '',
    estimatedDuration: '',
    notes: ''
  })
  
  // Update mileage when vehicle is loaded
  useEffect(() => {
    if (vehicle?.odometerKm && !formData.mileage) {
      setFormData(prev => ({ ...prev, mileage: vehicle.odometerKm }))
    }
  }, [vehicle])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full my-auto">
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900">📋 Tiếp nhận yêu cầu dịch vụ</h3>
          <p className="text-sm text-gray-600 mt-1">Kiểm tra thông tin và quyết định có tiếp nhận hay không</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Appointment Info - Thông tin từ khách hàng khi đặt lịch */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3 border-2 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📅 Thông tin lịch hẹn</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-gray-700"><span className="font-medium">Lịch hẹn #:</span> {appointment.id}</p>
              <p className="text-gray-700"><span className="font-medium">Ngày hẹn:</span> {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
              <p className="text-gray-700"><span className="font-medium">Giờ hẹn:</span> {appointment.appointmentTime || 'N/A'}</p>
              <p className="text-gray-700"><span className="font-medium">Dịch vụ:</span> {appointment.serviceId || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-gray-900 mb-2">👤 Thông tin khách hàng</h4>
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Khách hàng:</span> {getCustomerName(appointment.customerId)}</p>
            <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Xe:</span> {getVehicleInfo(appointment.vehicleId)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mileage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số km hiện tại <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: 15000"
                required
              />
            </div>

            {/* Fuel Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức nhiên liệu (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.fuelLevel}
                onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Vehicle Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tình trạng xe
              </label>
              <select
                value={formData.vehicleCondition}
                onChange={(e) => setFormData({ ...formData, vehicleCondition: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="excellent">Rất tốt</option>
                <option value="good">Tốt</option>
                <option value="fair">Trung bình</option>
                <option value="poor">Kém</option>
              </select>
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chi phí dự kiến (VNĐ)
              </label>
              <input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: 500000"
              />
            </div>

            {/* Estimated Duration */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian dự kiến hoàn thành
              </label>
              <input
                type="text"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="VD: 2 giờ, 1 ngày, 3 ngày làm việc..."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú của nhân viên
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ghi chú về tình trạng bên ngoài, đồ trong xe, yêu cầu đặc biệt..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                if (confirm('Xác nhận từ chối tiếp nhận yêu cầu này?')) {
                  // Từ chối: Có thể hủy appointment hoặc đánh dấu cancelled
                  onClose()
                }
              }}
              className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-md hover:bg-red-50 font-medium"
            >
              ❌ Từ chối
            </button>
            <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
                ✅ Tiếp nhận và tạo phiếu bảo dưỡng
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Assignment Modal Component
function AssignmentModal({ appointment, technicians, onClose, onSubmit, getCustomerName, getVehicleInfo }) {
  const [selectedTechId, setSelectedTechId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedTechId) {
      alert('Vui lòng chọn kỹ thuật viên')
      return
    }
    // Đảm bảo selectedTechId là số, không phải string tên
    const techId = parseInt(selectedTechId)
    if (isNaN(techId) || techId <= 0) {
      alert('Lỗi: ID kỹ thuật viên không hợp lệ. Vui lòng chọn lại.')
      console.error('[AssignmentModal] Invalid technician ID:', selectedTechId)
      return
    }
    console.log('[AssignmentModal] Submitting technician assignment:', { selectedTechId, techId })
    onSubmit(techId)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Phân công kỹ thuật viên</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600"><span className="font-medium">Lịch hẹn:</span> #{appointment.id}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Khách hàng:</span> {getCustomerName(appointment.customerId)}</p>
            <p className="text-sm text-gray-600"><span className="font-medium">Xe:</span> {getVehicleInfo(appointment.vehicleId)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn kỹ thuật viên</label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              <option value="">-- Chọn kỹ thuật viên --</option>
              {technicians.map(tech => {
                const techId = tech.id || tech.technicianId || tech.staffId
                console.log('[AssignmentModal] Technician:', { id: tech.id, technicianId: tech.technicianId, staffId: tech.staffId, fullName: tech.fullName, email: tech.email })
                if (!techId) {
                  console.warn('[AssignmentModal] Technician missing ID:', tech)
                  return null
                }
                return (
                  <option key={techId} value={techId}>
                    {tech.fullName || tech.email || `Technician #${techId}`}
                </option>
                )
              })}
            </select>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Phân công
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 🆕 Timeline Modal Component - Visualize Receipt Workflow
function TimelineModal({ receipt, appointment, assignment, technician, maintenanceReport, onClose }) {
  const getTimelineEvents = () => {
    const events = []
    
    // Receipt created
    if (receipt) {
      events.push({
        time: new Date(receipt.createdAt),
        icon: '📝',
        title: 'Phiếu tiếp nhận được tạo',
        description: `Tiếp nhận xe từ khách hàng. Số km: ${receipt.mileage?.toLocaleString()} km`,
        status: 'completed',
        color: 'bg-green-500'
      })
    }

    // Assignment created
    if (assignment) {
      events.push({
        time: new Date(assignment.createdAt),
        icon: '👷',
        title: 'Phân công kỹ thuật viên',
        description: `Đã phân công cho ${technician?.fullName || 'KTV'}`,
        status: 'completed',
        color: 'bg-blue-500'
      })
    }

    // Work started (if assignment in_progress or completed)
    if (assignment && (assignment.status === 'in_progress' || assignment.status === 'completed')) {
      const startTime = new Date(assignment.createdAt)
      startTime.setMinutes(startTime.getMinutes() + 15) // Estimate 15 min after assignment
      events.push({
        time: startTime,
        icon: '🔧',
        title: 'Bắt đầu sửa chữa',
        description: 'Kỹ thuật viên đã bắt đầu công việc',
        status: 'completed',
        color: 'bg-purple-500'
      })
    }

    // Work completed
    if (assignment && assignment.status === 'completed') {
      events.push({
        time: new Date(assignment.updatedAt || assignment.createdAt),
        icon: '✅',
        title: 'Hoàn thành sửa chữa',
        description: 'Công việc đã hoàn thành',
        status: 'completed',
        color: 'bg-green-500'
      })
    }

    // Maintenance report created
    if (maintenanceReport) {
      events.push({
        time: new Date(maintenanceReport.createdAt),
        icon: '📋',
        title: 'Báo cáo bảo dưỡng',
        description: `Báo cáo #${maintenanceReport.id} đã được tạo`,
        status: 'completed',
        color: 'bg-yellow-500'
      })
    }

    // Future: Ready for payment
    if (maintenanceReport && maintenanceReport.status === 'completed') {
      events.push({
        time: new Date(),
        icon: '💰',
        title: 'Sẵn sàng thanh toán',
        description: 'Xe đã sẵn sàng để giao lại cho khách',
        status: 'pending',
        color: 'bg-orange-500'
      })
    }

    // Estimated completion (if not yet completed)
    if (receipt.estimatedDuration && assignment && assignment.status !== 'completed') {
      const estimatedEnd = new Date(receipt.createdAt)
      estimatedEnd.setHours(estimatedEnd.getHours() + parseInt(receipt.estimatedDuration))
      events.push({
        time: estimatedEnd,
        icon: '⏱️',
        title: 'Dự kiến hoàn thành',
        description: `Ước tính xong lúc ${estimatedEnd.toLocaleTimeString('vi-VN')}`,
        status: 'pending',
        color: 'bg-gray-400'
      })
    }

    return events.sort((a, b) => a.time - b.time)
  }

  const timeline = getTimelineEvents()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">📅 Timeline - Phiếu #{receipt.id}</h3>
              <p className="text-sm text-gray-600 mt-1">Theo dõi tiến trình xử lý phiếu tiếp nhận</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline events */}
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div key={index} className="relative flex items-start">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${event.color} flex items-center justify-center text-white text-xl font-bold shadow-lg z-10 border-4 border-white`}>
                    {event.icon}
                  </div>

                  {/* Content */}
                  <div className="ml-6 flex-1">
                    <div className={`p-4 rounded-lg border-2 ${
                      event.status === 'completed' 
                        ? 'bg-white border-gray-200' 
                        : 'bg-gray-50 border-dashed border-gray-300'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold ${
                          event.status === 'completed' ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {event.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {event.time.toLocaleString('vi-VN', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        event.status === 'completed' ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {event.description}
                      </p>
                      {event.status === 'completed' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          ✓ Đã hoàn thành
                        </span>
                      )}
                      {event.status === 'pending' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          ○ Chờ xử lý
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">⏱️ Thời gian đã trôi qua:</p>
                <p className="font-semibold text-gray-900">
                  {Math.floor((new Date() - new Date(receipt.createdAt)) / (1000 * 60 * 60))}h {Math.floor(((new Date() - new Date(receipt.createdAt)) % (1000 * 60 * 60)) / (1000 * 60))}m
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">📊 Trạng thái hiện tại:</p>
                <p className="font-semibold text-gray-900">
                  {assignment?.status === 'completed' ? '✅ Hoàn thành' :
                   assignment?.status === 'in_progress' ? '🔧 Đang sửa' :
                   assignment ? '👷 Đã phân công' : '⏳ Chờ phân công'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default Staff
