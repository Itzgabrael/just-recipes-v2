import { useState, useEffect, useCallback } from "react";
import IngredientSelector from "../components/IngredientSelector";
import { findMatchingRecipes } from "../utils/ingredientMatcher";
import recipes from "../data/recipes";
import RecipeCard from "../components/RecipeCard";
import { getRecipes } from "../services/recipeService";
import { useAuth } from "../context/AuthContext";
import { buildIngredientDatabase } from "../utils/ingredientDatabase";
import { searchTheMealDBRecipes } from "../services/externalRecipeService";

function CookWithWhatYouHave() {
  const { currentUser } = useAuth();
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [matchingRecipes, setMatchingRecipes] = useState([]);
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loadingCommunityRecipes, setLoadingCommunityRecipes] = useState(false);
  const [communityRecipesError, setCommunityRecipesError] = useState("");
  const [externalRecipeResults, setExternalRecipeResults] = useState([]);
  const [loadingExternalRecipes, setLoadingExternalRecipes] = useState(false);
  const [externalRecipeError, setExternalRecipeError] = useState("");
  const loadCommunityRecipes = useCallback(async () => {
  if (!currentUser) {
    setCommunityRecipes([]);
    setAvailableIngredients(
      buildIngredientDatabase(recipes, [])
    );
    return [];
  }

  try {
    setLoadingCommunityRecipes(true);
    setCommunityRecipesError("");

    const firestoreRecipes = await getRecipes();

setCommunityRecipes(firestoreRecipes);

const ingredientDatabase =
  buildIngredientDatabase(
    recipes,
    firestoreRecipes
  );

setAvailableIngredients(
  ingredientDatabase
);

return firestoreRecipes;

  } catch (error) {
    console.error(
      "Error loading community recipes:",
      error
    );

    setCommunityRecipesError(
      "We couldn't load community recipes right now."
    );

    return [];
  } finally {
    setLoadingCommunityRecipes(false);
  }
  }, [currentUser]);

  const searchExternalRecipes = useCallback(
  async (ingredients) => {
    if (
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      setExternalRecipeResults([]);
      setExternalRecipeError("");
      return;
    }

    try {
      setLoadingExternalRecipes(true);
      setExternalRecipeError("");

      const resultsById = new Map();

      /*
      Search TheMealDB using each selected ingredient.
      */

      const ingredientResults = await Promise.all(
        ingredients.map((ingredient) =>
          searchTheMealDBRecipes(ingredient)
        )
      );

      ingredientResults.forEach((results) => {
        results.forEach((recipe) => {
          if (!resultsById.has(recipe.id)) {
            resultsById.set(recipe.id, recipe);
          }
        });
      });

      const externalRecipes = Array.from(
        resultsById.values()
      );

      /*
      Match external recipes against
      the ingredients selected by the user.
      */

      const matchingExternalRecipes =
        findMatchingRecipes(
          externalRecipes,
          ingredients
        );

      setExternalRecipeResults(
        matchingExternalRecipes.map(
          (result) => result.recipe
        )
      );

    } catch (error) {

      console.error(
        "Error searching external recipes:",
        error
      );

      setExternalRecipeResults([]);

      setExternalRecipeError(
        "We couldn't search external recipes right now."
      );

    } finally {

      setLoadingExternalRecipes(false);

    }
  },
  []
);

  useEffect(() => {
    const load = async () => {
      await loadCommunityRecipes();
    };

    void load();
  }, [loadCommunityRecipes]);

 const handleFindRecipes = (ingredients) => {
  setSelectedIngredients(ingredients);

  const allRecipes = [
    ...recipes,
    ...communityRecipes,
  ];

  const results = findMatchingRecipes(
    allRecipes,
    ingredients
  );

  setMatchingRecipes(results);

 void searchExternalRecipes(ingredients);
};

const handleSearchClear = () => {
  setSelectedIngredients([]);
  setMatchingRecipes([]);
  setExternalRecipeResults([]);
  setExternalRecipeError("");
  setLoadingExternalRecipes(false);
};

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">

      <IngredientSelector
        onFindRecipes={handleFindRecipes}
        onSearchClear={handleSearchClear}
        availableIngredients={availableIngredients}
      />

      {loadingExternalRecipes && (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
    <p className="text-center text-gray-600 dark:text-cyan-400">
      Searching more recipes from TheMealDB...
    </p>
  </div>
)}
{externalRecipeError && (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl p-4">
      <p className="text-sm">
        {externalRecipeError}
      </p>
      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
        Your built-in and community recipes are still available.
      </p>
    </div>
  </div>
)}

      {externalRecipeResults.length > 0 && (
  <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">

    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        More Recipes from TheMealDB
      </h2>

      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
        External recipes that match your ingredients you selected.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {externalRecipeResults.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
        />
      ))}
    </div>

  </section>
)}

      {selectedIngredients.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center shadow-sm dark:shadow-none">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Selected ingredients:
            </p>

            <p className="text-gray-900 dark:text-white font-semibold mt-2">
              {selectedIngredients.join(", ")}
            </p>
          </div>
        </div>
      )}
      {selectedIngredients.length > 0 && (
  <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Matching Recipes
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Recipes you can make with what you have.
        </p>
      </div>

      {loadingCommunityRecipes && (
        <p className="text-sm text-cyan-600 dark:text-cyan-400">
          Checking community recipes...
        </p>
      )}

    </div>

    {communityRecipesError && (
      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 rounded-xl p-4">
        <p className="text-sm">
          {communityRecipesError}
        </p>

        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
          Your built-in recipes are still available.
        </p>
      </div>
    )}

    {matchingRecipes.length === 0 ? (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm dark:shadow-none">
        <p className="text-gray-900 dark:text-white text-lg font-semibold">
          No matching recipes found.
        </p>

        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Try selecting another ingredient or adding more ingredients.
        </p>
      </div>
    ) : (
      <>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
          Found {matchingRecipes.length}{" "}
          {matchingRecipes.length === 1
            ? "matching recipe"
            : "matching recipes"}.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingRecipes.map((result) => (
            <RecipeCard
              key={result.recipe.id}
              recipe={result.recipe}
            />
          ))}
        </div>
      </>
    )}

  </section>
)}
    </main>
  );
}

export default CookWithWhatYouHave;