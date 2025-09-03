import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, Eye, EyeOff, Settings } from 'lucide-react';
import { menuAPI, handleAPIError } from '../services/api';

const AdminMenuPage = ({ menuItems, setMenuItems, loadMenuItems, categories, setCategories, loadCategories, adminCategories, setAdminCategories, loadAdminCategories, setLoading, setError }) => {
  const [isEditing, setIsEditing] = useState({});
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    isSpicy: false,
    isAvailable: true,
    displayOrder: 0
  });
  const [activeCategory, setActiveCategory] = useState('');
  const [changes, setChanges] = useState({});
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    displayOrder: 0
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState({});

  useEffect(() => {
    // Set first category as active if none selected and we have categories
    if (!activeCategory && adminCategories && adminCategories.length > 0) {
      // Find first active category, or use first category if none are active
      const firstActiveCategory = adminCategories.find(cat => cat.isActive) || adminCategories[0];
      if (firstActiveCategory) {
        const categoryKey = getCategoryKey(firstActiveCategory.id);
        setActiveCategory(categoryKey);
      }
    }
  }, [adminCategories, activeCategory]);


  // Map category ID to legacy category key for menuItems
  const getCategoryKey = (categoryId) => {
    const categoryKeyMap = {
      1: 'appetizers',
      2: 'soup',
      3: 'chowMein',
      4: 'friedRice',
      5: 'chopSuey',
      6: 'eggFooYoung',
      7: 'chicken',
      8: 'beef',
      9: 'pork',
      10: 'seafood',
      11: 'chefSpecialty',
      12: 'combinations',
      13: 'sauces',
      14: 'extras'
    };
    return categoryKeyMap[categoryId] || 'other';
  };

  const formatCategoryName = (key) => {
    const nameMap = {
      appetizers: 'Appetizers',
      soup: 'Soup',
      chowMein: 'Chow Mein',
      friedRice: 'Fried Rice',
      chopSuey: 'Chop Suey',
      eggFooYoung: 'Egg Foo Young',
      chicken: 'Chicken',
      beef: 'Beef',
      pork: 'Pork',
      seafood: 'Seafood',
      chefSpecialty: 'Chef Specialty',
      combinations: 'Combinations',
      sauces: 'Sauces',
      extras: 'Extras'
    };
    return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const handleEdit = (itemId) => {
    const item = getCurrentCategoryItems().find(i => i.id === itemId);
    if (item) {
      setIsEditing({ ...isEditing, [itemId]: true });
      setEditData({ ...editData, [itemId]: { ...item } });
    }
  };

  const handleCancel = (itemId) => {
    setIsEditing({ ...isEditing, [itemId]: false });
    const newEditData = { ...editData };
    delete newEditData[itemId];
    setEditData(newEditData);
  };

  const handleSave = async (itemId) => {
    try {
      setLoading(true);
      await menuAPI.updateItem(itemId, editData[itemId]);
      
      // Reload admin menu items to ensure all items are visible
      await loadMenuItems(true);
      
      setIsEditing({ ...isEditing, [itemId]: false });
      const newEditData = { ...editData };
      delete newEditData[itemId];
      setEditData(newEditData);
      
      // Mark as changed
      setChanges({ ...changes, [itemId]: true });
      
    } catch (error) {
      handleAPIError(error, false);
      setError('Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setLoading(true);
      await menuAPI.deleteItem(itemId);
      
      // Reload admin menu items to refresh the view
      await loadMenuItems(true);
      
    } catch (error) {
      handleAPIError(error, false);
      setError('Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await menuAPI.createItem({
        ...newItem,
        price: parseFloat(newItem.price)
      });
      
      // Reload admin menu items to refresh the view
      await loadMenuItems(true);
      
      // Reset form
      setNewItem({
        categoryId: '',
        name: '',
        description: '',
        price: '',
        isSpicy: false,
        isAvailable: true,
        displayOrder: 0
      });
      setShowAddForm(false);
      
    } catch (error) {
      handleAPIError(error, false);
      setError('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (itemId, file) => {
    try {
      setLoading(true);
      console.log('📤 Starting image upload for item:', itemId);
      console.log('📤 File details:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      await menuAPI.uploadImage(itemId, file);
      
      // Reload menu items to get updated image URL
      const updatedMenuItems = await menuAPI.getAllItems();
      setMenuItems(updatedMenuItems);
      
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      handleAPIError(error, false);
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Starting image deletion for item:', itemId);
      
      await menuAPI.deleteImage(itemId);
      
      // Reload menu items to get updated data without image URL
      const updatedMenuItems = await menuAPI.getAllItems();
      setMenuItems(updatedMenuItems);
      
      console.log('✅ Image deleted successfully');
    } catch (error) {
      console.error('❌ Image deletion failed:', error);
      handleAPIError(error, false);
      setError('Failed to delete image');
    } finally {
      setLoading(false);
    }
  };


  const handleTestStorageStatus = async () => {
    try {
      setLoading(true);
      const status = await menuAPI.getStorageStatus();
      console.log('☁️ Storage status:', status);
      alert(`Storage Status:\nAvailable: ${status.isAvailable}\nProject: ${status.projectId}\nBucket: ${status.bucketName}`);
    } catch (error) {
      console.error('❌ Storage status check failed:', error);
      handleAPIError(error, false);
      setError('Failed to check storage status');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCategoryItems = () => {
    return (menuItems && menuItems[activeCategory]) ? menuItems[activeCategory] : [];
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const createdCategory = await menuAPI.createCategory({
        name: newCategory.name,
        displayOrder: parseInt(newCategory.displayOrder)
      });
      
      // Refresh categories list
      await loadAdminCategories();
      
      // Reset form
      setNewCategory({
        name: '',
        displayOrder: 0
      });
      setShowAddCategory(false);
      
    } catch (error) {
      handleAPIError(error, false);
      setError('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.id);
    setEditCategoryData({
      name: category.name,
      displayOrder: category.displayOrder,
      isActive: category.isActive
    });
  };

  const handleSaveCategory = async (categoryId) => {
    try {
      setLoading(true);
      await menuAPI.updateCategory(categoryId, editCategoryData);
      
      // Refresh categories list
      await loadAdminCategories();
      
      setEditingCategory(null);
      setEditCategoryData({});
      
    } catch (error) {
      handleAPIError(error, false);
      setError('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null);
    setEditCategoryData({});
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    const confirmMessage = `Are you sure you want to delete the category "${categoryName}"?\n\nThis action cannot be undone. The category can only be deleted if it has no menu items.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await menuAPI.deleteCategory(categoryId);
      
      // Refresh categories list
      await loadAdminCategories();
      
    } catch (error) {
      handleAPIError(error, false);
      // Show more specific error message if it's about items in the category
      if (error.message.includes('menu items')) {
        setError(error.message);
      } else {
        setError('Failed to delete category');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Menu Management</h1>
          
          {/* Admin Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 lg:gap-4">
            <button
              onClick={handleTestStorageStatus}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm w-full sm:w-auto flex items-center justify-center space-x-2"
            >
              <span>Test Storage</span>
            </button>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Categories</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
            {hasChanges && (
              <div className="bg-yellow-600/20 border border-yellow-500 text-yellow-400 px-4 py-2 rounded-lg text-center text-sm w-full sm:w-auto">
                Unsaved changes detected
              </div>
            )}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 mb-8">
          <div className="relative">
            {/* Scroll Container */}
            <div 
              className="flex overflow-x-auto space-x-4 pb-2 admin-category-scroll scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-red-600 hover:scrollbar-thumb-red-500"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#dc2626 #374151'
              }}
            >
              {(adminCategories || []).map((category) => {
                const categoryKey = getCategoryKey(category.id);
                const itemCount = (menuItems && menuItems[categoryKey]) ? menuItems[categoryKey].length : 0;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(categoryKey)}
                    className={`flex-shrink-0 whitespace-nowrap px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeCategory === categoryKey
                        ? 'bg-red-700 text-white shadow-lg border border-red-600'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <span>{category.name} ({itemCount})</span>
                    {!category.isActive && (
                      <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs">Inactive</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCurrentCategoryItems().map((item) => {
            const isEditingItem = isEditing[item.id];
            const itemData = isEditingItem ? editData[item.id] : item;
            const hasChanged = changes[item.id];

            return (
              <div 
                key={item.id} 
                className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border transition-all duration-300 ${
                  hasChanged 
                    ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' 
                    : 'border-gray-700 hover:border-red-500/50'
                }`}
              >
                {/* Item Image */}
                <div className="relative w-full h-40 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden group">
                  {itemData.imageUrl ? (
                    <img 
                      src={itemData.imageUrl} 
                      alt={itemData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm text-center">No Image<br/>(16:9)</span>
                  )}
                  
                  {/* Image Upload/Delete Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <label className="cursor-pointer bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-colors">
                      <Upload className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageUpload(item.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {itemData.imageUrl && (
                      <button
                        onClick={() => handleImageDelete(item.id)}
                        className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Item Details */}
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    {isEditingItem ? (
                      <input
                        type="text"
                        value={itemData.name}
                        onChange={(e) => setEditData({
                          ...editData,
                          [item.id]: { ...editData[item.id], name: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className="text-white font-semibold">{itemData.name}</span>
                        {itemData.isSpicy && <span className="ml-2 text-red-500 text-sm">🌶️</span>}
                        {!itemData.isAvailable && (
                          <EyeOff className="ml-2 w-4 h-4 text-gray-400" title="Hidden from customers" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    {isEditingItem ? (
                      <textarea
                        value={itemData.description || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          [item.id]: { ...editData[item.id], description: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                      />
                    ) : (
                      <p className="text-gray-300 text-sm">{itemData.description}</p>
                    )}
                  </div>

                  {/* Price and Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                      {isEditingItem ? (
                        <input
                          type="number"
                          step="0.01"
                          value={itemData.price}
                          onChange={(e) => setEditData({
                            ...editData,
                            [item.id]: { ...editData[item.id], price: parseFloat(e.target.value) }
                          })}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-red-500"
                        />
                      ) : (
                        <span className="text-yellow-400 font-bold">${itemData.price != null ? Number(itemData.price).toFixed(2) : ""}</span>
                      )}
                    </div>

                    {isEditingItem && (
                      <div className="space-y-2">
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={itemData.isSpicy}
                            onChange={(e) => setEditData({
                              ...editData,
                              [item.id]: { ...editData[item.id], isSpicy: e.target.checked }
                            })}
                            className="mr-2 text-red-600"
                          />
                          <span className="text-gray-300">Spicy</span>
                        </label>
                        
                        <label className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={itemData.isAvailable}
                            onChange={(e) => setEditData({
                              ...editData,
                              [item.id]: { ...editData[item.id], isAvailable: e.target.checked }
                            })}
                            className="mr-2 text-green-600"
                          />
                          <span className="text-gray-300">Available</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-600">
                    {isEditingItem ? (
                      <>
                        <button
                          onClick={() => handleSave(item.id)}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md w-full max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Add New Item</h2>
              
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={newItem.categoryId}
                    onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {adminCategories.filter(cat => cat.isActive).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.isSpicy}
                      onChange={(e) => setNewItem({ ...newItem, isSpicy: e.target.checked })}
                      className="mr-2 text-red-600"
                    />
                    <span className="text-gray-300">Spicy</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newItem.isAvailable}
                      onChange={(e) => setNewItem({ ...newItem, isAvailable: e.target.checked })}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-gray-300">Available</span>
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                  >
                    Add Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Management Modal */}
        {showCategoryManager && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-4xl w-full max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Manage Categories</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                  <button
                    onClick={() => setShowCategoryManager(false)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {adminCategories.map((category) => {
                  const isEditing = editingCategory === category.id;
                  const displayData = isEditing ? editCategoryData : category;
                  
                  return (
                    <div key={category.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayData.name}
                              onChange={(e) => setEditCategoryData({
                                ...editCategoryData,
                                name: e.target.value
                              })}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          ) : (
                            <span className="text-white font-semibold">{displayData.name}</span>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={displayData.displayOrder}
                              onChange={(e) => setEditCategoryData({
                                ...editCategoryData,
                                displayOrder: parseInt(e.target.value)
                              })}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:border-red-500"
                            />
                          ) : (
                            <span className="text-gray-300">{displayData.displayOrder}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  checked={displayData.isActive}
                                  onChange={(e) => setEditCategoryData({
                                    ...editCategoryData,
                                    isActive: e.target.checked
                                  })}
                                  className="mr-2 text-green-600"
                                />
                                <span className="text-gray-300">Active</span>
                              </label>
                            </div>
                          ) : (
                            <span className={`px-2 py-1 rounded text-sm ${
                              displayData.isActive 
                                ? 'bg-green-600/20 text-green-400' 
                                : 'bg-red-600/20 text-red-400'
                            }`}>
                              {displayData.isActive ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveCategory(category.id)}
                              className="bg-green-600 hover:bg-green-500 text-white py-1 px-3 rounded font-medium transition-colors duration-200 flex items-center space-x-1"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancelCategoryEdit}
                              className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded font-medium transition-colors duration-200 flex items-center space-x-1"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-3 rounded font-medium transition-colors duration-200 flex items-center space-x-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              className="bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded font-medium transition-colors duration-200 flex items-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Add New Category</h2>
              
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={newCategory.displayOrder}
                    onChange={(e) => setNewCategory({ ...newCategory, displayOrder: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                  >
                    Add Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMenuPage;