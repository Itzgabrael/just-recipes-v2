Just Recipes 2.0

A modern recipe-sharing web application where users can discover recipes, create and manage their own recipes, save favorites, rate recipes, and maintain a public profile.

Built with React, Firebase, Supabase, and Tailwind CSS, Just Recipes is designed as a responsive Progressive Web App (PWA) that works across desktop and mobile devices.

Live Demo

"Visit Just Recipes 2.0" (https://just-recipes-v2.netlify.app/)

Features

Authentication

- Email and password registration and login
- Email verification for new accounts
- Google authentication
- Password reset
- Remember-me authentication persistence
- Protected authenticated features

Recipe Management

- Browse built-in recipes
- Discover external recipes from TheMealDB
- Create personal recipes
- Edit and delete recipes
- Guest recipes stored locally on the device
- Recipe image uploads
- JPEG, PNG, and WebP image validation
- Recipe ratings and rating counts
- Favorite recipes
- Recipe printing

User Profiles

- Personal profile page
- Public user profiles
- Display name management
- Profile photo upload and deletion
- View recipes created by a user
- Public recipe ownership information

Progressive Web App

- Installable as a PWA
- Responsive design for mobile, tablet, and desktop
- Offline fallback support
- Online/offline status handling
- Dark and light themes
- PWA icons and web app manifest

User Experience & Accessibility

- Responsive navigation
- Keyboard-accessible interactive elements
- Accessible recipe links and controls
- Loading and error states
- Toast notifications for important actions
- Recipe cards with accessible navigation
- Mobile-friendly touch interactions

Tech Stack

Frontend

- React
- React Router
- Vite
- Tailwind CSS
- React Icons

Backend & Services

- Firebase Authentication
- Firebase Firestore
- Supabase Storage
- Supabase Row Level Security (RLS)
- TheMealDB API

Deployment & Tooling

- Netlify
- GitHub
- Vite PWA Plugin
- ESLint

Architecture

Just Recipes uses Firebase for authentication and application data while Supabase Storage handles user-uploaded profile and recipe images.

React Application

       │
       ├── Firebase Authentication

       │       └── User accounts & authentication
       │

       ├── Firestore

       │       └── Users, recipes, favorites & ratings
       │

       ├── Supabase Storage

       │       └── Profile & recipe images
       │

       └── TheMealDB

               └── External recipe data


Guest-created recipes are stored locally using browser "localStorage", while authenticated users can save recipes to their account.

Security

The application uses authentication and database/storage security rules to protect user-owned data.

- Firebase Authentication handles user identity.
- Firestore security rules restrict access to protected user data.
- Supabase Storage uses Row Level Security policies.
- Firebase Admin credentials are kept outside the client application and are not committed to the repository.
- User-uploaded images are validated by file type and size before upload.

Getting Started

Prerequisites

- Node.js
- npm
- A Firebase project
- A Supabase project

Installation

Clone the repository and install the dependencies:

git clone https://github.com/itzgabriel/just-recipes-v2.git
cd just-recipes-v2
npm install

Environment Variables

Create a ".env" file in the project root and add the required Firebase and Supabase configuration values.

Example:

VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value

VITE_SUPABASE_URL=your_value
VITE_SUPABASE_PUBLISHABLE_KEY=your_value

Do not commit secret credentials or Firebase Admin service-account files to GitHub.

Run the Development Server

npm run dev

The application will be available at the local development address shown by Vite.

Build for Production

npm run build

Project Structure:

src/

├── assets/

├── components/

├── context/

├── data/

├── hooks/

├── layouts/

├── pages/

├── services/

└── utils/

admin-tools/

└── set-authenticated-role.cjs

The application is organized into reusable components, pages, services, context providers, hooks, and utility modules to keep responsibilities separated and maintainable.

What I Learned

Building Just Recipes 2.0 gave me practical experience working with a production-style React application rather than only isolated tutorials.

Through the project, I worked with:

- React component architecture and reusable UI
- React Router and protected navigation
- Firebase Authentication
- Firestore data modeling and security rules
- Supabase Storage and Row Level Security
- Authentication between Firebase and Supabase
- File uploads and image validation
- Local storage and offline-friendly behavior
- Progressive Web Apps
- Responsive and accessible UI development
- Git and GitHub workflows
- Netlify deployment
- Debugging real application issues
- Performance and loading considerations
- Testing features across desktop and mobile devices

Future Improvements

Potential future improvements include further performance optimization, additional recipe discovery features, and continued refinement of the user experience based on real-world feedback.

"GitHub" (https://github.com/Itzgabrael)