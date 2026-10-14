export function getDailyRecipe(recipesList = []) {
  if (!Array.isArray(recipesList) || recipesList.length === 0) {
    return null;
  }

  const today = new Date();

  const dateKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Create a stable number from today's date.
  let hash = 0;

  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.codePointAt(i)) % 2147483647;
  }

  const index = hash % recipesList.length;

  return recipesList[index];
}