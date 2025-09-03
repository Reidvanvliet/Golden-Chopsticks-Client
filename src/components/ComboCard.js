import React, { useState } from 'react';
import { Plus, Minus, Star } from 'lucide-react';
import ComboSelector from './ComboSelector';

const ComboCard = ({ combo, onAddToCart }) => {
  const [showSelector, setShowSelector] = useState(false);

  const handleComboSelect = (comboData) => {
    onAddToCart(comboData);
    setShowSelector(false);
  };

  if (showSelector) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Customize Your Combo</h2>
            <button
              onClick={() => setShowSelector(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          <ComboSelector
            comboId={combo.id}
            onAddToCart={handleComboSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-red-600/50 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{combo.name}</h3>
          <p className="text-gray-300 text-sm mb-3">{combo.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-400">
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              <span>Choose {(combo.base_items || combo.baseItems)} items</span>
            </div>
            {(combo.spring_rolls_included || combo.springRollsIncluded) > 0 && (
              <div className="flex items-center text-sm text-green-400">
                <Plus className="w-4 h-4 mr-2" />
                <span>Includes {combo.spring_rolls_included || combo.springRollsIncluded} Spring Roll{(combo.spring_rolls_included || combo.springRollsIncluded) > 1 ? 's' : ''}</span>
              </div>
            )}
            {(combo.additional_item_price || combo.additionalItemPrice) && (
              <div className="flex items-center text-sm text-blue-400">
                <Plus className="w-4 h-4 mr-2" />
                <span>
                  {combo.id === 1 ? (
                    'Add extra items: 3rd item +$3.00, 4+ items +$7.00 each'
                  ) : (
                    `Add extra items for $${parseFloat(combo.additional_item_price || combo.additionalItemPrice).toFixed(2)} each`
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-red-400 mb-4">
            ${parseFloat(combo.base_price || combo.basePrice).toFixed(2)}
          </div>
          <button
            onClick={() => setShowSelector(true)}
            className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Customize
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboCard;