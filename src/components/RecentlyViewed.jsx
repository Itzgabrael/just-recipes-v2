import { useState } from "react";
import { FaClock, FaTimes } from "react-icons/fa";
import {
  getRecentlyViewed,
  removeRecentlyViewed,
  clearRecentlyViewed
} from "../services/recentlyViewed";
import RecipeCard from "./RecipeCard";

function RecentlyViewed() {
  const [recentRecipes, setRecentRecipes] =
    useState(() => getRecentlyViewed());

  function handleRemove(recipeId) {
    removeRecentlyViewed(recipeId);

    setRecentRecipes((current) =>
      current.filter(
        (recipe) => recipe.id !== recipeId
      )
    );
  }
  function handleClearAll() {
    clearRecentlyViewed();
    setRecentRecipes([]);
  }

  if (recentRecipes.length === 0) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">

        <div>

          <div className="flex items-center gap-2">

            <FaClock className="text-green-600" />

            <h2 className="text-3xl font-bold">
              Recently Viewed
            </h2>

          </div>

          <p className="text-gray-500 mt-2">
            Recipes you've recently opened.
          </p>

        </div>

        <button
        type="button"
        onClick={handleClearAll}
        className="text-red-600 hover:text-red-800 font-medium transition">
        Clear All
      </button>

      </div>


      {/* RECIPE GRID */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {recentRecipes.map((recipe, index) => (

          <div
            key={recipe.id}
            className="relative animate-fadeIn recently-viewed-item"
            style={{ animationDelay: `${index * 80}ms` }}
          >

            {/* REMOVE BUTTON */}

            <button
              type="button"
              onClick={() =>
                handleRemove(recipe.id)
              }
              aria-label={`Remove ${
                recipe.title ||
                recipe.recipeName ||
                "recipe"
              } from recently viewed`}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition"
            >

              <FaTimes />

            </button>


            <RecipeCard
              recipe={recipe}
            />

          </div>

        ))}

      </div>

    </section>
  );
}

export default RecentlyViewed;