import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, MapPin, User } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { orderAPI, paymentAPI, handleAPIError } from '../services/api';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af'
      }
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444'
    }
  }
};

// Checkout Form Component (wrapped in Elements provider)
const CheckoutForm = ({ 
  user, 
  cartItems, 
  cartTotal, 
  clearCart, 
  setCurrentPage, 
  setLoading, 
  setError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderData, setOrderData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const subtotal = cartTotal;
  const tax = subtotal * 0.12; // 12% HST
  const deliveryFee = deliveryType === 'delivery' ? 3.99 : 0;
  const total = subtotal + tax + deliveryFee;

  // Create payment intent when total changes or component mounts
  useEffect(() => {
    if (paymentMethod === 'card' && total > 0) {
      createPaymentIntent();
    }
  }, [total, paymentMethod]);

  const createPaymentIntent = async () => {
    try {
      const intent = await paymentAPI.createPaymentIntent({
        total,
        customerEmail: orderData.email,
        customerFirstName: orderData.firstName,
        customerLastName: orderData.lastName,
        orderType: deliveryType
      });
      setPaymentIntent(intent);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setCardError('Failed to initialize payment. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!orderData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!orderData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!orderData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!orderData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(orderData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (deliveryType === 'delivery' && !orderData.address.trim()) {
      errors.address = 'Delivery address is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardChange = (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setCardError(event.error ? event.error.message : null);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      setLoading(true);

      // Validate form
      if (!validateForm()) {
        throw new Error('Please fix the errors below and try again');
      }

      // Prepare order data
      const order = {
        userId: user?.id || null,
        customerEmail: orderData.email,
        customerFirstName: orderData.firstName,
        customerLastName: orderData.lastName,
        customerPhone: orderData.phone,
        customerAddress: deliveryType === 'delivery' ? orderData.address : null,
        orderType: deliveryType,
        paymentMethod: paymentMethod,
        items: cartItems.map(item => {
          if (item.isCombo) {
            return {
              isCombo: true,
              comboId: item.comboId,
              selectedItems: item.selectedItems,
              additionalItems: item.additionalItems,
              baseChoice: item.baseChoice,
              quantity: item.quantity,
              price: item.price,
              itemName: item.name
            };
          } else {
            return {
              menuItemId: item.id,
              quantity: item.quantity,
              price: item.price,
              itemName: item.name
            };
          }
        }),
        subtotal: subtotal,
        tax: tax,
        deliveryFee: deliveryFee,
        total: total,
        notes: orderData.notes
      };

      let createdOrder;

      if (paymentMethod === 'card') {
        // Get the card element
        const cardElement = elements.getElement(CardElement);

        // Confirm the payment with Stripe
        const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
          paymentIntent.clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${orderData.firstName} ${orderData.lastName}`,
                email: orderData.email,
                phone: orderData.phone,
                address: deliveryType === 'delivery' ? {
                  line1: orderData.address
                } : null
              }
            }
          }
        );

        if (error) {
          // Show error to customer
          setCardError(error.message);
          throw new Error(error.message);
        }

        // Payment succeeded, create the order
        order.paymentStatus = 'paid';
        order.stripePaymentIntentId = confirmedIntent.id;
        createdOrder = await orderAPI.createOrder(order);

      } else {
        // For cash/card on arrival orders
        order.paymentStatus = 'pending';
        createdOrder = await orderAPI.createOrder(order);
      }

      // Clear cart and redirect to confirmation
      clearCart();
      setCurrentPage('confirmation');
      
      // Store order details for confirmation page with guest info
      const orderForStorage = {
        ...createdOrder,
        isGuestOrder: !user,
        customerInfo: {
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          email: orderData.email,
          phone: orderData.phone
        }
      };
      localStorage.setItem('lastOrder', JSON.stringify(orderForStorage));

    } catch (error) {
      handleAPIError(error, false);
      setError(error.message);
      setCardError(error.message);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Checkout</h1>
        
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information & Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Information */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3" />
                  Customer Information
                  {!user && (
                    <span className="ml-auto text-sm bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                      Guest Checkout
                    </span>
                  )}
                </h2>
                
                {!user && (
                  <div className="mb-6 p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      <span className="font-medium">Checking out as a guest.</span> You'll receive order updates via email.
                      Want to save your info for faster checkout? 
                      <button 
                        type="button"
                        onClick={() => setCurrentPage('signin')}
                        className="ml-1 text-blue-400 hover:text-blue-300 underline"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={orderData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                        validationErrors.firstName 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-red-500 focus:ring-red-500'
                      }`}
                      required
                      disabled={isProcessing}
                    />
                    {validationErrors.firstName && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={orderData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                        validationErrors.lastName 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-red-500 focus:ring-red-500'
                      }`}
                      required
                      disabled={isProcessing}
                    />
                    {validationErrors.lastName && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.lastName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={orderData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                        validationErrors.email 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-red-500 focus:ring-red-500'
                      }`}
                      required
                      disabled={isProcessing}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={orderData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                        validationErrors.phone 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-red-500 focus:ring-red-500'
                      }`}
                      required
                      disabled={isProcessing}
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Order Type & Address */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-3" />
                  Order Details
                </h2>
                
                {/* Delivery Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Order Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700/70 transition-colors">
                      <input
                        type="radio"
                        value="pickup"
                        checked={deliveryType === 'pickup'}
                        onChange={(e) => setDeliveryType(e.target.value)}
                        className="text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                        disabled={isProcessing}
                      />
                      <div className="ml-3">
                        <span className="text-white font-medium">Pickup</span>
                        <p className="text-gray-400 text-sm">Ready in 15-20 mins</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700/70 transition-colors">
                      <input
                        type="radio"
                        value="delivery"
                        checked={deliveryType === 'delivery'}
                        onChange={(e) => setDeliveryType(e.target.value)}
                        className="text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                        disabled={isProcessing}
                      />
                      <div className="ml-3">
                        <span className="text-white font-medium">Delivery</span>
                        <p className="text-gray-400 text-sm">30-45 mins • +$3.99</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Address (if delivery) */}
                {deliveryType === 'delivery' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={orderData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St, West Kelowna, BC"
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 ${
                        validationErrors.address 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:border-red-500 focus:ring-red-500'
                      }`}
                      required={deliveryType === 'delivery'}
                      disabled={isProcessing}
                    />
                    {validationErrors.address && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.address}</p>
                    )}
                  </div>
                )}
                
                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={orderData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any special requests or notes..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    disabled={isProcessing}
                  />
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3" />
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700/70 transition-colors">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                      disabled={isProcessing}
                    />
                    <div className="ml-3 flex-1">
                      <span className="text-white font-medium">Credit Card</span>
                      <p className="text-gray-400 text-sm">Pay online with Stripe</p>
                    </div>
                    <Lock className="w-5 h-5 text-green-400" />
                  </label>
                  
                  <label className="flex items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700/70 transition-colors">
                    <input
                      type="radio"
                      value="card_on_arrival"
                      checked={paymentMethod === 'card_on_arrival'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                      disabled={isProcessing}
                    />
                    <div className="ml-3">
                      <span className="text-white font-medium">Card on Arrival</span>
                      <p className="text-gray-400 text-sm">Pay with card when you receive your order</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-4 bg-gray-700/50 rounded-lg border border-gray-600 cursor-pointer hover:bg-gray-700/70 transition-colors">
                    <input
                      type="radio"
                      value="cash_on_arrival"
                      checked={paymentMethod === 'cash_on_arrival'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
                      disabled={isProcessing}
                    />
                    <div className="ml-3">
                      <span className="text-white font-medium">Cash on Arrival</span>
                      <p className="text-gray-400 text-sm">Pay with cash when you receive your order</p>
                    </div>
                  </label>
                </div>
                
                {/* Stripe Card Element */}
                {paymentMethod === 'card' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Card Details
                    </label>
                    <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                      <CardElement 
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardChange}
                      />
                    </div>
                    {cardError && (
                      <p className="mt-2 text-sm text-red-400">{cardError}</p>
                    )}
                    <p className="mt-3 text-xs text-gray-400 flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      Your payment info is secure and encrypted by Stripe
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 sticky top-24">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                
                {!user && (
                  <div className="mb-4 p-3 bg-blue-600/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm font-medium">Guest Order</p>
                    <p className="text-blue-300/80 text-xs">Order confirmation will be sent to your email</p>
                  </div>
                )}
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-white font-medium">{item.quantity}x {item.name}</span>
                          {item.isSpicy && <span className="ml-1 text-red-500 text-sm">🌶️</span>}
                          {item.isCombo && (
                            <div className="ml-4 mt-1 text-xs text-gray-400">
                              <div className="bg-red-700/20 inline-block px-2 py-1 rounded mb-1">COMBO</div>
                              {item.comboDetails?.spring_rolls_included > 0 && (
                                <div>• {item.comboDetails.spring_rolls_included} Spring Roll{item.comboDetails.spring_rolls_included > 1 ? 's' : ''}</div>
                              )}
                              {item.selectedItems && item.selectedItems.length > 0 && (
                                <div>• {item.selectedItems.length} selected item{item.selectedItems.length > 1 ? 's' : ''}</div>
                              )}
                              {item.additionalItems && item.additionalItems.length > 0 && (
                                <div>• +{item.additionalItems.length} extra item{item.additionalItems.length > 1 ? 's' : ''}</div>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-gray-300 ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Totals */}
                <div className="space-y-2 mb-6 border-t border-gray-600 pt-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
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
                  <div className="flex justify-between text-white font-bold text-xl border-t border-gray-600 pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Place Order Button */}
                <button
                  type="submit"
                  className="w-full bg-red-700 hover:bg-red-600 text-white py-4 px-6 rounded-lg font-medium transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isProcessing || !stripe}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </button>
                
                <p className="text-gray-400 text-xs text-center mt-4">
                  🔒 Your information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main CheckoutPage component wrapped with Stripe Elements
const CheckoutPage = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default CheckoutPage;