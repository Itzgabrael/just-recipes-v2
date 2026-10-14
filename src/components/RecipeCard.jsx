import { Link } from "react-router-dom";
import { FaHeart, FaStar } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addFavorite, removeFavorite, isFavorite } from "../services/favorites";
import toast from "react-hot-toast";

function RecipeCard({ recipe, ratingSummary }) {
  const { currentUser } = useAuth();
  const [favorite, setFavorite] = useState(false);
  const averageRating = ratingSummary?.average ?? null;
  const ratingCount = ratingSummary?.count ?? 0;

  /* =====================================================
     CHECK FAVORITE
  ===================================================== */

  useEffect(() => {
    async function checkFavorite() {
      if (!currentUser) {
        return;
      }

      const exists = await isFavorite(
        currentUser.uid,
        recipe.id
      );

      setFavorite(exists);
    }

    void checkFavorite();
  }, [currentUser, recipe.id]);


  /* =====================================================
     FAVORITE HANDLER
  ===================================================== */

  async function handleFavorite() {
    if (!currentUser) {
      alert(
        "Please log in to save recipes."
      );

      return;
    }

    if (favorite) {
      await removeFavorite(
        currentUser.uid,
        recipe.id
      );

      setFavorite(false);

      toast.success(
        "Recipe removed from favorites!"
      );
    } else {
      await addFavorite(
        currentUser.uid,
        recipe.id
      );

      setFavorite(true);

      toast.success(
        "Recipe added to favorites!"
      );
    }
  }


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="
        recipe-card
        bg-white
        dark:bg-gray-800
        rounded-xl
        overflow-hidden
        border
        border-gray-200
        dark:border-gray-700
        shadow
        hover:shadow-lg
        dark:hover:shadow-black/30
        transition">

{/* Recipe Image */}

<img
  src={
    recipe.image ||
    "/default-food.jpg"
  }
  alt={
    recipe.title ||
    recipe.recipeName ||
    "Recipe"
  }
  onError={(e) => {
    if (
      e.currentTarget.src.endsWith(
        "/default-food.jpg"
      )
    ) {
      return;
    }

    e.currentTarget.onerror = null;
    e.currentTarget.src = "/default-food.jpg";
  }}
  className="w-full h-52 object-cover"/>


      {/* Recipe Content */}

      <div className="p-5">

        {/* Title */}

        <h2
          className="
            recipe-card-title
            text-xl
            font-bold
            text-gray-900
            dark:text-gray-100
          "
        >
          {recipe.title ||
            recipe.recipeName}
        </h2>


        {/* Rating */}

        <div
          className="
            flex
            items-center
            gap-1
            mt-2
          "
        >
          <FaStar
            className="text-yellow-400"
          />

          {ratingCount > 0 ? (
            <>
              <span
                className="
                  text-gray-700
                  dark:text-gray-200
                "
              >
                {averageRating.toFixed(
                  1
                )}
              </span>

              <span
                className="
                  text-gray-400
                  dark:text-gray-500
                  text-sm
                "
              >
                ({ratingCount})
              </span>
            </>
          ) : (
            <span
              className="
                text-gray-400
                dark:text-gray-500
                text-sm
              "
            >
              No ratings
            </span>
          )}
        </div>


        {/* Difficulty / Time */}

        <p
          className="
            flex
            items-center
            gap-2
            text-gray-500
            dark:text-gray-400
          "
        >
          {recipe.difficulty} •

          <LuClock3 />

          {recipe.time ||
            `${recipe.cookTime} ${recipe.cookTimeUnit}`}
        </p>


        {/* Owner */}

        {recipe.ownerName && (
          <p
            className="
              text-sm
              text-gray-500
              dark:text-gray-400
              mt-2
            "
          >
            By {recipe.ownerName}
          </p>
        )}


        {/* Actions */}

        <div
          className="
            flex
            justify-between
            items-center
            gap-3
            mt-5
          "
        >

          {/* Favorite */}

          <button
            type="button"
            onClick={handleFavorite}
            className={`favorite-button flex items-center gap-2 transition-colors duration-200
              ${
                favorite
                  ? "text-red-500"
                  : "text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500"}
            `}
          >
            <FaHeart />

            {favorite
              ? "Favorited"
              : "Favorite"}
          </button>


          {/* View Recipe */}

          <Link
            to={`/recipe/${recipe.id}`}
          >
            <button
              type="button"
              className="
                bg-green-600
                text-white
                px-4
                py-2
                rounded-lg
                hover:bg-green-700
                dark:hover:bg-green-500
                transition
              "
            >
              View Recipe
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default RecipeCard;