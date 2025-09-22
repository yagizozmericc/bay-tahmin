# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## ðŸš€ Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## ðŸ“‹ Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## ðŸ› ï¸ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## ðŸ“ Project Structure

```
react_app/
â”œâ”€â”€ public/             # Static assets
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/     # Reusable UI components
â”‚   â”œâ”€â”€ pages/          # Page components
â”‚   â”œâ”€â”€ styles/         # Global styles and Tailwind configuration
â”‚   â”œâ”€â”€ App.jsx         # Main application component
â”‚   â”œâ”€â”€ Routes.jsx      # Application routes
â”‚   â””â”€â”€ index.jsx       # Application entry point
â”œâ”€â”€ .env                # Environment variables
â”œâ”€â”€ index.html          # HTML template
â”œâ”€â”€ package.json        # Project dependencies and scripts
â”œâ”€â”€ tailwind.config.js  # Tailwind CSS configuration
â””â”€â”€ vite.config.js      # Vite configuration
```

## ðŸ§© Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## ðŸŽ¨ Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## ðŸ“± Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## ðŸ“¦ Deployment

Build the application for production:

```bash
npm run build
```

## ðŸ™ Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by React and Vite
- Styled with Tailwind CSS

Built with â¤ï¸ on Rocket.new
## Match Predictions Data Integration

The match predictions view now sources fixtures from [TheSportsDB](https://www.thesportsdb.com/documentation) (also accessible through TheDataDB). The free tier allows unauthenticated access with the demo key `3`, which is bundled by default. To use your own key:

1. Create a free account and request an API key from TheSportsDB / TheDataDB dashboard.
2. Update `.env.local` with:
   - `VITE_THESPORTSDB_API_KEY=<your-key>`
   - `VITE_THESPORTSDB_API_URL=https://www.thesportsdb.com/api/v1/json` (or the TheDataDB host if you prefer)
3. Restart the Vite dev server so the new environment variables are picked up.

Only the Turkish Super Lig (league id `4339`) and UEFA Champions League (league id `4480`) are fetched on the match predictions page to stay within the free-plan limits. The app combines the `/eventsnextleague.php` responses for those leagues and normalizes the data for the UI.
The client falls back to `eventsseason.php` when `eventsnextleague.php` does not expose upcoming fixtures (common for UEFA competitions during the off-season), then trims to future dates before returning results. Quick filters on the match predictions page now toggle between the two supported competitions or status shortcuts without requiring a manual refresh.
User dashboard widgets (upcoming fixtures, recent results, quick actions) now reuse the same data feed, so the homepage reflects live Turkish Super Lig and UEFA Champions League schedules generated from TheSportsDB responses.


## Firebase Authentication

Email/password authentication is wired through Firebase Auth. Update `.env.local` with your Firebase project values (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, optional `VITE_FIREBASE_APP_ID`, etc.) and restart the Vite dev server after editing. New `/login` and `/register` routes use the shared UI kit and talk to Firebase. The header now reflects the current auth state and exposes a sign-out action.
