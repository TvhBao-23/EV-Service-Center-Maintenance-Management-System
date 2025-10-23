// API Service Layer - Kết nối với Backend Services

const API_BASE_URLS = {
  auth: 'http://localhost:8081/api/auth',
  customer: 'http://localhost:8082/api/customer',
  staff: 'http://localhost:8083/api/staff',
  payment: 'http://localhost:8084/api/payment'
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
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        removeAuthToken()
        window.location.href = '/login'
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
    const response = await apiCall(`${API_BASE_URLS.auth}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    
    if (response.token) {
      setAuthToken(response.token)
    }
    
    return response
  },

  // Đăng ký
  register: async (userData) => {
    const response = await apiCall(`${API_BASE_URLS.auth}/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    
    if (response.token) {
      setAuthToken(response.token)
    }
    
    return response
  },

  // Logout
  logout: () => {
    removeAuthToken()
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

  // Cập nhật xe
  updateVehicle: (vehicleId, vehicleData) => {
    return apiCall(`${API_BASE_URLS.customer}/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
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

// Staff Service APIs
export const staffAPI = {
  // Lấy danh sách appointments (cho staff)
  getAppointments: () => {
    return apiCall(`${API_BASE_URLS.staff}/appointments`)
  },

  // Cập nhật trạng thái appointment
  updateAppointmentStatus: (appointmentId, status) => {
    return apiCall(`${API_BASE_URLS.staff}/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }
}

export default {
  authAPI,
  customerAPI,
  paymentAPI,
  staffAPI
}
