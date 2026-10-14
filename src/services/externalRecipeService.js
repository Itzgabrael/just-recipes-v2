const THE_MEAL_DB_BASE_URL =
  "https://www.themealdb.com/api/json/v1/1";


// ----------------------------------------
// 7.3 - Normalize TheMealDB recipe
// ----------------------------------------

export function normalizeTheMealDBRecipe(meal) {
  if (!meal) {
    return null;
  }

  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient =
      meal[`strIngredient${i}`]?.trim();

    const measure =
      meal[`strMeasure${i}`]?.trim();

    if (ingredient) {
      ingredients.push(
        measure
          ? `${measure} ${ingredient}`
          : ingredient
      );
    }
  }

  return {
    id: `mealdb-${meal.idMeal}`,

    title: meal.strMeal,

    category: meal.strCategory || "Other",

    area: meal.strArea || "",

    ingredients,

   instructions:
  meal.strInstructions
    ? meal.strInstructions
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter(Boolean)
    : [],

    image:
      meal.strMealThumb || "",

    source: "TheMealDB",

    sourceUrl:
      meal.strSource || "",

    youtubeUrl:
      meal.strYoutube || "",

    tags:
      meal.strTags
        ? meal.strTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
  };
}


// ----------------------------------------
// 7.4 - Search TheMealDB
// ----------------------------------------

export async function searchTheMealDBRecipes(
  searchTerm
) {
  if (
    !searchTerm?.trim()
  ) {
    return [];
  }

  const response = await fetch(
    `${THE_MEAL_DB_BASE_URL}/search.php?s=${encodeURIComponent(
      searchTerm.trim()
    )}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch recipes from TheMealDB."
    );
  }

  const data = await response.json();

  if (!data.meals) {
    return [];
  }

  return data.meals
    .map(normalizeTheMealDBRecipe)
    .filter(Boolean);
}


// ----------------------------------------
// Get one TheMealDB recipe by ID
// ----------------------------------------

export async function getTheMealDBRecipeById(
  recipeId
) {
  if (!recipeId) {
    return null;
  }

  const response = await fetch(
    `${THE_MEAL_DB_BASE_URL}/lookup.php?i=${recipeId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch recipe details from TheMealDB."
    );
  }

  const data = await response.json();

  if (!data.meals) {
    return null;
  }

  return normalizeTheMealDBRecipe(
    data.meals[0]
  );
}