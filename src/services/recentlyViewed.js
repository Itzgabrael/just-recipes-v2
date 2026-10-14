const RECENTLY_VIEWED_KEY = "recentlyViewedRecipes";
const MAX_RECENTLY_VIEWED = 10;


// ----------------------------------------
// Get recently viewed recipes
// ----------------------------------------

export function getRecentlyViewed() {
  try {
    const storedRecipes =
      localStorage.getItem(RECENTLY_VIEWED_KEY);

    if (!storedRecipes) {
      return [];
    }

    const recipes = JSON.parse(storedRecipes);

    return Array.isArray(recipes)
      ? recipes
      : [];

  } catch (error) {
    console.error(
      "Error loading recently viewed recipes:",
      error
    );

    return [];
  }
}


// ----------------------------------------
// Add a recipe to recently viewed
// ----------------------------------------

export function addRecentlyViewed(recipe) {
  if (!recipe?.id) {
    return;
  }

  try {
    const currentRecipes =
      getRecentlyViewed();

    // Remove the recipe if it already exists.
    // This allows us to move it to the top.
    const filteredRecipes =
      currentRecipes.filter(
        (item) => item.id !== recipe.id
      );

    const updatedRecipes = [
      recipe,
      ...filteredRecipes,
    ].slice(0, MAX_RECENTLY_VIEWED);

    localStorage.setItem(
      RECENTLY_VIEWED_KEY,
      JSON.stringify(updatedRecipes)
    );

  } catch (error) {
    console.error(
      "Error saving recently viewed recipe:",
      error
    );
  }
}


// ----------------------------------------
// Remove one recently viewed recipe
// ----------------------------------------

export function removeRecentlyViewed(
  recipeId
) {
  if (!recipeId) {
    return;
  }

  try {
    const currentRecipes =
      getRecentlyViewed();

    const updatedRecipes =
      currentRecipes.filter(
        (recipe) => recipe.id !== recipeId
      );

    localStorage.setItem(
      RECENTLY_VIEWED_KEY,
      JSON.stringify(updatedRecipes)
    );

  } catch (error) {
    console.error(
      "Error removing recently viewed recipe:",
      error
    );
  }
}


// ----------------------------------------
// Clear all recently viewed recipes
// ----------------------------------------

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(
      RECENTLY_VIEWED_KEY
    );

  } catch (error) {
    console.error(
      "Error clearing recently viewed recipes:",
      error
    );
  }
}