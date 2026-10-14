const removableWords = new Set([
  "of",
  "and",
  "with",
  "for",

  "fresh",
  "large",
  "small",
  "medium",
  "whole",
  "extra",
  "optional",

  "chopped",
  "sliced",
  "diced",
  "minced",
  "grated",
  "crushed",
  "ground",
  "shredded",
  "halved",
  "quartered",

  "cooked",
  "boiled",
  "fried",
  "baked",
  "roasted",

  "boneless",
  "skinless",
]);

const quantityWords = new Set([
  "a",
  "an",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",

  "half",
  "quarter",
  "third",

  "cup",
  "cups",
  "spoon",
  "spoons",
  "tablespoon",
  "tablespoons",
  "tbsp",
  "teaspoon",
  "teaspoons",
  "tsp",

  "kg",
  "g",
  "gram",
  "grams",
  "ml",
  "l",
  "liter",
  "liters",
  "litre",
  "litres",
  "oz",
  "ounce",
  "ounces",
  "lb",
  "lbs",
  "pound",
  "pounds",
]);

const ingredientAliases = {
  tomatoes: "Tomato",
  tomatoe: "Tomato",

  onions: "Onion",
  "red onion": "Onion",

  peppers: "Pepper",
  "bell pepper": "Pepper",

  chickens: "Chicken",
  "chicken breast": "Chicken",
  "chicken breasts": "Chicken",

  "garlic cloves": "Garlic",
  "garlic clove": "Garlic",

  potatoes: "Potato",
  carrots: "Carrot",
  mushrooms: "Mushroom",
  eggs: "Egg",
  beans: "Bean",
  peas: "Pea",

  rices: "Rice",
  pastas: "Pasta",
  flours: "Flour",
  breads: "Bread",

  milks: "Milk",
  butters: "Butter",
  cheeses: "Cheese",
  corns: "Corn",

  garlics: "Garlic",
  gingers: "Ginger",
};

function removeParentheses(text) {
  return text.replace(/\([^()\r\n]*\)/g, "");
}

function removeQuantities(text) {
  return text
    .replace(/\b\d+([./]\d+)?\b/g, "")
    .replace(/\b\d+\s*-\s*\d+\b/g, "");
}

function cleanIngredientPhrase(ingredient) {
  if (
    typeof ingredient !== "string" ||
    !ingredient.trim()
  ) {
    return "";
  }

  let cleaned = ingredient
    .toLowerCase()
    .trim();

  cleaned = removeParentheses(cleaned);
  cleaned = removeQuantities(cleaned);

  cleaned = cleaned.replace(
    /[^\w\s-]/g,
    " "
  );

  const words = cleaned
    .split(/\s+/)
    .filter(Boolean);

  const meaningfulWords = words.filter(
    (word) =>
      !removableWords.has(word) &&
      !quantityWords.has(word)
  );

  if (meaningfulWords.length === 0) {
    return "";
  }

  let phrase = meaningfulWords.join(" ").trim();

  if (ingredientAliases[phrase]) {
    return ingredientAliases[phrase];
  }

  const singularWords = phrase
    .split(" ")
    .map((word) => {
      if (
        word.endsWith("s") &&
        word.length > 3
      ) {
        return word.slice(0, -1);
      }

      return word;
    });

  phrase = singularWords.join(" ");

  if (ingredientAliases[phrase]) {
    return ingredientAliases[phrase];
  }

  return phrase
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export function extractIngredientsFromRecipes(
  recipes
) {
  if (!Array.isArray(recipes)) {
    return [];
  }

  const ingredients = [];

  recipes.forEach((recipe) => {
    if (!Array.isArray(recipe.ingredients)) {
      return;
    }

    recipe.ingredients.forEach((ingredient) => {
      const cleanIngredient =
        cleanIngredientPhrase(ingredient);

      if (cleanIngredient) {
        ingredients.push(cleanIngredient);
      }
    });
  });

  return ingredients;
}

export function buildIngredientDatabase(
  builtInRecipes = [],
  communityRecipes = []
) {
  const allRecipes = [
    ...builtInRecipes,
    ...communityRecipes,
  ];

  const extractedIngredients =
    extractIngredientsFromRecipes(allRecipes);

  const uniqueIngredients = new Map();

  extractedIngredients.forEach((ingredient) => {
    const key = ingredient
      .toLowerCase()
      .trim();

    if (!uniqueIngredients.has(key)) {
      uniqueIngredients.set(
        key,
        ingredient
      );
    }
  });

  return Array.from(
    uniqueIngredients.values()
  ).sort((a, b) =>
    a.localeCompare(b)
  );
}