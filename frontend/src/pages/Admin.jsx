import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getCurrentUserId, loadList, loadGlobalList, saveGlobalList } from '../lib/store'
import { staffAPI, adminAPI, partsInventoryAPI, maintenanceAPI, customerAPI } from '../lib/api.js'
import RoleBasedNav from '../components/RoleBasedNav'

function Admin() {
  const userId = useMemo(() => getCurrentUserId(), [])
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  // Use real service receipts instead of local 'records'
  const [serviceReceipts, setServiceReceipts] = useState([])
  const [maintenanceReports, setMaintenanceReports] = useState([])
  const [serviceOrders, setServiceOrders] = useState([]) // Service orders để link với checklist
  const [checklists, setChecklists] = useState({}) // Map orderId -> checklist items: {orderId: [items]}
  const [customers, setCustomers] = useState([])
  const [payments, setPayments] = useState([]) // Payments để tính chi phí chưa thanh toán
  const [expandedCustomers, setExpandedCustomers] = useState(new Set()) // Track expanded customer rows
  const [services, setServices] = useState([]) // Services để hiển thị tên dịch vụ
  const [parts, setParts] = useState([])
  const [assignments, setAssignments] = useState([])
  const [bookingsState, setBookingsState] = useState([])
  const [adminSummary, setAdminSummary] = useState(null)
  const [techniciansCount, setTechniciansCount] = useState(null)
  const [staffCount, setStaffCount] = useState(null)
  const [staffMembers, setStaffMembers] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [adminActivities, setAdminActivities] = useState({ recentBookings: [], recentCompletedReceipts: [] })
  // Modal edit user (staff/technician)
  const [editUserModal, setEditUserModal] = useState({ open: false, user: null, role: 'staff', fullName: '', email: '', phone: '' })
  // Modal add user (staff/technician)
  const [addUserModal, setAddUserModal] = useState({ open: false, role: 'staff', fullName: '', email: '', phone: '', password: '' })
  
  // Modal states for View Customer
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showAllBookings, setShowAllBookings] = useState(false)
  const [showAllServiceRecords, setShowAllServiceRecords] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  // Modal states for View Report
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  
  // Modal states for Chat
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedChatCustomer, setSelectedChatCustomer] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  // Finance filters - Lấy từ bảng payments (giống backend)
  const [financeFilter, setFinanceFilter] = useState({ period: 'all' })
  const filteredPayments = useMemo(() => {
    const list = Array.isArray(payments) ? payments : []
    console.log('[Admin] Filtering payments. Total:', list.length, 'Filter:', financeFilter.period)
    
    if (financeFilter.period === 'all') {
      console.log('[Admin] Returning all payments:', list.length)
      return list
    }
    
    const now = new Date()
    const filtered = list.filter(p => {
      // Lấy ngày từ payment_date hoặc paymentDate
      const paymentDate = p.paymentDate || p.payment_date || p.createdAt || p.created_at
      if (!paymentDate) {
        console.log('[Admin] Payment missing date:', p)
        return false
      }
      const d = new Date(paymentDate)
      
      if (financeFilter.period === 'month') {
        const match = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        return match
      }
      if (financeFilter.period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3)
        const match = d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q
        return match
      }
      if (financeFilter.period === 'year') {
        const match = d.getFullYear() === now.getFullYear()
        return match
      }
      return true
    })
    
    console.log('[Admin] Filtered payments count:', filtered.length)
    return filtered
  }, [payments, financeFilter])
  
  // Giữ filteredReceipts để tương thích với exportFinanceCSV (nếu cần)
  const filteredReceipts = useMemo(() => {
    const list = Array.isArray(serviceReceipts) ? serviceReceipts : []
    if (financeFilter.period === 'all') return list
    const now = new Date()
    return list.filter(r => {
      const d = new Date(r.completedAt || r.date || r.updatedAt || now)
      if (financeFilter.period === 'month') {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      }
      if (financeFilter.period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3)
        return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === q
      }
      if (financeFilter.period === 'year') {
        return d.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [serviceReceipts, financeFilter])

  const exportFinanceCSV = () => {
    const rows = [['Ngày', 'Khách hàng', 'Xe', 'Dịch vụ', 'Số tiền', 'Trạng thái']]
    filteredPayments.forEach(payment => {
      // Tìm appointment từ payment.appointmentId
      const appointment = (bookings || []).find(b => 
        (b.id || b.appointmentId) === (payment.appointmentId || payment.appointment_id)
      )
      
      // Tìm vehicle từ appointment hoặc payment
      const vehicleId = appointment?.vehicleId || appointment?.vehicle_id || payment.vehicleId || payment.vehicle_id
      const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === vehicleId)
      
      // Tìm customer từ payment.customerId hoặc từ vehicle
      const customerId = payment.customerId || payment.customer_id || (vehicle?.customer_id || vehicle?.customerId)
      const customer = customers.find(c => (c.customer_id || c.id || c.user_id) === customerId)
      
      // Tìm service từ appointment
      const serviceId = appointment?.serviceId || appointment?.service_id
      const service = services.find(s => (s.id || s.serviceId) === serviceId)
      
      const dateVal = payment.paymentDate || payment.payment_date || payment.createdAt || payment.created_at
      const amount = Number(payment.amount || 0)
      const status = payment.status || ''
      
      rows.push([
        dateVal ? new Date(dateVal).toLocaleDateString('vi-VN') : '',
        customer?.full_name || customer?.fullName || '',
        vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() : '',
        service?.name || appointment?.serviceType || appointment?.service || '',
        String(amount),
        String(status)
      ])
    })
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'finance.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadMaintenanceReports = async () => {
    try {
      const reports = await staffAPI.getMaintenanceReports()
      if (Array.isArray(reports)) {
        setMaintenanceReports(reports)
        saveGlobalList('maintenanceReports', reports)
      } else {
        setMaintenanceReports([])
      }
    } catch (e) {
      console.warn('[Admin] Failed to load maintenance reports from API, fallback local:', e)
      const localReports = loadGlobalList('maintenanceReports', [])
      setMaintenanceReports(Array.isArray(localReports) ? localReports : [])
    }
  }

  // Load service orders để link với checklist
  const loadServiceOrders = async () => {
    try {
      // Load tất cả service orders (Admin có thể xem tất cả)
      const orders = await maintenanceAPI.getServiceOrders().catch(() => [])
      if (Array.isArray(orders)) {
        setServiceOrders(orders)
      } else {
        setServiceOrders([])
      }
    } catch (e) {
      console.warn('[Admin] Failed to load service orders:', e)
      setServiceOrders([])
    }
  }

  // Load checklists cho các service orders
  const loadChecklists = async () => {
    try {
      const checklistMap = {}
      // Load checklist cho mỗi service order
      const checklistPromises = serviceOrders.map(async (order) => {
        try {
          const orderId = order.orderId || order.id
          if (!orderId) return null
          const checklist = await maintenanceAPI.getServiceOrderChecklist(orderId)
          // Normalize checklist data
          const normalizedChecklist = Array.isArray(checklist) 
            ? checklist.map(item => ({
                ...item,
                checklistId: item.checklistId || item.id || item.checklist_id,
                itemName: item.itemName || item.item_name,
                isCompleted: item.isCompleted !== undefined ? item.isCompleted : (item.is_completed === 1 || item.is_completed === true),
                completedBy: item.completedBy || item.completed_by,
                completedAt: item.completedAt || item.completed_at,
                notes: item.notes || ''
              }))
            : []
          return { orderId, checklist: normalizedChecklist }
        } catch (err) {
          console.warn(`[Admin] Failed to load checklist for order ${order.orderId || order.id}:`, err)
          return null
        }
      })
      
      const results = await Promise.all(checklistPromises)
      results.forEach(result => {
        if (result && result.orderId) {
          checklistMap[result.orderId] = result.checklist
          console.log(`[Admin] Loaded checklist for order ${result.orderId}: ${result.checklist.length} items`)
        }
      })
      console.log('[Admin] Total checklists loaded:', Object.keys(checklistMap).length, 'orders')
      setChecklists(checklistMap)
    } catch (e) {
      console.warn('[Admin] Failed to load checklists:', e)
    }
  }

  // Load checklists khi service orders thay đổi
  useEffect(() => {
    if (serviceOrders.length > 0) {
      loadChecklists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceOrders.length])

  useEffect(() => {
    if (!userId) return
    loadAdminData()
    loadMaintenanceReports()
    loadServiceOrders()
    // Listen storage changes to update live
    const onStorage = (e) => {
      if (e.key === 'bookings') {
        loadBookingsData()
      }
      if (e.key === 'maintenanceReportsUpdated') {
        loadMaintenanceReports()
      }
    }
    const onLocalUpdated = () => {
      loadBookingsData()
    }
    const onReportsUpdated = () => {
      loadMaintenanceReports()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('local-bookings-updated', onLocalUpdated)
    window.addEventListener('maintenance-reports-updated', onReportsUpdated)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('local-bookings-updated', onLocalUpdated)
      window.removeEventListener('maintenance-reports-updated', onReportsUpdated)
    }
  }, [userId])

  const loadAdminData = async () => {
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'))
    // Vehicles from API (fallback local if API fails)
    try {
      const apiVehicles = await staffAPI.getVehicles()
      setVehicles(apiVehicles || [])
    } catch (e) {
      console.warn('[Admin] Failed to load vehicles from API, fallback local:', e)
      setVehicles(loadList('vehicles', []))
    }

    // Customers from API
    try {
      const apiCustomers = await staffAPI.getCustomers()
      setCustomers(apiCustomers || [])
      console.log('[Admin] Loaded customers from API:', (apiCustomers || []).length)
    } catch (e) {
      console.warn('[Admin] Failed to load customers from API, fallback local:', e)
      // Fallback: build from local users if any
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]').filter(u => u.role === 'customer' || !u.role)
      const mapped = localUsers.map(u => ({ customer_id: u.id, user_id: u.id, full_name: u.fullName, email: u.email }))
      setCustomers(mapped)
    }
    // Service receipts from API (fallback local if API fails)
    try {
      const receipts = await staffAPI.getServiceReceipts()
      setServiceReceipts(receipts || [])
    } catch (e) {
      console.warn('[Admin] Failed to load service receipts from API, fallback local:', e)
      setServiceReceipts(loadList('records', []))
    }
    // Load assignments from API
    try {
      const apiAssignments = await staffAPI.getAssignments()
      setAssignments(apiAssignments || [])
    } catch (e) {
      console.warn('[Admin] Failed to load assignments from API, fallback local:', e)
      setAssignments(loadList('assignments', []))
    }

    // Load bookings from API
    await loadBookingsData()

    // Load parts from inventory service
    await loadPartsData()
    
    // Load services để hiển thị tên dịch vụ
    try {
      const svcs = await customerAPI.getServices()
      setServices(Array.isArray(svcs) ? svcs : [])
    } catch (e) {
      console.warn('[Admin] Failed to load services:', e)
      setServices([])
    }

    // Load payments để tính chi phí chưa thanh toán (giống backend)
    try {
      const allPayments = await customerAPI.getAllPayments()
      const paymentsList = Array.isArray(allPayments) ? allPayments : []
      setPayments(paymentsList)
      console.log('[Admin] Loaded payments from API:', paymentsList.length)
      console.log('[Admin] Payments data:', paymentsList.slice(0, 3)) // Debug: log first 3 payments
    } catch (e) {
      console.warn('[Admin] Failed to load payments:', e)
      setPayments([])
    }

    // Load technicians count (backup for dashboard if adminSummary missing)
    try {
      const techs = await staffAPI.getTechnicians()
      setTechnicians(techs || [])
      setTechniciansCount(Array.isArray(techs) ? techs.length : 0)
    } catch (e) {
      console.warn('[Admin] Failed to load technicians list:', e)
      setTechniciansCount(null)
    }

    // Load staff count via adminservice
    try {
      const sc = await adminAPI.getStaffCount()
      const cnt = typeof sc?.count === 'number' ? sc.count : Number(sc?.count || 0)
      setStaffCount(cnt)
    } catch (e) {
      console.warn('[Admin] Failed to load staff count:', e)
      setStaffCount(null)
    }

    // Load staff members list
    try {
      const sm = await staffAPI.getStaffMembers()
      setStaffMembers(sm || [])
    } catch (e) {
      console.warn('[Admin] Failed to load staff members list:', e)
      setStaffMembers([])
    }
    // Load admin dashboard summary via API Gateway
    try {
      const summary = await adminAPI.getDashboard()
      console.log('[Admin] Loaded admin summary from gateway:', summary)
      // Ensure all fields are properly set
      if (summary) {
        setAdminSummary({
          totalCustomers: summary.totalCustomers || 0,
          totalTechnicians: summary.totalTechnicians || 0,
          totalVehicles: summary.totalVehicles || 0,
          totalBookings: summary.totalBookings || 0,
          lowStockParts: summary.lowStockParts || 0,
          totalRevenue: summary.totalRevenue || 0,
          pendingPayments: summary.pendingPayments || 0
        })
      }
      // Load activities after summary
      try {
        const acts = await adminAPI.getActivities()
        setAdminActivities({
          recentBookings: Array.isArray(acts?.recentBookings) ? acts.recentBookings : [],
          recentCompletedReceipts: Array.isArray(acts?.recentCompletedReceipts) ? acts.recentCompletedReceipts : []
        })
      } catch (e) {
        console.warn('[Admin] Failed to load admin activities:', e)
        setAdminActivities({ recentBookings: [], recentCompletedReceipts: [] })
      }
    } catch (e) {
      console.warn('[Admin] Failed to load admin summary via gateway:', e)
      // Set empty summary on error to prevent rendering issues
      setAdminSummary({
        totalCustomers: 0,
        totalTechnicians: 0,
        totalVehicles: 0,
        totalBookings: 0,
        lowStockParts: 0,
        totalRevenue: 0,
        pendingPayments: 0
      })
    }
  }

  const loadBookingsData = async () => {
    try {
      // API only - no fallback
      const allBookings = await staffAPI.getAppointments()
      console.log('[Admin] Loaded bookings from API:', allBookings)
      setBookings(allBookings)
      setBookingsState(allBookings)
    } catch (error) {
      console.error('[Admin] Failed to load bookings:', error)
      setBookings([])
      setBookingsState([])
    }
  }

  const loadPartsData = async () => {
    try {
      const inventory = await partsInventoryAPI.getInventory()
      const normalized = (inventory || []).map(p => ({
        id: p.partId,
        name: p.name,
        currentStock: Number(p.quantityInStock ?? 0),
        minStock: Number(p.minStockLevel ?? 0),
        price: Number(p.unitPrice ?? 0)
      }))
      setParts(normalized)
      console.log('[Admin] Loaded parts from inventory service:', normalized.length)
    } catch (e) {
      console.warn('[Admin] Failed to load parts from inventory service, fallback local:', e)
      setParts(loadList('parts', []))
    }
  }

  // Handler for View Customer
  const handleViewCustomer = (customer) => {
    // Normalize selected customer fields for consistent usage
    const normalized = {
      ...customer,
      id: customer.customer_id || customer.user_id || customer.id,
      user_id: customer.user_id || customer.id,
      customer_id: customer.customer_id || customer.id,
      fullName: customer.fullName || customer.full_name,
      full_name: customer.full_name || customer.fullName
    }
    setSelectedCustomer(normalized)
    setShowViewModal(true)
    // Reset show all states when opening modal
    setShowAllBookings(false)
    setShowAllServiceRecords(false)
  }

  // Handler for Chat with Customer
  const handleChatCustomer = async (customer) => {
    const normalizedCustomer = {
      id: customer.id || customer.customer_id || customer.user_id,
      fullName: customer.fullName || customer.full_name || 'Khách hàng',
      email: customer.email || ''
    }
    setSelectedChatCustomer(normalizedCustomer)
    setShowChatModal(true)
    try {
      const conversation = await chatAPI.getConversation(normalizedCustomer.id)
      setChatMessages(conversation || [])
      await chatAPI.markConversationAsRead(normalizedCustomer.id).catch(() => {})
    } catch (err) {
      console.error('Failed to load conversation:', err)
      setChatMessages([])
    }
  }

  // Handler for sending message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChatCustomer) return
    
    const textToSend = newMessage.trim()
    setNewMessage('')
    try {
      const sentMsg = await chatAPI.sendMessage(selectedChatCustomer.id, textToSend)
      setChatMessages(prev => [...prev, sentMsg])
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Không thể gửi tin nhắn. Vui lòng thử lại!')
      setNewMessage(textToSend)
    }
  }

  // Polling for new messages in Admin chat modal
  useEffect(() => {
    if (!showChatModal || !selectedChatCustomer) return

    const fetchMessages = async () => {
      try {
        const conversation = await chatAPI.getConversation(selectedChatCustomer.id)
        setChatMessages(prev => {
          if (prev.length !== conversation.length) {
            chatAPI.markConversationAsRead(selectedChatCustomer.id).catch(() => {})
            return conversation
          }
          // Also check if any message text differs (just in case)
          const hasChanges = conversation.some((msg, idx) => {
            const prevMsg = prev[idx]
            return !prevMsg || prevMsg.messageId !== msg.messageId
          })
          if (hasChanges) {
            chatAPI.markConversationAsRead(selectedChatCustomer.id).catch(() => {})
            return conversation
          }
          return prev
        })
      } catch (err) {
        console.warn('Failed to poll new messages:', err)
      }
    }

    const intervalId = setInterval(fetchMessages, 3000)
    return () => clearInterval(intervalId)
  }, [showChatModal, selectedChatCustomer])

  // Dashboard Statistics
  const dashboardStats = useMemo(() => {
    const safeBookings = Array.isArray(bookings) ? bookings : []
    const safeParts = Array.isArray(parts) ? parts : []
    const safeVehicles = Array.isArray(vehicles) ? vehicles : []
    const safeReceipts = Array.isArray(serviceReceipts) ? serviceReceipts : Array.isArray(records) ? records : []

    // Prefer adminSummary (from DB via gateway) if available
    if (adminSummary) {
      // Fallback compute revenue/pending if API returns 0
      const computedRevenue = safeReceipts
        .filter(r => (String(r.status || '').toLowerCase() === 'done') || r.status === 'Hoàn tất' || r.approved === true)
        .reduce((sum, r) => sum + (Number(r.totalAmount ?? r.total ?? r.cost ?? r.amount ?? 0)), 0)
      
      // Calculate pending payments - BAO GỒM:
      // 1. Payments với status = 'pending'
      // 2. Appointments chưa có payment record (dùng service basePrice)
      // 3. Appointments có payment status != 'completed' (dùng payment amount hoặc service basePrice)
      
      const safePayments = Array.isArray(payments) ? payments : []
      
      // Bước 1: Tính từ payments với status = 'pending'
      const computedPendingFromPayments = safePayments
        .filter(p => {
          const status = String(p.status || '').toLowerCase()
          return status === 'pending'
        })
        .reduce((sum, p) => sum + (Number(p.amount || 0)), 0)
      
      // Bước 2: Tính từ appointments chưa thanh toán (chưa có payment hoặc payment status != 'completed')
      const safeBookings = Array.isArray(bookings) ? bookings : []
      const safeServices = Array.isArray(services) ? services : []
      
      const unpaidAppointmentsCost = safeBookings
        .filter(b => {
          // Tìm payment cho appointment này
          const appointmentId = b.appointmentId || b.id
          const relatedPayment = safePayments.find(p => 
            (p.appointmentId || p.appointment_id) === appointmentId
          )
          
          // Nếu không có payment hoặc payment status != 'completed', thì chưa thanh toán
          if (!relatedPayment) {
            return true // Chưa có payment = chưa thanh toán
          }
          
          const paymentStatus = String(relatedPayment.status || '').toLowerCase()
          return paymentStatus !== 'completed' && paymentStatus !== 'paid'
        })
        .reduce((sum, b) => {
          const appointmentId = b.appointmentId || b.id
          // Tìm payment cho appointment này
          const relatedPayment = safePayments.find(p => 
            (p.appointmentId || p.appointment_id) === appointmentId
          )
          
          // Nếu có payment với amount và status != 'completed', dùng amount
          if (relatedPayment && relatedPayment.amount) {
            const paymentStatus = String(relatedPayment.status || '').toLowerCase()
            if (paymentStatus !== 'completed' && paymentStatus !== 'paid') {
              return sum + Number(relatedPayment.amount || 0)
            }
          }
          
          // Nếu không có payment hoặc payment không có amount, dùng service basePrice
          const serviceId = b.serviceId || b.service_id
          const service = safeServices.find(s => 
            (s.serviceId || s.id) === serviceId
          )
          const servicePrice = service ? Number(service.basePrice || 0) : 0
          
          return sum + servicePrice
        }, 0)
      
      // Also check serviceReceipts as fallback
      const computedPendingFromReceipts = safeReceipts
        .filter(r => (String(r.status || '').toLowerCase() === 'pending') || r.status === 'Chờ thanh toán')
        .reduce((sum, r) => sum + (Number(r.totalAmount ?? r.total ?? r.cost ?? r.amount ?? 0)), 0)

      const totalRevenue = Number(adminSummary.totalRevenue || 0) || computedRevenue
      // Tổng chờ thanh toán = pending payments + unpaid appointments
      const totalPendingPayments = computedPendingFromPayments + unpaidAppointmentsCost
      const pendingPayments = Number(adminSummary.pendingPayments || 0) || 
        (totalPendingPayments > 0 ? totalPendingPayments : computedPendingFromReceipts)
      
      // Calculate booking stats from actual bookings data
      const pendingBookings = safeBookings.filter(b => (b.status || '').toLowerCase() === 'pending').length
      const activeBookings = safeBookings.filter(b => ['received', 'in_maintenance', 'confirmed'].includes((b.status || '').toLowerCase())).length
      const completedBookings = safeBookings.filter(b => ['completed', 'done'].includes((b.status || '').toLowerCase())).length
      
      // Calculate total parts value from parts data
      const totalPartsValue = safeParts.reduce((sum, p) => sum + ((Number(p.currentStock) || 0) * (Number(p.price) || 0)), 0)
      const lowStockCount = safeParts.filter(p => (Number(p.currentStock) || 0) <= (Number(p.minStock) || 0)).length
      
      return {
        totalCustomers: Number(adminSummary.totalCustomers || 0),
        totalStaff: Number(adminSummary.totalStaff || staffCount || 0),
        totalTechnicians: Number(adminSummary.totalTechnicians || techniciansCount || 0),
        totalVehicles: Number(adminSummary.totalVehicles || 0),
        totalBookings: Number(adminSummary.totalBookings || 0),
        pendingBookings: Number(pendingBookings || 0),
        activeBookings: Number(activeBookings || 0),
        completedBookings: Number(completedBookings || 0),
        totalRevenue: Number(totalRevenue || 0),
        pendingPayments: Number(pendingPayments || 0),
        lowStockParts: Number(adminSummary.lowStockParts || lowStockCount || 0),
        totalPartsValue: Number(totalPartsValue || 0)
      }
    }
    const totalCustomers = (users || []).filter(u => u.role === 'customer' || !u.role).length
    const totalStaff = (users || []).filter(u => u.role === 'staff').length
    const totalTechnicians = (users || []).filter(u => u.role === 'technician').length
    const totalVehicles = safeVehicles.length
    const totalBookings = safeBookings.length
    const statusLower = (s) => String(s || '').toLowerCase()
    const pendingBookings = safeBookings.filter(b => statusLower(b.status) === 'pending').length
    const activeBookings = safeBookings.filter(b => ['received', 'in_maintenance', 'confirmed'].includes(statusLower(b.status))).length
    const completedBookings = safeBookings.filter(b => ['done', 'completed'].includes(statusLower(b.status))).length
    
    // Financial stats
    const completedRecords = safeReceipts.filter(r => r.status === 'done' || r.status === 'Hoàn tất')
    const totalRevenue = completedRecords.reduce((sum, r) => sum + (Number(r.totalAmount ?? r.total ?? r.cost ?? r.amount ?? 0)), 0)
    
    // Calculate pending payments - BAO GỒM:
    // 1. Payments với status = 'pending'
    // 2. Appointments chưa có payment record (dùng service basePrice)
    // 3. Appointments có payment status != 'completed' (dùng payment amount hoặc service basePrice)
    
    const safePayments = Array.isArray(payments) ? payments : []
    const safeServices = Array.isArray(services) ? services : []
    
    // Bước 1: Tính từ payments với status = 'pending'
    const pendingPaymentsFromPayments = safePayments
      .filter(p => {
        const status = String(p.status || '').toLowerCase()
        return status === 'pending'
      })
      .reduce((sum, p) => sum + (Number(p.amount || 0)), 0)
    
    // Bước 2: Tính từ appointments chưa thanh toán
    const unpaidAppointmentsCost = safeBookings
      .filter(b => {
        const appointmentId = b.appointmentId || b.id
        const relatedPayment = safePayments.find(p => 
          (p.appointmentId || p.appointment_id) === appointmentId
        )
        
        if (!relatedPayment) {
          return true // Chưa có payment = chưa thanh toán
        }
        
        const paymentStatus = String(relatedPayment.status || '').toLowerCase()
        return paymentStatus !== 'completed' && paymentStatus !== 'paid'
      })
      .reduce((sum, b) => {
        const appointmentId = b.appointmentId || b.id
        const relatedPayment = safePayments.find(p => 
          (p.appointmentId || p.appointment_id) === appointmentId
        )
        
        if (relatedPayment && relatedPayment.amount) {
          const paymentStatus = String(relatedPayment.status || '').toLowerCase()
          if (paymentStatus !== 'completed' && paymentStatus !== 'paid') {
            return sum + Number(relatedPayment.amount || 0)
          }
        }
        
        const serviceId = b.serviceId || b.service_id
        const service = safeServices.find(s => 
          (s.serviceId || s.id) === serviceId
        )
        const servicePrice = service ? Number(service.basePrice || 0) : 0
        
        return sum + servicePrice
      }, 0)
    
    // Tổng chờ thanh toán = pending payments + unpaid appointments
    const pendingPayments = pendingPaymentsFromPayments + unpaidAppointmentsCost
    
    // Parts inventory
    const lowStockParts = safeParts.filter(p => (Number(p.currentStock) || 0) <= (Number(p.minStock) || 0))
    const totalPartsValue = safeParts.reduce((sum, p) => sum + ((Number(p.currentStock) || 0) * (Number(p.price) || 0)), 0)
    
    return {
      totalCustomers: Number(totalCustomers || 0),
      totalStaff: Number(totalStaff || 0),
      totalTechnicians: Number(totalTechnicians || 0),
      totalVehicles: Number(totalVehicles || 0),
      totalBookings: Number(totalBookings || 0),
      pendingBookings: Number(pendingBookings || 0),
      activeBookings: Number(activeBookings || 0),
      completedBookings: Number(completedBookings || 0),
      totalRevenue: Number(totalRevenue || 0),
      pendingPayments: Number(pendingPayments || 0),
      lowStockParts: Number(lowStockParts.length || 0),
      totalPartsValue: Number(totalPartsValue || 0)
    }
  }, [users, vehicles, bookings, serviceReceipts, parts, adminSummary])

  // Profile dropdown handlers
  const displayName = user?.fullName || user?.email || 'Administrator'
  const initials = (displayName || '').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
  }

  const handlePersonalInfo = () => {
    navigate('/personal-profile')
    setProfileDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setProfileDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileDropdownOpen])

  // Helper function to get actual appointment status by syncing with service order
  const getActualAppointmentStatus = (appointment, serviceOrdersList) => {
    if (!appointment) return 'pending'
    
    const appointmentId = appointment.appointmentId || appointment.id
    
    // Find corresponding service order
    const serviceOrder = serviceOrdersList?.find(so => 
      so.appointmentId === appointmentId || 
      (so.appointment && (so.appointment.id === appointmentId || so.appointment.appointmentId === appointmentId))
    )
    
    // If service order exists, use its status to determine actual appointment status
    if (serviceOrder) {
      const normalizedStatus = (serviceOrder.status || '').toString().toUpperCase()
      
      // Map service order status to appointment status
      if (normalizedStatus === 'COMPLETED' || normalizedStatus === 'COMPLETE' || normalizedStatus === 'DONE') {
        return 'completed'
      } else if (normalizedStatus === 'IN_PROGRESS' || normalizedStatus === 'INPROGRESS' || normalizedStatus === 'IN PROGRESS') {
        return 'in_progress'
      } else if (normalizedStatus === 'QUEUED' || normalizedStatus === 'QUEUE') {
        return 'received'
      }
    }
    
    // If no service order, use appointment status
    return (appointment.status || 'pending').toLowerCase()
  }

  // Recent activities
  const recentActivities = useMemo(() => {
    const activities = []

    // Prefer activities from admin service if available (already sorted and limited by backend)
    const acts = adminActivities || { recentBookings: [], recentCompletedReceipts: [] }
    console.log('[Admin] Processing activities. Total bookings from API:', acts.recentBookings?.length || 0)
    console.log('[Admin] Booking IDs from API:', acts.recentBookings?.map(b => b.appointmentId || b.id) || [])
    
    ;(acts.recentBookings || []).forEach(booking => {
      const id = booking.appointmentId || booking.id || ''
      const vehicleName = booking.vehicleModel || booking.vehicle || booking.licensePlate || booking.vin || ''
      const customerName = booking.customerName || booking.customer_name || booking.fullName || booking.full_name || ''
      const serviceName = booking.serviceType || booking.service || booking.serviceId || 'Dịch vụ'
      const when = booking.appointmentDate || booking.date || booking.timeSlot || booking.requested_date_time || ''
      const whenText = when ? new Date(when).toLocaleString('vi-VN') : ''

      // Tạo title với tên khách hàng hoặc tên xe, fallback về ID
      let displayName = customerName || vehicleName || `#${id}`
      if (customerName && vehicleName) {
        displayName = `${customerName} - ${vehicleName}`
      }

      const timestamp = new Date(booking.created_at || booking.createdAt || booking.appointmentDate || booking.requested_date_time || Date.now())
      
      // Get actual status by syncing with service order
      const actualStatus = getActualAppointmentStatus(booking, serviceOrders)
      console.log('[Admin] Processing booking:', { id, originalStatus: booking.status, actualStatus, createdAt: booking.createdAt || booking.created_at, timestamp })

      activities.push({
        id: `booking-${id || Date.now()}`,
        type: 'booking',
        title: `Đặt lịch mới: #${id}`, // Simplified to show appointment ID
        description: `${serviceName}${whenText ? ` - ${whenText}` : ''}`,
        status: actualStatus, // Use actual status synced with service order
        timestamp: timestamp,
        // Lưu toàn bộ booking data để xem chi tiết
        bookingData: booking
      })
    })
    ;(acts.recentCompletedReceipts || []).forEach(record => {
      const receiptId = record.id || record.receiptId || ''
      const vehicleName = record.vehicleModel || record.vehicle || record.licensePlate || record.vin || ''
      const serviceName = record.serviceType || record.service || 'Dịch vụ'
      const amount = Number(record.totalAmount ?? record.total ?? record.cost ?? record.amount ?? 0).toLocaleString()
      const when = record.completedAt || record.completed_at || record.date || record.updatedAt || record.updated_at || ''
      const whenText = when ? new Date(when).toLocaleString('vi-VN') : ''

      activities.push({
        id: `receipt-${receiptId || Date.now()}`,
        type: 'completion',
        title: `Hoàn thành dịch vụ: ${vehicleName || `#${receiptId}`}`,
        description: `${serviceName} - ${amount} VNĐ${whenText ? ` - ${whenText}` : ''}`,
        status: 'completed',
        timestamp: new Date(when || Date.now())
      })
    })

    // Fallback: use FE-computed activities if admin activities are empty
    if (activities.length === 0) {
      const safeBookings = Array.isArray(bookings) ? bookings : []
      const safeVehicles = Array.isArray(vehicles) ? vehicles : []
      safeBookings.slice(-5).forEach(booking => {
        const vehicle = safeVehicles.find(v => v.id === booking.vehicleId)
        // Get actual status by syncing with service order
        const actualStatus = getActualAppointmentStatus(booking, serviceOrders)
        activities.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: `Đặt lịch mới: ${vehicle?.model || 'N/A'}`,
          description: `${booking.serviceType} - ${booking.date} ${booking.time}`,
          status: actualStatus, // Use actual status synced with service order
          timestamp: new Date(booking.createdAt || Date.now())
        })
      })
      const safeReceipts = Array.isArray(serviceReceipts) ? serviceReceipts : []
      safeReceipts.filter(r => r.status === 'done' || r.status === 'Hoàn tất').slice(0, 3).forEach(record => {
        activities.push({
          id: `record-${record.id}`,
          type: 'completion',
          title: `Hoàn thành dịch vụ: ${record.vehicleModel || record.vehicle}`,
          description: `${record.serviceType || record.service} - ${Number(record.cost || 0).toLocaleString()} VNĐ`,
          status: 'completed',
          timestamp: new Date(record.date || record.completedAt || Date.now())
        })
      })
    }

    const sorted = activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8)
    console.log('[Admin] Final activities count:', sorted.length)
    console.log('[Admin] Final activity IDs:', sorted.map(a => a.id))
    return sorted
  }, [adminActivities, bookings, vehicles, serviceReceipts, serviceOrders])

  const reportSummary = useMemo(() => {
    const list = Array.isArray(maintenanceReports) ? maintenanceReports : []
    const normalizeStatus = (status) => String(status || '').toLowerCase()
    const submitted = list.filter(r => normalizeStatus(r.status) === 'submitted').length
    const draft = list.filter(r => normalizeStatus(r.status) === 'draft').length
    const approved = list.filter(r => normalizeStatus(r.status) === 'approved').length
    const rejected = list.filter(r => normalizeStatus(r.status) === 'rejected').length
    return {
      total: list.length,
      submitted,
      pending: submitted,
      draft,
      approved,
      rejected
    }
  }, [maintenanceReports])

  const pendingReports = useMemo(() => {
    const list = Array.isArray(maintenanceReports) ? maintenanceReports : []
    return list.filter(r => {
      const status = String(r.status || '').toLowerCase()
      return status === 'submitted' || status === 'pending'
    })
  }, [maintenanceReports])

  const recentReports = useMemo(() => {
    const list = Array.isArray(maintenanceReports) ? maintenanceReports : []
    return list.slice(0, 10)
  }, [maintenanceReports])

  const getTechnicianName = (technicianId) => {
    if (!technicianId) return `#${technicianId || ''}`
    const idNum = Number(technicianId)
    const tech = technicians.find(t => {
      const ids = [t.user_id, t.userId, t.id].map(val => Number(val)).filter(val => Number.isFinite(val))
      return ids.includes(idNum)
    })
    return tech?.full_name || tech?.fullName || tech?.email || `#${technicianId}`
  }

  const getVehicleLabel = (vehicleId) => {
    if (!vehicleId) return 'Xe không xác định'
    const idNum = Number(vehicleId)
    const vehicle = vehicles.find(v => {
      const ids = [v.id, v.vehicleId, v.vehicle_id].map(val => Number(val)).filter(val => Number.isFinite(val))
      return ids.includes(idNum)
    })
    if (!vehicle) return `Xe #${vehicleId}`
    const model = vehicle.model || vehicle.vehicleModel || vehicle.brand || 'Xe'
    const plate = vehicle.licensePlate || vehicle.license_plate || ''
    return plate ? `${model} (${plate})` : model
  }

  // Helper để lấy appointment_id từ report
  const getAppointmentIdByReport = (report) => {
    if (!report) return null
    
    // Cách 1: Từ assignment_id trong report
    if (report.assignmentId || report.assignment_id) {
      const assignmentId = report.assignmentId || report.assignment_id
      const assignment = assignments.find(a => {
        const aId = a.assignment_id || a.assignmentId || a.id
        return aId && (aId.toString() === assignmentId.toString())
      })
      if (assignment) {
        const appointmentId = assignment.appointmentId || assignment.appointment_id || assignment.appointment?.id || assignment.appointment?.appointmentId
        if (appointmentId) return appointmentId
      }
    }
    
    // Cách 2: Từ serviceOrder nếu có
    const serviceOrder = getServiceOrderByReport(report)
    if (serviceOrder) {
      const appointmentId = serviceOrder.appointmentId || serviceOrder.appointment_id
      if (appointmentId) return appointmentId
    }
    
    return null
  }

  // Helper để tìm service order từ report
  const getServiceOrderByReport = (report) => {
    if (!report) return null
    
    // Cách 1: Match qua serviceOrderId hoặc orderId trong report
    if (report.serviceOrderId || report.orderId) {
      const targetOrderId = report.serviceOrderId || report.orderId
      const matched = serviceOrders.find(order => {
        const orderId = order.orderId || order.id
        return orderId === targetOrderId || orderId?.toString() === targetOrderId?.toString()
      })
      if (matched) return matched
    }
    
    // Cách 2: Match qua assignmentId (nếu có) - tìm appointment_id từ assignment
    if (report.assignmentId || report.assignment_id) {
      const assignmentId = report.assignmentId || report.assignment_id
      const assignment = assignments.find(a => {
        const aId = a.assignment_id || a.assignmentId || a.id
        return aId && (aId.toString() === assignmentId.toString())
      })
      if (assignment) {
        const appointmentId = assignment.appointmentId || assignment.appointment_id || assignment.appointment?.id || assignment.appointment?.appointmentId
        if (appointmentId) {
          // Tìm service order có appointmentId này
          const matched = serviceOrders.find(order => {
            const orderAppointmentId = order.appointmentId || order.appointment_id
            return orderAppointmentId && (orderAppointmentId.toString() === appointmentId.toString())
          })
          if (matched) return matched
        }
      }
    }
    
    // Cách 3: Match qua vehicleId và technicianId (nếu có)
    if (report.vehicleId) {
      const reportVehicleId = report.vehicleId
      const reportTechnicianId = report.technicianId
      
      const matched = serviceOrders.find(order => {
        const orderVehicleId = order.vehicleId || order.vehicle_id
        const orderTechnicianId = order.technicianId || order.technician_id
        
        // Match vehicleId và (technicianId nếu có)
        if (orderVehicleId?.toString() === reportVehicleId?.toString()) {
          if (reportTechnicianId) {
            return orderTechnicianId?.toString() === reportTechnicianId?.toString()
          }
          return true // Nếu report không có technicianId, chỉ cần match vehicleId
        }
        return false
      })
      if (matched) return matched
    }
    
    // Cách 4: Match chỉ qua vehicleId (fallback)
    if (report.vehicleId) {
      const reportVehicleId = report.vehicleId
      const matched = serviceOrders.find(order => {
        const orderVehicleId = order.vehicleId || order.vehicle_id
        return orderVehicleId?.toString() === reportVehicleId?.toString()
      })
      if (matched) return matched
    }
    
    return null
  }

  // Helper để lấy checklist từ report
  const getChecklistByReport = (report) => {
    const order = getServiceOrderByReport(report)
    if (!order) return []
    const orderId = order.orderId || order.id
    return checklists[orderId] || []
  }

  const getCustomerNameByVehicle = (vehicleId) => {
    const idNum = Number(vehicleId)
    if (!Number.isFinite(idNum)) return null
    const vehicle = vehicles.find(v => {
      const ids = [v.id, v.vehicleId, v.vehicle_id].map(val => Number(val)).filter(val => Number.isFinite(val))
      return ids.includes(idNum)
    })
    const customerId = vehicle?.customer_id || vehicle?.customerId || vehicle?.userId
    if (!customerId) return null
    const customer = customers.find(c => {
      const ids = [c.id, c.customer_id, c.user_id].map(val => Number(val)).filter(val => Number.isFinite(val))
      return ids.includes(Number(customerId))
    })
    return customer?.full_name || customer?.fullName || customer?.email || null
  }

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'customers', label: 'Khách hàng & Xe', icon: '👥' },
    { id: 'staff', label: 'Nhân sự', icon: '👨‍💼' },
    { id: 'parts', label: 'Phụ tùng', icon: '🔧' },
    { id: 'finance', label: 'Tài chính', icon: '💰' },
    { id: 'reports', label: 'Báo cáo', icon: '📈' }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng khách hàng</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">🚗</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng xe</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalVehicles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lịch đặt</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Doanh thu</p>
              <p className="text-2xl font-semibold text-gray-900">{(dashboardStats.totalRevenue || 0).toLocaleString()} VNĐ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái dịch vụ</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chờ tiếp nhận</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {dashboardStats.pendingBookings}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đang bảo dưỡng</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {dashboardStats.activeBookings}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hoàn tất</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {dashboardStats.completedBookings}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhân sự</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nhân viên</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {dashboardStats.totalStaff}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Kỹ thuật viên</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {dashboardStats.totalTechnicians}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng nhân sự</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {dashboardStats.totalStaff + dashboardStats.totalTechnicians}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
        <div className="space-y-3">
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'booking' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <span className={`text-sm ${
                      activity.type === 'booking' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {activity.type === 'booking' ? '📅' : '✅'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    activity.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                    activity.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    activity.status === 'received' ? 'bg-blue-100 text-blue-800' :
                    activity.status === 'in_progress' || activity.status === 'in_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    activity.status === 'completed' || activity.status === 'done' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.status === 'pending' ? 'Chờ' :
                     activity.status === 'confirmed' ? 'Đã xác nhận' :
                     activity.status === 'received' ? 'Tiếp nhận' :
                     activity.status === 'in_progress' || activity.status === 'in_maintenance' ? 'Đang làm' :
                     activity.status === 'completed' || activity.status === 'done' ? 'Hoàn tất' :
                     'Hoàn tất'}
                  </span>
                  {activity.type === 'booking' && activity.bookingData && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(activity.bookingData)
                        setShowAppointmentModal(true)
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Xem thông tin
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý khách hàng & xe</h3>

        {/* Customers table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số xe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi phí</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(customers || []).map((cus) => {
                const customerId = cus.customer_id || cus.id || cus.user_id
                const userId = cus.user_id || cus.id
                const userVehicles = (vehicles || []).filter(v => (v.customer_id || v.customerId) === customerId)
                const userBookings = (bookings || []).filter(b => {
                  // Match by vehicle
                  const bookingVehicleId = b.vehicleId || b.vehicle_id
                  const vehicleMatch = userVehicles.some(v => (v.vehicle_id || v.id) === bookingVehicleId)
                  // Or match by customerId in appointment
                  const bookingCustomerId = b.customerId || b.customer_id
                  return vehicleMatch || bookingCustomerId === customerId || bookingCustomerId === userId
                })
                
                // Tính chi phí chưa thanh toán - BAO GỒM:
                // 1. Payments với status = 'pending'
                // 2. Appointments chưa có payment record (dùng service basePrice)
                // 3. Appointments có payment status != 'completed' (dùng payment amount hoặc service basePrice)
                
                // Bước 1: Tính từ payments với status = 'pending'
                const customerPendingPayments = (payments || []).filter(p => {
                  const paymentCustomerId = p.customerId || p.customer_id
                  return paymentCustomerId === customerId
                }).filter(p => {
                  const status = String(p.status || '').toLowerCase()
                  return status === 'pending'
                })
                
                const pendingPaymentsCost = customerPendingPayments.reduce((sum, p) => {
                  const amount = Number(p.amount || 0)
                  return sum + amount
                }, 0)
                
                // Bước 2: Tính từ appointments chưa thanh toán (chưa có payment hoặc payment status != 'completed')
                const customerUnpaidAppointments = (bookings || []).filter(b => {
                  const bookingCustomerId = b.customerId || b.customer_id
                  return bookingCustomerId === customerId
                }).filter(b => {
                  // Tìm payment cho appointment này
                  const appointmentId = b.appointmentId || b.id
                  const relatedPayment = (payments || []).find(p => 
                    (p.appointmentId || p.appointment_id) === appointmentId
                  )
                  
                  // Nếu không có payment hoặc payment status != 'completed', thì chưa thanh toán
                  if (!relatedPayment) {
                    return true // Chưa có payment = chưa thanh toán
                  }
                  
                  const paymentStatus = String(relatedPayment.status || '').toLowerCase()
                  return paymentStatus !== 'completed' && paymentStatus !== 'paid'
                })
                
                const unpaidAppointmentsCost = customerUnpaidAppointments.reduce((sum, b) => {
                  const appointmentId = b.appointmentId || b.id
                  // Tìm payment cho appointment này
                  const relatedPayment = (payments || []).find(p => 
                    (p.appointmentId || p.appointment_id) === appointmentId
                  )
                  
                  // Nếu có payment với amount, dùng amount
                  if (relatedPayment && relatedPayment.amount) {
                    const paymentStatus = String(relatedPayment.status || '').toLowerCase()
                    if (paymentStatus !== 'completed' && paymentStatus !== 'paid') {
                      return sum + Number(relatedPayment.amount || 0)
                    }
                  }
                  
                  // Nếu không có payment hoặc payment không có amount, dùng service basePrice
                  const serviceId = b.serviceId || b.service_id
                  const service = (services || []).find(s => 
                    (s.serviceId || s.id) === serviceId
                  )
                  const servicePrice = service ? Number(service.basePrice || 0) : 0
                  
                  return sum + servicePrice
                }, 0)
                
                // Tổng chi phí chưa thanh toán = pending payments + unpaid appointments
                const totalPendingCost = pendingPaymentsCost + unpaidAppointmentsCost
                
                // Tính userServiceOrders để hiển thị trong expanded row
                const userServiceOrders = (serviceOrders || []).filter(order => {
                  const orderVehicleId = order.vehicleId || order.vehicle_id
                  return userVehicles.some(v => (v.vehicle_id || v.id) === orderVehicleId)
                })
                
                const isExpanded = expandedCustomers.has(customerId || userId)
                
                return (
                  <>
                    <tr key={customerId || userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedCustomers)
                              if (isExpanded) {
                                newExpanded.delete(customerId || userId)
                              } else {
                                newExpanded.add(customerId || userId)
                              }
                              setExpandedCustomers(newExpanded)
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                      <div>
                            <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                                 onClick={() => {
                                   const newExpanded = new Set(expandedCustomers)
                                   if (isExpanded) {
                                     newExpanded.delete(customerId || userId)
                                   } else {
                                     newExpanded.add(customerId || userId)
                                   }
                                   setExpandedCustomers(newExpanded)
                                 }}>
                              {cus.full_name || cus.fullName}
                            </div>
                        <div className="text-sm text-gray-500">{cus.email}</div>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userVehicles.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userBookings.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        {totalPendingCost > 0 ? `${totalPendingCost.toLocaleString()} VNĐ` : '0 VNĐ'}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                          onClick={() => handleViewCustomer({ id: userId || customerId, ...cus })}
                        className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
                      >
                        Xem
                      </button>
                      <button 
                          onClick={() => handleChatCustomer({ id: userId || customerId, fullName: cus.full_name || cus.fullName, email: cus.email })}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Chat
                      </button>
                    </td>
                  </tr>
                    {/* Expanded row - Hiển thị danh sách dịch vụ/lịch hẹn */}
                    {isExpanded && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Danh sách dịch vụ & lịch hẹn</h4>
                            {userBookings.length === 0 ? (
                              <p className="text-sm text-gray-500">Chưa có lịch hẹn nào</p>
                            ) : (
        <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Lịch hẹn #</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Dịch vụ</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Xe</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Ngày hẹn</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Chi phí</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái thanh toán</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
              </tr>
            </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {userBookings.map(booking => {
                                      const bookingVehicle = userVehicles.find(v => (v.vehicle_id || v.id) === (booking.vehicleId || booking.vehicle_id))
                                      const bookingService = services.find(s => (s.id || s.serviceId) === (booking.serviceId || booking.service_id))
                                      const bookingId = booking.id || booking.appointmentId
                                      
                                      // Tìm payment record từ payments table (ưu tiên nhất)
                                      const relatedPayment = (payments || []).find(p => 
                                        (p.appointmentId || p.appointment_id) === bookingId
                                      )
                                      const paymentAmount = relatedPayment ? Number(relatedPayment.amount || 0) : 0
                                      const paymentStatusFromDB = relatedPayment ? String(relatedPayment.status || '').toLowerCase() : ''
                                      
                                      // Tìm service order liên quan (fallback)
                                      const relatedOrder = userServiceOrders.find(order => 
                                        order.appointmentId === bookingId
                                      )
                                      const orderCost = relatedOrder ? Number(relatedOrder.totalAmount ?? relatedOrder.total ?? relatedOrder.amount ?? 0) : 0
                                      
                                      // Fallback từ booking nếu không có payment
                                      const bookingCost = Number(booking.totalAmount ?? booking.amount ?? booking.cost ?? 0)
                                      
                                      // Lấy giá từ service (base_price) nếu có
                                      const servicePrice = bookingService ? Number(bookingService.basePrice ?? bookingService.price ?? bookingService.cost ?? 0) : 0
                                      
                                      // Tính finalCost với logic hợp lý:
                                      // 1. Nếu có payment với amount > 0 → dùng amount đó
                                      // 2. Nếu có payment với amount = 0 và status = 'completed' → hiển thị "0 VNĐ" (dịch vụ miễn phí)
                                      // 3. Nếu có payment với amount = 0 và status = 'pending' → tìm giá từ service
                                      // 4. Nếu không có payment → tìm giá từ service > order > booking
                                      let finalCost = 0
                                      if (relatedPayment) {
                                        // Có payment record
                                        if (paymentAmount > 0) {
                                          finalCost = paymentAmount
                                        } else if (paymentStatusFromDB === 'completed') {
                                          // Payment amount = 0 nhưng đã completed → dịch vụ miễn phí
                                          finalCost = 0
                                        } else {
                                          // Payment amount = 0 nhưng chưa completed → tìm giá từ service
                                          finalCost = servicePrice > 0 ? servicePrice : (orderCost > 0 ? orderCost : bookingCost)
                                        }
                                      } else {
                                        // Không có payment record → tìm giá từ service > order > booking
                                        finalCost = servicePrice > 0 ? servicePrice : (orderCost > 0 ? orderCost : bookingCost)
                                      }
                                      
                                      // Payment status: từ payment record > order > booking
                                      const finalPaymentStatus = paymentStatusFromDB || (relatedOrder ? String(relatedOrder.paymentStatus || '').toLowerCase() : '') || String(booking.paymentStatus || '').toLowerCase()
                                      
                                      // Xác định trạng thái thanh toán:
                                      // - Nếu payment status = 'completed' → đã thanh toán
                                      // - Nếu payment status = 'pending' → chưa thanh toán
                                      // - Nếu không có payment nhưng có order/booking với paymentStatus = 'paid' → đã thanh toán
                                      const finalIsPaid = paymentStatusFromDB === 'completed' || 
                                        (relatedOrder && String(relatedOrder.paymentStatus || '').toLowerCase() === 'paid') || 
                                        String(booking.paymentStatus || '').toLowerCase() === 'paid' || 
                                        booking.paid === true
                                      
                return (
                                        <tr key={booking.id || booking.appointmentId} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 text-sm text-gray-900">
                                            #{booking.id || booking.appointmentId}
                    </td>
                                          <td className="px-4 py-2 text-sm text-gray-900">
                                            {bookingService?.name || booking.serviceName || booking.service || 'N/A'}
                    </td>
                                          <td className="px-4 py-2 text-sm text-gray-900">
                                            {bookingVehicle ? `${bookingVehicle.brand || ''} ${bookingVehicle.model || ''}`.trim() : 'N/A'}
                    </td>
                                          <td className="px-4 py-2 text-sm text-gray-900">
                                            {booking.appointmentDate 
                                              ? new Date(booking.appointmentDate).toLocaleDateString('vi-VN')
                                              : booking.requestedDateTime
                                                ? new Date(booking.requestedDateTime).toLocaleDateString('vi-VN')
                                                : 'N/A'}
                                          </td>
                                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                            {relatedPayment && paymentAmount === 0 && paymentStatusFromDB === 'completed' 
                                              ? '0 VNĐ' // Dịch vụ miễn phí (đã thanh toán với amount = 0)
                                              : finalCost > 0 
                                                ? `${finalCost.toLocaleString()} VNĐ` 
                                                : 'Chưa có'}
                                          </td>
                                          <td className="px-4 py-2 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                              finalIsPaid 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                              {finalIsPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-sm">
                                            {(() => {
                                              // Display actual status from database - payment status does NOT affect appointment status
                                              // Payment before work completion is allowed, so we show the real appointment status
                                              const bookingStatus = String(booking.status || '').toLowerCase()
                                              let statusClass = ''
                                              
                                              // Determine color based on actual appointment status
                                              if (bookingStatus === 'completed' || bookingStatus === 'done') {
                                                statusClass = 'bg-green-100 text-green-800'
                                              } else if (bookingStatus === 'pending') {
                                                statusClass = 'bg-yellow-100 text-yellow-800'
                                              } else if (bookingStatus === 'confirmed' || bookingStatus === 'received') {
                                                statusClass = 'bg-blue-100 text-blue-800'
                                              } else if (bookingStatus === 'in_progress' || bookingStatus === 'in_maintenance') {
                                                statusClass = 'bg-blue-100 text-blue-800'
                                              } else if (bookingStatus === 'cancelled') {
                                                statusClass = 'bg-red-100 text-red-800'
                                              } else {
                                                statusClass = 'bg-gray-100 text-gray-800'
                                              }
                                              
                                              // Map status to Vietnamese for better readability
                                              const statusMap = {
                                                'completed': 'Hoàn tất',
                                                'done': 'Hoàn tất',
                                                'pending': 'Chờ xử lý',
                                                'confirmed': 'Đã xác nhận',
                                                'received': 'Đã tiếp nhận',
                                                'in_progress': 'Đang xử lý',
                                                'in_maintenance': 'Đang bảo dưỡng',
                                                'cancelled': 'Đã hủy'
                                              }
                                              
                                              const displayText = statusMap[bookingStatus] || bookingStatus || 'N/A'
                                              
                                              return (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                                  {displayText}
                                                </span>
                                              )
                                            })()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Nhân viên</h3>
            <button
              onClick={() => setAddUserModal({ open: true, role: 'staff', fullName: '', email: '', phone: '', password: '' })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Thêm nhân viên
            </button>
          </div>
          <div className="space-y-3">
            {(staffMembers || []).map((staff) => (
              <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{staff.full_name || staff.fullName}</p>
                  <p className="text-sm text-gray-600">{staff.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditUserModal({ open: true, user: staff, role: 'staff', fullName: staff.full_name || staff.fullName || '', email: staff.email || '', phone: staff.phone || '' })}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
                      try {
                        await staffAPI.deleteUser(staff.user_id || staff.id)
                        const sm = await staffAPI.getStaffMembers()
                        setStaffMembers(sm || [])
                      } catch (e) {
                        alert('Xóa không thành công')
                      }
                    }}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Kỹ thuật viên</h3>
            <button
              onClick={() => setAddUserModal({ open: true, role: 'technician', fullName: '', email: '', phone: '', password: '' })}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              + Thêm Kỹ thuật viên
            </button>
          </div>
          <div className="space-y-3">
            {(technicians || []).map((tech) => (
              <div key={tech.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{tech.full_name || tech.fullName}</p>
                  <p className="text-sm text-gray-600">{tech.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditUserModal({ open: true, user: tech, role: 'technician', fullName: tech.full_name || tech.fullName || '', email: tech.email || '', phone: tech.phone || '' })}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
                      try {
                        await staffAPI.deleteUser(tech.user_id || tech.id)
                        const tx = await staffAPI.getTechnicians()
                        setTechnicians(tx || [])
                      } catch (e) {
                        alert('Xóa không thành công')
                      }
                    }}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý lịch hẹn & dịch vụ</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã lịch hẹn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookingsState.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có lịch hẹn nào</td>
                </tr>
              ) : (
                bookingsState.map((booking) => {
                  const vehicle = vehicles.find(v => (v.vehicleId || v.id) === booking.vehicleId)
                  const user = users.find(u => u.id === vehicle?.userId)
                  const status = (booking.status || 'PENDING').toUpperCase()
                  const pretty = status === 'PENDING' ? 'Chờ tiếp nhận' : status === 'RECEIVED' ? 'Đã tiếp nhận' : status === 'IN_MAINTENANCE' ? 'Đang bảo dưỡng' : status === 'DONE' ? 'Hoàn tất' : status

                  const badgeClass = status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                    status === 'RECEIVED' ? 'bg-blue-100 text-blue-800' :
                    status === 'IN_MAINTENANCE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'

                return (
                    <tr key={booking.appointmentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.appointmentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user?.fullName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle?.model || vehicle?.vin || booking.vehicleId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.serviceId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.appointmentDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>{pretty}</span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {status !== 'RECEIVED' && status !== 'IN_MAINTENANCE' && status !== 'DONE' && (
                          <button onClick={() => updateBookingStatus(booking.appointmentId, 'RECEIVED')} className="text-blue-600 hover:text-blue-900">Tiếp nhận</button>
                        )}
                        {(status === 'RECEIVED' || status === 'IN_MAINTENANCE') && status !== 'DONE' && (
                          <button onClick={() => updateBookingStatus(booking.appointmentId, 'IN_MAINTENANCE')} className="text-yellow-600 hover:text-yellow-900">Đang làm</button>
                        )}
                        {(status === 'RECEIVED' || status === 'IN_MAINTENANCE') && (
                          <button onClick={() => updateBookingStatus(booking.appointmentId, 'DONE')} className="text-green-600 hover:text-green-900">Hoàn tất</button>
                        )}
                        {status === 'DONE' && (
                          <span className="text-green-600 font-semibold">✓ Đã hoàn tất</span>
                        )}
                    </td>
                  </tr>
                )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const updateBookingStatus = async (appointmentId, newStatus) => {
    console.log(`[Admin] Updating booking ${appointmentId} to status: ${newStatus}`)
    
    // Optimistic UI update
    setBookingsState(prev => 
      prev.map(b => b.appointmentId === appointmentId ? { ...b, status: newStatus } : b)
    )
    
    try {
      // Try backend API first
      await staffAPI.updateAppointmentStatus(appointmentId, newStatus)
      console.log('[Admin] Updated booking via API')
      
      // Reload bookings from API to get latest data
      await loadBookingsData()
      
      // Dispatch events for real-time sync to customer pages
      try {
        const event1 = new CustomEvent('local-bookings-updated', { detail: { appointmentId, newStatus } })
        window.dispatchEvent(event1)
        console.log('[Admin] Dispatched local-bookings-updated event')
      } catch (e) {
        console.error('[Admin] Error dispatching events:', e)
      }
      
      // Show success message
      const statusText = newStatus === 'RECEIVED' ? 'Đã tiếp nhận' : 
                        newStatus === 'IN_MAINTENANCE' ? 'Đang bảo dưỡng' : 
                        newStatus === 'DONE' ? 'Hoàn tất' : newStatus
      
      // Use a non-blocking notification instead of alert
      console.log(`✅ Cập nhật thành công: ${statusText}`)
      
    } catch (error) {
      console.error('[Admin] Failed to update booking status:', error)
      // Rollback optimistic update on error
      await loadBookingsData()
      alert('Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  const renderParts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quản lý phụ tùng</h3>
          <button
            onClick={handleAddPart}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Thêm phụ tùng
          </button>
        </div>
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Phụ tùng sắp hết: <span className="font-semibold text-red-600">{dashboardStats.lowStockParts}</span>
          </div>
          <div className="text-sm text-gray-600">
            Tổng giá trị: <span className="font-semibold text-green-600">{(dashboardStats.totalPartsValue || 0).toLocaleString()} VNĐ</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên phụ tùng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tối thiểu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parts.map((part) => {
                const isLowStock = (Number(part.currentStock) || 0) <= (Number(part.minStock) || 0)
                return (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.currentStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.minStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Number(part.price || 0).toLocaleString()} VNĐ</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isLowStock ? 'Sắp hết' : 'Đủ hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900" onClick={() => handleEditPart(part)}>Sửa</button>
                      <button className="text-green-600 hover:text-green-900" onClick={() => handleImportPart(part)}>Nhập kho</button>
                        <button className="text-orange-600 hover:text-orange-900" onClick={() => handleExportPart(part)}>Xuất kho</button>
                        <button className="text-red-600 hover:text-red-900" onClick={() => handleDeletePart(part)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const handleEditPart = async (part) => {
    try {
      const detail = await partsInventoryAPI.getPart(part.id)
      const newName = window.prompt('Tên phụ tùng', detail.name || '')
      if (newName === null) return
      const newPriceStr = window.prompt('Đơn giá', String(detail.unitPrice ?? part.price ?? 0))
      if (newPriceStr === null) return
      const payload = {
        ...detail,
        name: newName,
        unitPrice: Number(newPriceStr || 0),
        category: detail.category || '',
        description: detail.description || '',
        manufacturer: detail.manufacturer || ''
      }
      await partsInventoryAPI.updatePart(part.id, payload)
      await loadPartsData()
      console.log('[Admin] Updated part', part.id)
    } catch (error) {
      console.error('[Admin] Failed to update part:', error)
      alert('Không thể cập nhật phụ tùng')
    }
  }

  const handleAddPart = async () => {
    try {
      // Nhập thông tin phụ tùng mới
      const partCode = window.prompt('Mã phụ tùng (bắt buộc)', '')
      if (partCode === null || !partCode.trim()) {
        alert('Mã phụ tùng không được để trống')
        return
      }

      const name = window.prompt('Tên phụ tùng (bắt buộc)', '')
      if (name === null || !name.trim()) {
        alert('Tên phụ tùng không được để trống')
        return
      }

      const priceStr = window.prompt('Đơn giá (VNĐ)', '0')
      if (priceStr === null) return
      const unitPrice = Number(priceStr) || 0

      const category = window.prompt('Danh mục (tùy chọn)', '')
      if (category === null) return

      const description = window.prompt('Mô tả (tùy chọn)', '')
      if (description === null) return

      const manufacturer = window.prompt('Nhà sản xuất (tùy chọn)', '')
      if (manufacturer === null) return

      // Tạo payload
      const payload = {
        partCode: partCode.trim(),
        name: name.trim(),
        unitPrice: unitPrice,
        category: category.trim() || null,
        description: description.trim() || null,
        manufacturer: manufacturer.trim() || null
      }

      // Gọi API tạo phụ tùng - API trả về part object có partId
      const createdPart = await partsInventoryAPI.createPart(payload)
      
      // Nhập số lượng ban đầu nếu có
      const initialQtyStr = window.prompt('Số lượng ban đầu (tùy chọn, Enter để bỏ qua)', '0')
      if (initialQtyStr !== null && initialQtyStr.trim()) {
        const initialQty = Number(initialQtyStr)
        if (Number.isFinite(initialQty) && initialQty > 0) {
          // Sử dụng partId từ response
          const partId = createdPart.partId || createdPart.id
          if (partId) {
            const staffId = user?.id || user?.userId || 1
            await partsInventoryAPI.importStock(partId, initialQty, staffId, 'Nhập kho ban đầu')
          }
        }
      }

      await loadPartsData()
      alert('Thêm phụ tùng thành công!')
      console.log('[Admin] Created part', payload)
    } catch (error) {
      console.error('[Admin] Failed to create part:', error)
      alert('Không thể thêm phụ tùng: ' + (error.message || 'Lỗi không xác định'))
    }
  }

  const handleDeletePart = async (part) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phụ tùng "${part.name}"?\n\nLưu ý: Hành động này sẽ xóa tất cả dữ liệu liên quan (tồn kho, giao dịch) và không thể hoàn tác.`)) {
      return
    }

    try {
      await partsInventoryAPI.deletePart(part.id)
      await loadPartsData()
      alert('Xóa phụ tùng thành công!')
      console.log('[Admin] Deleted part', part.id)
    } catch (error) {
      console.error('[Admin] Failed to delete part:', error)
      alert('Không thể xóa phụ tùng: ' + (error.message || 'Lỗi không xác định'))
    }
  }

  const handleExportPart = async (part) => {
    // Kiểm tra tồn kho
    if ((Number(part.currentStock) || 0) <= 0) {
      alert('Phụ tùng này không còn tồn kho để xuất!')
      return
    }

    const qtyStr = window.prompt(`Nhập số lượng cần xuất kho (Tồn kho hiện tại: ${part.currentStock})`, '1')
    if (qtyStr === null) return
    const qty = Number(qtyStr)
    
    if (!Number.isFinite(qty) || qty <= 0) {
      alert('Số lượng phải lớn hơn 0')
      return
    }

    if (qty > (Number(part.currentStock) || 0)) {
      alert(`Số lượng xuất (${qty}) không được vượt quá tồn kho hiện tại (${part.currentStock})`)
      return
    }

    if (!window.confirm(`Xác nhận xuất ${qty} ${part.name}?`)) {
      return
    }

    try {
      const staffId = user?.id || user?.userId || 1
      await partsInventoryAPI.exportStock(part.id, qty, staffId, 'Xuất kho từ dashboard')
      await loadPartsData()
      alert(`Xuất kho thành công: ${qty} ${part.name}`)
      console.log('[Admin] Exported stock for part', part.id, qty)
    } catch (error) {
      console.error('[Admin] Failed to export stock:', error)
      alert('Không thể xuất kho phụ tùng: ' + (error.message || 'Lỗi không xác định'))
    }
  }

  const handleImportPart = async (part) => {
    const qtyStr = window.prompt('Nhập số lượng cần nhập kho', '1')
    if (qtyStr === null) return
    const qty = Number(qtyStr)
    if (!Number.isFinite(qty) || qty <= 0) {
      alert('Số lượng phải lớn hơn 0')
      return
    }
    try {
      const staffId = user?.id || user?.userId || 1
      await partsInventoryAPI.importStock(part.id, qty, staffId, 'Nhập kho từ dashboard')
      await loadPartsData()
      console.log('[Admin] Imported stock for part', part.id, qty)
    } catch (error) {
      console.error('[Admin] Failed to import stock:', error)
      alert('Không thể nhập kho phụ tùng')
    }
  }

  const renderFinance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tài chính tổng quan</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Doanh thu đã thu</span>
              <span className="text-lg font-semibold text-green-600">{(dashboardStats.totalRevenue || 0).toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chờ thanh toán</span>
              <span className="text-lg font-semibold text-orange-600">{(dashboardStats.pendingPayments || 0).toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng giá trị phụ tùng</span>
              <span className="text-lg font-semibold text-blue-600">{(dashboardStats.totalPartsValue || 0).toLocaleString()} VNĐ</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê dịch vụ</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng dịch vụ</span>
              <span className="text-lg font-semibold text-gray-900">{dashboardStats.totalBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hoàn tất</span>
              <span className="text-lg font-semibold text-green-600">{dashboardStats.completedBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đang xử lý</span>
              <span className="text-lg font-semibold text-yellow-600">{dashboardStats.activeBookings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Table + Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={exportFinanceCSV}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Xuất CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có giao dịch</td>
                </tr>
              ) : (
                filteredPayments
                  .sort((a, b) => {
                    // Sắp xếp theo payment_date DESC (mới nhất trước)
                    const dateA = new Date(a.paymentDate || a.payment_date || a.createdAt || a.created_at || 0)
                    const dateB = new Date(b.paymentDate || b.payment_date || b.createdAt || b.created_at || 0)
                    return dateB - dateA
                  })
                  .slice(0, 50)
                  .map(payment => {
                    // Tìm appointment từ payment.appointmentId
                    const appointment = (bookings || []).find(b => 
                      (b.id || b.appointmentId) === (payment.appointmentId || payment.appointment_id)
                    )
                    
                    // Tìm vehicle từ appointment hoặc payment
                    const vehicleId = appointment?.vehicleId || appointment?.vehicle_id || payment.vehicleId || payment.vehicle_id
                    const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === vehicleId)
                    
                    // Tìm customer từ payment.customerId hoặc từ vehicle
                    const customerId = payment.customerId || payment.customer_id || (vehicle?.customer_id || vehicle?.customerId)
                    const customer = customers.find(c => (c.customer_id || c.id || c.user_id) === customerId)
                    
                    // Tìm service từ appointment
                    const serviceId = appointment?.serviceId || appointment?.service_id
                    const service = services.find(s => (s.id || s.serviceId) === serviceId)
                    
                    const dateVal = payment.paymentDate || payment.payment_date || payment.createdAt || payment.created_at
                    const amount = Number(payment.amount || 0)
                    const status = String(payment.status || '').toLowerCase()
                    
                  return (
                      <tr key={payment.paymentId || payment.payment_id || payment.id}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {dateVal ? new Date(dateVal).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {customer?.full_name || customer?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                          {service?.name || appointment?.serviceType || appointment?.service || 'Dịch vụ'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {amount.toLocaleString()} VNĐ
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            status === 'completed' ? 'bg-green-100 text-green-800' :
                            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status === 'completed' ? 'Hoàn tất' : 
                             status === 'pending' ? 'Chờ thanh toán' :
                             status === 'processing' ? 'Đang xử lý' :
                             status === 'failed' ? 'Thất bại' :
                             (payment.status || 'Khác')}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tổng số báo cáo</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{reportSummary.total}</p>
          </div>
          <button
            onClick={async () => {
              await loadMaintenanceReports()
              await loadServiceOrders()
              // loadChecklists sẽ tự động chạy khi serviceOrders thay đổi
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách báo cáo</h3>
        {maintenanceReports.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Chưa có báo cáo nào được ghi nhận.</p>
        ) : (
          <div className="space-y-3">
            {maintenanceReports.map(report => {
              const customerName = getCustomerNameByVehicle(report.vehicleId)
              const serviceOrder = getServiceOrderByReport(report)
              const appointmentId = getAppointmentIdByReport(report)
              const reportChecklist = getChecklistByReport(report)
              const completedCount = reportChecklist.filter(item => item.isCompleted).length
              const totalCount = reportChecklist.length
              
              // Debug: Log để kiểm tra
              if (serviceOrder && totalCount === 0) {
                console.log('[Admin] Report', report.reportId || report.id, 'matched with order', serviceOrder.orderId || serviceOrder.id)
                console.log('[Admin] Available checklist keys:', Object.keys(checklists))
                console.log('[Admin] Looking for orderId:', serviceOrder.orderId || serviceOrder.id)
              }
              
              return (
                <div key={report.reportId || report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Báo cáo #{report.reportId || report.id}
                        {appointmentId && (
                          <span className="ml-2 text-xs text-gray-500">
                            • Phiếu bảo dưỡng #{appointmentId}
                          </span>
                        )}
                    </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {report.createdAt ? new Date(report.createdAt).toLocaleString('vi-VN') : 
                         report.submittedAt ? new Date(report.submittedAt).toLocaleString('vi-VN') : '---'}
                    </p>
                  </div>
                    <button
                      onClick={() => {
                        setSelectedReport(report)
                        setShowReportModal(true)
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">
                  <span className="font-medium">Kỹ thuật viên:</span> {getTechnicianName(report.technicianId)}
                </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                  <span className="font-medium">Xe:</span> {getVehicleLabel(report.vehicleId)}
                      </p>
              </div>
                    {customerName && (
                    <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Chủ xe:</span> {customerName}
                      </p>
                    </div>
                    )}
                    {totalCount > 0 && (
                      <div>
                        <p className="text-gray-600">
                          <span className="font-medium">Checklist:</span> 
                          <span className={`ml-1 font-semibold ${
                            completedCount === totalCount ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {completedCount} / {totalCount} hoàn thành
                    </span>
                  </p>
                      </div>
                    )}
                  {report.workPerformed && (
                      <div className="md:col-span-2">
                        <p className="text-gray-600">
                          <span className="font-medium">Công việc:</span> {report.workPerformed.length > 100 ? 
                            report.workPerformed.substring(0, 100) + '...' : report.workPerformed}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard()
      case 'customers': return renderCustomers()
      case 'staff': return renderStaff()
      case 'bookings': return renderBookings()
      case 'parts': return renderParts()
      case 'finance': return renderFinance()
      case 'reports': return renderReports()
      default: return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Navigation */}
      <RoleBasedNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hệ thống EV Service Center</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* View Customer Modal */}
        {showViewModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Chi tiết khách hàng</h3>
                  <p className="text-sm text-gray-600">{selectedCustomer.fullName || selectedCustomer.full_name}</p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.fullName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.phone || 'Chưa có'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Địa chỉ:</span>
                      <span className="ml-2 font-medium">{selectedCustomer.address || 'Chưa có'}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicles */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Danh sách xe ({
                    vehicles.filter(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id)).length
                  })</h4>
                  <div className="space-y-2">
                    {vehicles.filter(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id)).length === 0 ? (
                      <p className="text-gray-500 text-sm">Chưa có xe nào</p>
                    ) : (
                      vehicles.filter(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id)).map(vehicle => {
                        const vehicleName = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Xe không xác định'
                        const licensePlateOrVin = vehicle.licensePlate || vehicle.vin || 'N/A'
                        const year = vehicle.year || 'N/A'
                        const currentKm = vehicle.currentKm || vehicle.current_km || vehicle.odometer || null
                        
                        return (
                        <div key={vehicle.vehicle_id || vehicle.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                          <div>
                              <p className="font-medium text-gray-900">🚗 {vehicleName}</p>
                              <p className="text-sm text-gray-600">
                                Biển số/VIN: {licensePlateOrVin} • Năm: {year}
                                {currentKm !== null && ` • Số km: ${Number(currentKm).toLocaleString()}`}
                              </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Hoạt động
                          </span>
                        </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Bookings */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Lịch hẹn gần đây ({
                    bookings.filter(b => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === b.vehicleId))).length
                  })</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {bookings
                      .filter(b => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === b.vehicleId)))
                      .slice(0, showAllBookings ? undefined : 5)
                      .map(booking => {
                        const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === booking.vehicleId)
                        
                        // Find service name from services array
                        const bookingServiceId = booking.serviceId || booking.service_id
                        const bookingService = services.find(s => {
                          const sId = s.serviceId || s.id || s.service_id
                          return sId && bookingServiceId && String(sId) === String(bookingServiceId)
                        })
                        const serviceName = bookingService?.name || booking.serviceName || booking.service || booking.serviceType || (bookingServiceId ? `Dịch vụ #${bookingServiceId}` : 'Dịch vụ không xác định')
                        
                        // Map status to Vietnamese
                        const bookingStatus = String(booking.status || '').toLowerCase()
                        const statusMap = {
                          'pending': { text: 'Chờ tiếp nhận', color: 'bg-gray-100 text-gray-800' },
                          'received': { text: 'Đã tiếp nhận', color: 'bg-blue-100 text-blue-800' },
                          'confirmed': { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
                          'in_progress': { text: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
                          'in_maintenance': { text: 'Đang bảo dưỡng', color: 'bg-yellow-100 text-yellow-800' },
                          'completed': { text: 'Hoàn tất', color: 'bg-green-100 text-green-800' },
                          'done': { text: 'Hoàn tất', color: 'bg-green-100 text-green-800' },
                          'cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800' }
                        }
                        const statusInfo = statusMap[bookingStatus] || { text: bookingStatus || 'N/A', color: 'bg-gray-100 text-gray-800' }
                        
                        // Format appointment date
                        const appointmentDate = booking.appointmentDate || booking.requestedDateTime || booking.date
                        const formattedDate = appointmentDate 
                          ? new Date(appointmentDate).toLocaleDateString('vi-VN', { 
                              year: 'numeric', 
                              month: '2-digit', 
                              day: '2-digit',
                              hour: booking.time ? undefined : '2-digit',
                              minute: booking.time ? undefined : '2-digit'
                            })
                          : 'N/A'
                        
                        return (
                          <div key={booking.id || booking.appointmentId} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900">#{booking.id || booking.appointmentId}</p>
                                <p className="text-sm text-gray-600">
                                  {vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || vehicle.vin || vehicle.licensePlate : 'N/A'} • {serviceName}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              📅 {formattedDate} {booking.time ? `- ${booking.time}` : ''}
                            </p>
                          </div>
                        )
                      })}
                    {(() => {
                      const filteredBookings = bookings.filter(b => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === b.vehicleId)))
                      const totalBookings = filteredBookings.length
                      
                      if (totalBookings > 5 && !showAllBookings) {
                        return (
                          <div className="pt-2">
                            <button
                              onClick={() => setShowAllBookings(true)}
                              className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors text-sm"
                            >
                              Hiển thị thêm ({totalBookings - 5} lịch hẹn)
                            </button>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>

                {/* Service Records */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Lịch sử dịch vụ ({
                    serviceReceipts.filter(r => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id)))).length
                  })</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {serviceReceipts
                      .filter(r => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id))))
                      .slice(0, showAllServiceRecords ? undefined : 5)
                      .map(record => {
                        const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === (record.vehicleId || record.vehicle_id))
                        
                        // Find service name from services array
                        const recordServiceId = record.serviceId || record.service_id
                        const recordService = services.find(s => {
                          const sId = s.serviceId || s.id || s.service_id
                          return sId && recordServiceId && String(sId) === String(recordServiceId)
                        })
                        const serviceName = recordService?.name || record.serviceName || record.service || record.serviceType || (recordServiceId ? `Dịch vụ #${recordServiceId}` : 'Bảo dưỡng định kỳ')
                        
                        // Format date
                        const recordDate = record.completedAt || record.date || record.createdAt
                        const formattedDate = recordDate 
                          ? new Date(recordDate).toLocaleDateString('vi-VN', { 
                              year: 'numeric', 
                              month: '2-digit', 
                              day: '2-digit'
                            })
                          : 'N/A'
                        
                        // Determine status
                        const recordStatus = String(record.status || '').toLowerCase()
                        const isCompleted = recordStatus === 'done' || recordStatus === 'completed' || recordStatus === 'hoàn tất' || record.status === 'Hoàn tất'
                        
                        return (
                          <div key={record.id || record.receiptId} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{serviceName}</p>
                              <p className="text-sm text-gray-600">
                                {vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || vehicle.vin || vehicle.licensePlate : 'N/A'}
                                {vehicle && (vehicle.licensePlate || vehicle.vin) ? ` (${vehicle.licensePlate || vehicle.vin})` : ''}
                              </p>
                              <p className="text-xs text-gray-500">
                                📅 {formattedDate}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{(record.totalAmount ?? record.total ?? record.cost ?? record.amount ?? 0).toLocaleString()} VNĐ</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {isCompleted ? 'Hoàn tất' : 'Đang xử lý'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    {(() => {
                      const filteredRecords = serviceReceipts.filter(r => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id))))
                      const totalRecords = filteredRecords.length
                      
                      if (totalRecords > 5 && !showAllServiceRecords) {
                        return (
                          <div className="pt-2">
                            <button
                              onClick={() => setShowAllServiceRecords(true)}
                              className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors text-sm"
                            >
                              Hiển thị thêm ({totalRecords - 5} bản ghi)
                            </button>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {vehicles.filter(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id)).length}
                    </p>
                    <p className="text-sm text-gray-600">Số xe</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {bookings.filter(b => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === b.vehicleId))).length}
                    </p>
                    <p className="text-sm text-gray-600">Lịch hẹn</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {(payments || [])
                        .filter(p => {
                          // Match customer_id từ payments table
                          const paymentCustomerId = p.customer_id || p.customerId || p.customer?.customer_id || p.customer?.customerId
                          const customerId = selectedCustomer.customer_id || selectedCustomer.user_id || selectedCustomer.id
                          // Chỉ tính payments với status = 'completed' (đã thanh toán)
                          const isCompleted = String(p.status || '').toLowerCase() === 'completed'
                          return paymentCustomerId && customerId && 
                            (String(paymentCustomerId) === String(customerId)) && isCompleted
                        })
                        .reduce((sum, p) => sum + (Number(p.amount || 0) || 0), 0)
                        .toLocaleString()} VNĐ
                    </p>
                    <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleChatCustomer(selectedCustomer)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  💬 Chat với khách hàng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Detail Modal */}
        {showAppointmentModal && selectedAppointment && (() => {
          const appointment = selectedAppointment
          const appointmentId = appointment.appointmentId || appointment.id
          const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === (appointment.vehicleId || appointment.vehicle_id))
          const customer = vehicle ? customers.find(c => (c.customer_id || c.id || c.user_id) === (vehicle.customer_id || vehicle.customerId || vehicle.userId)) : null
          const status = (appointment.status || '').toLowerCase()
          const statusText = status === 'pending' ? 'Chờ tiếp nhận' :
                            status === 'confirmed' ? 'Đã xác nhận' :
                            status === 'received' ? 'Đã tiếp nhận' :
                            status === 'in_maintenance' ? 'Đang bảo dưỡng' :
                            status === 'completed' ? 'Hoàn tất' :
                            status === 'cancelled' ? 'Đã hủy' : 'Không xác định'
          const statusColor = status === 'pending' ? 'bg-gray-100 text-gray-800' :
                             status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                             status === 'received' ? 'bg-blue-100 text-blue-800' :
                             status === 'in_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                             status === 'completed' ? 'bg-green-100 text-green-800' :
                             status === 'cancelled' ? 'bg-red-100 text-red-800' :
                             'bg-gray-100 text-gray-800'
          
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết lịch hẹn #{appointmentId}</h2>
                  <button
                    onClick={() => setShowAppointmentModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="px-6 py-4 space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tên khách hàng</p>
                        <p className="font-medium text-gray-900">
                          {customer?.full_name || customer?.fullName || appointment.customerName || appointment.customer_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {customer?.email || appointment.customerEmail || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số điện thoại</p>
                        <p className="font-medium text-gray-900">
                          {customer?.phone || appointment.customerPhone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin xe</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Biển số xe</p>
                        <p className="font-medium text-gray-900">
                          {vehicle?.licensePlate || appointment.licensePlate || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Model</p>
                        <p className="font-medium text-gray-900">
                          {vehicle?.model || appointment.vehicleModel || appointment.vehicle || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">VIN</p>
                        <p className="font-medium text-gray-900">
                          {vehicle?.vin || appointment.vin || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Số km hiện tại</p>
                        <p className="font-medium text-gray-900">
                          {vehicle?.currentMileage ? `${vehicle.currentMileage.toLocaleString()} km` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin lịch hẹn</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Dịch vụ</p>
                        <p className="font-medium text-gray-900">
                          {appointment.serviceType || appointment.service || appointment.serviceId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày giờ hẹn</p>
                        <p className="font-medium text-gray-900">
                          {appointment.appointmentDate || appointment.date || appointment.requested_date_time ? 
                            new Date(appointment.appointmentDate || appointment.date || appointment.requested_date_time).toLocaleString('vi-VN') : 
                            'N/A'}
                        </p>
                      </div>
                      {appointment.timeSlot && (
                        <div>
                          <p className="text-sm text-gray-600">Khung giờ</p>
                          <p className="font-medium text-gray-900">{appointment.timeSlot}</p>
                        </div>
                      )}
                      {appointment.notes && (
                        <div>
                          <p className="text-sm text-gray-600">Ghi chú</p>
                          <p className="font-medium text-gray-900">{appointment.notes}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Ngày tạo</p>
                        <p className="font-medium text-gray-900">
                          {appointment.created_at || appointment.createdAt ? 
                            new Date(appointment.created_at || appointment.createdAt).toLocaleString('vi-VN') : 
                            'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowAppointmentModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Đóng
                  </button>
                  {customer && (
                    <button
                      onClick={() => {
                        setShowAppointmentModal(false)
                        handleViewCustomer(customer)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Xem thông tin khách hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Chat Modal */}
        {showChatModal && selectedChatCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">💬 Chat với {selectedChatCustomer.fullName}</h3>
                  <p className="text-sm text-green-100">{selectedChatCustomer.email}</p>
                </div>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <p className="text-4xl mb-2">💬</p>
                    <p>Chưa có tin nhắn nào</p>
                    <p className="text-sm mt-1">Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isMe = String(msg.senderId) === String(userId)
                    return (
                      <div
                        key={msg.messageId || msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isMe
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-xs font-semibold mb-1">
                            {isMe ? 'Bạn' : msg.senderName || 'Khách hàng'}
                          </p>
                          <p className="text-sm">{msg.messageText}</p>
                          <p className={`text-xs mt-1 ${
                            isMe ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    Gửi
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Nhấn Enter để gửi tin nhắn nhanh
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {addUserModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Thêm {addUserModal.role === 'staff' ? 'Nhân viên' : 'Kỹ thuật viên'}</h3>
                <button onClick={() => setAddUserModal({ open: false, role: 'staff', fullName: '', email: '', phone: '', password: '' })} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    value={addUserModal.fullName} 
                    onChange={e => setAddUserModal(m => ({ ...m, fullName: e.target.value }))} 
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input 
                    type="email"
                    value={addUserModal.email} 
                    onChange={e => setAddUserModal(m => ({ ...m, email: e.target.value }))} 
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                  <input 
                    type="password"
                    value={addUserModal.password} 
                    onChange={e => setAddUserModal(m => ({ ...m, password: e.target.value }))} 
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Nhập mật khẩu"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mật khẩu tối thiểu 6 ký tự</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input 
                    type="tel"
                    value={addUserModal.phone} 
                    onChange={e => setAddUserModal(m => ({ ...m, phone: e.target.value }))} 
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="0123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò <span className="text-red-500">*</span></label>
                  <select 
                    value={addUserModal.role} 
                    onChange={e => setAddUserModal(m => ({ ...m, role: e.target.value }))} 
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="staff">Nhân viên</option>
                    <option value="technician">Kỹ thuật viên</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button 
                  onClick={() => setAddUserModal({ open: false, role: 'staff', fullName: '', email: '', phone: '', password: '' })} 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    // Validation
                    if (!addUserModal.fullName.trim()) {
                      alert('Vui lòng nhập họ tên')
                      return
                    }
                    if (!addUserModal.email.trim()) {
                      alert('Vui lòng nhập email')
                      return
                    }
                    if (!addUserModal.password || addUserModal.password.length < 6) {
                      alert('Mật khẩu phải có ít nhất 6 ký tự')
                      return
                    }

                    try {
                      await staffAPI.createUser({
                        fullName: addUserModal.fullName.trim(),
                        email: addUserModal.email.trim(),
                        password: addUserModal.password,
                        phone: addUserModal.phone.trim() || null,
                        role: addUserModal.role
                      })
                      
                      // Reload data
                      if (addUserModal.role === 'staff') {
                        const sm = await staffAPI.getStaffMembers()
                        setStaffMembers(sm || [])
                      } else {
                        const tx = await staffAPI.getTechnicians()
                        setTechnicians(tx || [])
                      }
                      
                      setAddUserModal({ open: false, role: 'staff', fullName: '', email: '', phone: '', password: '' })
                      alert('Thêm ' + (addUserModal.role === 'staff' ? 'nhân viên' : 'kỹ thuật viên') + ' thành công!')
                    } catch (e) {
                      console.error('Error creating user:', e)
                      alert('Thêm không thành công: ' + (e.message || 'Lỗi không xác định'))
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Tạo tài khoản
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Detail Modal */}
        {showReportModal && selectedReport && (() => {
          const report = selectedReport
          const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === (report.vehicleId || report.vehicle_id))
          const customerName = getCustomerNameByVehicle(report.vehicleId)
          const technicianName = getTechnicianName(report.technicianId)
          const reportChecklist = getChecklistByReport(report)
          const serviceOrder = getServiceOrderByReport(report)
          const appointmentId = getAppointmentIdByReport(report)
          const completedCount = reportChecklist.filter(item => item.isCompleted).length
          const totalCount = reportChecklist.length
          
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết báo cáo #{report.reportId || report.id}</h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="px-6 py-4 space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Kỹ thuật viên</p>
                        <p className="font-medium text-gray-900">{technicianName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Xe</p>
                        <p className="font-medium text-gray-900">{getVehicleLabel(report.vehicleId) || 'N/A'}</p>
                      </div>
                      {customerName && (
                        <div>
                          <p className="text-sm text-gray-600">Chủ xe</p>
                          <p className="font-medium text-gray-900">{customerName}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Ngày tạo</p>
                        <p className="font-medium text-gray-900">
                          {report.createdAt ? new Date(report.createdAt).toLocaleString('vi-VN') : 
                           report.submittedAt ? new Date(report.submittedAt).toLocaleString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Work Performed */}
                  {report.workPerformed && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Công việc đã thực hiện</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{report.workPerformed}</p>
                    </div>
                  )}

                  {/* Parts Used */}
                  {report.partsUsed && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Phụ tùng đã sử dụng</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{report.partsUsed}</p>
                    </div>
                  )}

                  {/* Issues Found */}
                  {report.issuesFound && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Sự cố phát hiện</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{report.issuesFound}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.recommendations && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Khuyến nghị</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{report.recommendations}</p>
                    </div>
                  )}

                  {/* Checklist Section */}
                  {totalCount > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Danh sách kiểm tra</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          completedCount === totalCount 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {completedCount} / {totalCount} hoàn thành
                        </span>
                      </div>
                      {appointmentId && (
                        <p className="text-xs text-gray-500 mb-3">
                          Phiếu bảo dưỡng #{appointmentId}
                        </p>
                      )}
                      <div className="space-y-2">
                        {reportChecklist.map((item, index) => {
                          const isCompleted = item.isCompleted || false
                          return (
                            <div 
                              key={item.checklistId || item.id || index}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${
                                isCompleted 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-green-600 border-green-600' 
                                  : 'border-gray-300'
                              }`}>
                                {isCompleted && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
                                }`}>
                                  {item.itemName || item.item_name || 'N/A'}
                                </p>
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
                      {totalCount > 0 && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                completedCount === totalCount ? 'bg-green-600' : 'bg-yellow-500'
                              }`}
                              style={{ 
                                width: `${(completedCount / totalCount) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin bổ sung</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {report.laborHours && (
                        <div>
                          <p className="text-sm text-gray-600">Giờ công</p>
                          <p className="font-medium text-gray-900">{report.laborHours} giờ</p>
                        </div>
                      )}
                      {report.submittedAt && (
                        <div>
                          <p className="text-sm text-gray-600">Ngày gửi</p>
                          <p className="font-medium text-gray-900">
                            {new Date(report.submittedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                      {report.approvedAt && (
                        <div>
                          <p className="text-sm text-gray-600">Ngày phê duyệt</p>
                          <p className="font-medium text-gray-900">
                            {new Date(report.approvedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                      {report.approvedBy && (
                        <div>
                          <p className="text-sm text-gray-600">Người phê duyệt</p>
                          <p className="font-medium text-gray-900">
                            {getTechnicianName(report.approvedBy) || `ID: ${report.approvedBy}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Edit User Modal */}
        {editUserModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa {editUserModal.role === 'staff' ? 'Nhân viên' : 'Kỹ thuật viên'}</h3>
                <button onClick={() => setEditUserModal({ open: false, user: null })} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Họ tên</label>
                  <input value={editUserModal.fullName} onChange={e => setEditUserModal(m => ({ ...m, fullName: e.target.value }))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input value={editUserModal.email} onChange={e => setEditUserModal(m => ({ ...m, email: e.target.value }))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                  <input value={editUserModal.phone} onChange={e => setEditUserModal(m => ({ ...m, phone: e.target.value }))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Vai trò</label>
                  <select value={editUserModal.role} onChange={e => setEditUserModal(m => ({ ...m, role: e.target.value }))} className="w-full border rounded px-3 py-2">
                    <option value="staff">Nhân viên</option>
                    <option value="technician">Kỹ thuật viên</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <button onClick={() => setEditUserModal({ open: false, user: null })} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Hủy</button>
                <button
                  onClick={async () => {
                    try {
                      await staffAPI.updateUser(editUserModal.user.user_id || editUserModal.user.id, {
                        fullName: editUserModal.fullName,
                        email: editUserModal.email,
                        phone: editUserModal.phone,
                        role: editUserModal.role
                      })
                      if (editUserModal.role === 'staff') {
                        const sm = await staffAPI.getStaffMembers()
                        setStaffMembers(sm || [])
                      } else {
                        const tx = await staffAPI.getTechnicians()
                        setTechnicians(tx || [])
                      }
                      setEditUserModal({ open: false, user: null })
                    } catch (e) {
                      alert('Cập nhật không thành công')
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Admin
