// API Service Layer - Kết nối với Backend Services

const API_BASE_URLS = {
  auth: 'http://localhost:8080/api/auth',
  customer: 'http://localhost:8082/api/customer',
  staff: 'http://localhost:8083/api/staff',
  payment: 'http://localhost:8084/api/payment',
  maintenance: 'http://localhost:8080/api'
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
    try {
      const response = await fetch(`${API_BASE_URLS.auth}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      // Backend returns 200 for success, 401 for failed login
      // Both cases return JSON with success flag
      if (response.ok && data.success && data.token) {
        setAuthToken(data.token)
      }
      
      return data
    } catch (error) {
      console.error('Login API error:', error)
      return { success: false, message: error.message || 'Có lỗi xảy ra khi đăng nhập' }
    }
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

// Maintenance Service APIs (Backend port 8080)
export const maintenanceAPI = {
  // Appointments
  getAppointments: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/appointments`)
  },
  getAppointmentById: (appointmentId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}`)
  },
  createAppointment: (appointmentData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/appointments`, {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    })
  },
  updateAppointment: (appointmentId, appointmentData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    })
  },
  confirmAppointment: (appointmentId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}/confirm`, {
      method: 'PUT'
    })
  },
  cancelAppointment: (appointmentId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/appointments/${appointmentId}/cancel`, {
      method: 'PUT'
    })
  },
  getAppointmentsByStatus: (status) => {
    return apiCall(`${API_BASE_URLS.maintenance}/appointments/status/${status}`)
  },

  // Service Orders
  getServiceOrders: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-orders`)
  },
  getServiceOrderById: (orderId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}`)
  },
  createServiceOrder: (orderData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-orders`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  },
  createServiceOrderFromAppointment: (appointmentId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-orders/from-appointment/${appointmentId}`, {
      method: 'POST'
    })
  },
  updateServiceOrderStatus: (orderId, status) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },
  assignTechnician: (orderId, technicianId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/assign-technician`, {
      method: 'PUT',
      body: JSON.stringify({ technicianId })
    })
  },
  completeServiceOrder: (orderId, completionData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-orders/${orderId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(completionData)
    })
  },
  getServiceOrdersByTechnician: (technicianId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-orders/technician/${technicianId}`)
  },

  // Vehicles
  getVehicles: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/vehicles`)
  },
  getVehicleById: (vehicleId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/vehicles/${vehicleId}`)
  },
  getVehiclesByCustomer: (customerId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/vehicles/customer/${customerId}`)
  },
  createVehicle: (vehicleData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    })
  },
  updateVehicle: (vehicleId, vehicleData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    })
  },

  // Services
  getServices: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/services`)
  },
  getServiceById: (serviceId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/services/${serviceId}`)
  },
  getServicesByType: (type) => {
    return apiCall(`${API_BASE_URLS.maintenance}/services/type/${type}`)
  },
  getServicePackages: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/services/packages`)
  },

  // Parts
  getParts: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/parts`)
  },
  getPartById: (partId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/parts/${partId}`)
  },
  getPartByCode: (partCode) => {
    return apiCall(`${API_BASE_URLS.maintenance}/parts/code/${partCode}`)
  },
  createPart: (partData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/parts`, {
      method: 'POST',
      body: JSON.stringify(partData)
    })
  },
  updatePart: (partId, partData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/parts/${partId}`, {
      method: 'PUT',
      body: JSON.stringify(partData)
    })
  },

  // Service Checklists
  getServiceChecklists: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-checklists`)
  },
  getServiceChecklistById: (checklistId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-checklists/${checklistId}`)
  },
  getChecklistsByOrderId: (orderId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-checklists/order/${orderId}`)
  },
  createServiceChecklist: (checklistData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-checklists`, {
      method: 'POST',
      body: JSON.stringify(checklistData)
    })
  },
  updateServiceChecklist: (checklistId, checklistData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-checklists/${checklistId}`, {
      method: 'PUT',
      body: JSON.stringify(checklistData)
    })
  },
  completeChecklistItem: (checklistId, completionData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/service-checklists/${checklistId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(completionData)
    })
  },

  // Order Items
  getOrderItems: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/order-items`)
  },
  getOrderItemById: (itemId) => {
    return apiCall(`${API_BASE_URLS.maintenance}/order-items/${itemId}`)
  },
  createServiceItem: (itemData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/order-items/service`, {
      method: 'POST',
      body: JSON.stringify(itemData)
    })
  },
  createPartItem: (itemData) => {
    return apiCall(`${API_BASE_URLS.maintenance}/order-items/part`, {
      method: 'POST',
      body: JSON.stringify(itemData)
    })
  },

  // Health check
  health: () => {
    return apiCall(`${API_BASE_URLS.maintenance}/health`)
  }
}

export default {
  authAPI,
  customerAPI,
  paymentAPI,
  staffAPI,
  maintenanceAPI
}
