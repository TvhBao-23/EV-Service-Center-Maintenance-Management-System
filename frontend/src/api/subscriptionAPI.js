// API Gateway is disabled; call CustomerService directly on 8082
const API_BASE_URL = 'http://localhost:8082';

const subscriptionAPI = {
  // Get all available service packages
  getPackages: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/packages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }
    
    return response.json();
  },

  // Get package details
  getPackageDetails: async (packageId) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/packages/${packageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch package details');
    }
    
    return response.json();
  },

  // Subscribe to a package
  subscribe: async (packageId) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/subscribe/${packageId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to subscribe');
    }
    
    return response.json();
  },

  // Get user's subscriptions
  getMySubscriptions: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/my-subscriptions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }
    
    return response.json();
  },

  // Get active subscriptions
  getActiveSubscriptions: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/active`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch active subscriptions');
    }
    
    return response.json();
  },

  // Cancel a subscription
  cancelSubscription: async (subscriptionId) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/customers/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }
    
    return response.json();
  },
};

export default subscriptionAPI;

