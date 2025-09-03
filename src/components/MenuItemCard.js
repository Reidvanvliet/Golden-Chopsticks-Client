import React from 'react';
import { Plus, Minus } from 'lucide-react';

const MenuItemCard = ({ item, quantity, onAdd, onRemove }) => {
  const hasImage = item.imageUrl && item.imageUrl !== '';
  
  return (
    <div className='flex items-center h-full'>
    <div className="bg-gray-800/50 w-full backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/25">
      {hasImage && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-6 flex flex-col justify-center min-h-[200px]">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-white group-hover:text-red-300 transition-colors">
            {item.name}
          </h3>
          <span className="text-2xl font-bold text-red-400 ml-4">
            ${item.price.toFixed(2)}
          </span>
        </div>
        
        {item.description && (
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={onRemove}
              disabled={quantity === 0}
              className="p-2 rounded-full bg-gray-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            
            <span className="text-white font-medium w-8 text-center">
              {quantity}
            </span>
            
            <button
              onClick={onAdd}
              className="p-2 rounded-full bg-red-600 hover:bg-red-500 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default MenuItemCard;