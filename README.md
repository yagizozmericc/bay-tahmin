# ScoreGuess Pro

A modern football prediction game platform where users can predict match outcomes, compete in leagues, and track their performance across major football competitions.

## 🎯 Project Overview

ScoreGuess Pro is a comprehensive football prediction platform that allows users to:

- **Make Predictions**: Predict match scores for Turkish Super League and UEFA Champions League fixtures
- **Compete in Leagues**: Create or join private leagues with friends and compete for rankings
- **Track Performance**: Monitor prediction accuracy, points, and global rankings
- **Live Data Integration**: Real-time match data from TheSportsDB API
- **User Management**: Complete profile system with statistics and achievements
- **Authentication**: Secure Firebase-based user authentication

The platform fetches live football data from TheSportsDB API and provides an engaging prediction experience with comprehensive scoring systems and league management features.

## 🚀 Tech Stack

### Frontend Framework
- **React 18** - Modern React with concurrent features and improved rendering
- **Vite 5.0** - Lightning-fast build tool and development server
- **React Router v6** - Declarative routing for single-page application

### State Management
- **Redux Toolkit** - Simplified Redux setup for predictable state management
- **React Hook Form** - Efficient form handling and validation

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework with extensive customization
- **Tailwind Plugins**:
  - Forms plugin for enhanced form styling
  - Typography plugin for consistent text styling
  - Aspect ratio plugin for responsive elements
  - Container queries for component-specific responsive design
  - Fluid typography for responsive text scaling
  - Animation utilities for smooth transitions
- **Framer Motion** - Production-ready motion library for React
- **Lucide React** - Beautiful & consistent icon library
- **Class Variance Authority** - Building type-safe component variants

### Data Visualization
- **D3.js 7.9** - Powerful data visualization library
- **Recharts 2.15** - Composable charting library built on React components

### Backend Services
- **Firebase 11.10** - Complete backend-as-a-service platform
  - Authentication (Email/Password)
  - Cloud Firestore for data storage
  - Hosting for deployment
- **TheSportsDB API** - Live football data integration
- **Axios** - Promise-based HTTP client for API requests

### Development Tools
- **TypeScript Support** - Enhanced development experience with type checking
- **PostCSS** - CSS processing with autoprefixer
- **ESLint** - Code linting for consistent code quality
- **Testing Library** - React Testing Library with Jest for component testing

### Deployment
- **Firebase Hosting** - Fast and secure web hosting
- **Vite Build** - Optimized production builds with source maps

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- Firebase project (for authentication and hosting)
- TheSportsDB API key (optional, uses demo key by default)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pred-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_THESPORTSDB_API_KEY=your_api_key
   VITE_THESPORTSDB_API_URL=https://www.thesportsdb.com/api/v1/json
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 📁 Project Structure

```
pred-game/
├── public/                 # Static assets
│   ├── assets/            # Icons, manifest, and other static files
│   └── index.html         # HTML template
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components (Button, Input, etc.)
│   │   ├── AppIcon.jsx   # Icon component
│   │   └── AppImage.jsx  # Image component
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages (Login, Register)
│   │   ├── user-dashboard/      # Dashboard with upcoming matches
│   │   ├── match-predictions/   # Match prediction interface
│   │   ├── league-management/   # League creation and management
│   │   ├── league-leaderboards/ # League rankings and statistics
│   │   └── user-profile/        # User profile and settings
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services and data layer
│   ├── context/          # React context providers
│   ├── styles/           # Global styles and Tailwind configuration
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application component
│   └── index.jsx         # Application entry point
├── .env.local            # Environment variables
├── firebase.json         # Firebase configuration
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.mjs       # Vite configuration
```

## 🏈 Features

### Match Predictions
- Live fixture data from Turkish Super League and UEFA Champions League
- Score prediction with auto-save functionality
- Goal scorer predictions
- Real-time scoring system based on prediction accuracy

### League Management
- Create private leagues with custom settings
- Invite friends via unique league codes
- Member management and league administration
- Custom scoring rules and competition formats

### User Dashboard
- Upcoming matches overview
- Recent prediction results
- Performance statistics and trends
- Quick actions for league management

### User Profile
- Comprehensive statistics tracking
- Achievement system with badges
- Customizable notification preferences
- Profile customization options

### Authentication
- Secure Firebase Authentication
- Email/password registration and login
- Protected routes and user session management

## 🎮 Usage

1. **Register/Login**: Create an account or sign in to access the platform
2. **Make Predictions**: Navigate to match predictions to forecast upcoming games
3. **Join/Create Leagues**: Compete with friends in private leagues
4. **Track Performance**: Monitor your accuracy and rankings in your profile
5. **View Leaderboards**: Check league standings and compare with other players

## 🔧 API Integration

### TheSportsDB Integration
The application integrates with TheSportsDB for live football data:
- Fetches fixtures for Turkish Super League (ID: 4339) and UEFA Champions League (ID: 4480)
- Falls back to season data when next fixtures are unavailable
- Filters and normalizes data for consistent UI presentation
- Supports both free (demo key "3") and paid API tiers

### Firebase Services
- **Authentication**: Email/password authentication with session management
- **Firestore**: User data, predictions, and league information storage
- **Hosting**: Production deployment platform

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers (1920px and above)
- Laptops and tablets (768px - 1919px)
- Mobile devices (320px - 767px)

Built with mobile-first approach using Tailwind CSS breakpoints.

The application is configured for Firebase Hosting with proper routing and caching headers.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [TheSportsDB](https://www.thesportsdb.com/) for providing football data API
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [React](https://reactjs.org/) team for the amazing framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool

---