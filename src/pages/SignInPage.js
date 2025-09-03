import React, { useState, useEffect } from 'react';
import { authAPI, handleAPIError } from '../services/api';

const SignInPage = ({ setCurrentPage, setUser, setLoading, setError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      setLoading(true);
      const userData = await authAPI.signIn(email, password);
      setUser(userData);
      setCurrentPage('home');
    } catch (error) {
      handleAPIError(error, false);
      setError(error.message);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleThirdPartyLogin = async (provider) => {
    try {
      setLoading(true);
      setError(null);

      switch (provider.toLowerCase()) {
        case 'google':
          // Google login is handled by the official button
          setError('Please use the Google Sign-In button below');
          break;
        case 'facebook':
          await handleFacebookLogin();
          break;
        case 'apple':
          await handleAppleLogin();
          break;
        default:
          setError(`${provider} login not implemented`);
      }
    } catch (error) {
      handleAPIError(error, false);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogle = () => {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.warn('Google Client ID not configured. Please add REACT_APP_GOOGLE_CLIENT_ID to your environment variables.');
        return;
      }
      
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
            use_fedcm_for_prompt: true,
            auto_select: false,
            cancel_on_tap_outside: true
          });
          
          // Render the Google Sign-In button directly
          const googleButtonContainer = document.getElementById('google-signin-button');
          if (googleButtonContainer) {
            window.google.accounts.id.renderButton(googleButtonContainer, {
              theme: 'filled_blue',
              size: 'large',
              width: '100%',
              text: 'signin_with'
            });
          }
          
          setGoogleInitialized(true);
          console.log('Google OAuth initialized successfully');
        } catch (error) {
          console.error('Failed to initialize Google OAuth:', error);
        }
      }
    };

    // Check if Google script is loaded
    if (window.google && window.google.accounts) {
      initializeGoogle();
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogle);
          initializeGoogle();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!googleInitialized) {
          console.warn('Google Identity Services failed to load within 10 seconds');
        }
      }, 10000);
    }
  }, []);

  const handleGoogleCallback = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authAPI.googleAuth(credentialResponse.credential);
      
      if (result.requiresProfile) {
        // Handle profile completion flow
        if (result.userId) {
          // User exists but needs to complete profile
          setCurrentPage('completeProfile', { 
            userId: result.userId, 
            userData: result.userData,
            isOAuth: true 
          });
        } else {
          // New user needs to complete profile
          setCurrentPage('completeProfile', { 
            tempUserData: result.tempUserData,
            isOAuth: true 
          });
        }
      } else {
        // Login successful
        setUser(result);
        setCurrentPage('home');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      setError(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };


  const handleFacebookLogin = async () => {
    // For production, you'd use Facebook SDK
    // This is a placeholder implementation that would require proper Facebook OAuth setup
    setError('Facebook OAuth requires proper configuration. Please set up Facebook OAuth credentials and implement the OAuth flow.');
  };

  const handleAppleLogin = async () => {
    // For production, you'd use Apple Sign In
    // This is a placeholder implementation that would require proper Apple OAuth setup
    setError('Apple OAuth requires proper configuration. Please set up Apple OAuth credentials and implement the OAuth flow.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 pt-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Login</h1>
          
          {/* Third Party Login Options */}
          <div className="space-y-4 mb-6">
            {/* Official Google Sign-In Button */}
            <div id="google-signin-button" className="w-full"></div>
            <button 
              onClick={() => handleThirdPartyLogin('Facebook')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Continue with Facebook</span>
            </button>
            <button 
              onClick={() => handleThirdPartyLogin('Apple')}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Continue with Apple</span>
            </button>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">or</span>
            </div>
          </div>
          
          {/* Email/Password Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-red-700 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage('createaccount')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                disabled={isSubmitting}
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;