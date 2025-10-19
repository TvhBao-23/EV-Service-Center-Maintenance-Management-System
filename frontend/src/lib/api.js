const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Lấy token từ localStorage
 * @returns {string|null}
 */
const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}').token || null;
  } catch {
    return null;
  }
};

/**
 * Hàm fetch được bao bọc (wrapped) để tự động thêm header Authorization
 * @param {string} url - Đường dẫn API (ví dụ: '/api/customers/vehicles')
 * @param {RequestInit} options - Các tùy chọn của fetch
 * @returns {Promise<Response>}
 */
const apiFetch = (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
};

// --- Customer APIs ---

export const getVehicles = async () => {
  const response = await apiFetch('/api/customers/vehicles');
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
};

export const createVehicle = async (vehicleData) => {
  const response = await apiFetch('/api/customers/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData),
  });
  if (!response.ok) throw new Error('Failed to create vehicle');
  return response.json();
};

export const deleteVehicle = async (vehicleId) => {
  const response = await apiFetch(`/api/customers/vehicles/${vehicleId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete vehicle');
  // DELETE thường không có body, trả về response để kiểm tra status
  return response;
};