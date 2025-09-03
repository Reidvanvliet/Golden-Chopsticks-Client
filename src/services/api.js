const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  // Add restaurant query parameter to all endpoints
  const separator = endpoint.includes('?') ? '&' : '?';
  const endpointWithRestaurant = `${endpoint}${separator}restaurant=goldenchopsticks`;
  const url = `${API_BASE_URL}${endpointWithRestaurant}`;
  
  // Get token from localStorage
  const user = JSON.parse(localStorage.getItem('goldenChopsticksUser') || '{}');
  const token = user.token;

  const isFormData = options.body instanceof FormData;

  const defaultOptions = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Host': 'goldchopsticks.restaurants-api-d19o.onrender.com'
    }
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If we can't parse JSON, try to get text
        try {
          const errorText = await response.text();
          console.error('Server error (non-JSON):', errorText);
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          console.error('Could not parse server error response');
        }
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication API calls
export const authAPI = {
  // Sign in with email/password
  signIn: async (email, password) => {
    return apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Sign up new user
  signUp: async (userData) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Google OAuth
  googleAuth: async (googleToken) => {
    return apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken })
    });
  },

  // Facebook OAuth
  facebookAuth: async (accessToken) => {
    return apiCall('/auth/facebook', {
      method: 'POST',
      body: JSON.stringify({ accessToken })
    });
  },

  // Apple OAuth
  appleAuth: async (identityToken) => {
    return apiCall('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ identityToken })
    });
  },

  // Complete OAuth profile
  completeOAuthProfile: async (profileData) => {
    return apiCall('/auth/complete-oauth-profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  },

  // Refresh token
  refreshToken: async () => {
    return apiCall('/auth/refresh', {
      method: 'POST'
    });
  },

  // Logout
  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST'
    });
  }
};

// Menu API calls
export const menuAPI = {
  // Get all menu items organized by category
  getAllItems: async () => {
    return apiCall('/menu');
  },

  // Admin: Get all menu items including unavailable
  getAllItemsAdmin: async () => {
    return apiCall('/menu/all');
  },

  // Get menu categories
  getCategories: async () => {
    return apiCall('/menu/categories');
  },

  // Admin: Get all categories including inactive
  getAllCategories: async () => {
    return apiCall('/menu/categories/all');
  },

  // Get items by category
  getItemsByCategory: async (categoryId) => {
    return apiCall(`/menu/category/${categoryId}`);
  },

  // Get single menu item
  getItem: async (itemId) => {
    return apiCall(`/menu/${itemId}`);
  },

  // Admin: Create menu item
  createItem: async (itemData) => {
    return apiCall('/menu', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  },

  // Admin: Update menu item
  updateItem: async (itemId, itemData) => {
    return apiCall(`/menu/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  },

  // Admin: Delete menu item
  deleteItem: async (itemId) => {
    return apiCall(`/menu/${itemId}`, {
      method: 'DELETE'
    });
  },

  // Admin: Upload item image
  uploadImage: async (itemId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return apiCall(`/menu/${itemId}/image`, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },

  // Admin: Delete item image
  deleteImage: async (itemId) => {
    return apiCall(`/menu/${itemId}/image`, {
      method: 'DELETE'
    });
  },

  // Admin: Create menu item with image
  createItemWithImage: async (itemData, imageFile) => {
    const formData = new FormData();
    
    // Append item data
    Object.keys(itemData).forEach(key => {
      formData.append(key, itemData[key]);
    });
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    return apiCall('/menu/with-image', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },

  // Admin: Update menu item with image
  updateItemWithImage: async (itemId, itemData, imageFile) => {
    const formData = new FormData();
    
    // Append item data
    Object.keys(itemData).forEach(key => {
      formData.append(key, itemData[key]);
    });
    
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    return apiCall(`/menu/${itemId}/with-image`, {
      method: 'PUT',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  },

  // Admin: Create menu category
  createCategory: async (categoryData) => {
    return apiCall('/menu/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  // Admin: Update menu category
  updateCategory: async (categoryId, categoryData) => {
    return apiCall(`/menu/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  },

  // Admin: Delete menu category
  deleteCategory: async (categoryId) => {
    return apiCall(`/menu/categories/${categoryId}`, {
      method: 'DELETE'
    });
  },

  // Admin: Check storage service status
  getStorageStatus: async () => {
    return apiCall('/menu/storage-status');
  }
};

// Order API calls
export const orderAPI = {
  // Create new order
  createOrder: async (orderData) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // Get user's order history
  getUserOrders: async (userId) => {
    return apiCall(`/orders/user/${userId}`);
  },

  // Get specific order
  getOrder: async (orderId) => {
    return apiCall(`/orders/${orderId}`);
  },

  // Update order status (admin)
  updateOrderStatus: async (orderId, status) => {
    return apiCall(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Get all orders (admin)
  getAllOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return apiCall(`/orders/admin?${queryParams}`);
  }
};

// Payment API calls
export const paymentAPI = {
  // Create Stripe payment intent
  createPaymentIntent: async (orderData) => {
    return apiCall('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    return apiCall('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({
        paymentIntentId,
        paymentMethodId
      })
    });
  },

  // Get payment status
  getPaymentStatus: async (paymentIntentId) => {
    return apiCall(`/payments/status/${paymentIntentId}`);
  }
};

// User API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiCall('/users/profile');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return apiCall('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
  },

  // Delete account
  deleteAccount: async () => {
    return apiCall('/users/account', {
      method: 'DELETE'
    });
  }
};

// Google APIs
export const googleAPI = {
  // Get place details (for reviews)
  getPlaceDetails: async (placeId) => {
    return apiCall(`/google/place/${placeId}`);
  },

  // Get address suggestions (autocomplete)
  getAddressSuggestions: async (input) => {
    return apiCall(`/google/autocomplete?input=${encodeURIComponent(input)}`);
  }
};

// Combo API calls
export const comboAPI = {
  // Get all combo types
  getAllCombos: async () => {
    return apiCall('/combos');
  },

  // Get combo with available items
  getComboWithItems: async (comboId) => {
    return apiCall(`/combos/${comboId}`);
  },

  // Create combo order
  createComboOrder: async (orderData) => {
    return apiCall('/combos/order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }
};

// Error handling helper
export const handleAPIError = (error, showAlert = true) => {
  console.error('API Error:', error);
  
  if (showAlert) {
    // You can integrate with a toast library here
    alert(error.message || 'An error occurred. Please try again.');
  }
  
  // Handle specific error types
  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    // Token expired, redirect to login
    localStorage.removeItem('goldChopsticksUser');
    window.location.href = '/signin';
  }
  
  return error;
};

// Request interceptor for adding auth token
export const setupAuthInterceptor = () => {
  // This would be used if you're using axios instead of fetch
  // For fetch, we handle it in the apiCall function above
};

const apiService = {
  apiCall,
  authAPI,
  menuAPI,
  orderAPI,
  paymentAPI,
  userAPI,
  googleAPI,
  comboAPI,
  handleAPIError
};

export default apiService;