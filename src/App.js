import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import MobileMenu from './components/MobileMenu';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ContactPage from './pages/ContactPage';
import SignInPage from './pages/SignInPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminMenuPage from './pages/AdminMenuPage';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import CompleteProfileModal from './components/CompleteProfileModal';
import { apiCall } from './services/api';
import './App.css';

// Helper function to check if user has admin privileges
const isUserAdmin = (user) => {
  return user?.isAdmin || user?.role === 'admin' || user?.role === 'super_admin';
};

const App = () => {
  // Global state management
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState(null);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [categories, setCategories] = useState([]);
  const [adminCategories, setAdminCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('goldChopsticksUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedCart = localStorage.getItem('goldChopsticksCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    // Load menu items and categories
    const user = savedUser ? JSON.parse(savedUser) : null;
    const isAdmin = isUserAdmin(user);
    
    loadMenuItems(isAdmin);
    loadCategories();
    if (isAdmin) {
      loadAdminCategories();
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('goldChopsticksCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save user to localStorage whenever it changes and reload menu for admin view
  useEffect(() => {
    if (user) {
      localStorage.setItem('goldChopsticksUser', JSON.stringify(user));
      // Reload menu items with admin view if user is admin
      const isAdmin = isUserAdmin(user);
      loadMenuItems(isAdmin);
      if (isAdmin) {
        loadAdminCategories();
      }
    } else {
      localStorage.removeItem('goldChopsticksUser');
      // Reload menu items without admin view
      loadMenuItems(false);
    }
  }, [user]);

  // Load menu items from API
  const loadMenuItems = async (isAdmin = false) => {
    try {
      setLoading(true);
      const data = isAdmin 
        ? await apiCall('/menu/all')
        : await apiCall('/menu');
      
      console.log('Menu API response:', data); // Debug log
      
      // Handle different response structures
      // /menu returns: {restaurant: {...}, menu: {...}, itemCount: ...}
      // /menu/all returns: {...} (direct menu object)
      const menuData = data.menu || data;
      console.log('Setting menuItems to:', menuData); // Debug log
      
      setMenuItems(menuData || {});
    } catch (err) {
      console.error('Menu loading error:', err);
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      const data = await apiCall('/menu/categories');
      setCategories(data.categories);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  // Load admin categories from API (includes inactive)
  const loadAdminCategories = async () => {
    try {
      const data = await apiCall('/menu/categories/all');
      setAdminCategories(data);
    } catch (err) {
      setError('Failed to load admin categories');
    }
  };

  // Cart management functions
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addToCart = (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCartItems(cartItems.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCartItems(cartItems.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('goldChopsticksCart');
  };

  // User authentication functions
  const loginUser = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('goldChopsticksUser');
    setCurrentPage('home');
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMobileLogout = () => {
    logoutUser();
    setIsMobileMenuOpen(false);
  };

  // Custom setCurrentPage function to handle additional data
  const handleSetCurrentPage = (page, data = null) => {
    if (page === 'completeProfile') {
      setPageData(data);
      setShowCompleteProfile(true);
    } else {
      setCurrentPage(page);
      setPageData(data);
    }
  };

  // Page props object
  const pageProps = {
    currentPage,
    setCurrentPage: handleSetCurrentPage,
    user,
    setUser: loginUser,
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    clearCart,
    menuItems,
    setMenuItems,
    loadMenuItems,
    categories,
    setCategories,
    loadCategories,
    adminCategories,
    setAdminCategories,
    loadAdminCategories,
    loading,
    setLoading,
    error,
    setError
  };

  // Navigation props
  const navProps = {
    currentPage,
    setCurrentPage: handleSetCurrentPage,
    user,
    logoutUser,
    cartCount,
    onMobileMenuToggle: handleMobileMenuToggle
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage {...pageProps} />;
      case 'menu':
        return <MenuPage {...pageProps} />;
      case 'contact':
        return <ContactPage {...pageProps} />;
      case 'signin':
        return <SignInPage {...pageProps} />;
      case 'createaccount':
        return <CreateAccountPage {...pageProps} />;
      case 'profile':
        return <ProfilePage {...pageProps} />;
      case 'orders':
        return <OrderHistoryPage {...pageProps} />;
      case 'cart':
        return <CartPage {...pageProps} />;
      case 'checkout':
        return <CheckoutPage {...pageProps} />;
      case 'confirmation':
        return <ConfirmationPage {...pageProps} />;
      case 'admin':
        return isUserAdmin(user) ? <AdminMenuPage {...pageProps} /> : <HomePage {...pageProps} />;
      default:
        return <HomePage {...pageProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation {...navProps} />
      {renderCurrentPage()}
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {loading && <LoadingSpinner />}
      
      {/* Mobile Menu - Rendered at root level */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        currentPage={currentPage}
        setCurrentPage={handleSetCurrentPage}
        user={user}
        onLogout={handleMobileLogout}
      />
      
      {/* Complete Profile Modal */}
      <CompleteProfileModal
        isOpen={showCompleteProfile}
        onClose={() => setShowCompleteProfile(false)}
        tempUserData={pageData?.tempUserData}
        userId={pageData?.userId}
        setUser={loginUser}
        setCurrentPage={handleSetCurrentPage}
      />
    </div>
  );
};

export default App;