import React from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';

const Logo = () => (
  <div className="mb-6 sm:mb-8 flex justify-center pt-4 sm:pt-0">
    <img 
      src="/golden-chopsticks-logo.png" 
      alt="Golden Chopsticks Logo" 
      className="w-32 h-24 sm:w-40 sm:h-32 md:w-56 md:h-44 lg:w-64 lg:h-48 object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
    />
  </div>
);

const ActionButtons = ({ setCurrentPage }) => (
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in px-4" style={{ animationDelay: '0.9s' }}>
    <button
      onClick={() => setCurrentPage('menu')}
      className="btn-primary text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 shadow-2xl hover:shadow-yellow-400/25 w-full sm:w-auto sm:min-w-[220px]"
    >
      View Our Menu
    </button>
    <button
      onClick={() => setCurrentPage('contact')}
      className="btn-outline text-base sm:text-lg px-6 sm:px-10 py-3 sm:py-4 shadow-xl hover:shadow-pink-400/25 w-full sm:w-auto sm:min-w-[220px]"
    >
      Visit Us Today
    </button>
  </div>
);

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="card card-hover bg-black/40 backdrop-blur-md p-4 sm:p-6">
    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400 mx-auto mb-3 sm:mb-4" />
    <h3 className="text-base sm:text-lg font-semibold text-yellow-300 mb-2">{title}</h3>
    {children}
  </div>
);

const FeatureCard = ({ emoji, title, description }) => (
  <div className="text-center p-4">
    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
      <span className="text-xl sm:text-2xl">{emoji}</span>
    </div>
    <h3 className="text-lg sm:text-xl font-semibold text-yellow-300 mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-yellow-100">{description}</p>
  </div>
);

const BackgroundOverlay = () => (
  <div className="absolute inset-0">
    <div 
      className="w-full h-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('/restaurant-interior.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 via-transparent to-orange-900/20"></div>
    </div>
  </div>
);

const HomePage = ({ setCurrentPage }) => {
  const infoCards = [
    {
      icon: Clock,
      title: "Operating Hours",
      content: (
        <>
          <p className="text-sm sm:text-base text-yellow-100">Monday: Closed</p>
          <p className="text-sm sm:text-base text-yellow-100">Tues-Sun: 3:00 PM - 8:30 PM</p>
        </>
      )
    },
    {
      icon: MapPin,
      title: "Location",
      content: (
        <>
          <p className="text-sm sm:text-base text-yellow-100">2459 Main St</p>
          <p className="text-sm sm:text-base text-yellow-100">West Kelowna, BC</p>
          <p className="text-sm sm:text-base text-yellow-100">V4T 1K5</p>
        </>
      )
    },
    {
      icon: Phone,
      title: "Contact Us",
      content: (
        <>
          <p className="text-sm sm:text-base text-yellow-100">(778) 754-5535</p>
          <p className="text-sm sm:text-base text-yellow-100">Dine-in • Takeout • Delivery</p>
        </>
      )
    }
  ];

  const features = [
    {
      emoji: "🥢",
      title: "Authentic Recipes",
      description: "Traditional family recipes passed down through generations"
    },
    {
      emoji: "🍜",
      title: "Generous Portions",
      description: "Hearty servings that satisfy and delight"
    },
    {
      emoji: "💰",
      title: "Great Value",
      description: "Exceptional quality at unbeatable prices"
    },
    {
      emoji: "👨‍👩‍👧‍👦",
      title: "Family Owned",
      description: "Locally owned and operated with personal care"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen sm:h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-0">
        <BackgroundOverlay />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto py-8 sm:py-0">
          <Logo />

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 text-gradient animate-fade-in">
            Golden Chopsticks
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-yellow-200 mb-6 sm:mb-8 font-light animate-fade-in px-2" style={{ animationDelay: '0.3s' }}>
            Authentic Chinese Cuisine • West Kelowna, BC
          </p>

          <ActionButtons setCurrentPage={setCurrentPage} />

          {/* Info Cards */}
          <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center animate-fade-in px-2" style={{ animationDelay: '1.2s' }}>
            {infoCards.map((card, index) => (
              <InfoCard key={index} icon={card.icon} title={card.title}>
                {card.content}
              </InfoCard>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-black to-soft-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gradient mb-8 sm:mb-12 md:mb-16">
            Why Choose Golden Chopsticks?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                emoji={feature.emoji}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;