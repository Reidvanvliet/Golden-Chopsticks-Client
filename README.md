# Golden Chopsticks - Frontend

A React-based frontend application for Golden Chopsticks restaurant ordering system.

## 🌐 Live Demo

- **Frontend**: [https://goldenchopsticks.netlify.app/](https://goldenchopsticks.netlify.app/)
- **API**: [https://restaurants-api-d19o.onrender.com/](https://restaurants-api-d19o.onrender.com/)
- **API Documentation**: [https://restaurants-api-d19o.onrender.com/api/docs](https://restaurants-api-d19o.onrender.com/api/docs)

## ✨ Features

- **Menu Browsing**: Browse restaurant menu items by categories
- **User Authentication**: Sign in/up functionality with profile management
- **Cart Management**: Add items to cart and manage orders
- **Combo Selection**: Special combo meal options
- **Order History**: Track previous orders
- **Checkout**: Complete order placement with Stripe integration
- **Admin Panel**: Administrative menu management
- **Google Maps Integration**: Location services
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0
- **Styling**: CSS with Tailwind (custom build process)
- **Maps**: Google Maps API integration
- **Payments**: Stripe integration
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Golden-Chopsticks-Client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The application will run on [http://localhost:3000](http://localhost:3000).

## 🚀 Available Scripts

- `npm start` - Run the development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run build:css` - Build CSS with Tailwind (watch mode)

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── App.js              # Main application component
```

## 🔧 Configuration

The application connects to the backend API at `https://restaurants-api-d19o.onrender.com/`. 

For local development, you may need to configure:
- Google Maps API keys
- Stripe publishable keys
- API base URLs

## 🚀 Deployment

The application is deployed on Netlify. To deploy:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `build/` directory to your hosting provider.