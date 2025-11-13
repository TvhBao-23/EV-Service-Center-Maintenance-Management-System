import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getCurrentUserId, loadList, loadGlobalList, saveGlobalList } from '../lib/store'
import { staffAPI, adminAPI, partsInventoryAPI } from '../lib/api.js'
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
  const [customers, setCustomers] = useState([])
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
  
  // Modal states for View Customer
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  
  // Modal states for Chat
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedChatCustomer, setSelectedChatCustomer] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  // Finance filters
  const [financeFilter, setFinanceFilter] = useState({ period: 'all' })
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
    filteredReceipts.forEach(r => {
      const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id))
      const owner = customers.find(c => (c.customer_id || c.id) === (vehicle?.customer_id || vehicle?.customerId))
      const dateVal = r.completedAt || r.date || r.updatedAt
      const amount = Number(r.totalAmount ?? r.total ?? r.cost ?? r.amount ?? 0)
      const status = r.status || ''
      rows.push([
        dateVal ? new Date(dateVal).toLocaleDateString('vi-VN') : '',
        owner?.full_name || owner?.fullName || '',
        vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() : '',
        r.serviceType || r.service || '',
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

  useEffect(() => {
    if (!userId) return
    loadAdminData()
    // Listen storage changes to update live
    const onStorage = (e) => {
      if (e.key === 'bookings') {
        loadBookingsData()
      }
    }
    const onLocalUpdated = () => {
      loadBookingsData()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('local-bookings-updated', onLocalUpdated)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('local-bookings-updated', onLocalUpdated)
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
    setAssignments(loadList('assignments', []))

    // Load bookings from API
    await loadBookingsData()

    // Load parts from inventory service
    await loadPartsData()

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
  }

  // Handler for Chat with Customer
  const handleChatCustomer = (customer) => {
    setSelectedChatCustomer(customer)
    // Load existing messages from localStorage
    const storageKey = `chat_${userId}_${customer.id}`
    const existingMessages = JSON.parse(localStorage.getItem(storageKey) || '[]')
    setChatMessages(existingMessages)
    setShowChatModal(true)
  }

  // Handler for sending message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message = {
      id: Date.now(),
      sender: 'admin',
      senderName: user?.fullName || 'Admin',
      text: newMessage,
      timestamp: new Date().toISOString()
    }
    
    const updatedMessages = [...chatMessages, message]
    setChatMessages(updatedMessages)
    
    // Save to localStorage
    const storageKey = `chat_${userId}_${selectedChatCustomer.id}`
    localStorage.setItem(storageKey, JSON.stringify(updatedMessages))
    
    setNewMessage('')
  }

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
      const computedPending = safeReceipts
        .filter(r => (String(r.status || '').toLowerCase() === 'pending') || r.status === 'Chờ thanh toán')
        .reduce((sum, r) => sum + (Number(r.totalAmount ?? r.total ?? r.cost ?? r.amount ?? 0)), 0)

      const totalRevenue = Number(adminSummary.totalRevenue || 0) || computedRevenue
      const pendingPayments = Number(adminSummary.pendingPayments || 0) || computedPending
      
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
    const pendingPayments = safeReceipts
      .filter(r => statusLower(r.status) === 'pending' || r.status === 'Chờ thanh toán')
      .reduce((sum, r) => sum + (Number(r.totalAmount ?? r.total ?? r.cost ?? r.amount ?? 0)), 0)
    
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

  // Recent activities
  const recentActivities = useMemo(() => {
    const activities = []

    // Prefer activities from admin service if available
    const acts = adminActivities || { recentBookings: [], recentCompletedReceipts: [] }
    ;(acts.recentBookings || []).slice(0, 5).forEach(booking => {
      const id = booking.appointmentId || booking.id || ''
      const vehicleName = booking.vehicleModel || booking.vehicle || booking.licensePlate || booking.vin || ''
      const serviceName = booking.serviceType || booking.service || booking.serviceId || 'Dịch vụ'
      const when = booking.appointmentDate || booking.date || booking.timeSlot || ''
      const whenText = when ? new Date(when).toLocaleString('vi-VN') : ''

      activities.push({
        id: `booking-${id || Date.now()}`,
        type: 'booking',
        title: `Đặt lịch mới: ${vehicleName || `#${id}`}`,
        description: `${serviceName}${whenText ? ` - ${whenText}` : ''}`,
        status: (booking.status || '').toLowerCase(),
        timestamp: new Date(booking.created_at || booking.createdAt || booking.appointmentDate || Date.now())
      })
    })
    ;(acts.recentCompletedReceipts || []).slice(0, 3).forEach(record => {
      const receiptId = record.id || record.receiptId || ''
      const vehicleName = record.vehicleModel || record.vehicle || record.licensePlate || record.vin || ''
      const serviceName = record.serviceType || record.service || 'Dịch vụ'
      const amount = Number(record.totalAmount ?? record.total ?? record.cost ?? record.amount ?? 0).toLocaleString()
      const when = record.completedAt || record.date || record.updatedAt || ''
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
        activities.push({
          id: `booking-${booking.id}`,
          type: 'booking',
          title: `Đặt lịch mới: ${vehicle?.model || 'N/A'}`,
          description: `${booking.serviceType} - ${booking.date} ${booking.time}`,
          status: booking.status,
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

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8)
  }, [adminActivities, bookings, vehicles, serviceReceipts])

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
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
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
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    activity.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                    activity.status === 'received' ? 'bg-blue-100 text-blue-800' :
                    activity.status === 'in_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {activity.status === 'pending' ? 'Chờ' :
                     activity.status === 'received' ? 'Tiếp nhận' :
                     activity.status === 'in_maintenance' ? 'Đang làm' :
                     'Hoàn tất'}
                  </span>
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
                const userVehicles = (vehicles || []).filter(v => (v.customer_id || v.customerId) === (cus.customer_id || cus.id))
                const userBookings = (bookings || []).filter(b => userVehicles.some(v => (v.vehicle_id || v.id) === b.vehicleId))
                const userRecords = (serviceReceipts || []).filter(r => userVehicles.some(v => (v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id)))
                const totalCost = userRecords
                  .filter(r => (String(r.status || '').toLowerCase() === 'done') || r.status === 'Hoàn tất')
                  .reduce((sum, r) => sum + (Number(r.cost) || 0), 0)
                
                return (
                  <tr key={cus.customer_id || cus.user_id || cus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cus.full_name || cus.fullName}</div>
                        <div className="text-sm text-gray-500">{cus.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userVehicles.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userBookings.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalCost.toLocaleString()} VNĐ</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleViewCustomer({ id: cus.user_id || cus.customer_id, ...cus })}
                        className="text-blue-600 hover:text-blue-900 mr-3 font-medium"
                      >
                        Xem
                      </button>
                      <button 
                        onClick={() => handleChatCustomer({ id: cus.user_id || cus.customer_id, fullName: cus.full_name || cus.fullName, email: cus.email })}
                        className="text-green-600 hover:text-green-900 font-medium"
                      >
                        Chat
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Vehicles table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chủ sở hữu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN/Biển số</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Năm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Odometer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lần bảo dưỡng</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(vehicles || []).map(v => {
                const owner = (customers || []).find(c => (c.customer_id || c.id) === (v.customer_id || v.customerId))
                return (
                  <tr key={v.vehicle_id || v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {`${v.brand || ''} ${v.model || ''}`.trim() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {owner?.full_name || owner?.fullName || v.customer_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {v.vin || v.licensePlate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.year || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.odometer_km ?? v.odometerKm ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(v.last_service_date || v.lastServiceDate) ?
                        new Date(v.last_service_date || v.lastServiceDate).toLocaleDateString('vi-VN') : '-'}
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

  const renderStaff = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhân viên</h3>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kỹ thuật viên</h3>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản lý phụ tùng</h3>
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
                      <button className="text-blue-600 hover:text-blue-900 mr-3" onClick={() => handleEditPart(part)}>Sửa</button>
                      <button className="text-green-600 hover:text-green-900" onClick={() => handleImportPart(part)}>Nhập kho</button>
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
            <select
              value={financeFilter.period || 'all'}
              onChange={e => setFinanceFilter(f => ({ ...f, period: e.target.value }))}
              className="border rounded px-3 py-2"
            >
              <option value="all">Tất cả</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
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
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có giao dịch</td>
                </tr>
              ) : (
                filteredReceipts.slice(0, 50).map(r => {
                  const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id))
                  const owner = customers.find(c => (c.customer_id || c.id) === (vehicle?.customer_id || vehicle?.customerId))
                  const dateVal = r.completedAt || r.date || r.updatedAt
                  const amount = Number(r.totalAmount ?? r.total ?? r.cost ?? r.amount ?? 0)
                  const status = String(r.status || '').toLowerCase()
                  return (
                    <tr key={r.id}>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {dateVal ? new Date(dateVal).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {owner?.full_name || owner?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() : 'N/A'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {r.serviceType || r.service || 'Dịch vụ'}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                        {amount.toLocaleString()} VNĐ
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          status === 'done' || r.status === 'Hoàn tất' ? 'bg-green-100 text-green-800' :
                          status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status === 'done' || r.status === 'Hoàn tất' ? 'Hoàn tất' : status === 'pending' ? 'Chờ' : (r.status || 'Khác')}
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Báo cáo & Thống kê</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Báo cáo doanh thu</h4>
            <p className="text-sm text-gray-600 mt-1">Xuất báo cáo doanh thu theo tháng/quý</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Thống kê dịch vụ</h4>
            <p className="text-sm text-gray-600 mt-1">Phân tích loại dịch vụ phổ biến</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Báo cáo phụ tùng</h4>
            <p className="text-sm text-gray-600 mt-1">Thống kê tiêu hao và đề xuất nhập kho</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Hiệu suất nhân sự</h4>
            <p className="text-sm text-gray-600 mt-1">Đánh giá hiệu suất làm việc</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Khách hàng VIP</h4>
            <p className="text-sm text-gray-600 mt-1">Danh sách khách hàng có giá trị cao</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">Xu hướng hỏng hóc</h4>
            <p className="text-sm text-gray-600 mt-1">Phân tích các lỗi thường gặp</p>
          </button>
        </div>
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
                      vehicles.filter(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id)).map(vehicle => (
                        <div key={vehicle.vehicle_id || vehicle.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">🚗 {(vehicle.brand || '')} {(vehicle.model || '')}</p>
                            <p className="text-sm text-gray-600">Biển số/VIN: {vehicle.licensePlate || vehicle.vin || 'N/A'} • Năm: {vehicle.year || 'N/A'}</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            Hoạt động
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bookings */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Lịch hẹn gần đây ({
                    bookings.filter(b => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === b.vehicleId))).length
                  })</h4>
                  <div className="space-y-2">
                    {bookings
                      .filter(b => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === b.vehicleId)))
                      .slice(0, 5)
                      .map(booking => {
                        const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === booking.vehicleId)
                        const statusText = booking.status === 'pending' ? 'Chờ tiếp nhận' :
                                         booking.status === 'received' ? 'Đã tiếp nhận' :
                                         booking.status === 'in_maintenance' ? 'Đang bảo dưỡng' :
                                         'Hoàn tất'
                        const statusColor = booking.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                          booking.status === 'received' ? 'bg-blue-100 text-blue-800' :
                                          booking.status === 'in_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-green-100 text-green-800'
                        return (
                          <div key={booking.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-gray-900">#{booking.id}</p>
                                <p className="text-sm text-gray-600">{vehicle?.licensePlate || vehicle?.vin} • {booking.service || booking.serviceType || booking.serviceId}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                {statusText}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              📅 {booking.date ? new Date(booking.date).toLocaleDateString('vi-VN') : (booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString('vi-VN') : 'N/A')} {booking.time ? `- ${booking.time}` : ''}
                            </p>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Service Records */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Lịch sử dịch vụ ({
                    serviceReceipts.filter(r => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id)))).length
                  })</h4>
                  <div className="space-y-2">
                    {serviceReceipts
                      .filter(r => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id))))
                      .slice(0, 5)
                      .map(record => {
                        const vehicle = vehicles.find(v => (v.vehicle_id || v.id) === (record.vehicleId || record.vehicle_id))
                        return (
                          <div key={record.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{record.service || record.serviceType || 'Bảo dưỡng định kỳ'}</p>
                              <p className="text-sm text-gray-600">{vehicle?.licensePlate || vehicle?.vin}</p>
                              <p className="text-xs text-gray-500">
                                {record.date ? new Date(record.date).toLocaleDateString('vi-VN') : (record.completedAt ? new Date(record.completedAt).toLocaleDateString('vi-VN') : 'N/A')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{(record.totalAmount ?? record.total ?? record.cost ?? 0).toLocaleString()} VNĐ</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                (String(record.status || '').toLowerCase() === 'done' || record.status === 'Hoàn tất') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(String(record.status || '').toLowerCase() === 'done' || record.status === 'Hoàn tất') ? 'Hoàn tất' : 'Đang xử lý'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
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
                      {serviceReceipts
                        .filter(r => vehicles.some(v => (v.customer_id || v.customerId || v.userId) === ((selectedCustomer.customer_id) || selectedCustomer.user_id || selectedCustomer.id) && ((v.vehicle_id || v.id) === (r.vehicleId || r.vehicle_id)) && (String(r.status || '').toLowerCase() === 'done' || r.status === 'Hoàn tất')))
                        .reduce((sum, r) => sum + (Number(r.totalAmount ?? r.total ?? r.cost ?? 0) || 0), 0)
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
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === 'admin'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1">
                          {msg.sender === 'admin' ? 'Bạn' : msg.senderName}
                        </p>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'admin' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
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
