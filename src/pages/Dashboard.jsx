import { useAuth } from "../context/AuthContext";
import {FaHeart, FaPlus, FaUtensils,FaSearch, FaHome} from "react-icons/fa";
import {Link} from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyRecipes, getFavorites } from "../services/recipeService";
import useOnlineStatus from "../hooks/useOnlineStatus";
import OfflineFallback from "../components/OfflineFallback";
function Dashboard() {
  const isOnline = useOnlineStatus();
  const { currentUser } = useAuth();
  const [statsError, setStatsError] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recipeCount, setRecipeCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
  async function loadStats() {
    if (!currentUser) {
      setLoadingStats(false);
      return;
    }

    setLoadingStats(true);
    setStatsError(false);

    try {
      const [myRecipes, favorites] = await Promise.all([
        getMyRecipes(currentUser),
        getFavorites(currentUser),
      ]);

      setRecipeCount(myRecipes.length);
      setFavoriteCount(favorites.length);
    } catch (error) {
      console.error("Error loading dashboard statistics:", error);

      setRecipeCount(0);
      setFavoriteCount(0);
      setStatsError(true);
    } finally {
      setLoadingStats(false);
    }
  }

  void loadStats();
}, [currentUser]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">

      <div className="mb-10">

  <Link
    to="/"
    aria-label="Go to Home"
    className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-full bg-green-50 text-green-600 shadow-md hover:bg-green-600 hover:text-white hover:shadow-lg transition-all duration-200"
  >
    <FaHome className="text-3xl" />
  </Link>

  <div className="flex items-center gap-5">

   {currentUser.photoURL ? (
  <img
    src={currentUser.photoURL}
    alt={currentUser.displayName || "User"}
    className="w-24 h-24 rounded-full border-4 border-green-500 object-cover"
  />
) : (
  <div className="w-24 h-24 rounded-full border-4 border-green-500 bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-600">
    {(currentUser.displayName || currentUser.email || "U")
      .charAt(0)
      .toUpperCase()}
  </div>
)}

    <div>
      <h1 className="text-4xl font-bold">
        Welcome back,
      </h1>

      <h2 className="text-2xl text-green-600 font-semibold mt-2">
        {currentUser.displayName}
      </h2>

      <p className="text-gray-500 mt-1">
        {currentUser.email}
      </p>
    </div>

  </div>
</div>

      <h2 className="text-2xl font-bold mb-6">
  Your Statistics
</h2>

{statsError && (
  <div className="mb-6">
    <OfflineFallback
      title={
        isOnline
          ? "Your statistics couldn't be loaded"
          : "Your statistics aren't available offline"
      }
      message={
        isOnline
          ? "We couldn't load your account statistics right now. Please try again later."
          : "Your account data hasn't been cached on this device yet. Connect to the internet to load your statistics."
      }
    />
  </div>
)}

<div className="grid md:grid-cols-2 gap-6 mb-10">

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">
      <span className="text-green-600">Recipes</span> Published
    </p>

    <h3 className="text-4xl font-bold text-green-600 mt-2">
  {loadingStats ? "..." : recipeCount}
  {!loadingStats && (
    <span className="text-sm text-gray-500"> Recipes</span>
  )}
</h3>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">
      <span className="text-red-500">Favorite</span> Recipes
    </p>

   <h3 className="text-4xl font-bold text-red-500 mt-2">
  {loadingStats ? "..." : favoriteCount}
  {!loadingStats && (
    <span className="text-sm text-gray-500"> Saved</span>
  )}
</h3>
  </div>

</div>

      <h2 className="text-2xl font-bold mb-5">
        Quick Actions
      </h2>

     <div className="grid md:grid-cols-3 gap-6">

  <Link
    to="/my-recipes"
    className=" block bg-white rounded-xl shadow p-6 hover:shadow-xl hover:-translate-y-2 transition duration-300"
  >
    <FaUtensils className="text-4xl text-green-600" />

    <h3 className="font-bold text-xl mt-4">
      My <span className="text-green-600">Recipes</span>
    </h3>

    <p className="text-gray-500 mt-2">
      View and manage your published recipes.
    </p>
  </Link>

  <Link
    to="/favorites"
    className=" block bg-white rounded-xl shadow p-6 hover:shadow-xl hover:-translate-y-2 transition duration-300"
  >
    <FaHeart className="text-4xl text-red-500" />
    <h3 className="font-bold text-xl text-red-500 mt-4">
      Favorites
    </h3>

    <p className="text-gray-500 mt-2">
      See all the recipes you've saved.
    </p>
  </Link>

  <Link
    to="/add-recipe"
    className="block bg-white rounded-xl shadow p-6 hover:shadow-xl hover:-translate-y-2 transition duration-300"
  >
    <FaPlus className="text-4xl text-blue-600" />

    <h3 className="font-bold text-xl mt-4">
      <span className="text-blue-600">Add</span> Recipe
    </h3>

    <p className="text-gray-500 mt-2">
      Publish a brand new recipe.
    </p>
  </Link>
  <Link
    to="/#recipe-search"
    className="block bg-white rounded-xl shadow p-6 hover:shadow-xl hover:-translate-y-2 transition duration-300"
  >
    <FaSearch className="text-4xl text-purple-600" />

    <h3 className="font-bold text-xl mt-4">
      <span className="text-purple-600">Search</span> Recipes
    </h3>

    <p className="text-gray-500 mt-2">
      Find delicious recipes you'll love.
    </p>
  </Link>

</div>

    </section>
  );
}

export default Dashboard;