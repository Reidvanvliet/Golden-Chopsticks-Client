import { apiCall } from './api';

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

// Individual functions for easier import
export const fetchAllCombos = async () => {
  return comboAPI.getAllCombos();
};

export const fetchComboWithItems = async (comboId) => {
  return comboAPI.getComboWithItems(comboId);
};

export const createComboOrder = async (orderData) => {
  return comboAPI.createComboOrder(orderData);
};

export default comboAPI;