import React, { useState, useEffect } from 'react';
import CategoryNavigation from '../components/CategoryNavigation';
import MenuItemCard from '../components/MenuItemCard';
import LoadingState from '../components/LoadingState';
import ComboCard from '../components/ComboCard';
import { useMenuData } from '../hooks/useMenuData';
import { getCategoryItems, getCategoryName, getItemQuantity, createComboCartItem } from '../utils/menuHelpers';
import { COMBINATIONS_CATEGORY_ID } from '../utils/constants';

const MenuPage = ({ menuItems, categories, addToCart, removeFromCart, cartItems }) => {
  const [activeCategory, setActiveCategory] = useState('');
  const { combos, loadingCombos } = useMenuData(categories, activeCategory);

  useEffect(() => {
    if (!activeCategory && categories && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const handleComboAddToCart = (comboData) => {
    const comboCartItem = createComboCartItem(comboData, combos);
    addToCart(comboCartItem);
  };

  const activeCategoryItems = getCategoryItems(activeCategory, menuItems);
  const activeCategoryName = getCategoryName(activeCategory, categories);
  const isComboCategory = activeCategory === COMBINATIONS_CATEGORY_ID;

  if (!menuItems || Object.keys(menuItems).length === 0) {
    return <LoadingState message="Loading menu..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16">
      <CategoryNavigation 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isComboCategory ? (
          <CombosSection 
            combos={combos}
            loadingCombos={loadingCombos}
            onComboAddToCart={handleComboAddToCart}
          />
        ) : (
          <MenuItemsSection
            categoryName={activeCategoryName}
            items={activeCategoryItems}
            cartItems={cartItems}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
          />
        )}
      </div>
    </div>
  );
};

const CombosSection = ({ combos, loadingCombos, onComboAddToCart }) => (
  <>
    <h2 className="text-3xl font-bold text-white mb-8">Combination Dinners</h2>
    
    {loadingCombos ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-white">Loading combinations...</p>
      </div>
    ) : combos.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {combos.map((combo) => (
          <ComboCard
            key={combo.id}
            combo={combo}
            onAddToCart={onComboAddToCart}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-400">
        <p className="text-xl">No combinations available at the moment.</p>
      </div>
    )}
  </>
);

const MenuItemsSection = ({ categoryName, items, cartItems, addToCart, removeFromCart }) => (
  <>
    <h2 className="text-3xl font-bold text-white mb-8">{categoryName}</h2>
    
    {items.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            quantity={getItemQuantity(item.id, cartItems)}
            onAdd={() => addToCart(item)}
            onRemove={() => removeFromCart(item.id)}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-400">
        <p className="text-xl">No items available in this category.</p>
      </div>
    )}
  </>
);

export default MenuPage;