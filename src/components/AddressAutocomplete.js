import React, { useEffect, useRef, useState } from 'react';

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Enter your address...", 
  className = "",
  required = false,
  disabled = false,
  error = null
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
    } else {
      // Load Google Maps API if not already loaded
      loadGoogleMapsAPI();
    }

    return () => {
      if (autocompleteRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        } catch (error) {
          // Handle cleanup error silently
        }
      }
    };
  }, []);

  const loadGoogleMapsAPI = () => {
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    
    if (!apiKey) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setTimeout(() => {
          initializeAutocomplete();
        }, 100);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        initializeAutocomplete();
      }, 100);
    };
    script.onerror = (error) => {
      setIsLoaded(true);
    };
    
    document.head.appendChild(script);
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    try {
      
      // Create the traditional Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'ca' }
      });

      // Bias results towards West Kelowna and Kelowna, BC
      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(49.8000, -119.6500), // Southwest corner
        new window.google.maps.LatLng(49.9500, -119.4000)  // Northeast corner
      );
      autocompleteRef.current.setBounds(bounds);

      // Add place changed listener
      autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
      
      // Aggressively disable browser autocomplete
      if (inputRef.current) {
        inputRef.current.setAttribute('autocomplete', 'chrome-off');
        inputRef.current.setAttribute('autocomplete', 'disable-autofill');
        
        // Add event listener to prevent browser suggestions
        inputRef.current.addEventListener('focus', () => {
          inputRef.current.setAttribute('readonly', true);
          setTimeout(() => {
            inputRef.current.removeAttribute('readonly');
          }, 100);
        });
      }
      
      setIsLoaded(true);
    } catch (error) {
      setIsLoaded(true);
    }
  };

  const handlePlaceChanged = () => {
    try {
      const place = autocompleteRef.current.getPlace();
      
      if (place && place.formatted_address) {
        const address = place.formatted_address;
        onChange(address);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  return (
    <>
      <style>
        {`
          /* Hide browser autocomplete dropdowns */
          input[data-form-ignore="true"]::-webkit-contacts-auto-fill-button,
          input[data-form-ignore="true"]::-webkit-credentials-auto-fill-button {
            visibility: hidden;
            display: none !important;
            pointer-events: none;
            height: 0;
            width: 0;
            margin: 0;
          }
          
          /* Additional browser autocomplete hiding */
          input[data-form-ignore="true"] + datalist,
          input[data-form-ignore="true"] ~ .autocomplete-suggestions {
            display: none !important;
          }
        `}
      </style>
      <div className="relative w-full">
        <form autoComplete="off" style={{ display: 'contents' }}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={className}
            required={required}
            disabled={disabled}
            autoComplete="nope"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            data-form-type="other"
            name={`addr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`}
            id={`addr-input-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="false"
            data-lpignore="true"
            data-form-ignore="true"
          />
        </form>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
      
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      )}
    </>
  );
};

export default AddressAutocomplete;