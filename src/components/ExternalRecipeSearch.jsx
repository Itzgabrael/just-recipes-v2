import { useState } from "react";
import { FaSearch } from "react-icons/fa";

import {
  searchTheMealDBRecipes,
} from "../services/externalRecipeService";

function ExternalRecipeSearch({
  onResults,
  onLoading,
  onError,
}) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const handleSearch = async () => {
    const trimmedSearchTerm =
      searchTerm.trim();

    if (!trimmedSearchTerm) {
      return;
    }

    try {
      onLoading(true);
      onError("");

      const results =
        await searchTheMealDBRecipes(
          trimmedSearchTerm
        );

      onResults(results);
    } catch (error) {
      console.error(
        "External recipe search failed:",
        error
      );

      onResults([]);

      onError(
        "We couldn't search external recipes right now."
      );
    } finally {
      onLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Discover More Recipes
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Search thousands of recipes from
            TheMealDB.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">

            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              placeholder="Search chicken, pasta, rice..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />

          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!searchTerm.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition"
          >
            <FaSearch />
            Search
          </button>

        </div>

      </div>
    </div>
  );
}

export default ExternalRecipeSearch;