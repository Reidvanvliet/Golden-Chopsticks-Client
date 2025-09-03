import React, { useState } from 'react';
import { ShoppingCart, Menu } from 'lucide-react';
import Logo from './Logo';
import UserMenu from './UserMenu';

const Navigation = ({ currentPage, setCurrentPage, user, logoutUser, cartCount, onMobileMenuToggle }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    setIsUserMenuOpen(false);
  };

  const navigationItems = [
    { key: 'home', label: 'Home' },
    { key: 'menu', label: 'Menu' },
    { key: 'contact', label: 'Contact' }
  ];

  return (
    <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-primary-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {['home', 'menu', 'contact'].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`nav-link capitalize ${
                  currentPage === page ? 'nav-link-active' : 'nav-link-inactive'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Cart */}
            <CartButton 
              count={cartCount} 
              onClick={() => setCurrentPage('cart')} 
            />

            {/* User Menu or Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <UserMenu
                  user={user}
                  isOpen={isUserMenuOpen}
                  onToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onLogout={handleLogout}
                  setCurrentPage={setCurrentPage}
                />
              ) : (
                <AuthButtons setCurrentPage={setCurrentPage} />
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden text-light-gold hover:text-primary-gold transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

    </nav>
  );
};

const NavItem = ({ children, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`text-lg font-medium transition-colors duration-200 ${
      isActive 
        ? 'text-primary-gold' 
        : 'text-light-gold hover:text-primary-gold'
    }`}
  >
    {children}
  </button>
);

const CartButton = ({ count, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-2 text-light-gold hover:text-primary-gold transition-colors duration-200"
  >
    <ShoppingCart className="w-6 h-6" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
);

const AuthButtons = ({ setCurrentPage }) => (
  <>
    <button
      onClick={() => setCurrentPage('signin')}
      className="text-sm font-medium text-light-gold hover:text-primary-gold transition-colors duration-200"
    >
      Sign In
    </button>
    <button
      onClick={() => setCurrentPage('createaccount')}
      className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
    >
      Sign Up
    </button>
  </>
);

export default Navigation;