// apiService.js

// Cấu hình URL backend của bạn
const API_BASE_URL = 'http://localhost:8080/api/admin';

/**
 * Hàm trợ giúp (helper) để xử lý các yêu cầu API
 * @param {string} endpoint - Đường dẫn API (ví dụ: /customers)
 * @param {string} method - Phương thức (GET, POST, PUT, DELETE)
 * @param {object} [body=null] - Dữ liệu gửi đi (cho POST, PUT)
 * @returns {Promise<any>} - Dữ liệu JSON trả về
 */
async function apiCall(endpoint, method, body = null) {
  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      // Thêm 'Authorization': `Bearer ${token}` ở đây nếu bạn dùng JWT
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      // Thử đọc lỗi từ body
      let errorMessage = `Lỗi HTTP: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Không thể parse JSON, dùng lỗi status text
      }
      throw new Error(errorMessage);
    }

    // Nếu method là DELETE hoặc không có nội dung, trả về null
    if (response.status === 204 || response.status === 202) {
      return null;
    }
    
    return await response.json();

  } catch (error) {
    console.error(`API call failed: ${method} ${endpoint}`, error);
    throw error;
  }
}

// === API KHÁCH HÀNG (Customers) ===

export const getCustomers = () => {
  return apiCall('/customers', 'GET');
};

export const getCustomerDetails = (customerId) => {
  return apiCall(`/customers/${customerId}`, 'GET');
};

export const createCustomer = (customerData) => {
  return apiCall('/customers', 'POST', customerData);
};

export const updateCustomer = (customerId, customerData) => {
  return apiCall(`/customers/${customerId}`, 'PUT', customerData);
};

export const deleteCustomer = (customerId) => {
  return apiCall(`/customers/${customerId}`, 'DELETE');
};

// === API XE (Vehicles) ===

export const createVehicle = (customerId, vehicleData) => {
  return apiCall(`/customers/${customerId}/vehicles`, 'POST', vehicleData);
};

export const updateVehicle = (vehicleId, vehicleData) => {
  return apiCall(`/customers/vehicles/${vehicleId}`, 'PUT', vehicleData);
};

export const deleteVehicle = (vehicleId) => {
  return apiCall(`/customers/vehicles/${vehicleId}`, 'DELETE');
};