// API Service Layer - Kết nối với Backend Services
// Direct connection to microservices (API Gateway not implemented yet)

const API_BASE_URLS = {
  auth: 'http://localhost:8081/api/auth',  // AuthService on port 8081
  customer: 'http://localhost:8082/api/customers',  // CustomerService on port 8082
  staff: 'http://localhost:8083/api/staff',  // StaffService on port 8083
  payment: 'http://localhost:8084/api/payments'  // PaymentService on port 8084
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
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

export default {
  authAPI,
  customerAPI,
  paymentAPI,
  staffAPI
}
