import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  Home,
} from "lucide-react";

const ConfirmationPage = ({ setCurrentPage }) => {
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchAndSetOrderDetails = async () => {
      try {
        const lastOrder = localStorage.getItem("lastOrder");
        console.log('Retrieved lastOrder from localStorage:', lastOrder); // Debug log
        
        if (!lastOrder) {
          console.warn('No lastOrder found in localStorage');
          setOrderDetails(null);
          return;
        }
        
        // Get order details from localStorage (set during checkout)
        const details = await fetchOrderDetails(lastOrder);
        console.log('Parsed order details:', details); // Debug log
        setOrderDetails(details);
        console.log(`these are the order details: ${orderDetails}`);
        
        // Clear it after loading to prevent stale data
        localStorage.removeItem("lastOrder");
      } catch (error) {
        console.error('Error loading order details:', error);
        setOrderDetails(null);
      }
    };
    fetchAndSetOrderDetails();
  }, []);

  const fetchOrderDetails = async (lastOrder) => {
    if (lastOrder) {
      try {
        const parsed = JSON.parse(lastOrder);
        console.log('Raw parsed data:', parsed);
        
        // Check if this is the nested structure from the API response
        if (parsed.order) {
          // Flatten the structure to make it easier to work with
          const flattened = {
            ...parsed.order,
            // Keep the customer info from the root level if it exists
            customerInfo: parsed.customerInfo || {
              firstName: parsed.order.customerFirstName,
              lastName: parsed.order.customerLastName,
              email: parsed.order.customerEmail,
              phone: parsed.order.customerPhone
            },
            isGuestOrder: parsed.isGuestOrder
          };
          console.log('Flattened order data:', flattened);
          return flattened;
        }
        
        // Validate essential fields for direct structure
        if (!parsed.orderNumber && !parsed.id) {
          console.warn('Order data missing essential identifier');
          return null;
        }
        return parsed;
      } catch (parseError) {
        console.error('Error parsing order data:', parseError);
        return null;
      }
    }
    return null;
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      card: "Credit Card (Paid Online)",
      card_on_arrival: "Card on Arrival",
      cash_on_arrival: "Cash on Arrival",
    };
    return methods[method] || method;
  };

  const getEstimatedTime = (orderType) => {
    if (orderType === "delivery") {
      return "30-45 minutes";
    }
    return "15-20 minutes";
  };

  const parseComboItem = (item) => {
    try {
      // Check if itemName contains JSON combo data
      const comboData = JSON.parse(item.itemName);
      if (comboData.type === 'combo') {
        return {
          ...item,
          isCombo: true,
          comboData: comboData,
          displayName: comboData.originalName
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

  const getMenuItemName = async (itemId) => {
    // In a real app, you'd fetch this from an API or context
    // For now, return a placeholder
    return `Menu Item ${itemId}`;
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <p className="text-white text-lg mb-4">Order details not found</p>
            <p className="text-gray-400 text-sm mb-6">
              We couldn't find your recent order information. This might happen if you navigated away during checkout or if there was a browser issue.
            </p>
            <button
              onClick={() => setCurrentPage("home")}
              className="bg-red-700 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-xl text-gray-300">
            Thank you for choosing Gold Chopsticks
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Order Details
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div>
                    <p className="text-gray-400 text-sm">Order Number</p>
                    <p className="text-white font-bold text-lg">
                      #{orderDetails.orderNumber || orderDetails.id || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Order Date & Time</p>
                    <p className="text-white">
                      {orderDetails.created_at ? formatOrderDate(orderDetails.created_at) : 'Just now'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Order Type</p>
                    <p className="text-white capitalize">
                      {orderDetails.orderType}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Estimated {orderDetails.orderType} time:{" "}
                      {getEstimatedTime(orderDetails.orderType)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Payment Method</p>
                    <p className="text-white">
                      {getPaymentMethodDisplay(orderDetails.paymentMethod)}
                    </p>
                  </div>
                </div>

                {orderDetails.orderType === "delivery" &&
                  orderDetails.customerAddress && (
                    <div className="flex items-start space-x-3">
                      <Home className="w-5 h-5 text-purple-400 mt-1" />
                      <div>
                        <p className="text-gray-400 text-sm">
                          Delivery Address
                        </p>
                        <p className="text-white">
                          {orderDetails.customerAddress}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Customer Information
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white">
                    {orderDetails.customerInfo?.firstName || orderDetails.customerFirstName}{" "}
                    {orderDetails.customerInfo?.lastName || orderDetails.customerLastName}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{orderDetails.customerInfo?.email || orderDetails.customerEmail}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <p className="text-white">{orderDetails.customerInfo?.phone || orderDetails.customerPhone}</p>
                </div>

                {orderDetails.notes && (
                  <div>
                    <p className="text-gray-400 text-sm">
                      Special Instructions
                    </p>
                    <p className="text-white">{orderDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Items Ordered</h2>

          <div className="space-y-4">
            {(orderDetails.items || []).map((item, index) => {
              const parsedItem = parseComboItem(item);
              
              return (
                <div
                  key={index}
                  className="py-3 border-b border-gray-600 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-white font-medium">
                        {parsedItem.quantity}x {parsedItem.displayName}
                      </span>
                      {parsedItem.isCombo && parsedItem.comboData && (
                        <div className="ml-4 mt-2 text-sm text-gray-400">
                          <div className="bg-red-700/20 inline-block px-2 py-1 rounded mb-2 text-xs">COMBO</div>
                          
                          {/* Base Choice for combos 2-7 */}
                          {parsedItem.comboData.baseChoice && (
                            <div className="mb-1">• Base: Chicken Chow Mein or Chicken Fried Rice</div>
                          )}
                          
                          {/* Spring rolls info - you'd need to fetch this from combo details */}
                          {[2, 3, 4, 5, 6, 7].includes(parsedItem.comboData.comboId) && (
                            <div className="mb-1">• {parsedItem.comboData.comboId === 2 ? '2' : parsedItem.comboData.comboId === 3 ? '3' : parsedItem.comboData.comboId === 4 ? '4' : parsedItem.comboData.comboId === 5 ? '6' : parsedItem.comboData.comboId === 6 ? '8' : '10'} Spring Roll{parsedItem.comboData.comboId === 2 ? 's' : 's'} (included)</div>
                          )}
                          
                          {/* Selected Items */}
                          {parsedItem.comboData.selectedItems && parsedItem.comboData.selectedItems.length > 0 && (
                            <div className="mb-1">• {parsedItem.comboData.selectedItems.length} selected entree{parsedItem.comboData.selectedItems.length > 1 ? 's' : ''}</div>
                          )}
                          
                          {/* Additional Items */}
                          {parsedItem.comboData.additionalItems && parsedItem.comboData.additionalItems.length > 0 && (
                            <div className="mb-1">• {parsedItem.comboData.additionalItems.length} additional item{parsedItem.comboData.additionalItems.length > 1 ? 's' : ''}</div>
                          )}
                        </div>
                      )}
                      <p className="text-gray-400 text-sm mt-1">
                        ${parsedItem.price != null ? Number(parsedItem.price).toFixed(2) : ""} each
                      </p>
                    </div>
                    <span className="text-white font-bold ml-4">
                      ${Number(parsedItem.price * parsedItem.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Totals */}
          <div className="border-t border-gray-600 pt-6 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>
                  $
                  {orderDetails.subtotal != null ? Number(orderDetails.subtotal).toFixed(2) : ""}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span>
                  $
                  {orderDetails.tax != null ? Number(orderDetails.tax).toFixed(2) : ""}
                </span>
              </div>
              {orderDetails.deliveryFee > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Delivery Fee</span>
                  <span>
                    $
                    {orderDetails.deliveryFee != null ? Number(orderDetails.deliveryFee).toFixed(2) : ""}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-xl border-t border-gray-600 pt-3">
                <span>Total</span>
                <span>
                  $
                  {orderDetails.total != null ? Number(orderDetails.total).toFixed(2) : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* What's Next */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <p className="text-gray-300">
                  We've received your order and are preparing it now
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <p className="text-gray-300">
                  {orderDetails.orderType === "delivery"
                    ? "Our driver will contact you when your order is on the way"
                    : "We'll call you when your order is ready for pickup"}
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <p className="text-gray-300">Enjoy your delicious meal!</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-gray-400 text-sm">Call us at</p>
                  <a
                    href="tel:+17787545535"
                    className="text-white hover:text-yellow-400 transition-colors"
                  >
                    (778) 754-5535
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-gray-400 text-sm">Visit us at</p>
                  <p className="text-white">
                    2459 Main Street, West Kelowna, BC
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-gray-400 text-sm">Hours</p>
                  <p className="text-white">Mon: Closed</p>
                  <p className="text-white">Tues-Sun: 3:00 PM - 8:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <button
            onClick={() => setCurrentPage("home")}
            className="bg-red-700 hover:bg-red-600 text-white py-3 px-8 rounded-lg font-medium transition-colors duration-200 text-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
