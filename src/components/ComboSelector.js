import React, { useState, useEffect } from 'react';
import { useCombo } from '../hooks/useCombo';

const ItemSelector = ({ item, isSelected, onSelect, showPrice = false, additionalPrice = 0 }) => (
  <div 
    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
      isSelected 
        ? 'border-primary-gold bg-primary-gold/10' 
        : 'border-gray-300 hover:border-primary-gold/50'
    }`}
    onClick={onSelect}
  >
    <div className="flex justify-between items-center">
      <div>
        <h4 className="font-medium">{item.item_name}</h4>
        {item.description && (
          <p className="text-sm text-gray-600">{item.description}</p>
        )}
      </div>
      {showPrice && (
        <span className="text-primary-gold font-semibold">
          +${parseFloat(additionalPrice).toFixed(2)}
        </span>
      )}
    </div>
  </div>
);

const ComboSelector = ({ comboId, onAddToCart }) => {
  const { combo, availableItems, loading, error } = useCombo(comboId);
  const [selectedItems, setSelectedItems] = useState([]);
  const [additionalItems, setAdditionalItems] = useState([]);
  const [baseChoice, setBaseChoice] = useState(null); // For combo 2 base choice

  useEffect(() => {
    // Reset selections when combo changes
    setSelectedItems([]);
    setAdditionalItems([]);
    setBaseChoice(null);
  }, [comboId]);

  const handleBaseChoiceSelect = (itemId) => {
    setBaseChoice(itemId);
  };

  const handleItemSelect = (itemId, isAdditional = false) => {
    if (isAdditional) {
      setAdditionalItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      let maxSelections;
      
      if ([2, 3, 4, 5, 6, 7].includes(combo.id)) {
        // For combos 2-7, calculate entree selections (base choice is separate)
        const selectionCounts = {
          2: 2, // Dinner for Two: 2 entree selections
          3: 3, // Dinner for Three: 3 entree selections
          4: 4, // Dinner for Four: 4 entree selections
          5: 5, // Dinner for Six: 5 entree selections
          6: 7, // Dinner for Eight: 7 entree selections
          7: 9  // Dinner for Ten: 9 entree selections
        };
        maxSelections = selectionCounts[combo.id];
      } else {
        maxSelections = (combo.base_items || combo.baseItems) - (combo.spring_rolls_included || combo.springRollsIncluded || 0);
      }
      
      if (selectedItems.length < maxSelections || selectedItems.includes(itemId)) {
        setSelectedItems(prev =>
          prev.includes(itemId)
            ? prev.filter(id => id !== itemId)
            : prev.length < maxSelections
            ? [...prev, itemId]
            : prev
        );
      }
    }
  };

  // const getNextItemPrice = () => {
  //   if (!combo || combo.id !== 1) {
  //     return parseFloat(combo?.additional_item_price || combo?.additionalItemPrice || 0);
  //   }
  //   
  //   // Special pricing for combo 1
  //   const currentTotal = selectedItems.length + additionalItems.length;
  //   
  //   if (currentTotal < 2) {
  //     return 0; // Items 1-2 are included in base price
  //   } else if (currentTotal === 2) {
  //     return 3.00; // 3rd item costs +$3.00
  //   } else {
  //     return 7.00; // 4+ items cost +$7.00 each
  //   }
  // };

  const calculateTotal = () => {
    if (!combo) return 0;
    
    // Special pricing logic for combo 1
    if (combo.id === 1) {
      const totalItems = selectedItems.length + additionalItems.length;
      
      if (totalItems <= 2) {
        return 17.95; // Base price for 2 items
      } else if (totalItems === 3) {
        return 20.95; // 3 items price
      } else {
        // 4+ items: base 3-item price + $7 per additional item after 3rd
        return 20.95 + ((totalItems - 3) * 7.00);
      }
    }
    
    // Default pricing for other combos
    const basePrice = parseFloat(combo.base_price || combo.basePrice);
    const additionalPrice = additionalItems.length * parseFloat(combo.additional_item_price || combo.additionalItemPrice || 0);
    return basePrice + additionalPrice;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading combo: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Combo not available</p>
      </div>
    );
  }

  const entreeItems = availableItems.filter(item => item.is_entree);
  const baseChoiceItems = availableItems.filter(item => !item.is_entree); // For combo 2
  
  let maxSelections, canAddToCart;
  
  if ([2, 3, 4, 5, 6, 7].includes(combo.id)) {
    // For combos 2-7: need base choice + specific number of entree selections
    const selectionCounts = {
      2: 2, // Dinner for Two: 2 entree selections
      3: 3, // Dinner for Three: 3 entree selections
      4: 4, // Dinner for Four: 4 entree selections
      5: 5, // Dinner for Six: 5 entree selections
      6: 7, // Dinner for Eight: 7 entree selections
      7: 9  // Dinner for Ten: 9 entree selections
    };
    maxSelections = selectionCounts[combo.id];
    canAddToCart = baseChoice !== null && selectedItems.length === maxSelections;
  } else {
    maxSelections = (combo.base_items || combo.baseItems) - (combo.spring_rolls_included || combo.springRollsIncluded || 0);
    canAddToCart = selectedItems.length === maxSelections;
  }

  return (
    <div className="combo-selector max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{combo.name}</h2>
        <p className="text-gray-600 mb-4">{combo.description}</p>

        {(combo.spring_rolls_included || combo.springRollsIncluded) > 0 && (
          <div className="included-items bg-primary-gold/10 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-700">
              Includes: {combo.spring_rolls_included || combo.springRollsIncluded} Spring Roll{(combo.spring_rolls_included || combo.springRollsIncluded) > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {[2, 3, 4, 5, 6, 7].includes(combo.id) && baseChoiceItems.length > 0 && (
          <div className="base-choice-selection mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Step 1: Choose your base (Chicken Chow Mein OR Chicken Fried Rice):
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({baseChoice ? '✓ Selected' : 'Required'})
              </span>
            </h3>
            
            <div className="grid gap-3 md:grid-cols-2">
              {baseChoiceItems.map(item => (
                <ItemSelector
                  key={`base-${item.menu_item_id}`}
                  item={item}
                  isSelected={baseChoice === item.menu_item_id}
                  onSelect={() => handleBaseChoiceSelect(item.menu_item_id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="item-selection mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {[2, 3, 4, 5, 6, 7].includes(combo.id) ? 
              `Step 2: Choose ${maxSelections} entree item${maxSelections > 1 ? 's' : ''}:` : 
              `Choose ${maxSelections} item${maxSelections > 1 ? 's' : ''}:`
            }
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({selectedItems.length}/{maxSelections} selected)
            </span>
          </h3>
          
          <div className="grid gap-3 md:grid-cols-2">
            {entreeItems.map(item => (
              <ItemSelector
                key={item.menu_item_id}
                item={item}
                isSelected={selectedItems.includes(item.menu_item_id)}
                onSelect={() => handleItemSelect(item.menu_item_id)}
              />
            ))}
          </div>
        </div>

        {(combo.additional_item_price || combo.additionalItemPrice) && ![2, 3, 4, 5, 6, 7].includes(combo.id) && (
          <div className="additional-items mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {combo.id === 1 ? (
                'Add extra items (3rd item: +$3.00, 4+ items: +$7.00 each):'
              ) : (
                `Add extra items ($${parseFloat(combo.additional_item_price || combo.additionalItemPrice).toFixed(2)} each):`
              )}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {entreeItems.map(item => {
                // Calculate price for this specific item if it were to be added
                const isCurrentlySelected = additionalItems.includes(item.menu_item_id);
                const currentTotal = selectedItems.length + additionalItems.length;
                let itemPrice;
                
                if (combo.id === 1) {
                  if (isCurrentlySelected) {
                    // If already selected, show the price it was added at
                    const positionWhenAdded = selectedItems.length + additionalItems.indexOf(item.menu_item_id) + 1;
                    if (positionWhenAdded <= 2) itemPrice = 0;
                    else if (positionWhenAdded === 3) itemPrice = 3.00;
                    else itemPrice = 7.00;
                  } else {
                    // If not selected, show what it would cost to add it now
                    const nextPosition = currentTotal + 1;
                    if (nextPosition <= 2) itemPrice = 0;
                    else if (nextPosition === 3) itemPrice = 3.00;
                    else itemPrice = 7.00;
                  }
                } else {
                  itemPrice = combo.additional_item_price || combo.additionalItemPrice || 0;
                }
                
                return (
                  <ItemSelector
                    key={`additional-${item.menu_item_id}`}
                    item={item}
                    isSelected={isCurrentlySelected}
                    onSelect={() => handleItemSelect(item.menu_item_id, true)}
                    showPrice={true}
                    additionalPrice={itemPrice}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="combo-summary bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary-gold">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={() => onAddToCart({
              comboId,
              selectedItems,
              additionalItems,
              baseChoice: [2, 3, 4, 5, 6, 7].includes(combo.id) ? baseChoice : null,
              total: calculateTotal()
            })}
            disabled={!canAddToCart}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              canAddToCart
                ? 'bg-primary-gold text-black hover:bg-primary-gold/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!canAddToCart 
              ? [2, 3, 4, 5, 6, 7].includes(combo.id)
                ? (!baseChoice 
                  ? 'Choose your base first'
                  : `Select ${maxSelections - selectedItems.length} more entree item${maxSelections - selectedItems.length > 1 ? 's' : ''}`)
                : `Select ${maxSelections - selectedItems.length} more item${maxSelections - selectedItems.length > 1 ? 's' : ''}`
              : 'Add to Cart'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboSelector;