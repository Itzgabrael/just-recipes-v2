import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Favorites = lazy(() => import("./pages/Favorites"));
const RecipeDetails = lazy(() => import("./pages/RecipeDetails"));
const AddRecipe = lazy(() => import("./pages/AddRecipe"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MyRecipes = lazy(() => import("./pages/MyRecipes"));
const CookWithWhatYouHave = lazy(() => import("./pages/CookWithWhatYouHave"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));

import {Toaster} from "react-hot-toast";
import GuestRecipeMigration from "./components/GuestRecipeMigration";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import useOnlineStatus from "./hooks/useOnlineStatus";
import OfflineBanner from "./components/OfflineBanner";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function App() {
  const isOnline = useOnlineStatus();
  const location = useLocation();
  const hideFooter = ["/profile", "/dashboard"].includes(location.pathname);
  
  return (
    <>
    <Toaster
  position="top-right"
  reverseOrder={false}
  toastOptions={{
    duration: 3000,
    style: {
      borderRadius: "12px",
      background: "#fff",
      color: "#333",
      fontSize: "18px",
    },
    success: {
      iconTheme: {
        primary: "#16a34a",
        secondary: "#fff",
      },
    },
    error: {
      iconTheme: {
        primary: "#dc2626",
        secondary: "#fff",
      },
    },
  }}
/>
<PWAInstallPrompt />
    <Navbar/>
    {!isOnline && <OfflineBanner />}
    <Suspense
  fallback={
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-gray-600 dark:text-gray-300">
        Loading page...
      </p>
    </div>
  }
>
    <Routes>
      {/* PUBLIC ROUTES */}
  <Route path="/" element={<Home />} />
  <Route path="/add-recipe" element={<AddRecipe />} />
  <Route path="/recipe/:id" element={<RecipeDetails />} />
  <Route path="/users/:userId" element={<PublicProfile />} />
   {/* AUTHENTICATION ROUTES */}
  <Route element={<PublicOnlyRoute />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>
   {/* PRIVATE ROUTES */}
  <Route element={<ProtectedRoute />}>
   <Route path="/favorites" element={<Favorites />} />
  <Route path="/my-recipes" element={<MyRecipes />} />
  <Route path="/edit-recipe/:id" element={<AddRecipe />} />
  <Route path="/cook-with-what-you-have" element={<CookWithWhatYouHave />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile" element={<Profile />} /> 
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
</Suspense>
    {!hideFooter && <Footer/>}
    <GuestRecipeMigration />
    </>
  );
}

export default App;