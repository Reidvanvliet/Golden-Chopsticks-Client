import React from 'react';

const CategoryNavigation = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="sticky top-16 bg-black/95 backdrop-blur-sm border-b border-red-900/30 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative">
          <div 
            className="flex overflow-x-auto space-x-4 pb-2 category-scroll scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-red-600 hover:scrollbar-thumb-red-500"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#dc2626 #111827'
            }}
          >
            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onClick={() => onCategoryChange(category.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryButton = ({ category, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 whitespace-nowrap px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? 'bg-red-700 text-white shadow-lg border border-red-600'
        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {category.name}
  </button>
);

export default CategoryNavigation;