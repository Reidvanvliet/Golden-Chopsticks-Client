import React from 'react';
import { X } from 'lucide-react';

// Helper function to check if user has admin privileges
const isUserAdmin = (user) => {
  return user?.isAdmin || user?.role === 'admin' || user?.role === 'super_admin';
};

const MobileMenu = ({ isOpen, onClose, currentPage, setCurrentPage, user, onLogout }) => {
  if (!isOpen) return null;

  const handleNavigation = (page) => {
    setCurrentPage(page);
    onClose();
  };

  const menuItems = [
    { key: 'home', label: 'Home' },
    { key: 'menu', label: 'Menu' },
    { key: 'contact', label: 'Contact' }
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed top-0 right-0 h-full w-64 bg-gray-900/95 backdrop-blur-sm shadow-2xl border-l border-gray-600">
        <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-black/70">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          <div className="space-y-4">
            {menuItems.map((item) => (
              <MobileMenuItem
                key={item.key}
                isActive={currentPage === item.key}
                onClick={() => handleNavigation(item.key)}
              >
                {item.label}
              </MobileMenuItem>
            ))}
          </div>

          {user && (
            <>
              <div className="border-t border-gray-700 my-4" />
              <div className="space-y-4">
                <MobileMenuItem onClick={() => handleNavigation('profile')}>
                  Profile
                </MobileMenuItem>
                <MobileMenuItem onClick={() => handleNavigation('orders')}>
                  Order History
                </MobileMenuItem>
                {isUserAdmin(user) && (
                  <MobileMenuItem onClick={() => handleNavigation('admin')} className="text-yellow-400">
                    Admin Panel
                  </MobileMenuItem>
                )}
                <MobileMenuItem onClick={onLogout} className="text-red-400">
                  Sign Out
                </MobileMenuItem>
              </div>
            </>
          )}

          {!user && (
            <>
              <div className="border-t border-gray-700 my-4" />
              <div className="space-y-4">
                <MobileMenuItem onClick={() => handleNavigation('signin')}>
                  Sign In
                </MobileMenuItem>
                <MobileMenuItem onClick={() => handleNavigation('createaccount')}>
                  Create Account
                </MobileMenuItem>
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

const MobileMenuItem = ({ children, isActive, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full text-left py-2 px-3 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-red-700 text-white' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    } ${className}`}
  >
    {children}
  </button>
);

export default MobileMenu;