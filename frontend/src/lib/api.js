// API Service Layer - Kết nối với Backend Services
// All services now use API Gateway for centralized routing

const API_BASE_URLS = {
  // All services via API Gateway (port 8090)
  auth: 'http://localhost:8090/api/auth',  // AuthService via Gateway
  customer: 'http://localhost:8090/api/customers',  // CustomerService via Gateway
  staff: 'http://localhost:8090/api/staff',  // StaffService via Gateway
  payment: 'http://localhost:8090/api/payment',  // PaymentService via Gateway (singular to match controller)
  maintenance: 'http://localhost:8090/api/maintenance',  // Maintenance Service via Gateway
  // API Gateway base URL
  gateway: 'http://localhost:8090/api',
  admin: 'http://localhost:8090/api/admin' // Admin aggregation service via gateway
}

// Helper function để lấy token từ localStorage
function getAuthToken() {
  return localStorage.getItem('authToken')
}

// Helper function để set token vào localStorage
function setAuthToken(token) {
  localStorage.setItem('authToken', token)
}

// Helper function để remove token
function removeAuthToken() {
  localStorage.removeItem('authToken')
}

// Generic API call function
async function apiCall(url, options = {}) {
  const token = getAuthToken()
  
  console.log('🌐 API CALL:', {
    url,
    method: options.method || 'GET',
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
  })
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }

  try {
    const response = await fetch(url, config)
    
    console.log('🌐 API RESPONSE:', {
      url,
      status: response.status,
      ok: response.ok
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid - only clear if not using local auth
        const authToken = getAuthToken()
        if (authToken && authToken !== 'local-token' && authToken !== 'admin-token') {
          removeAuthToken()
          window.location.href = '/login'
        }
        throw new Error('Unauthorized')
      }
      
      // Try to parse error message from response body
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.text()
        if (errorData) {
          try {
            const errorJson = JSON.parse(errorData)
            errorMessage = errorJson.message || errorJson.error || errorData || errorMessage
          } catch (e) {
            // If not JSON, use the text as error message
            errorMessage = errorData || errorMessage
          }
        }
      } catch (e) {
        // If parsing fails, use default error message
        console.warn('Could not parse error response:', e)
      }
      
      const error = new Error(errorMessage)
      error.status = response.status
      throw error
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Call Error:', error)
    throw error
  }
}

// Auth Service APIs
export const authAPI = {
  // Đăng nhập
  login: async (email, password) => {
    // Don't send Authorization header for login either
    const response = await fetch(`${API_BASE_URLS.auth}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header for login
      },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Login failed: ${errorText}`)
    }
    
    const data = await response.json()
    
    if (data.token) {
      setAuthToken(data.token)
    }
    
    return data
  },

  // Đăng ký
  register: async (userData) => {
    // IMPORTANT: Don't send Authorization header for registration
    // Remove any existing token from the request
    const response = await fetch(`${API_BASE_URLS.auth}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Explicitly NO Authorization header here
      },
      body: JSON.stringify(userData)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Registration failed: ${errorText}`)
    }
    
    const data = await response.json()
    
    if (data.token) {
      setAuthToken(data.token)
    }
    
    return data
  },

  // Get current user info
  getMe: async () => {
    return apiCall(`${API_BASE_URLS.auth}/me`)
  },

  // Logout
  logout: () => {
    removeAuthToken()
  },

  // Change password - API only (no localStorage fallback)
  changePassword: async (currentPassword, newPassword) => {
    return apiCall(`${API_BASE_URLS.auth}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    })
  },
  
  // Forgot password - Send OTP
  sendOTP: async (email) => {
    const response = await fetch(`${API_BASE_URLS.auth}/forgot-password/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send OTP')
    }
    
    return await response.json()
  },
  
  // Forgot password - Verify OTP
  verifyOTP: async (email, otp) => {
    const response = await fetch(`${API_BASE_URLS.auth}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to verify OTP')
    }
    
    return await response.json()
  },
  
  // Forgot password - Reset password
  resetPassword: async (email, otp, newPassword) => {
    const response = await fetch(`${API_BASE_URLS.auth}/forgot-password/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp, newPassword })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to reset password')
    }
    
    return await response.json()
  }
}

// Customer Service APIs
export const customerAPI = {
  // Lấy thông tin profile
  getProfile: () => {
    return apiCall(`${API_BASE_URLS.customer}/profile`)
  },

  // Cập nhật profile
  updateProfile: (profileData) => {
    return apiCall(`${API_BASE_URLS.customer}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  },

  // Lấy danh sách xe
  getVehicles: () => {
    return apiCall(`${API_BASE_URLS.customer}/vehicles`)
  },

  // Thêm xe mới
  createVehicle: (vehicleData) => {
    return apiCall(`${API_BASE_URLS.customer}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    })
  },

  // Cập nhật xe (toàn bộ)
  updateVehicle: (vehicleId, vehicleData) => {
    return apiCall(`${API_BASE_URLS.customer}/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    })
  },

  // Cập nhật xe (từng phần - dùng cho cập nhật km)
  patchVehicle: (vehicleId, partialData) => {
    return apiCall(`${API_BASE_URLS.customer}/vehicles/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify(partialData)
    })
  },

  // Xóa xe
  deleteVehicle: (vehicleId) => {
    return apiCall(`${API_BASE_URLS.customer}/vehicles/${vehicleId}`, {
      method: 'DELETE'
    })
  },

  // Lấy danh sách dịch vụ
  getServices: () => {
    return apiCall(`${API_BASE_URLS.customer}/services`)
  },

  // Lấy danh sách loại dịch vụ (categories)
  getServiceCategories: () => {
    return apiCall(`${API_BASE_URLS.customer}/services/categories`)
  },

  // Lấy danh sách dịch vụ theo loại
  getServicesByCategory: (category) => {
    return apiCall(`${API_BASE_URLS.customer}/services?category=${encodeURIComponent(category)}`)
  },

  // Lấy danh sách trung tâm dịch vụ
  getServiceCenters: () => {
    return apiCall(`${API_BASE_URLS.customer}/service-centers`)
  },

  // Lấy danh sách appointments
  getAppointments: () => {
    return apiCall(`${API_BASE_URLS.customer}/appointments`)
  },

  // Tạo appointment mới
  createAppointment: (appointmentData) => {
    return apiCall(`${API_BASE_URLS.customer}/appointments`, {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    })
  },

  // Hủy appointment
  cancelAppointment: (appointmentId) => {
    return apiCall(`${API_BASE_URLS.customer}/appointments/${appointmentId}`, {
      method: 'DELETE'
    })
  },

  // Lấy lịch sử tracking
  getTrackingHistory: () => {
    return apiCall(`${API_BASE_URLS.customer}/tracking/history`)
  },
  
  // Mark appointment as paid
  markAppointmentAsPaid: (appointmentId) => {
    return apiCall(`${API_BASE_URLS.customer}/appointments/${appointmentId}/mark-paid`, {
      method: 'PATCH'
    })
  },

  // Get pending payments (both appointment and subscription)
  getPendingPayments: () => {
    return apiCall(`${API_BASE_URLS.customer}/payments/pending`)
  },

  // Get all payments (for admin)
  getAllPayments: () => {
    return apiCall(`${API_BASE_URLS.customer}/payments/all`)
  },

  // Mark payment as paid
  markPaymentAsPaid: (paymentId) => {
    return apiCall(`${API_BASE_URLS.customer}/payments/${paymentId}/mark-paid`, {
      method: 'PATCH'
    })
  },

  // Sync subscription payments (create payments for existing subscriptions)
  syncSubscriptionPayments: () => {
    return apiCall(`${API_BASE_URLS.customer}/payments/sync-subscription-payments`, {
      method: 'POST'
    })
  }
}

// Payment Service APIs
export const paymentAPI = {
  // Tạo payment mới
  initiatePayment: (paymentData) => {
    return apiCall(`${API_BASE_URLS.payment}/initiate`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  },

  // Xác thực payment
  verifyPayment: (paymentId, verificationCode) => {
    return apiCall(`${API_BASE_URLS.payment}/verify`, {
      method: 'POST',
      body: JSON.stringify({ paymentId, verificationCode })
    })
  },

  // Lấy thông tin payment
  getPayment: (paymentId) => {
    return apiCall(`${API_BASE_URLS.payment}/${paymentId}`)
  },

  // Lấy danh sách payments của user
  getMyPayments: () => {
    return apiCall(`${API_BASE_URLS.payment}/my-payments`)
  }
}

// Admin Aggregation APIs (via API Gateway)
export const adminAPI = {
  // Get dashboard summary
  getDashboard: () => {
    return apiCall(`${API_BASE_URLS.admin}/dashboard`)
  },
  // Recent activities (bookings + completed receipts)
  getActivities: () => {
    return apiCall(`${API_BASE_URLS.admin}/activities`)
  },
  // Staff count (role = staff)
  getStaffCount: () => {
    return apiCall(`${API_BASE_URLS.admin}/staff-count`)
  },
  // Health check
  health: () => {
    return apiCall(`${API_BASE_URLS.admin}/health`)
  }
}

// Staff Service APIs - Expanded for full staff workflow
export const staffAPI = {
  // ==================== AUTH ====================
  // Staff login uses the same AuthService as customers (port 8081)
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URLS.auth}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Staff login failed: ${errorText}`)
    }
    
    const data = await response.json()
    
    if (data.token) {
      setAuthToken(data.token)
    }
    
    return data
  },

  getProfile: () => {
    // Staff profile is fetched from the User entity, not a separate staff profile
    // We'll use the JWT token to get user info
    return apiCall(`${API_BASE_URLS.auth}/me`)
  },

  // ==================== APPOINTMENTS ====================
  getAppointments: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/appointments`)
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    return await apiCall(`${API_BASE_URLS.staff}/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  // ==================== CUSTOMERS & VEHICLES ====================
  getCustomers: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/customers`)
  },

  getCustomer: async (customerId) => {
    return await apiCall(`${API_BASE_URLS.staff}/customers/${customerId}`)
  },

  getVehicles: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/vehicles`)
  },

  getVehicle: async (vehicleId) => {
    return await apiCall(`${API_BASE_URLS.staff}/vehicles/${vehicleId}`)
  },

  getVehicleHistory: async (vehicleId) => {
    return await apiCall(`${API_BASE_URLS.staff}/vehicles/${vehicleId}/history`)
  },

  // ==================== TECHNICIANS ====================
  getTechnicians: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/technicians`)
  },

  // List staff members (role=staff)
  getStaffMembers: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/staff-members`)
  },

  // Create new user (staff or technician)
  createUser: async (userData) => {
    return await apiCall(`${API_BASE_URLS.staff}/users`, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  // Update user basic info
  updateUser: async (userId, payload) => {
    return await apiCall(`${API_BASE_URLS.staff}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  // Delete user
  deleteUser: async (userId) => {
    return await apiCall(`${API_BASE_URLS.staff}/users/${userId}`, {
      method: 'DELETE'
    })
  },

  // ==================== ASSIGNMENTS ====================
  createAssignment: async (assignmentData) => {
    return await apiCall(`${API_BASE_URLS.staff}/assignments`, {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    })
  },

  getAssignments: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/assignments`)
  },

  getAssignment: async (assignmentId) => {
    return await apiCall(`${API_BASE_URLS.staff}/assignments/${assignmentId}`)
  },

  updateAssignmentStatus: async (assignmentId, status) => {
    return await apiCall(`${API_BASE_URLS.staff}/assignments/${assignmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  // ==================== SERVICE RECEIPTS ====================
  createServiceReceipt: async (receiptData) => {
    return await apiCall(`${API_BASE_URLS.staff}/service-receipts`, {
      method: 'POST',
      body: JSON.stringify(receiptData)
    })
  },

  getServiceReceipts: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/service-receipts`)
  },

  getServiceReceipt: async (receiptId) => {
    return await apiCall(`${API_BASE_URLS.staff}/service-receipts/${receiptId}`)
  },

  getServiceReceiptByAppointment: async (appointmentId) => {
    return await apiCall(`${API_BASE_URLS.staff}/service-receipts/appointment/${appointmentId}`)
  },

  // ==================== CHECKLISTS ====================
  createChecklist: async (checklistData) => {
    return await apiCall(`${API_BASE_URLS.staff}/checklists`, {
      method: 'POST',
      body: JSON.stringify(checklistData)
    })
  },

  getChecklists: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/checklists`)
  },

  getChecklist: async (checklistId) => {
    return await apiCall(`${API_BASE_URLS.staff}/checklists/${checklistId}`)
  },

  getChecklistsByAssignment: async (assignmentId) => {
    return await apiCall(`${API_BASE_URLS.staff}/checklists/assignment/${assignmentId}`)
  },

  updateChecklist: async (checklistId, checklistData) => {
    return await apiCall(`${API_BASE_URLS.staff}/checklists/${checklistId}`, {
      method: 'PUT',
      body: JSON.stringify(checklistData)
    })
  },

  // ==================== MAINTENANCE REPORTS ====================
  createMaintenanceReport: async (reportData) => {
    return await apiCall(`${API_BASE_URLS.staff}/maintenance-reports`, {
      method: 'POST',
      body: JSON.stringify(reportData)
    })
  },

  getMaintenanceReports: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/maintenance-reports`)
  },

  getMaintenanceReport: async (reportId) => {
    return await apiCall(`${API_BASE_URLS.staff}/maintenance-reports/${reportId}`)
  },

  getMaintenanceReportsByAssignment: async (assignmentId) => {
    return await apiCall(`${API_BASE_URLS.staff}/maintenance-reports/assignment/${assignmentId}`)
  },

  updateMaintenanceReport: async (reportId, reportData) => {
    return await apiCall(`${API_BASE_URLS.staff}/maintenance-reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(reportData)
    })
  },

  approveMaintenanceReport: async (reportId) => {
    return await apiCall(`${API_BASE_URLS.staff}/maintenance-reports/${reportId}/approve`, {
      method: 'PUT'
    })
  },

  // ==================== PARTS & INVENTORY ====================
  getParts: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/parts`)
  },

  getPart: async (partId) => {
    return await apiCall(`${API_BASE_URLS.staff}/parts/${partId}`)
  },

  createPart: async (partData) => {
    return await apiCall(`${API_BASE_URLS.staff}/parts`, {
      method: 'POST',
      body: JSON.stringify(partData)
    })
  },

  updatePart: async (partId, partData) => {
    return await apiCall(`${API_BASE_URLS.staff}/parts/${partId}`, {
      method: 'PUT',
      body: JSON.stringify(partData)
    })
  },

  deletePart: async (partId) => {
    return await apiCall(`${API_BASE_URLS.staff}/parts/${partId}`, {
      method: 'DELETE'
    })
  },

  // Request parts from inventory
  createPartRequest: async (requestData) => {
    return await apiCall(`${API_BASE_URLS.staff}/part-requests`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  },

  getPartRequests: async () => {
    return await apiCall(`${API_BASE_URLS.staff}/part-requests`)
  }
}

// Parts Inventory Service APIs (via gateway)
export const partsInventoryAPI = {
  getInventory: () => {
    return apiCall(`${API_BASE_URLS.gateway}/inventory`)
  },
  getPart: (partId) => {
    return apiCall(`${API_BASE_URLS.gateway}/parts/${partId}`)
  },
  createPart: (data) => {
    return apiCall(`${API_BASE_URLS.gateway}/parts`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  updatePart: (partId, data) => {
    return apiCall(`${API_BASE_URLS.gateway}/parts/${partId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  deletePart: (partId) => {
    return apiCall(`${API_BASE_URLS.gateway}/parts/${partId}`, {
      method: 'DELETE'
    })
  },
  importStock: (partId, quantity, staffId = 1, note = 'Nhập kho từ dashboard') => {
    const params = new URLSearchParams({
      quantity: String(quantity),
      staffId: String(staffId),
      note
    }).toString()
    return apiCall(`${API_BASE_URLS.gateway}/inventory/${partId}/import?${params}`, {
      method: 'PUT'
    })
  },
  exportStock: (partId, quantity, staffId = 1, note = 'Xuất kho từ dashboard') => {
    const params = new URLSearchParams({
      quantity: String(quantity),
      staffId: String(staffId),
      note
    }).toString()
    return apiCall(`${API_BASE_URLS.gateway}/inventory/${partId}/export?${params}`, {
      method: 'PUT'
    })
  }
}

// Maintenance Service APIs - Service Orders & Workflow Management
export const maintenanceAPI = {
  // ==================== SERVICE ORDERS ====================
  // Tạo service order từ appointment
  createServiceOrderFromAppointment: async (appointmentId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/from-appointment/${appointmentId}`, {
      method: 'POST'
    })
  },

  // Tạo service order trực tiếp
  createServiceOrder: async (serviceOrderData) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders`, {
      method: 'POST',
      body: JSON.stringify(serviceOrderData)
    })
  },

  // Lấy service order theo ID
  getServiceOrder: async (orderId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}`)
  },

  // Lấy tất cả service orders hoặc theo status
  getServiceOrders: async (status = null) => {
    const url = status 
      ? `${API_BASE_URLS.maintenance}/service-orders?status=${status}`
      : `${API_BASE_URLS.maintenance}/service-orders`
    return await apiCall(url)
  },

  // Cập nhật trạng thái service order (queued, in_progress, completed, delayed)
  updateServiceOrderStatus: async (orderId, status) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  // Phân công kỹ thuật viên
  assignTechnician: async (orderId, technicianId) => {
    // Đảm bảo technicianId là số hợp lệ
    const techId = typeof technicianId === 'number' ? technicianId : parseInt(technicianId)
    if (isNaN(techId) || techId <= 0) {
      throw new Error(`Invalid technician ID: ${technicianId}`)
    }
    
    console.log('[maintenanceAPI] assignTechnician request:', { orderId, technicianId: techId })
    
    try {
      const response = await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/assign-technician`, {
        method: 'PUT',
        body: JSON.stringify({ technicianId: techId })
      })
      
      console.log('[maintenanceAPI] assignTechnician response:', response)
      return response
    } catch (error) {
      console.error('[maintenanceAPI] assignTechnician error:', error)
      // Extract error message from response if available
      if (error.message && error.message.includes('HTTP 400')) {
        // Try to get error message from response body
        const errorMessage = error.response?.data || error.message || 'Lỗi phân công kỹ thuật viên'
        throw new Error(errorMessage)
      }
      throw error
    }
  },

  // Hoàn thành service order
  completeServiceOrder: async (orderId, completionData) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(completionData)
    })
  },

  // Cập nhật tổng tiền
  updateServiceOrderAmount: async (orderId, totalAmount) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/amount`, {
      method: 'PUT',
      body: JSON.stringify({ totalAmount })
    })
  },

  // Lấy service orders của kỹ thuật viên
  getServiceOrdersByTechnician: async (technicianId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/technician/${technicianId}`)
  },

  // ==================== APPOINTMENTS (Maintenance Service) ====================
  // Xác nhận appointment
  confirmAppointment: async (appointmentId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}/confirm`, {
      method: 'PUT'
    })
  },

  // Hủy appointment
  cancelAppointment: async (appointmentId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}/cancel`, {
      method: 'PUT'
    })
  },

  // Hoàn thành appointment
  completeAppointment: async (appointmentId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}/complete`, {
      method: 'PUT'
    })
  },

  // Lấy appointments theo status
  getAppointmentsByStatus: async (status) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/appointments/status/${status}`)
  },

  // Xác nhận appointment (pending → confirmed)
  confirmAppointment: async (appointmentId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}/confirm`, {
      method: 'PUT'
    })
  },

  // Tiếp nhận appointment và tạo service order (confirmed → received + tạo service order)
  receiveAppointment: async (appointmentId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}/receive`, {
      method: 'PUT'
    })
  },

  // ==================== TECHNICIANS (Maintenance Service) ====================
  // Lấy danh sách technicians từ Maintenance Service (gọi Staff Service nội bộ)
  getTechnicians: async () => {
    return await apiCall(`${API_BASE_URLS.maintenance}/technicians`)
  },

  // Lấy technician theo ID
  getTechnician: async (technicianId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/technicians/${technicianId}`)
  },

  // ==================== STAFF RECORDS (Maintenance DB) ====================
  getStaffRecords: async () => {
    return await apiCall(`${API_BASE_URLS.maintenance}/staffs`)
  },

  getStaffRecordByUserId: async (userId) => {
    const id = typeof userId === 'number' ? userId : parseInt(userId, 10)
    if (Number.isNaN(id) || id <= 0) {
      throw new Error(`Invalid userId: ${userId}`)
    }
    return await apiCall(`${API_BASE_URLS.maintenance}/staffs/user/${id}`)
  },

  // ==================== SERVICE CHECKLISTS (Maintenance Service) ====================
  // Lấy checklist của service order
  getServiceOrderChecklist: async (orderId) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/checklist`)
  },

  // Tạo checklist cho service order
  createServiceOrderChecklist: async (orderId, items) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/checklist`, {
      method: 'POST',
      body: JSON.stringify({ items })
    })
  },

  // Đánh dấu hoàn thành checklist item
  completeChecklistItem: async (orderId, checklistId, notes, completedBy) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/checklist/${checklistId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ notes, completedBy })
    })
  },

  // Cập nhật checklist item
  updateChecklistItem: async (orderId, checklistId, itemName, notes) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/checklist/${checklistId}`, {
      method: 'PUT',
      body: JSON.stringify({ itemName, notes })
    })
  },

  // Cập nhật checklist item status (bao gồm isCompleted) - sử dụng direct controller
  updateChecklistItemStatus: async (checklistId, isCompleted, notes, completedBy) => {
    return await apiCall(`${API_BASE_URLS.maintenance}/service-checklists/${checklistId}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        isCompleted,
        notes: notes || '',
        completedBy: completedBy || null
      })
    })
  }
}

// Chat / Messages API
export const chatAPI = {
  // Gửi tin nhắn mới
  sendMessage: (recipientId, messageText, subject = 'Chăm sóc khách hàng', parentMessageId = null) => {
    return apiCall(`${API_BASE_URLS.staff}/messages`, {
      method: 'POST',
      body: JSON.stringify({ recipientId, messageText, subject, parentMessageId })
    })
  },

  // Lấy cuộc hội thoại giữa user hiện tại và user khác
  getConversation: (otherUserId) => {
    return apiCall(`${API_BASE_URLS.staff}/messages/conversation/${otherUserId}`)
  },

  // Lấy danh sách các cuộc hội thoại của user hiện tại
  getConversations: () => {
    return apiCall(`${API_BASE_URLS.staff}/messages/conversations`)
  },

  // Đánh dấu toàn bộ hội thoại là đã đọc
  markConversationAsRead: (otherUserId) => {
    return apiCall(`${API_BASE_URLS.staff}/messages/mark-conversation-read/${otherUserId}`, {
      method: 'PUT'
    })
  },

  // Đếm số tin nhắn chưa đọc
  getUnreadCount: () => {
    return apiCall(`${API_BASE_URLS.staff}/messages/unread-count`)
  },

  // Lấy danh sách nhân viên để khách hàng bắt đầu chat
  getStaffList: () => {
    return apiCall(`${API_BASE_URLS.staff}/messages/staff-list`)
  }
}

export default {
  authAPI,
  customerAPI,
  paymentAPI,
  staffAPI,
  maintenanceAPI,
  partsInventoryAPI,
  chatAPI
}
