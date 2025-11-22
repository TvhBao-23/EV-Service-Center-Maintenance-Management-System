import { useEffect, useState } from 'react'
import { staffAPI, maintenanceAPI, customerAPI } from '../lib/api'
import RoleBasedNav from '../components/RoleBasedNav'

function Technician() {
  const [activeTab, setActiveTab] = useState('assignments') // assignments | checklists | reports
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Data states
  const [assignments, setAssignments] = useState([])
  const [serviceOrders, setServiceOrders] = useState([]) // Service orders từ maintenance service
  const [vehicles, setVehicles] = useState([])
  const [appointments, setAppointments] = useState([])
  const [checklists, setChecklists] = useState([]) // Legacy checklists từ Staff Service
  const [serviceOrderChecklists, setServiceOrderChecklists] = useState({}) // Service order checklists từ Maintenance Service: {orderId: [checklistItems]}
  const [checklistErrors, setChecklistErrors] = useState({}) // Lưu lỗi khi load checklist: {orderId: errorMessage}
  const [maintenanceReports, setMaintenanceReports] = useState([])
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([]) // Services để lấy service name
  const [staffs, setStaffs] = useState([]) // Staffs để map user_id -> staff_id
  const [staffRecords, setStaffRecords] = useState([]) // Staff records từ maintenance DB
  const [staffIdMap, setStaffIdMap] = useState({}) // Map userId -> staffId
  const [payments, setPayments] = useState([]) // Payments để lấy payment status chính xác

  // UI states
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  // Get current user ID from localStorage (tech user)
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user?.id ? parseInt(user.id) : null
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e)
    }
    return null
  }
  const currentUserId = getCurrentUserId()

  // Helper function to convert snake_case to camelCase
  const snakeToCamel = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(v => snakeToCamel(v))
    } else if (obj !== null && typeof obj === 'object') {
      const result = {}
      Object.keys(obj).forEach(key => {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        result[camelKey] = snakeToCamel(obj[key])
      })
      return result
    }
    return obj
  }

  // Normalize service order status from backend (enum IN_PROGRESS -> in_progress)
  const normalizeStatus = (status) => {
    if (!status) return 'queued'
    // Convert enum format (IN_PROGRESS) to lowercase with underscore (in_progress)
    if (typeof status === 'string') {
      return status.toLowerCase()
    }
    return status
  }

  // Normalize payment status from backend (enum UNPAID -> unpaid)
  const normalizePaymentStatus = (status) => {
    if (!status) return 'unpaid'
    const normalized = String(status).toLowerCase()
    if (normalized === 'unpaid' || normalized === 'pending') return normalized
    if (normalized === 'paid' || normalized === 'completed') return 'paid' // 'completed' cũng là 'paid'
    if (normalized === 'partially_paid' || normalized === 'partial' || normalized === 'partially paid') {
      return 'partially_paid'
    }
    return normalized
  }

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load service orders assigned to this technician from maintenance service
      // API already filters by technician, so we don't need to filter again
      const serviceOrdersData = currentUserId 
        ? await maintenanceAPI.getServiceOrdersByTechnician(currentUserId).catch(() => [])
        : []
      
      // Debug: Log raw data from API
      window.debugServiceOrders = serviceOrdersData
      if (serviceOrdersData && serviceOrdersData.length > 0) {
        console.warn('[DEBUG] Raw service orders from API:', JSON.stringify(serviceOrdersData, null, 2))
        serviceOrdersData.forEach(order => {
          console.warn(`[DEBUG] Order ${order.orderId || order.id} - Status: ${order.status} (type: ${typeof order.status})`)
        })
      }
      
      // Normalize status for all service orders (convert enum IN_PROGRESS -> in_progress)
      // Create a new array to ensure React re-renders
      const normalizedServiceOrders = serviceOrdersData && Array.isArray(serviceOrdersData)
        ? serviceOrdersData.map(order => {
            const normalizedOrder = { ...order } // Create new object to avoid mutation
            if (normalizedOrder.status) {
              const originalStatus = normalizedOrder.status
              normalizedOrder.status = normalizeStatus(normalizedOrder.status)
              console.warn(`[DEBUG] Normalized: Order ${normalizedOrder.orderId || normalizedOrder.id} - ${originalStatus} -> ${normalizedOrder.status}`)
            }
            return normalizedOrder
          })
        : []
      
      console.warn('[DEBUG] Normalized service orders:', JSON.stringify(normalizedServiceOrders, null, 2))
      
      // Load other data from staff service
      const [assigns, vehs, appts, checks, reports, custs, svcs, staffUsersData, maintenanceStaffRecords, paymentsData] = await Promise.all([
        staffAPI.getAssignments().catch(() => []),
        staffAPI.getVehicles().catch(() => []),
        staffAPI.getAppointments().catch(() => []),
        staffAPI.getChecklists().catch(() => []),
        staffAPI.getMaintenanceReports().catch(() => []),
        staffAPI.getCustomers().catch(() => []), // Fixed: getCustomers instead of getAllCustomers
        customerAPI.getServices().catch(() => []), // Load services từ Customer Service để lấy service name
        staffAPI.getTechnicians().catch(() => []), // Load technicians (user-level) từ Staff Service
        maintenanceAPI.getStaffRecords().catch(() => []), // Load staff records (staff_id, user_id) từ Maintenance DB
        customerAPI.getAllPayments().catch(() => []) // Load payments để lấy payment status chính xác
      ])
      
      setServiceOrders(normalizedServiceOrders)
      setAssignments(assigns || [])
      setVehicles(vehs || [])
      setAppointments(appts || [])
      setChecklists(checks || [])
      setMaintenanceReports(reports || [])
      setCustomers(custs || [])
      setServices(svcs || [])
      setPayments(paymentsData || [])
      // Merge staff info từ Staff Service (user account) và Maintenance DB (staff_id)
      const staffUsers = Array.isArray(staffUsersData) ? snakeToCamel(staffUsersData) : []
      const staffRecordsArray = Array.isArray(maintenanceStaffRecords) ? maintenanceStaffRecords : []

      // Build quick lookup map userId -> staffId từ maintenance records
      const staffLookup = {}
      staffRecordsArray.forEach(record => {
        if (record && record.userId !== undefined && record.staffId !== undefined && record.staffId !== null) {
          const numericUserId = Number(record.userId)
          const numericStaffId = Number(record.staffId)
          if (!Number.isNaN(numericUserId) && !Number.isNaN(numericStaffId)) {
            staffLookup[numericUserId] = numericStaffId
          }
        }
      })

      const mergedStaffs = staffUsers.map(user => {
        const candidateIds = [
          user.userId,
          user.user_id,
          user.id
        ].map(val => Number(val)).filter(val => !Number.isNaN(val))
        const matchedUserId = candidateIds.length > 0 ? candidateIds[0] : null
        const matchedStaffRecord = matchedUserId != null
          ? staffRecordsArray.find(record => Number(record.userId) === matchedUserId)
          : null
        const staffId = matchedUserId != null
          ? (matchedStaffRecord?.staffId ?? staffLookup[matchedUserId])
          : null

        return {
          ...user,
          staffId: staffId ?? user.staffId ?? user.staff_id ?? null,
          maintenanceStaffId: staffId ?? null,
          maintenanceStaffRecord: matchedStaffRecord ?? null
        }
      })

      setStaffRecords(staffRecordsArray)
      setStaffIdMap(staffLookup)
      setStaffs(mergedStaffs)
      
      // Load service order checklists from maintenance service
      if (normalizedServiceOrders && normalizedServiceOrders.length > 0) {
        const checklistPromises = normalizedServiceOrders.map(async (order) => {
          try {
            const orderId = order.orderId || order.id
            const checklist = await maintenanceAPI.getServiceOrderChecklist(orderId)
            // Normalize checklist data from snake_case to camelCase
            const normalizedChecklist = Array.isArray(checklist) 
              ? snakeToCamel(checklist).map(item => ({
                  ...item,
                  checklistId: item.checklistId || item.id,
                  itemName: item.itemName || item.item_name,
                  isCompleted: item.isCompleted !== undefined ? item.isCompleted : (item.is_completed === 1 || item.is_completed === true)
                }))
              : []
            return { orderId, checklist: normalizedChecklist, error: null }
          } catch (err) {
            console.error(`Error loading checklist for order ${order.orderId || order.id}:`, err)
            // Return error info to distinguish between "no checklist" and "API error"
            return { 
              orderId: order.orderId || order.id, 
              checklist: [], 
              error: err.message || 'Failed to load checklist' 
            }
          }
        })
        
        const checklistResults = await Promise.all(checklistPromises)
        const checklistMap = {}
        const errorMap = {}
        checklistResults.forEach(({ orderId, checklist, error }) => {
          checklistMap[orderId] = checklist
          // Lưu error nếu có để hiển thị cho user
          if (error) {
            errorMap[orderId] = error
            console.warn(`[Checklist] Order ${orderId} - ${error}`)
          } else {
            // Xóa error nếu load thành công
            delete errorMap[orderId]
          }
        })
        setServiceOrderChecklists(checklistMap)
        setChecklistErrors(errorMap)
      }
    } catch (err) {
      setError('Không thể tải dữ liệu: ' + err.message)
      console.error('Load data error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter assignments for current technician
  const myAssignments = assignments.filter(a => a.technicianId === currentUserId)
  
  // Service orders are already filtered by API (getServiceOrdersByTechnician)
  // API maps userId -> staff_id and returns only service orders for this technician
  // So we don't need to filter again - just use all service orders returned
  const myServiceOrders = serviceOrders

  // Get vehicle info by ID
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? `${vehicle.model} (${vehicle.licensePlate})` : 'N/A'
  }
  
  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    return customer ? customer.fullName || customer.email : 'N/A'
  }

  // Get appointment info by ID
  const getAppointmentInfo = (appointmentId) => {
    const appointment = appointments.find(a => 
      a.id === appointmentId || 
      a.appointmentId === appointmentId
    )
    return appointment
  }

  // Get service name by ID with encoding fix
  const getServiceName = (serviceId) => {
    const service = services.find(s => 
      s.id === serviceId || 
      s.serviceId === serviceId
    )
    if (!service || !service.name) return 'N/A'
    
    // Fix encoding issue if present
    try {
      let serviceName = service.name
      
      // Check if the string appears to be incorrectly encoded (multiple patterns)
      const hasEncodingIssue = /[ÃÄÅÆÇÈÉÊË]/.test(serviceName) || 
                               /Ã¡|Ã¢|Ã£|Ã¤|Ã¥|Ã¦|Ã§|Ã¨|Ã©|Ãª|Ã«|Ã¬|Ã­|Ã®|Ã¯|Ã°|Ã±|Ã²|Ã³|Ã´|Ãµ|Ã¶|Ã·|Ã¸|Ã¹|Ãº|Ã»|Ã¼|Ã½|Ã¾|Ã¿/.test(serviceName) ||
                               /BÃ¡|dÃ|á»|Ä|kÃ|áº|Æ°|á»¡|á»‹|ká»|Báº|dÆ°/.test(serviceName)
      
      if (hasEncodingIssue) {
        // Try multiple decoding methods
        try {
          // Method 1: Direct manual fix for the specific pattern "Báº£o dÆ°á»¡ng Ä'á»‹nh ká»³"
          // This pattern suggests UTF-8 bytes interpreted as Latin1, then encoded again
          if (serviceName.includes('Báº') || serviceName.includes('dÆ°') || serviceName.includes('á»')) {
            // Try to decode as if it was UTF-8 bytes read as Latin1
            const bytes = []
            for (let i = 0; i < serviceName.length; i++) {
              bytes.push(serviceName.charCodeAt(i) & 0xFF)
            }
            try {
              serviceName = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes))
              // If still has issues, try one more decode
              if (/[ÃÄÅÆÇÈÉÊË]/.test(serviceName) || /áº|Æ°|á»/.test(serviceName)) {
                const bytes2 = []
                for (let i = 0; i < serviceName.length; i++) {
                  bytes2.push(serviceName.charCodeAt(i) & 0xFF)
                }
                serviceName = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes2))
              }
            } catch (e1) {
              // If decoding fails, use manual replacement
              serviceName = serviceName
                .replace(/Báº£o/g, 'Bảo')
                .replace(/dÆ°á»¡ng/g, 'dưỡng')
                .replace(/Ä'/g, 'đ')
                .replace(/á»‹nh/g, 'ịnh')
                .replace(/ká»³/g, 'kỳ')
            }
          } else {
            // Method 2: Fix double-encoded UTF-8
            try {
              serviceName = decodeURIComponent(escape(serviceName))
            } catch (e2) {
              // Method 3: Manual fix for common Vietnamese characters
              serviceName = serviceName
                .replace(/BÃ¡/g, 'Bả')
                .replace(/dÃ/g, 'dưỡ')
                .replace(/á»/g, '')
                .replace(/Ä/g, 'đ')
                .replace(/kÃ/g, 'kỳ')
                .replace(/áº/g, 'ả')
                .replace(/Æ°/g, 'ưỡ')
                .replace(/á»¡/g, 'ỡ')
                .replace(/á»‹/g, 'ị')
                .replace(/ká»/g, 'kỳ')
                .replace(/Ã¡/g, 'á')
                .replace(/Ã¢/g, 'â')
                .replace(/Ã£/g, 'ã')
                .replace(/Ã¤/g, 'ä')
                .replace(/Ã¥/g, 'å')
                .replace(/Ã¦/g, 'æ')
                .replace(/Ã§/g, 'ç')
                .replace(/Ã¨/g, 'è')
                .replace(/Ã©/g, 'é')
                .replace(/Ãª/g, 'ê')
                .replace(/Ã«/g, 'ë')
                .replace(/Ã¬/g, 'ì')
                .replace(/Ã­/g, 'í')
                .replace(/Ã®/g, 'î')
                .replace(/Ã¯/g, 'ï')
                .replace(/Ã°/g, 'ð')
                .replace(/Ã±/g, 'ñ')
                .replace(/Ã²/g, 'ò')
                .replace(/Ã³/g, 'ó')
                .replace(/Ã´/g, 'ô')
                .replace(/Ãµ/g, 'õ')
                .replace(/Ã¶/g, 'ö')
                .replace(/Ã·/g, '÷')
                .replace(/Ã¸/g, 'ø')
                .replace(/Ã¹/g, 'ù')
                .replace(/Ãº/g, 'ú')
                .replace(/Ã»/g, 'û')
                .replace(/Ã¼/g, 'ü')
                .replace(/Ã½/g, 'ý')
                .replace(/Ã¾/g, 'þ')
                .replace(/Ã¿/g, 'ÿ')
            }
          }
          
          // Final check: if still has encoding issues, apply manual fix
          if (/[ÃÄÅÆÇÈÉÊË]/.test(serviceName) || /áº|Æ°|á»¡|á»‹|ká»/.test(serviceName)) {
            serviceName = serviceName
              .replace(/Báº£o/g, 'Bảo')
              .replace(/dÆ°á»¡ng/g, 'dưỡng')
              .replace(/Ä'/g, 'đ')
              .replace(/á»‹nh/g, 'ịnh')
              .replace(/ká»³/g, 'kỳ')
              .replace(/Báº/g, 'Bả')
              .replace(/dÆ°/g, 'dưỡ')
              .replace(/á»¡/g, 'ỡ')
              .replace(/á»‹/g, 'ị')
              .replace(/ká»/g, 'kỳ')
          }
        } catch (e1) {
          console.warn('Could not decode service name:', serviceName, e1)
          // Final fallback: manual fix
          serviceName = serviceName
            .replace(/Báº£o/g, 'Bảo')
            .replace(/dÆ°á»¡ng/g, 'dưỡng')
            .replace(/Ä'/g, 'đ')
            .replace(/á»‹nh/g, 'ịnh')
            .replace(/ká»³/g, 'kỳ')
        }
      }
      
      return serviceName
    } catch (e) {
      console.error('Error decoding service name:', e)
      return service.name
    }
  }

  // Handle accept assignment (đồng ý nhận công việc)
  const handleAcceptAssignment = async (orderId) => {
    if (!confirm('Xác nhận đồng ý nhận công việc này?')) return
    
    try {
      // Update service order status to 'in_progress' (đang làm)
      await maintenanceAPI.updateServiceOrderStatus(orderId, 'in_progress')
      await loadData() // Wait for data reload to ensure UI updates
      alert('✅ Đã đồng ý nhận công việc!')
    } catch (err) {
      alert('❌ Lỗi: ' + err.message)
      await loadData() // Reload on error to ensure consistency
    }
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

  // Handle create checklist for service order
  const handleCreateChecklist = async (orderId) => {
    // Default checklist items - format theo API: array of strings
    const defaultItems = [
      'Kiểm tra pin',
      'Kiểm tra phanh',
      'Kiểm tra lốp',
      'Kiểm tra đèn',
      'Kiểm tra hệ thống điện',
      'Kiểm tra hệ thống làm mát'
    ]
    
    try {
      await maintenanceAPI.createServiceOrderChecklist(orderId, defaultItems)
      await loadData() // Wait for data reload
      alert('✅ Đã tạo checklist thành công!')
    } catch (err) {
      alert('❌ Lỗi tạo checklist: ' + err.message)
      await loadData() // Reload on error
    }
  }

  // Helper function để lấy staff_id từ user_id
  const getStaffIdFromUserId = (userId) => {
    if (userId === null || userId === undefined) return null
    const numericUserId = Number(userId)
    if (!Number.isFinite(numericUserId)) return null

    if (staffIdMap[numericUserId]) {
      return staffIdMap[numericUserId]
    }

    const maintenanceRecord = staffRecords.find(record => Number(record.userId) === numericUserId)
    if (maintenanceRecord?.staffId !== undefined && maintenanceRecord?.staffId !== null) {
      const recordStaffId = Number(maintenanceRecord.staffId)
      if (Number.isFinite(recordStaffId)) {
        return recordStaffId
      }
    }

    const staff = staffs.find(s => {
      const candidateIds = [s.userId, s.user_id, s.id]
        .map(val => Number(val))
        .filter(val => Number.isFinite(val))
      return candidateIds.includes(numericUserId)
    })

    if (staff?.staffId !== undefined && staff?.staffId !== null) {
      const resolvedStaffId = Number(staff.staffId)
      if (Number.isFinite(resolvedStaffId)) {
        return resolvedStaffId
      }
    }

    return null
  }

  const ensureStaffIdForUser = async (userId) => {
    if (userId === null || userId === undefined) return null
    const numericUserId = Number(userId)
    if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
      return null
    }

    const existingStaffId = getStaffIdFromUserId(numericUserId)
    if (existingStaffId) {
      return existingStaffId
    }

    try {
      const record = await maintenanceAPI.getStaffRecordByUserId(numericUserId)
      if (record && record.staffId !== undefined && record.staffId !== null) {
        const staffIdNumber = Number(record.staffId)
        if (Number.isFinite(staffIdNumber)) {
          setStaffRecords(prev => {
            const exists = prev.some(r => Number(r.staffId) === staffIdNumber)
            if (exists) {
              return prev
            }
            return [...prev, record]
          })
          setStaffIdMap(prev => ({
            ...prev,
            [numericUserId]: staffIdNumber
          }))
          setStaffs(prev => {
            const index = prev.findIndex(s => {
              const candidateIds = [s.userId, s.user_id, s.id]
                .map(val => Number(val))
                .filter(val => Number.isFinite(val))
              return candidateIds.includes(numericUserId)
            })
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = {
                ...updated[index],
                staffId: staffIdNumber,
                maintenanceStaffId: staffIdNumber,
                maintenanceStaffRecord: record
              }
              return updated
            }
            return prev
          })
          return staffIdNumber
        }
      }
    } catch (err) {
      console.warn('[Checklist] Failed to fetch staff record for user', numericUserId, err)
    }

    return null
  }

  // Handle complete/uncomplete checklist item
  // Sử dụng một API duy nhất để update status (thống nhất logic)
  const handleCompleteChecklistItem = async (orderId, checklistId, isCompleted, itemName) => {
    try {
      // Map user_id sang staff_id để tránh foreign key constraint error
      // completed_by phải reference đến staff_id trong bảng staffs, không phải user_id
      let staffId = null
      if (isCompleted) {
        staffId = getStaffIdFromUserId(currentUserId)
        if (!staffId) {
          staffId = await ensureStaffIdForUser(currentUserId)
        }
      }
      
      if (isCompleted && !staffId) {
        console.warn(`[Checklist] Cannot find staff_id for user_id ${currentUserId}. Staffs data:`, staffs)
        alert('⚠️ Không tìm thấy thông tin nhân viên. Vui lòng thử lại sau khi tải lại trang.')
        return
      }
      
      // Sử dụng updateChecklistItemStatus cho cả complete và uncomplete
      // API này hỗ trợ cả hai trường hợp
      // Pass staff_id thay vì user_id
      await maintenanceAPI.updateChecklistItemStatus(
        checklistId, 
        isCompleted, 
        '', 
        staffId ?? null // Sử dụng staff_id thay vì currentUserId
      )
      // Reload data để cập nhật UI
      await loadData()
    } catch (err) {
      console.error('Error updating checklist item:', err)
      const errorMessage = err.message || 'Không thể cập nhật checklist'
      alert(`❌ Lỗi cập nhật checklist: ${errorMessage}`)
      // Reload on error to ensure consistency
      await loadData()
    }
  }

  // Handle update service order status (Quản lý tiến trình: chờ - đang làm - hoàn tất)
  const handleUpdateServiceOrderStatus = async (orderId, newStatus) => {
    const statusLabels = {
      'queued': 'Chờ',
      'in_progress': 'Đang làm',
      'completed': 'Hoàn tất'
    }
    
    // Normalize orderId to ensure correct comparison
    const normalizedOrderId = typeof orderId === 'string' ? parseInt(orderId) : orderId
    
    // Check if status is already the same (prevent unnecessary API calls)
    const currentOrder = serviceOrders.find(order => {
      const orderIdToMatch = order.orderId || order.id
      return orderIdToMatch === normalizedOrderId || parseInt(orderIdToMatch) === normalizedOrderId
    })
    
    if (currentOrder) {
      const currentStatus = normalizeStatus(currentOrder.status)
      if (currentStatus === newStatus) {
        alert('⚠️ Trạng thái đã là "' + statusLabels[newStatus] + '" rồi!')
        return
      }
    }
    
    if (!confirm(`Xác nhận chuyển trạng thái sang "${statusLabels[newStatus] || newStatus}"?`)) return
    
    try {
      console.warn(`[DEBUG] Updating order ${normalizedOrderId} to status: ${newStatus}`)
      
      // Optimistic update: Update state immediately for better UX
      setServiceOrders(prevOrders => {
        const updated = prevOrders.map(order => {
          const orderIdToMatch = order.orderId || order.id
          const orderIdNum = typeof orderIdToMatch === 'string' ? parseInt(orderIdToMatch) : orderIdToMatch
          if (orderIdNum === normalizedOrderId || orderIdToMatch === normalizedOrderId) {
            console.warn(`[DEBUG] Optimistic update: order ${orderIdToMatch} status ${order.status} -> ${newStatus}`)
            return { ...order, status: newStatus }
          }
          return order
        })
        console.warn('[DEBUG] Updated serviceOrders state:', updated)
        return updated
      })
      
      const response = await maintenanceAPI.updateServiceOrderStatus(normalizedOrderId, newStatus)
      console.warn('[DEBUG] API response:', JSON.stringify(response, null, 2))
      
      // Normalize status from response if needed
      if (response && response.status) {
        const originalResponseStatus = response.status
        response.status = normalizeStatus(response.status)
        console.warn(`[DEBUG] Normalized response status: ${originalResponseStatus} -> ${response.status}`)
      }
      
      // Nếu hoàn tất, có thể gọi completeServiceOrder
      if (newStatus === 'completed') {
        await maintenanceAPI.completeServiceOrder(normalizedOrderId).catch(() => {})
      }
      
      // Reload data to ensure consistency
      console.warn('[DEBUG] Reloading data after status update...')
      await loadData()
      
      // Check final state after reload
      setTimeout(() => {
        const finalOrders = serviceOrders
        console.warn('[DEBUG] Final serviceOrders after reload:', JSON.stringify(finalOrders, null, 2))
        const targetOrder = finalOrders.find(o => (o.orderId || o.id) === normalizedOrderId)
        if (targetOrder) {
          console.warn(`[DEBUG] Target order ${normalizedOrderId} final status: ${targetOrder.status}`)
        } else {
          console.warn(`[DEBUG] Target order ${normalizedOrderId} not found in final state!`)
        }
      }, 1000)
      
      alert(`✅ Đã cập nhật trạng thái thành "${statusLabels[newStatus] || newStatus}"!`)
    } catch (err) {
      console.error('[handleUpdateServiceOrderStatus] Error:', err)
      // Revert optimistic update on error
      await loadData()
      alert('❌ Lỗi: ' + err.message)
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
      console.log('[submitReport] Starting with selectedAssignment:', selectedAssignment)
      console.log('[submitReport] Current assignments count:', assignments.length)
      console.log('[submitReport] Assignments sample:', assignments.slice(0, 3))
      
      // Get vehicleId - required by backend
      const vehicleId = selectedAssignment.vehicleId
        || selectedAssignment.order?.vehicleId
        || selectedAssignment.vehicle?.vehicleId
        || selectedAssignment.vehicle?.id
      if (!vehicleId) {
        alert('❌ Lỗi: Không tìm thấy thông tin xe. Vui lòng thử lại.')
        return
      }
      
      // Find or create assignmentId
      // IMPORTANT: assignmentId must be from assignments table, not orderId
      // Priority: Find by appointmentId first, then try to create if not found
      
      // Get appointmentId from selectedAssignment
      const appointmentId = selectedAssignment.appointmentId
        || selectedAssignment.appointment_id
        || selectedAssignment.appointment?.id
        || selectedAssignment.appointment?.appointmentId
        || selectedAssignment.order?.appointmentId
        || selectedAssignment.order?.appointment_id
        || selectedAssignment.order?.appointment?.id
        || selectedAssignment.order?.appointment?.appointmentId
      
      let assignmentId = null
      
      // First, try to find existing assignment by appointmentId
      if (appointmentId) {
        const existingAssignment = assignments.find(a => {
          const aAppointmentId = a.appointmentId || a.appointment_id || a.appointment?.id || a.appointment?.appointmentId
          return aAppointmentId && String(aAppointmentId) === String(appointmentId)
        })
        
        if (existingAssignment) {
          assignmentId = existingAssignment.assignment_id || existingAssignment.assignmentId || existingAssignment.id
          console.log('[submitReport] Found existing assignment by appointmentId:', appointmentId, '-> assignmentId:', assignmentId)
        }
      }
      
      // If not found, try to find by assignment_id directly (in case selectedAssignment already has it)
      if (!assignmentId) {
        const directAssignmentId = selectedAssignment.assignmentId || selectedAssignment.assignment_id
        if (directAssignmentId) {
          const exists = assignments.some(a => {
            const aId = a.assignment_id || a.assignmentId || a.id
            return aId && String(aId) === String(directAssignmentId)
          })
          if (exists) {
            assignmentId = directAssignmentId
            console.log('[submitReport] Using direct assignmentId from selectedAssignment:', assignmentId)
          }
        }
      }
      
      // If still not found, try to create assignment
      if (!assignmentId && appointmentId) {
        console.log('[submitReport] No assignment found, attempting to create for appointment:', appointmentId)
        try {
          const newAssignment = await staffAPI.createAssignment({
            appointment_id: appointmentId,
            technician_id: currentUserId
          })
          // API returns: { message: "...", assignment: { ... } }
          // Try multiple field names for assignment_id
          assignmentId = newAssignment.assignment?.assignment_id
            || newAssignment.assignment?.assignmentId
            || newAssignment.assignment?.id
            || newAssignment.assignmentId
            || newAssignment.id
            || newAssignment.assignment_id
          console.log('[submitReport] Created assignment response:', newAssignment)
          console.log('[submitReport] Extracted assignmentId:', assignmentId)
          if (assignmentId) {
            setAssignments(prev => {
              const updated = Array.isArray(prev) ? [...prev] : []
              if (newAssignment.assignment) {
                updated.push(newAssignment.assignment)
              } else if (newAssignment) {
                updated.push(newAssignment)
              }
              return updated
            })
          } else {
            console.warn('[submitReport] Created assignment but no assignment_id in response, reloading assignments...')
            // Reload assignments to get the newly created assignment_id
            try {
              const reloadedAssignments = await staffAPI.getAssignments()
              console.log('[submitReport] Reloaded assignments count after create:', reloadedAssignments.length)
              const existingAssignment = reloadedAssignments.find(a => {
                const aAppointmentId = a.appointmentId || a.appointment_id || a.appointment?.id || a.appointment?.appointmentId
                return aAppointmentId && String(aAppointmentId) === String(appointmentId)
              })
              if (existingAssignment) {
                assignmentId = existingAssignment.assignment_id || existingAssignment.assignmentId || existingAssignment.id
                console.log('[submitReport] Found assignment_id after reload:', assignmentId)
                setAssignments(reloadedAssignments)
              } else {
                console.error('[submitReport] Cannot find assignment after reload:', reloadedAssignments)
              }
            } catch (reloadErr) {
              console.error('[submitReport] Failed to reload assignments after create:', reloadErr)
            }
          }
        } catch (assignErr) {
          console.warn('[submitReport] Could not create assignment, fetching latest list:', assignErr)
          try {
          const reloadedAssignments = await staffAPI.getAssignments()
          console.log('[submitReport] Reloaded assignments count:', reloadedAssignments.length)
            const existingAssignment = reloadedAssignments.find(a => {
              const aAppointmentId = a.appointmentId || a.appointment_id || a.appointment?.id || a.appointment?.appointmentId
              return aAppointmentId && String(aAppointmentId) === String(appointmentId)
            })
          if (existingAssignment) {
              assignmentId = existingAssignment.assignment_id || existingAssignment.assignmentId || existingAssignment.id
            console.log('[submitReport] Found assignment after reload:', assignmentId, existingAssignment)
            setAssignments(reloadedAssignments)
          } else {
            console.error('[submitReport] Still cannot find assignment after reload')
            console.error('[submitReport] Reloaded assignments:', reloadedAssignments)
            alert('❌ Lỗi: Không thể tìm hoặc tạo phân công. Vui lòng thử lại.')
            return
          }
          } catch (reloadErr) {
            console.error('[submitReport] Failed to reload assignments:', reloadErr)
            alert('❌ Lỗi: Không thể tải danh sách phân công. Vui lòng thử lại.')
            return
          }
        }
      }
      
      if (!assignmentId) {
        console.error('[submitReport] Cannot determine assignmentId')
        console.error('[submitReport] selectedAssignment:', selectedAssignment)
        console.error('[submitReport] assignments:', assignments)
        alert('❌ Lỗi: Không thể xác định assignmentId. Vui lòng thử lại.')
        return
      }
      
      // Prepare report data - Backend requires: assignmentId, vehicleId, technicianId, workPerformed
      const reportPayload = {
        assignmentId: assignmentId,
        vehicleId: vehicleId,
        technicianId: currentUserId,
        workPerformed: reportData.workPerformed || '',
        issuesFound: reportData.issuesFound || '',
        partsUsed: reportData.partsReplaced || '', // Backend uses partsUsed, not partsReplaced
        recommendations: reportData.recommendations || ''
      }
      
      console.log('[submitReport] Sending report:', reportPayload)
      await staffAPI.createMaintenanceReport(reportPayload)
      
      setShowReportModal(false)
      setSelectedAssignment(null)
      await loadData() // Wait for data reload
      try {
        localStorage.setItem('maintenanceReportsUpdated', Date.now().toString())
        window.dispatchEvent(new Event('maintenance-reports-updated'))
      } catch (storageError) {
        console.warn('[Technician] Failed to dispatch maintenance report update event:', storageError)
      }
      alert('✅ Đã gửi báo cáo bảo dưỡng!')
    } catch (err) {
      console.error('Error submitting report:', err)
      alert('❌ Lỗi gửi báo cáo: ' + (err.message || 'Vui lòng thử lại'))
      await loadData() // Reload on error
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
            { key: 'assignments', label: 'Công việc' },
            { key: 'checklists', label: 'Checklists' },
            { key: 'reports', label: 'Báo cáo' }
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

            {/* Service Orders từ Maintenance Service */}
            {myServiceOrders.length > 0 && (
              <div className="mb-6">
                <div className="space-y-4">
                  {myServiceOrders.map(order => {
                    // Find payment by appointment_id để lấy payment status chính xác
                    const appointment = appointments.find(a => 
                      a.id === order.appointmentId || 
                      a.appointmentId === order.appointmentId ||
                      a.id === order.appointment?.id ||
                      a.appointmentId === order.appointment?.appointmentId
                    )
                    const payment = payments.find(p => 
                      p.appointmentId === order.appointmentId ||
                      p.appointment_id === order.appointmentId ||
                      (appointment && (p.appointmentId === appointment.id || p.appointment_id === appointment.id || p.appointmentId === appointment.appointmentId || p.appointment_id === appointment.appointmentId))
                    )
                    // Ưu tiên payment status từ bảng payments, nếu không có thì dùng từ service order
                    const actualPaymentStatus = payment?.status || order.paymentStatus
                    const paymentStatus = normalizePaymentStatus(actualPaymentStatus)
                    // Find vehicle by id or vehicleId
                    const vehicle = vehicles.find(v => 
                      v.id === order.vehicleId || 
                      v.vehicleId === order.vehicleId
                    )
                    // Try to find customer by customerId or userId
                    // appointment.customerId is customer_id in customers table
                    const customer = customers.find(c => {
                      const cId = c.id || c.customerId || c.customer_id
                      const aCustomerId = appointment?.customerId || appointment?.customer_id
                      const cUserId = c.userId || c.user_id
                      const aUserId = appointment?.userId || appointment?.user_id
                      const match = cId === aCustomerId || cUserId === aCustomerId || cId === aUserId || cUserId === aUserId
                      if (match && order.orderId === 14) {
                        console.log('[Technician] Found customer for order 14:', {
                          customer: c,
                          appointmentCustomerId: aCustomerId,
                          customerId: cId,
                          customerUserId: cUserId
                        })
                      }
                      return match
                    })
                    // Find service by id or serviceId
                    const service = services.find(s => 
                      s.id === appointment?.serviceId || 
                      s.serviceId === appointment?.serviceId
                    )
                    
                    return (
                      <div key={order.orderId || order.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl font-bold text-gray-900">Phiếu bảo dưỡng #{order.orderId || order.id}</span>
                            {appointment && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {service 
                                    ? (service.name || service.serviceName || `Lịch hẹn #${appointment.id || appointment.appointmentId}`)
                                    : appointment?.serviceId 
                                      ? (getServiceName(appointment.serviceId) || `Lịch hẹn #${appointment.id || appointment.appointmentId}`)
                                      : `Lịch hẹn #${appointment.id || appointment.appointmentId}`
                                  }
                                </span>
                            )}
                          </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Dịch vụ:</span> {
                                appointment?.serviceId 
                                  ? getServiceName(appointment.serviceId) 
                                  : service 
                                    ? (service.name || service.serviceName || 'N/A')
                                    : 'N/A'
                              }
                            </p>
                          </div>
                          <select
                            value={normalizeStatus(order.status) || 'queued'}
                            onChange={(e) => handleUpdateServiceOrderStatus(order.orderId || order.id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border-0 cursor-pointer ${
                              normalizeStatus(order.status) === 'queued' ? 'bg-yellow-100 text-yellow-800' :
                              normalizeStatus(order.status) === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              normalizeStatus(order.status) === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                            }`}
                            disabled={normalizeStatus(order.status) === 'completed'}
                          >
                            <option value="queued">⏳ Chờ</option>
                            <option value="in_progress">🔧 Đang làm</option>
                            <option value="completed">✅ Hoàn tất</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm bg-white p-3 rounded-lg border border-gray-200">
                          {customer && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">👤 Khách hàng</p>
                                <p className="font-semibold text-gray-900">
                                {customer.fullName || customer.name || customer.full_name || 
                                   (customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : customer.firstName || customer.lastName) || 
                                   'N/A'}
                                </p>
                              {(customer.email || customer.email_address) && (
                                <p className="text-sm text-gray-600">
                                  {customer.email || customer.email_address}
                                </p>
                              )}
                              {customer.phone && (
                                <p className="text-xs text-gray-500 mt-1">📞 {customer.phone}</p>
                              )}
                              {!customer.email && !customer.phone && !(customer.fullName || customer.name || customer.full_name) && (
                                <p className="text-sm text-gray-500">ID: {customer.id || customer.customerId || 'N/A'}</p>
                              )}
                            </div>
                          )}
                          {vehicle && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">🚗 Xe</p>
                              <p className="font-semibold text-gray-900">{getVehicleInfo(vehicle.id)}</p>
                            </div>
                          )}
                          {appointment && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">📅 Thời gian hẹn</p>
                              <p className="font-semibold text-gray-900">
                                {appointment.appointmentDate 
                                  ? new Date(appointment.appointmentDate).toLocaleDateString('vi-VN', { 
                                      weekday: 'short', 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })
                                  : appointment.requestedDateTime
                                    ? new Date(appointment.requestedDateTime).toLocaleDateString('vi-VN', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })
                                    : 'N/A'
                                }
                              </p>
                              {(appointment.appointmentTime || appointment.requestedTime) && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {appointment.appointmentTime || appointment.requestedTime}
                              </p>
                              )}
                            </div>
                          )}
                          {order.totalAmount != null && Number(order.totalAmount) > 0 && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">💰 Tổng tiền</p>
                              <p className="font-semibold text-green-600">{Number(order.totalAmount).toLocaleString('vi-VN')} VNĐ</p>
                            </div>
                          )}
                          {order.paymentStatus && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">💳 Trạng thái thanh toán</p>
                              <p className={`font-semibold ${
                                paymentStatus === 'paid' ? 'text-green-600' :
                                paymentStatus === 'pending' ? 'text-yellow-600' :
                                paymentStatus === 'partially_paid' ? 'text-orange-500' :
                                'text-red-600'
                              }`}>
                                {paymentStatus === 'paid' ? '✅ Đã thanh toán' :
                                 paymentStatus === 'pending' ? '⏳ Chờ thanh toán' :
                                 paymentStatus === 'partially_paid' ? '🟧 Đã thanh toán một phần' :
                                 '❌ Chưa thanh toán'}
                              </p>
                            </div>
                          )}
                          {order.createdAt && (
                            <div>
                              <p className="text-gray-500 text-xs mb-1">📝 Ngày tạo</p>
                              <p className="font-semibold text-gray-900 text-xs">
                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {appointment?.notes && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-gray-600 font-medium mb-1">📋 Ghi chú từ khách hàng:</p>
                            <p className="text-sm text-gray-700">{appointment.notes}</p>
                          </div>
                        )}

                        {/* Quản lý tiến trình: chờ - đang làm - hoàn tất */}
                        <div className="flex gap-2 pt-3 border-t">
                          {normalizeStatus(order.status) === 'queued' && (
                            <button
                              onClick={() => handleAcceptAssignment(order.orderId || order.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                            >
                              ✅ Đồng ý nhận công việc
                            </button>
                          )}
                          
                          {normalizeStatus(order.status) === 'completed' && (
                            <span className="text-sm text-gray-600 italic">✅ Đã hoàn thành công việc</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Legacy Assignments từ Staff Service */}
            {myAssignments.length > 0 && (
              <div className={myServiceOrders.length > 0 ? 'mt-6' : ''}>
                {myServiceOrders.length > 0 && (
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Phân công khác</h4>
                )}
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
              </div>
            )}

            {myServiceOrders.length === 0 && myAssignments.length === 0 && (
              <p className="text-gray-600 text-center py-8">Chưa có công việc nào được phân công</p>
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

            {/* Service Order Checklists (from Maintenance Service) */}
            {myServiceOrders.length > 0 && (
              <div className="mb-6">
                {/* Hiển thị danh sách service orders với checklist hoặc nút tạo checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {myServiceOrders.map(order => {
                    const orderId = order.orderId || order.id
                    const orderChecklist = serviceOrderChecklists[orderId] || []
                    // Find appointment by id or appointmentId
                    const appointment = appointments.find(a => 
                      a.id === order.appointmentId || 
                      a.appointmentId === order.appointmentId ||
                      a.id === order.appointment?.id ||
                      a.appointmentId === order.appointment?.appointmentId
                    )
                    // Find vehicle by id or vehicleId
                    const vehicle = vehicles.find(v => 
                      v.id === order.vehicleId || 
                      v.vehicleId === order.vehicleId
                    )
                    // Find service by id or serviceId
                    const service = services.find(s => 
                      s.id === appointment?.serviceId || 
                      s.serviceId === appointment?.serviceId
                    )
                    const hasChecklist = orderChecklist.length > 0
                    
                    return (
                      <div key={orderId} className="border rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base font-bold text-gray-900">Phiếu bảo dưỡng #{orderId}</span>
                              {appointment && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Lịch hẹn #{appointment.id}</span>
                              )}
                            </div>
                            {(service || appointment?.serviceId) && (
                              <p className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">Dịch vụ:</span> {
                                  appointment?.serviceId 
                                    ? getServiceName(appointment.serviceId) 
                                    : service 
                                      ? (service.name || service.serviceName || 'N/A')
                                      : 'N/A'
                                }
                              </p>
                            )}
                            {vehicle && (
                              <p className="text-xs text-gray-600">🚗 {getVehicleInfo(vehicle.id)}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                            normalizeStatus(order.status) === 'queued' ? 'bg-yellow-100 text-yellow-800' :
                            normalizeStatus(order.status) === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            normalizeStatus(order.status) === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {normalizeStatus(order.status) === 'queued' ? '⏳ Chờ' :
                             normalizeStatus(order.status) === 'in_progress' ? '🔧 Đang làm' :
                             normalizeStatus(order.status) === 'completed' ? '✅ Hoàn tất' : normalizeStatus(order.status)}
                          </span>
                        </div>
                        
                        {!hasChecklist ? (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-gray-700 mb-3">
                              {checklistErrors[orderId] 
                                ? `⚠️ Lỗi tải checklist: ${checklistErrors[orderId]}` 
                                : 'Chưa có checklist cho phiếu bảo dưỡng này.'}
                            </p>
                            {normalizeStatus(order.status) === 'in_progress' && (
                              <button
                                onClick={() => handleCreateChecklist(orderId)}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                              >
                                ➕ Tạo Checklist
                              </button>
                            )}
                            {normalizeStatus(order.status) === 'queued' && (
                              <div className="space-y-2">
                                <p className="text-xs text-gray-600 mb-2">Vui lòng bắt đầu công việc để tạo checklist</p>
                                <button
                                  onClick={() => handleAcceptAssignment(orderId)}
                                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                >
                                  🚀 Bắt đầu công việc
                                </button>
                              </div>
                            )}
                            {normalizeStatus(order.status) !== 'in_progress' && normalizeStatus(order.status) !== 'queued' && (
                              <p className="text-xs text-gray-500 italic">Vui lòng bắt đầu công việc để tạo checklist</p>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-gray-700">Danh sách kiểm tra:</p>
                              <span className="text-xs text-gray-500">
                                {orderChecklist.filter(item => item.isCompleted).length} / {orderChecklist.length} hoàn thành
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {orderChecklist.map(item => {
                                const itemId = item.checklistId || item.id
                                const isCompleted = item.isCompleted || false
                                
                                return (
                                  <div 
                                    key={itemId} 
                                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                      isCompleted 
                                        ? 'bg-green-50 border-green-200' 
                                        : 'bg-white border-gray-200 hover:border-blue-300'
                                    }`}
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={isCompleted} 
                                      onChange={() => handleCompleteChecklistItem(orderId, itemId, !isCompleted, item.itemName)}
                                      disabled={normalizeStatus(order.status) === 'completed'}
                                      className="w-5 h-5 mt-0.5 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                      <span className={`text-sm font-medium ${
                                        isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
                                      }`}>
                                        {item.itemName}
                                      </span>
                                      {isCompleted && item.completedAt && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Hoàn thành: {new Date(item.completedAt).toLocaleString('vi-VN')}
                                        </p>
                                      )}
                                      {item.notes && (
                                        <p className="text-xs text-gray-600 mt-1 italic">
                                          📝 {item.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            
                            {/* Progress bar - với guard để tránh chia cho 0 */}
                            {orderChecklist.length > 0 && (
                              <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ 
                                      width: `${(orderChecklist.filter(item => item.isCompleted).length / orderChecklist.length) * 100}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Legacy Checklists (from Staff Service) */}
            {myAssignments.length > 0 && (
              <div className={myServiceOrders.length > 0 ? 'mt-6' : ''}>
                {myServiceOrders.length > 0 && (
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Checklists từ Phân công</h4>
                )}
            {checklists.filter(c => myAssignments.some(a => a.id === c.assignmentId)).length === 0 ? (
                  <p className="text-gray-500 text-sm">Chưa có checklist nào cho phân công</p>
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

            {/* Empty state */}
            {myServiceOrders.length === 0 && myAssignments.length === 0 && (
              <p className="text-gray-600 text-center py-8">Chưa có công việc nào được phân công</p>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Báo cáo bảo dưỡng</h3>
              <button onClick={loadData} className="px-3 py-1 border rounded-md hover:bg-gray-50">
                🔄 Làm mới
              </button>
            </div>

            {/* Service Orders có thể tạo báo cáo */}
            {myServiceOrders.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Phiếu bảo dưỡng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {myServiceOrders
                    .filter(order => normalizeStatus(order.status) === 'in_progress' || normalizeStatus(order.status) === 'completed')
                    .map(order => {
                      const orderId = order.orderId || order.id
                      const appointment = appointments.find(a => 
                        a.id === order.appointmentId || 
                        a.appointmentId === order.appointmentId ||
                        a.id === order.appointment?.id ||
                        a.appointmentId === order.appointment?.appointmentId
                      )
                      const vehicle = vehicles.find(v => 
                        v.id === order.vehicleId || 
                        v.vehicleId === order.vehicleId
                      )
                      const customer = customers.find(c => 
                        c.id === appointment?.customerId || 
                        c.customerId === appointment?.customerId ||
                        c.userId === appointment?.customerId ||
                        c.id === appointment?.userId ||
                        c.userId === appointment?.userId
                      )
                      const service = services.find(s => 
                        s.id === appointment?.serviceId || 
                        s.serviceId === appointment?.serviceId
                      )
                      // Find assignment by appointmentId to check if report exists
                      const relatedAssignment = assignments.find(a => {
                        const aAppointmentId = a.appointmentId || a.appointment?.id || a.appointment?.appointmentId
                        const orderAppointmentId = order.appointmentId
                        return aAppointmentId && orderAppointmentId && (
                          aAppointmentId === orderAppointmentId ||
                          aAppointmentId.toString() === orderAppointmentId.toString()
                        )
                      })
                      
                      // Check if report exists for this assignment or order
                      const hasReport = relatedAssignment 
                        ? maintenanceReports.some(r => {
                            const rAssignmentId = r.assignmentId || r.assignment_id
                            const assignmentId = relatedAssignment.id || relatedAssignment.assignmentId || relatedAssignment.assignment_id
                            return rAssignmentId && assignmentId && (
                              rAssignmentId === assignmentId ||
                              rAssignmentId.toString() === assignmentId.toString()
                            )
                          })
                        : maintenanceReports.some(r => 
                            r.assignmentId === orderId || 
                            r.serviceOrderId === orderId ||
                            (r.appointmentId && r.appointmentId === order.appointmentId)
                          )
                      
                      return (
                        <div key={orderId} className="border rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-base font-bold text-gray-900">
                                  {appointment 
                                    ? `Lịch hẹn #${appointment.id || appointment.appointmentId}`
                                    : `Phiếu bảo dưỡng #${orderId}`
                                  }
                                </span>
                                {appointment && orderId && (appointment.id || appointment.appointmentId) !== orderId && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Order: #{orderId}</span>
                                )}
                              </div>
                              {(service || appointment?.serviceId) && (
                                <p className="text-xs text-gray-600 mb-1">
                                  <span className="font-medium">Dịch vụ:</span> {
                                    appointment?.serviceId 
                                      ? getServiceName(appointment.serviceId) 
                                      : service 
                                        ? (service.name || service.serviceName || 'N/A')
                                        : 'N/A'
                                  }
                                </p>
                              )}
                              {vehicle && (
                                <p className="text-xs text-gray-600">🚗 {getVehicleInfo(vehicle.id)}</p>
                              )}
                              {customer && (
                                <p className="text-xs text-gray-600 mt-1">
                                  👤 {customer.fullName || customer.name || customer.email || 'N/A'}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                              normalizeStatus(order.status) === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              normalizeStatus(order.status) === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {normalizeStatus(order.status) === 'in_progress' ? '🔧 Đang làm' :
                               normalizeStatus(order.status) === 'completed' ? '✅ Hoàn tất' : normalizeStatus(order.status)}
                            </span>
                          </div>
                          
                          <div className="mt-4">
                            {hasReport ? (
                              <button
                                disabled
                                className="w-full px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed text-sm font-medium"
                              >
                                ✅ Đã báo cáo
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenReport({ 
                                  id: orderId, 
                                  orderId: orderId,
                                  appointmentId: order.appointmentId,
                                  vehicleId: order.vehicleId,
                                  // Pass order data for vehicle lookup
                                  order: order
                                })}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                              >
                                📝 Tạo báo cáo
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Báo cáo đã tạo */}
            {maintenanceReports.filter(r => r.technicianId === currentUserId).length > 0 && (
              <div className={myServiceOrders.length > 0 ? 'mt-6' : ''}>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Báo cáo đã tạo</h4>
              <div className="space-y-4">
                {maintenanceReports
                  .filter(r => r.technicianId === currentUserId)
                    .map(report => {
                      // Tìm service order liên quan
                      const relatedOrder = myServiceOrders.find(o => 
                        (o.orderId || o.id) === report.assignmentId || 
                        (o.orderId || o.id) === report.serviceOrderId
                      )
                      const appointment = relatedOrder ? appointments.find(a => 
                        a.id === relatedOrder.appointmentId || 
                        a.appointmentId === relatedOrder.appointmentId
                      ) : null
                      const vehicle = relatedOrder ? vehicles.find(v => 
                        v.id === relatedOrder.vehicleId || 
                        v.vehicleId === relatedOrder.vehicleId
                      ) : null
                      
                      return (
                        <div key={report.id} className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-white">
                      <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-medium text-gray-900">Báo cáo #{report.id}</span>
                                {relatedOrder && (
                                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    Phiếu bảo dưỡng #{relatedOrder.orderId || relatedOrder.id}
                                  </span>
                                )}
                                {report.assignmentId && !relatedOrder && (
                                  <span className="text-sm text-gray-500">Phân công #{report.assignmentId}</span>
                                )}
                        </div>
                              {vehicle && (
                                <p className="text-xs text-gray-600">🚗 {getVehicleInfo(vehicle.id)}</p>
                              )}
                              {appointment && (
                                <p className="text-xs text-gray-600 mt-1">
                                  📅 {appointment.appointmentDate 
                                    ? new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')
                                    : 'N/A'}
                                </p>
                              )}
                        </div>
                        {/* Only show status if report is submitted and awaiting approval */}
                        {report.approved && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Đã phê duyệt
                          </span>
                        )}
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
                      )
                    })}
                </div>
              </div>
          )}

            {/* Empty state */}
            {myServiceOrders.filter(o => normalizeStatus(o.status) === 'in_progress' || normalizeStatus(o.status) === 'completed').length === 0 && 
             maintenanceReports.filter(r => r.technicianId === currentUserId).length === 0 && (
              <p className="text-gray-600 text-center py-8">Chưa có báo cáo nào</p>
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
          vehicles={vehicles}
          appointments={appointments}
          services={services}
          getServiceName={getServiceName}
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
function ReportModal({ assignment, vehicles, appointments, services, getServiceName, onClose, onSubmit, getVehicleInfo }) {
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

  // Find appointment from assignment to get service name and appointment ID
  const appointment = appointments?.find(a => 
    a.id === assignment.appointmentId || 
    a.appointmentId === assignment.appointmentId ||
    a.id === assignment.appointment?.id ||
    a.appointmentId === assignment.appointment?.appointmentId ||
    (assignment.order && (a.id === assignment.order.appointmentId || a.appointmentId === assignment.order.appointmentId))
  )
  
  // Get appointment ID (priority) or order ID (fallback)
  const appointmentId = appointment?.id || appointment?.appointmentId || assignment.appointmentId || assignment.appointment_id
  const orderId = assignment.orderId || assignment.id
  // Display appointment ID if available, otherwise order ID
  const displayId = appointmentId || orderId
  
  // Get service name
  let serviceName = null
  if (appointment) {
    const service = services?.find(s => 
      s.id === appointment.serviceId || 
      s.serviceId === appointment.serviceId
    )
    serviceName = service?.name || service?.serviceName || (appointment.serviceId ? getServiceName(appointment.serviceId) : null)
  }

  // Get vehicle info - support both assignment.vehicleId and order.vehicleId
  const vehicleId = assignment.vehicleId || (assignment.order?.vehicleId) || (appointment?.vehicleId) || null
  let vehicle = null
  let vehicleInfo = 'N/A'
  
  // Find vehicle from vehicles array
  if (vehicleId && vehicles && vehicles.length > 0) {
    vehicle = vehicles.find(v => {
      const vId = v.id || v.vehicleId
      const vIdStr = vId ? vId.toString() : ''
      const searchIdStr = vehicleId ? vehicleId.toString() : ''
      return vIdStr === searchIdStr || 
             (v.id && v.id.toString() === searchIdStr) ||
             (v.vehicleId && v.vehicleId.toString() === searchIdStr)
    })
  }
  
  if (vehicle) {
    vehicleInfo = `${vehicle.model || 'N/A'} (${vehicle.licensePlate || 'N/A'})`
  } else if (vehicleId) {
    vehicleInfo = getVehicleInfo(vehicleId)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Báo cáo bảo dưỡng</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Phiếu bảo dưỡng:</span> {
                serviceName 
                  ? `${serviceName} (#${displayId})`
                  : `#${displayId}`
              }
              {appointmentId && orderId && appointmentId !== orderId && (
                <span className="text-xs text-gray-400 ml-2">(Order: #{orderId})</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Xe:</span> {vehicleInfo}
            </p>
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
