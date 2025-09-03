import React from 'react';
import { Plus, Minus, Trash2, Star } from 'lucide-react';

const ComboCartItem = ({ item, addToCart, removeFromCart, removeItemCompletely }) => {
  return (
    <div className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-red-500">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
            <span className="bg-red-700 text-white text-xs px-2 py-1 rounded">COMBO</span>
          </div>
          
          <p className="text-gray-300 text-sm mb-3">${item.price?.toFixed(2)} each</p>
          
          {/* Combo Details */}
          <div className="bg-gray-800/50 rounded p-3 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {/* Included Items */}
              {item.comboDetails?.spring_rolls_included > 0 && (
                <div>
                  <h4 className="text-green-400 font-medium mb-1">Included:</h4>
                  <p className="text-gray-300">
                    {item.comboDetails.spring_rolls_included} Spring Roll{item.comboDetails.spring_rolls_included > 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {/* Selected Items */}
              {item.selectedItems && item.selectedItems.length > 0 && (
                <div>
                  <h4 className="text-blue-400 font-medium mb-1">Selected Items:</h4>
                  <p className="text-gray-300">
                    {item.selectedItems.length} item{item.selectedItems.length > 1 ? 's' : ''} chosen
                  </p>
                </div>
              )}
              
              {/* Additional Items */}
              {item.additionalItems && item.additionalItems.length > 0 && (
                <div>
                  <h4 className="text-purple-400 font-medium mb-1">Extra Items:</h4>
                  <p className="text-gray-300">
                    +{item.additionalItems.length} additional item{item.additionalItems.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quantity Controls */}
        <div className="flex items-center space-x-3 ml-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => removeFromCart(item.id)}
              className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors duration-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-white font-semibold min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => addToCart(item)}
              className="bg-red-700 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => removeItemCompletely(item.id)}
            className="text-red-400 hover:text-red-300 p-2 transition-colors duration-200"
            title="Remove item completely"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Total for this item */}
      <div className="flex justify-end mt-3 pt-3 border-t border-gray-600">
        <span className="text-red-400 font-bold">
          Total: ${(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default ComboCartItem;