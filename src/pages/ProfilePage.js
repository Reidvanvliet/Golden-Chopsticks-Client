import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Clock, MapPin, CreditCard } from 'lucide-react';
import { userAPI, orderAPI, handleAPIError } from '../services/api';

const ProfilePage = ({ user, setUser, setLoading, setError }) => {
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      loadOrderHistory();
    }
  }, [user]);

  const loadOrderHistory = async () => {
    try {
      setIsLoadingOrders(true);
      const orders = await orderAPI.getUserOrders(user.id);
      setOrderHistory(orders);
    } catch (error) {
      handleAPIError(error, false);
      setError('Failed to load order history');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
  };

  const handleCancel = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    // Reset form data to original values
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  };

  const handleSave = async (field) => {
    try {
      setLoading(true);
      const updatedUser = await userAPI.updateProfile({
        [field]: formData[field]
      });
      setUser({ ...user, ...updatedUser });
      setIsEditing({ ...isEditing, [field]: false });
    } catch (error) {
      handleAPIError(error, false);
      setError(`Failed to update ${field}`);
    } finally {
      setLoading(false);
    }
  };

  const parseOrderItem = (item) => {
    try {
      // Check if itemName contains JSON combo data
      const comboData = JSON.parse(item.itemName);
      if (comboData.type === 'combo') {
        return {
          ...item,
          isCombo: true,
          displayName: comboData.originalName,
          comboData: comboData
        };
      }
    } catch (e) {
      // Not JSON, treat as regular item
    }
    return {
      ...item,
      isCombo: false,
      displayName: item.itemName
    };
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      'card': 'Credit Card',
      'card_on_arrival': 'Card on Arrival',
      'cash_on_arrival': 'Cash on Arrival'
    };
    return methods[method] || method;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-12">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              {/* Email (non-editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400">
                  {user?.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              {/* Editable Fields */}
              {[
                { key: 'firstName', label: 'First Name', type: 'text' },
                { key: 'lastName', label: 'Last Name', type: 'text' },
                { key: 'phone', label: 'Phone Number', type: 'tel' },
                { key: 'address', label: 'Address', type: 'text' }
              ].map((field) => (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {field.label}
                    </label>
                    {!isEditing[field.key] && (
                      <button
                        onClick={() => handleEdit(field.key)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {isEditing[field.key] ? (
                    <div className="flex space-x-2">
                      <input
                        type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                      <button
                        onClick={() => handleSave(field.key)}
                        className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(field.key)}
                        className="bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
                      {formData[field.key] || 'Not set'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Order History */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
            
            {isLoadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading orders...</p>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No orders yet</p>
                <button
                  onClick={() => window.location.href = '#menu'}
                  className="bg-red-700 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                >
                  Place Your First Order
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {orderHistory.map((order) => (
                  <div key={order.id} className="border border-gray-600 rounded-lg p-6 bg-gray-700/30">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-gray-300 text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatOrderDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-2" />
                        {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                      </div>
                      <div className="flex items-center text-gray-300">
                        <CreditCard className="w-4 h-4 mr-2" />
                        {getPaymentMethodDisplay(order.paymentMethod)}
                      </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2">Items:</h4>
                      <div className="space-y-1">
                        {order.items?.map((item, index) => {
                          const parsedItem = parseOrderItem(item);
                          return (
                            <div key={index} className="text-gray-300 text-sm">
                              <div className="flex items-center space-x-2">
                                <span>{parsedItem.quantity}x {parsedItem.displayName}</span>
                                {parsedItem.isCombo && (
                                  <span className="bg-red-700/30 text-red-300 text-xs px-1 py-0.5 rounded">COMBO</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Order Total */}
                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Total</span>
                        <span className="text-white font-bold text-lg">${order.total != null ? Number(order.total).toFixed(2) : ""}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;