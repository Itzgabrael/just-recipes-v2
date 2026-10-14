import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db, auth } from "./firebase";
import recipes from "../data/recipes";
import { deleteRecipeImage, uploadRecipeImage } from "./recipeImageService";

// ----------------------------------------
// OFFLINE RECIPE CACHE HELPERS
// ----------------------------------------
//
// The cache is stored in localStorage, but each authenticated Firebase user
// gets a completely separate cache keyed by their UID. This prevents one
// user's previously cached Firestore recipes from being exposed to another
// user on the same device while offline. Guest recipes remain in their own
// separate localStorage key ("guestRecipes") and are never mixed into this
// cache.
// ----------------------------------------

const RECIPE_CACHE_KEY_PREFIX = "firestoreRecipeCache:";
const FAVORITE_CACHE_KEY_PREFIX = "favoriteRecipeCache:";
const MAX_CACHED_RECIPES_PER_USER = 200;

/**
 * Get the current authenticated user's UID using Firebase Auth directly.
 * This avoids depending on React hooks in the service layer.
 *
 * @returns {string|null} The current user's UID, or null if not authenticated.
 */
function getCurrentUserUid() {
  try {
    return auth?.currentUser?.uid || null;
  } catch (error) {
    console.error("Error getting current user UID:", error);
    return null;
  }
}

/**
 * Build the localStorage key for the current user's recipe cache.
 *
 * @returns {string|null} The cache key, or null if no user is authenticated.
 */
function getRecipeCacheKey() {
  const uid = getCurrentUserUid();
  return uid ? `${RECIPE_CACHE_KEY_PREFIX}${uid}` : null;
}

/**
 * Read the current user's recipe cache from localStorage.
 * Returns an empty object if no cache exists or if not authenticated.
 *
 * @returns {object} Object keyed by recipeId, or {} if not authenticated.
 */
function readRecipeCache() {
  const cacheKey = getRecipeCacheKey();
  if (!cacheKey) return {};

  try {
    const stored = localStorage.getItem(cacheKey);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error("Error reading recipe cache:", error);
    return {};
  }
}

/**
 * Write recipe data to the current user's cache in localStorage.
 *
 * @param {object} cachedData - Object keyed by recipeId.
 */
function writeRecipeCache(cachedData) {
  const cacheKey = getRecipeCacheKey();
  if (!cacheKey) return;

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cachedData));
  } catch (error) {
    console.error("Error writing recipe cache:", error);
  }
}

/**
 * Cache a single recipe by its ID.
 *
 * @param {object} recipe - Recipe object with an `id` field.
 */
function cacheRecipe(recipe) {
  if (!recipe?.id) return;

  const cache = readRecipeCache();

  cache[recipe.id] = {
    ...recipe,
    cachedAt: Date.now(),
  };

  const keys = Object.keys(cache);

  if (keys.length > MAX_CACHED_RECIPES_PER_USER) {
    const sortedKeys = keys.toSorted((a, b) => {
      const aCachedAt = Number(cache[a]?.cachedAt) || 0;
      const bCachedAt = Number(cache[b]?.cachedAt) || 0;

      return aCachedAt - bCachedAt;
    });

    const keysToRemove = sortedKeys.slice(
      0,
      keys.length - MAX_CACHED_RECIPES_PER_USER
    );

    keysToRemove.forEach((key) => {
      delete cache[key];
    });
  }

  writeRecipeCache(cache);
}

/**
 * Cache multiple recipes by their IDs.
 * Trims the cache to MAX_CACHED_RECIPES_PER_USER if it exceeds the limit
 * (least recently cached entries are removed first).
 *
 * @param {Array<object>} recipes - Array of recipe objects with `id` fields.
 */
function cacheRecipes(recipes) {
  if (!Array.isArray(recipes) || recipes.length === 0) return;

  const cache = readRecipeCache();
  const now = Date.now();

  recipes.forEach((recipe, index) => {
    if (!recipe?.id) return;

    cache[recipe.id] = {
      ...recipe,
      cachedAt: now + index,
    };
  });

  // Trim cache if it exceeds the maximum size.
  const keys = Object.keys(cache);

  if (keys.length > MAX_CACHED_RECIPES_PER_USER) {
    const sortedKeys = keys.toSorted((a, b) => {
      const aCachedAt = Number(cache[a]?.cachedAt) || 0;
      const bCachedAt = Number(cache[b]?.cachedAt) || 0;

      return aCachedAt - bCachedAt;
    });

    const keysToRemove = sortedKeys.slice(
      0,
      keys.length - MAX_CACHED_RECIPES_PER_USER
    );

    keysToRemove.forEach((key) => {
      delete cache[key];
    });
  }

  writeRecipeCache(cache);
}

/**
 * Remove a single recipe from the cache.
 *
 * @param {string} recipeId - The recipe ID to remove.
 */
function removeCachedRecipe(recipeId) {
  if (!recipeId) return;

  const cache = readRecipeCache();
  delete cache[recipeId];
  writeRecipeCache(cache);
}

/**
 * Get all cached recipes for the current user as an array.
 *
 * @returns {Array<object>} Array of cached recipe objects.
 */
function getCachedRecipes() {
  const cache = readRecipeCache();

  return Object.values(cache)
    .sort((a, b) => {
      const aCreatedAt = a.createdAt?.seconds || 0;
      const bCreatedAt = b.createdAt?.seconds || 0;

      return bCreatedAt - aCreatedAt;
    })
    // eslint-disable-next-line no-unused-vars
    .map(({ cachedAt: _cachedAt, ...recipe }) => recipe);
}

/**
 * Get a single cached recipe by its ID.
 *
 * @param {string} recipeId - The recipe ID to look up.
 * @returns {object|null} The cached recipe, or null if not found.
 */
function getCachedRecipe(recipeId) {
  if (!recipeId) return null;

  const cache = readRecipeCache();
  const entry = cache[recipeId];

  if (!entry) return null;

  // Reading a cached recipe counts as using it.
  // Refresh its access time so the LRU strategy
  // can keep frequently accessed recipes longer.
  cache[recipeId] = {
    ...entry,
    cachedAt: Date.now(),
  };

  writeRecipeCache(cache);

  // eslint-disable-next-line no-unused-vars
  const { cachedAt: _cachedAt, ...recipe } = cache[recipeId];

  return recipe;
}

/**
 * Check if a recipe is cached for the current user.
 *
 * @param {string} recipeId - The recipe ID to check.
 * @returns {boolean} True if the recipe is cached, false otherwise.
 */
function isRecipeCached(recipeId) {
  if (!recipeId) return false;

  const cache = readRecipeCache();
  return recipeId in cache;
}

function getFavoriteCacheKey() {
  const uid = getCurrentUserUid();

  if (!uid) {
    return null;
  }

  return `${FAVORITE_CACHE_KEY_PREFIX}${uid}`;
}

function readFavoriteCache() {
  const cacheKey = getFavoriteCacheKey();

  if (!cacheKey) {
    return [];
  }

  try {
    const cachedFavorites = localStorage.getItem(cacheKey);

    if (!cachedFavorites) {
      return [];
    }

    const parsedFavorites = JSON.parse(cachedFavorites);

    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch (error) {
    console.error("Error reading favorite cache:", error);
    return [];
  }
}

function writeFavoriteCache(favorites) {
  const cacheKey = getFavoriteCacheKey();

  if (!cacheKey) {
    return;
  }

  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify(favorites)
    );
  } catch (error) {
    console.error("Error writing favorite cache:", error);
  }
}

function cacheFavorites(favorites) {
  if (!Array.isArray(favorites)) {
    return;
  }

  writeFavoriteCache(favorites);
}

function getCachedFavorites() {
  return readFavoriteCache();
}

/**
 * Clear all cached recipes for the current user.
 */

/**
 * CREATE RECIPE
 * Creates a recipe owned by the currently authenticated user.
 */
export async function createRecipe(recipeData, currentUser) {
  if (!currentUser) {
    throw new Error("You must be signed in to create a recipe.");
  }

  if (!recipeData || typeof recipeData !== "object") {
    throw new Error("Invalid recipe data.");
  }

  const recipe = {
    ...recipeData,

    ownerId: currentUser.uid,
    ownerName: currentUser.displayName || "User",
    ownerPhoto: currentUser.photoURL || "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    likes: 0,
    comments: 0,
    rating: 0,
    ratingCount: 0,
  };

  const recipeRef = await addDoc(
    collection(db, "recipes"),
    recipe
  );

  // Read the newly created document back so we get the
  // real Firestore values, including resolved timestamps.
 let createdRecipe;

try {
  const snapshot = await getDoc(recipeRef);

  if (snapshot.exists()) {
    createdRecipe = {
      id: snapshot.id,
      ...snapshot.data(),
    };
  }
} catch (error) {
  console.warn(
    "Recipe created, but the refreshed document could not be loaded:",
    error
  );
}

if (!createdRecipe) {
  createdRecipe = {
    ...recipe,
    id: recipeRef.id,
  };
}

  // Keep the offline cache synchronized with the Firestore write.
  cacheRecipe(createdRecipe);

  return createdRecipe;
}

/**
 * READ ALL RECIPES
 */
export async function getRecipes() {
  const recipesQuery = query(
  collection(db, "recipes"),
  orderBy("createdAt", "desc")
);

  try {
    // Try to fetch recipes from Firestore first
    const snapshot = await getDocs(recipesQuery);

    // Map the documents to { id, ...data } and cache the fresh results
    const recipes = snapshot.docs.map((recipeDoc) => ({
      id: recipeDoc.id,
      ...recipeDoc.data(),
    }));

    cacheRecipes(recipes);

    return recipes;
    } catch (error) {
    console.error("Error loading recipes, using cached recipes:", error);

    const cachedRecipes = getCachedRecipes();

    if (cachedRecipes.length > 0) {
      return cachedRecipes;
    }

    throw error;
  }
}

/**
 * READ RECIPES BELONGING TO THE CURRENT USER
 *
 * Fetches the user's own recipes from Firestore and keeps
 * them synchronized with the user's offline recipe cache.
 *
 * If Firestore is unavailable, cached recipes belonging to
 * the current user are returned instead.
 */
export async function getMyRecipes(currentUser) {
  if (!currentUser) {
    throw new Error("You must be signed in to load your recipes.");
  }

  try {
    const q = query(
      collection(db, "recipes"),
      where("ownerId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const myRecipes = snapshot.docs.map((recipeDoc) => ({
      id: recipeDoc.id,
      ...recipeDoc.data(),
    }));

    // Keep the user's offline cache synchronized.
    cacheRecipes(myRecipes);

    return myRecipes;
  } catch (error) {
    console.error(
      "Error loading user recipes, using cached recipes:",
      error
    );

    const cachedRecipes = getCachedRecipes().filter(
      (recipe) => recipe.ownerId === currentUser.uid
    );

    if (cachedRecipes.length > 0) {
      return cachedRecipes;
    }

    throw error;
  }
}

export async function getFavorites(currentUser) {
  if (!currentUser) {
    throw new Error("You must be signed in to load your favorites.");
  }

  try {
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("userId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(favoritesQuery);

    const favoriteRecipes = [];

    const recipePromises = snapshot.docs.map(async (favoriteDoc) => {
      const recipeId = favoriteDoc.data().recipeId;

      if (!recipeId) {
        return null;
      }

      // Check built-in recipes first.
      const localRecipe = recipes.find(
        (recipe) => String(recipe.id) === String(recipeId)
      );

      if (localRecipe) {
        return localRecipe;
      }

      // Otherwise load the recipe from Firestore.
      return getRecipeById(recipeId);
    });

    favoriteRecipes.push(...(await Promise.all(recipePromises)).filter(Boolean));

    cacheFavorites(favoriteRecipes);

    return favoriteRecipes;
  } catch (error) {
    console.error(
      "Error loading favorites, using cached favorites:",
      error
    );

    const cachedFavorites = getCachedFavorites();

    if (cachedFavorites.length > 0) {
      return cachedFavorites;
    }

    throw error;
  }
}

/**
 * READ ONE RECIPE
 */
export async function getRecipeById(recipeId) {
  if (!recipeId) {
    throw new Error("Recipe ID is required.");
  }

  const recipeRef = doc(db, "recipes", recipeId);

  try {
    const snapshot = await getDoc(recipeRef);

    if (!snapshot.exists()) {
      return null;
    }

    const recipe = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    cacheRecipe(recipe);

    return recipe;
  } catch (error) {
    console.error("Error loading recipe:", error);

    const cachedRecipe = getCachedRecipe(recipeId);

    return cachedRecipe;
  }
}

/**
 * DELETE RECIPE
 *
 * Deletes a recipe only if the currently authenticated
 * user owns that recipe.
 */
export async function deleteRecipe(recipeId, currentUser) {

  /*
  ====================================================
  CHECK AUTHENTICATION
  ====================================================
  */

  if (!currentUser) {
    throw new Error(
      "You must be signed in to delete a recipe."
    );
  }


  /*
  ====================================================
  CHECK RECIPE ID
  ====================================================
  */

  if (!recipeId) {
    throw new Error(
      "Recipe ID is required."
    );
  }


  /*
  ====================================================
  GET RECIPE
  ====================================================
  */

  const recipeRef = doc(
    db,
    "recipes",
    recipeId
  );

  const snapshot =
    await getDoc(recipeRef);


  /*
  ====================================================
  CHECK IF RECIPE EXISTS
  ====================================================
  */

  if (!snapshot.exists()) {
    throw new Error(
      "Recipe not found."
    );
  }


  /*
  ====================================================
  GET RECIPE DATA
  ====================================================
  */

  const recipe =
    snapshot.data();


  /*
  ====================================================
  OWNERSHIP CHECK
  ====================================================
  */

  if (
    recipe.ownerId !== currentUser.uid
  ) {
    throw new Error(
      "You are not allowed to delete this recipe."
    );
  }


  /*
  ====================================================
  DELETE RECIPE
  ====================================================
  */

  await deleteDoc(recipeRef);

// Delete the Supabase image if this recipe owns one.
if (recipe.imagePath) {
  try {
    await deleteRecipeImage(
      currentUser,
      recipe.imagePath
    );
  } catch (imageDeleteError) {
    console.error(
      "Failed to delete recipe image:",
      imageDeleteError
    );
  }
}

// Remove the recipe from the offline cache too.
removeCachedRecipe(recipeId);

return true;
}
/**
 * UPDATE RECIPE
 * Updates a recipe only if the currently authenticated user owns that recipe.
 */
export async function updateRecipe(recipeId, updatedData, currentUser) {
  if (!currentUser) {
    throw new Error("You must be signed in to update a recipe.");
  }

  if (!recipeId) {
    throw new Error("Recipe ID is required.");
  }

  if (!updatedData || typeof updatedData !== "object") {
    throw new Error("Invalid recipe data.");
  }

  const recipeRef = doc(db, "recipes", recipeId);

  const snapshot = await getDoc(recipeRef);

  if (!snapshot.exists()) {
    throw new Error("Recipe not found.");
  }

  const existingRecipe = snapshot.data();

  if (existingRecipe.ownerId !== currentUser.uid) {
    throw new Error("You are not allowed to update this recipe.");
  }

  const safeRecipeData = {
    ...updatedData,
  };

  // These fields are controlled by the service/database
  // and must not be changed through normal recipe editing.
  delete safeRecipeData.ownerId;
  delete safeRecipeData.createdAt;
  delete safeRecipeData.likes;
  delete safeRecipeData.comments;
  delete safeRecipeData.rating;
  delete safeRecipeData.ratingCount;

  await updateDoc(recipeRef, {
    ...safeRecipeData,
    updatedAt: serverTimestamp(),
  });

   // Read the updated document back so the cache receives
  // the final Firestore data, including the new timestamp.
  let updatedRecipe;

  try {
    const updatedSnapshot = await getDoc(recipeRef);

    if (updatedSnapshot.exists()) {
      updatedRecipe = {
        id: updatedSnapshot.id,
        ...updatedSnapshot.data(),
      };
    }
  } catch (error) {
    console.warn(
      "Recipe updated, but the refreshed document could not be loaded:",
      error
    );
  }

  // updateDoc() already succeeded. A failed follow-up read
  // must not make the caller treat the update as a failed save.
  if (!updatedRecipe) {
    updatedRecipe = {
      ...existingRecipe,
      ...safeRecipeData,
      id: recipeId,
    };
  }

  cacheRecipe(updatedRecipe);

  return updatedRecipe;
}
/*
====================================================
GUEST RECIPE MIGRATION
====================================================
*/

/**
 * Convert a Base64 image data URL into a File.
 *
 * Guest recipes can store images as data URLs in localStorage.
 * Supabase Storage needs a File or Blob for uploading.
 */
async function dataUrlToFile(dataUrl, fileName) {
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error("Failed to read guest recipe image.");
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error("Guest recipe image has an invalid file type.");
  }

  return new File([blob], fileName, {
    type: blob.type,
  });
}

function createMigrationId(recipe) {

  /*
  Use the existing guest recipe ID whenever
  possible because it is the most reliable
  identifier.
  */

  if (recipe?.id) {
    return String(recipe.id);
  }


  /*
  Fallback for older guest recipes that
  don't have an ID.
  */

  const identifyingData = JSON.stringify({
    recipeName: recipe?.recipeName || "",
    title: recipe?.title || "",
    ingredients: recipe?.ingredients || [],
    instructions: recipe?.instructions || "",
  });


  let hash = 0;

  for (
    let index = 0;
    index < identifyingData.length;
    index++
  ) {

    hash =
      (hash * 31 +
        identifyingData.codePointAt(index)) %
      2147483647;

  }


  return `guest-${hash}`;
}

export async function migrateGuestRecipes(currentUser) {

  if (!currentUser) {
    throw new Error(
      "You must be signed in to migrate recipes."
    );
  }


  /*
  ====================================================
  GET GUEST RECIPES
  ====================================================
  */

  const storedRecipesString =
    localStorage.getItem("guestRecipes");


  if (!storedRecipesString) {

    return {
      migratedCount: 0,
      failedCount: 0,
    };

  }


  /*
  ====================================================
  PARSE GUEST RECIPES SAFELY
  ====================================================
  */

  let storedRecipes;

  try {

    storedRecipes =
      JSON.parse(storedRecipesString);

  } catch (error) {

    console.error(
      "Failed to parse guest recipes:",
      error
    );

    throw new Error(
      "Guest recipe data is corrupted.",
      { cause: error }
    );

  }


  /*
  ====================================================
  VALIDATE DATA
  ====================================================
  */

  if (
    !Array.isArray(storedRecipes) ||
    storedRecipes.length === 0
  ) {

    return {
      migratedCount: 0,
      failedCount: 0,
    };

  }


  /*
  ====================================================
  MIGRATION COUNTERS
  ====================================================
  */

  let migratedCount = 0;
  let failedCount = 0;

  const remainingRecipes = [];

  const existingQuery =
    query(
      collection(db, "recipes")
    );

  const existingSnapshot =
    await getDocs(existingQuery);

  const migratedIds = new Set(
    existingSnapshot.docs
      .map((recipeDoc) => recipeDoc.data())
      .filter((recipe) => recipe.ownerId === currentUser.uid)
      .map((recipe) => recipe.guestMigrationId)
  );


  /*
  ====================================================
  MIGRATE EACH RECIPE
  ====================================================
  */

  await Promise.all(
    storedRecipes.map(async (guestRecipe) => {
      let uploadedImagePath = null;

    try {

      const migrationId =
        createMigrationId(guestRecipe);


      /*
      ================================================
      CHECK WHETHER THIS GUEST RECIPE WAS ALREADY
      MIGRATED TO THIS USER'S ACCOUNT
      ================================================
      */

      const alreadyMigrated =
        migratedIds.has(migrationId);


      /*
      ================================================
      IF ALREADY MIGRATED
      ================================================
      */

      if (alreadyMigrated) {

        migratedCount++;

        return;

      }


      /*
===============================================
PREPARE RECIPE DATA
===============================================
*/

const recipeData = {
  ...guestRecipe,
  guestMigrationId: migrationId,
};

/*
Remove fields belonging only to the
local guest version.
*/

delete recipeData.id;
delete recipeData.source;

/*
===============================================
PREPARE GUEST RECIPE IMAGE
===============================================
*/

if (
  typeof recipeData.image === "string" &&
  recipeData.image.startsWith("data:image/")
) {
  const imageFile = await dataUrlToFile(
    recipeData.image,
    "guest-recipe-image"
  );

  const uploadedImage = await uploadRecipeImage(
    currentUser,
    imageFile
  );

  uploadedImagePath = uploadedImage.path;

  recipeData.image = uploadedImage.publicUrl;
  recipeData.imagePath = uploadedImage.path;
}


      /*
      ================================================
      CREATE FIRESTORE RECIPE
      ================================================
      */

      await createRecipe(
        recipeData,
        currentUser
      );


      migratedCount++;


    } catch (error) {

      console.error(
        "Failed to migrate guest recipe:",
        guestRecipe?.recipeName ||
          guestRecipe?.title,
        error
      );

      if (uploadedImagePath) {
  try {
    await deleteRecipeImage(
      currentUser,
      uploadedImagePath
    );
  } catch (imageDeleteError) {
    console.error(
      "Failed to clean up uploaded guest recipe image:",
      imageDeleteError
    );
  }
}


      /*
      Keep only failed recipes in localStorage.
      */

      remainingRecipes.push(
        guestRecipe
      );

      failedCount++;

    }

    })
  );


  /*
  ====================================================
  UPDATE LOCAL STORAGE
  ====================================================
  */

  if (remainingRecipes.length === 0) {

    localStorage.removeItem(
      "guestRecipes"
    );

  } else {

    localStorage.setItem(
      "guestRecipes",
      JSON.stringify(
        remainingRecipes
      )
    );

  }


  /*
  ====================================================
  RETURN RESULT
  ====================================================
  */

  return {
    migratedCount,
    failedCount,
  };
}

/*
====================================================
READ-ONLY OFFLINE CACHE API
====================================================
*/

/**
 * Read all recipes currently available in the
 * authenticated user's offline cache.
 */
export {
  getCachedRecipes,
  getCachedRecipe,
  isRecipeCached,
};