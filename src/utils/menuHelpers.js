import { CATEGORY_MAP } from './constants';

// Get menu items for a specific category
export const getCategoryItems = (categoryId, menuItems) => {
  if (!categoryId || !menuItems) return [];
  const categoryKey = CATEGORY_MAP[categoryId] || 'other';
  return menuItems[categoryKey] || [];
};

// Get category name by ID
export const getCategoryName = (categoryId, categories) => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : '';
};

// Get item quantity from cart
export const getItemQuantity = (itemId, cartItems) => {
  const cartItem = cartItems.find(item => item.id === itemId);
  return cartItem ? cartItem.quantity : 0;
};

// Transform combo data for cart
export const createComboCartItem = (comboData, combos) => {
  const combo = combos.find(c => c.id === comboData.comboId);
  
  return {
    id: `combo-${comboData.comboId}-${Date.now()}`,
    name: combo?.name || 'Combo',
    price: comboData.total,
    quantity: 1,
    isCombo: true,
    comboId: comboData.comboId,
    selectedItems: comboData.selectedItems,
    additionalItems: comboData.additionalItems,
    baseChoice: comboData.baseChoice,
    comboDetails: combo
  };
};