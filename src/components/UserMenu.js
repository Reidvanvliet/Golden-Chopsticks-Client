import React from 'react';
import { User, ArrowDown } from 'lucide-react';

// Helper function to check if user has admin privileges
const isUserAdmin = (user) => {
  return user?.isAdmin || user?.role === 'admin' || user?.role === 'super_admin';
};

const UserMenu = ({ user, isOpen, onToggle, onLogout, setCurrentPage }) => {
  if (!user) return null;

  const handleMenuItemClick = (page) => {
    setCurrentPage(page);
    onToggle(); // Close the menu
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 text-light-gold hover:text-primary-gold transition-colors duration-200"
      >
        <User className="w-5 h-5" />
        <span className="hidden sm:inline">{user.firstName}</span>
        <ArrowDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
          <UserMenuItem onClick={() => handleMenuItemClick('profile')}>
            View Profile
          </UserMenuItem>
          <UserMenuItem onClick={() => handleMenuItemClick('orders')}>
            Order History
          </UserMenuItem>
          {isUserAdmin(user) && (
            <>
              <div className="border-t border-gray-700 my-2"></div>
              <UserMenuItem onClick={() => handleMenuItemClick('admin')} className="text-yellow-400 hover:text-yellow-300">
                Admin Panel
              </UserMenuItem>
            </>
          )}
          <div className="border-t border-gray-700 my-2"></div>
          <UserMenuItem onClick={onLogout} className="text-red-400 hover:text-red-300">
            Sign Out
          </UserMenuItem>
        </div>
      )}
    </div>
  );
};

const UserMenuItem = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200 ${className}`}
  >
    {children}
  </button>
);

export default UserMenu;