import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import ComboCartItem from '../components/ComboCartItem';

const CartPage = ({ 
  cartItems, 
  cartTotal, 
  addToCart, 
  removeFromCart, 
  clearCart, 
  setCurrentPage, 
  user 
}) => {
  const [deliveryType, setDeliveryType] = useState('pickup');
  
  const subtotal = cartTotal;
  const tax = subtotal * 0.12; // 12% tax (BC PST + GST)
  const deliveryFee = deliveryType === 'delivery' ? 3.99 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleCheckout = () => {
    if (user) {
      setCurrentPage('checkout');
    } else {
      // Offer guest checkout or login
      setCurrentPage('signin');
    }
  };

  const handleGuestCheckout = () => {
    setCurrentPage('checkout');
  };

  const removeItemCompletely = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    // This would need to be handled by the parent component
    // For now, we'll remove all quantities
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      for (let i = 0; i < item.quantity; i++) {
        removeFromCart(itemId);
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-white text-center mb-12">Your Cart</h1>
          
          <div className="text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-12 border border-gray-700">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-300 mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8">Add some delicious items from our menu!</p>
              <button
                onClick={() => setCurrentPage('menu')}
                className="bg-red-700 hover:bg-red-600 text-white py-3 px-8 rounded-lg font-medium transition-colors duration-200"
              >
                Browse Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Your Cart</h1>
          <button
            onClick={clearCart}
            className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear Cart</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Cart Items ({cartItems.length})</h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => {
                  // Check if this is a combo item
                  if (item.isCombo) {
                    return (
                      <ComboCartItem
                        key={item.id}
                        item={item}
                        addToCart={addToCart}
                        removeFromCart={removeFromCart}
                        removeItemCompletely={removeItemCompletely}
                      />
                    );
                  }
                  
                  // Regular menu item
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          {item.name}
                          {item.isSpicy && <span className="ml-2 text-red-500 text-sm">🌶️</span>}
                        </h3>
                        <p className="text-gray-300 text-sm">${item.price?.toFixed(2)} each</p>
                        {item.description && (
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors duration-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-red-700 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Item Total */}
                        <div className="text-right min-w-[5rem]">
                          <span className="text-white font-bold text-lg">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Remove Item */}
                        <button
                          onClick={() => removeItemCompletely(item.id)}
                          className="text-red-400 hover:text-red-300 p-2 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Continue Shopping */}
              <div className="mt-6 pt-6 border-t border-gray-600">
                <button
                  onClick={() => setCurrentPage('menu')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
              
              {/* Delivery/Pickup Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Order Type</label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-white">Pickup (FREE)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-white">Delivery (+$3.99)</span>
                  </label>
                </div>
              </div>
              
              {/* Order Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="flex justify-between text-gray-300">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between text-white font-bold text-xl">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Checkout Buttons */}
              <div className="space-y-4">
                {user ? (
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-red-700 hover:bg-red-600 text-white py-4 px-6 rounded-lg font-medium transition-colors duration-200 text-lg"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleGuestCheckout}
                      className="w-full bg-red-700 hover:bg-red-600 text-white py-4 px-6 rounded-lg font-medium transition-colors duration-200 text-lg"
                    >
                      Continue as Guest
                    </button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-400">or</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentPage('signin')}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                    >
                      <span>Sign In for Faster Checkout</span>
                    </button>
                    <p className="text-gray-400 text-xs text-center">
                      Guest checkout: No account required • Order confirmation via email
                    </p>
                  </>
                )}
              </div>
              
              {/* Secure Checkout Notice */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-xs">
                  🔒 Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;