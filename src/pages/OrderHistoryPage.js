import React, { useState, useEffect } from 'react';
import { Clock, MapPin, DollarSign, Package } from 'lucide-react';
import { orderAPI } from '../services/api';
import LoadingState from '../components/LoadingState';

// Helper function to normalize order data structure
const normalizeOrderData = (order) => {
  // Handle nested order structure (like from API responses)
  const actualOrder = order.order || order;
  
  return {
    id: actualOrder.id || actualOrder.orderNumber,
    orderNumber: actualOrder.orderNumber || actualOrder.id,
    createdAt: actualOrder.created_at || actualOrder.createdAt,
    status: actualOrder.status,
    total: actualOrder.total,
    orderType: actualOrder.orderType || actualOrder.order_type,
    deliveryAddress: actualOrder.customerAddress || actualOrder.delivery_address,
    items: (actualOrder.items || []).map(item => ({
      id: item.id,
      name: item.itemName || item.name || (item.menuItem?.name),
      quantity: item.quantity,
      price: item.price
    }))
  };
};

const OrderHistoryPage = ({ user, setCurrentPage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setCurrentPage('signin');
        return;
      }

      try {
        setLoading(true);
        const response = await orderAPI.getUserOrders(user.id);
        console.log('Raw orders response:', response); // Debug log
        
        // Handle different response structures
        let userOrders = [];
        if (Array.isArray(response)) {
          userOrders = response;
        } else if (response.orders && Array.isArray(response.orders)) {
          userOrders = response.orders;
        } else if (response.data && Array.isArray(response.data)) {
          userOrders = response.data;
        }
        
        // Normalize order data structure
        const normalizedOrders = userOrders.map(normalizeOrderData);
        console.log('Normalized orders:', normalizedOrders); // Debug log
        
        setOrders(normalizedOrders);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, setCurrentPage]);

  if (loading) {
    return <LoadingState message="Loading your orders..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Order History</h1>
          <button
            onClick={() => setCurrentPage('menu')}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Order Again
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <EmptyOrderHistory setCurrentPage={setCurrentPage} />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyOrderHistory = ({ setCurrentPage }) => (
  <div className="text-center py-16">
    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-2xl font-semibold text-white mb-2">No Orders Yet</h2>
    <p className="text-gray-400 mb-6">
      You haven't placed any orders yet. Start exploring our delicious menu!
    </p>
    <button
      onClick={() => setCurrentPage('menu')}
      className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
    >
      Browse Menu
    </button>
  </div>
);

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'confirmed':
        return 'text-blue-400 bg-blue-900/20';
      case 'preparing':
        return 'text-orange-400 bg-orange-900/20';
      case 'ready':
        return 'text-green-400 bg-green-900/20';
      case 'completed':
        return 'text-green-400 bg-green-900/20';
      case 'cancelled':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Order #{order.orderNumber || order.id}
          </h3>
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {order.createdAt ? formatDate(order.createdAt) : 'Date not available'}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-green-400 font-semibold mt-1">
            <DollarSign className="w-4 h-4" />
            {order.total ? parseFloat(order.total).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {order.deliveryAddress && (
        <div className="flex items-center text-gray-400 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          {order.deliveryAddress}
        </div>
      )}

      {order.items && order.items.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-white font-medium mb-2">Items Ordered:</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={item.id || index} className="flex justify-between text-sm">
                <span className="text-gray-300">
                  {item.quantity || 1}x {item.name || 'Unknown Item'}
                </span>
                <span className="text-gray-400">
                  ${item.price && item.quantity ? (parseFloat(item.price) * parseInt(item.quantity)).toFixed(2) : '0.00'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;