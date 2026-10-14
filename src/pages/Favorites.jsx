import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import { getFavorites } from "../services/recipeService";
import useOnlineStatus from "../hooks/useOnlineStatus";
import OfflineFallback from "../components/OfflineFallback";
import RecipeCard from "../components/RecipeCard";

function Favorites() {
  const isOnline = useOnlineStatus();
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState(false);

useEffect(() => {
  async function loadFavorites() {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFavoritesError(false);

    try {
      const favoriteRecipes = await getFavorites(currentUser);

      setFavorites(favoriteRecipes);
    } catch (error) {
      console.error("Error loading favorites:", error);

      setFavorites([]);
      setFavoritesError(true);
    } finally {
      setLoading(false);
    }
  }

  loadFavorites();
}, [currentUser]);

  if (loading) {
    return (
      <h2 className="text-center text-2xl mt-10">
        Loading Favorites...
      </h2>
    );
  }

  if (favoritesError) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <OfflineFallback
        title={
          isOnline
            ? "Your favorites couldn't be loaded"
            : "Your favorites aren't available offline"
        }
        message={
          isOnline
            ? "We couldn't load your favorite recipes right now. Please try again later."
            : "Your favorite recipes haven't been cached on this device yet. Connect to the internet to load them."
        }
      />
    </section>
  );
}

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">

      <h1 className="text-4xl font-bold mb-8">
        My Favorites
      </h1>

      {favorites.length === 0 ? (
        <p className="text-gray-500">
          You haven't added any favorite recipes yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
            />
          ))}

        </div>
      )}

    </section>
  );
}

export default Favorites;