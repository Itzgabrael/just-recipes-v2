/**
 * Normalizes an ingredient so different forms
 * can be compared more easily.
 */
export function normalizeIngredient(ingredient) {
  if (!ingredient) {
    return "";
  }

  return ingredient
    .toLowerCase()
    .trim()
    .replace(/\([^()]*\)/g, "")
    .replace(/\b\d+([./]\d+)?\b/g, "")
    .replace(
      /\b(?:cup|tbsp|tablespoon|tsp|teaspoon|kg|g|gram|ml|liter|litre|oz|ounce|lb|pound)s?\b/g,
      ""
    )
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
const ingredientAliases = {
  tomatoes: "tomato",
  tomatoe: "tomato",

  onions: "onion",
  "red onion": "onion",

  peppers: "pepper",
  "bell pepper": "pepper",

  chickens: "chicken",
  "chicken breast": "chicken",
  "chicken breasts": "chicken",

  potatoes: "potato",

  carrots: "carrot",

  mushrooms: "mushroom",

  eggs: "egg",

  beans: "bean",

  peas: "pea",
};
function getBaseIngredient(ingredient) {
  const normalized = normalizeIngredient(ingredient);

  if (!normalized) {
    return "";
  }

  if (ingredientAliases[normalized]) {
    return ingredientAliases[normalized];
  }

  const words = normalized.split(" ");

  const meaningfulWords = words.filter(
    (word) =>
      ![
        "of",
        "and",
        "with",
        "for",
        "fresh",
        "large",
        "small",
        "medium",
        "whole",
        "chopped",
        "sliced",
        "diced",
        "minced",
        "grated",
        "crushed",
        "ground",
        "cooked",
        "boiled",
        "fried",
        "boneless",
        "skinless",
      ].includes(word)
  );

  for (const word of meaningfulWords) {
    if (ingredientAliases[word]) {
      return ingredientAliases[word];
    }

    if (word.endsWith("s") && word.length > 3) {
      const singularWord = word.slice(0, -1);

      if (ingredientAliases[singularWord]) {
        return ingredientAliases[singularWord];
      }
    }
  }

  const lastWord =
    meaningfulWords[meaningfulWords.length - 1];

  if (!lastWord) {
    return "";
  }

  return lastWord.endsWith("s") && lastWord.length > 3
    ? lastWord.slice(0, -1)
    : lastWord;
}


/**
 * Checks whether a user's ingredient matches
 * a recipe ingredient.
 */
export function ingredientMatches(
  userIngredient,
  recipeIngredient
) {
  const user = normalizeIngredient(userIngredient);
  const recipe = normalizeIngredient(recipeIngredient);

  if (!user || !recipe) {
    return false;
  }

  const excludedWords = [
    "stock",
    "powder",
    "sauce",
    "juice",
    "extract",
    "broth",
  ];

  const recipeWords = new Set(recipe.split(" "));

  const hasExcludedWord = excludedWords.some(
    (word) => recipeWords.has(word)
  );

  if (hasExcludedWord) {
    return false;
  }

  const userBase = getBaseIngredient(user);
  const recipeBase = getBaseIngredient(recipe);

  if (!userBase || !recipeBase) {
    return false;
  }

  if (userBase === recipeBase) {
    return true;
  }

  if (recipeWords.has(userBase)) {
    return true;
  }

  if (user.includes(recipeBase)) {
    return true;
  }

  return false;
}


/**
 * Calculates how well a recipe matches
 * the ingredients the user has.
 */
export function calculateRecipeMatch(
  recipe,
  userIngredients
) {
  if (
    !recipe ||
    !Array.isArray(recipe.ingredients) ||
    !Array.isArray(userIngredients) ||
    userIngredients.length === 0
  ) {
    return {
      recipe,
      matchedCount: 0,
      totalIngredients: 0,
      matchPercentage: 0,
      matchedIngredients: [],
      missingIngredients: [],
    };
  }

  const normalizedUserIngredients =
    userIngredients.map(normalizeIngredient);

  const matchedIngredients = [];
  const missingIngredients = [];

  recipe.ingredients.forEach(
    (recipeIngredient) => {
      const matched =
        normalizedUserIngredients.some(
          (userIngredient) =>
            ingredientMatches(
              userIngredient,
              recipeIngredient
            )
        );

      if (matched) {
        matchedIngredients.push(
          recipeIngredient
        );
      } else {
        missingIngredients.push(
          recipeIngredient
        );
      }
    }
  );

  const totalIngredients =
    recipe.ingredients.length;

  const matchedCount =
    matchedIngredients.length;

  const matchPercentage =
    totalIngredients > 0
      ? Math.round(
          (matchedCount /
            totalIngredients) *
            100
        )
      : 0;

  return {
    recipe,
    matchedCount,
    totalIngredients,
    matchPercentage,
    matchedIngredients,
    missingIngredients,
  };
}


/**
 * Finds and ranks recipes based on the
 * ingredients the user currently has.
 */
export function findMatchingRecipes(
  recipes,
  userIngredients
) {
  if (
    !Array.isArray(recipes) ||
    !Array.isArray(userIngredients) ||
    userIngredients.length === 0
  ) {
    return [];
  }

  return recipes
    .map((recipe) =>
      calculateRecipeMatch(
        recipe,
        userIngredients
      )
    )
    .filter(
      (result) =>
        result.matchedCount > 0
    )
    .sort(
      (a, b) =>
        b.matchPercentage -
        a.matchPercentage
    );
}