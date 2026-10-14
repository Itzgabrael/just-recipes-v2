import { useParams, useNavigate } from "react-router-dom";
import recipes from "../data/recipes";
import Ingredients from "../components/Ingredients";
import Instructions from "../components/Instructions";
import Nutrition from "../components/Nutrition";
import SimilarRecipes from "../components/SimilarRecipes";
import Comments from "../components/Comments";
import Rating from "../components/Rating";
import { getTheMealDBRecipeById } from "../services/externalRecipeService";
import { addRecentlyViewed } from "../services/recentlyViewed";
import { FaStar, FaFire, FaPrint,FaShareAlt } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";
import { useEffect, useState } from "react";
import { deleteRecipe, getRecipeById } from "../services/recipeService";
import { useAuth } from "../context/AuthContext";
import CookingMode from "../components/CookingMode";
import toast from "react-hot-toast";

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cookingMode, setCookingMode] = useState(false);


  /*
  ========================================
  LOAD RECIPE
  ========================================
  */

  useEffect(() => {

  async function loadRecipe() {

    try {

      /*
      =====================================================
      1. CHECK BUILT-IN RECIPES
      =====================================================
      */

      const localRecipe = recipes.find(
        (item) =>
          item.id === Number(id)
      );


      if (localRecipe) {

        setRecipe({

          ...localRecipe,

          source: "builtin",

        });

        setLoading(false);

        return;

      }


      /*
      =====================================================
      2. CHECK GUEST RECIPES
      =====================================================
      */

      const guestRecipes =
        JSON.parse(
          localStorage.getItem(
            "guestRecipes"
          )
        ) || [];


      const guestRecipe =
        guestRecipes.find(
          (item) =>
            item.id === id
        );


      if (guestRecipe) {

        setRecipe({

          ...guestRecipe,

          source: "guest",

        });

        setLoading(false);

        return;

      }

      /*
=====================================================
3. CHECK THEMEALDB EXTERNAL RECIPES
=====================================================
*/

if (id.startsWith("mealdb-")) {

  const mealId =
    id.replace("mealdb-", "");

  const externalRecipe =
    await getTheMealDBRecipeById(
      mealId
    );

  if (externalRecipe) {

    setRecipe({
      ...externalRecipe,

      source: "themealdb",

    });

    setLoading(false);

    return;

  }

}


      /*
      =====================================================
      4. CHECK FIRESTORE
      =====================================================
      */

      const firestoreRecipe = await getRecipeById(id);

if (firestoreRecipe) {
  setRecipe({
    ...firestoreRecipe,
    source: "firestore",
  });
}
    } catch (error) {

      console.error(
        "Error loading recipe:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  void loadRecipe();

}, [id]);

/*
========================================
TRACK RECENTLY VIEWED RECIPE
========================================
*/

useEffect(() => {

  if (!recipe) {
    return;
  }

  addRecentlyViewed(recipe);

}, [recipe]);

  /*
  ========================================
  PRINT RECIPE
  ========================================
  */

  function handlePrint() {

    if (!recipe) {

      toast.error(
        "Recipe is not ready to print."
      );

      return;
    }

    window.print();

  }

  /*
========================================
SHARE RECIPE
========================================
*/

async function handleShare() {

  if (!recipe) {

    toast.error(
      "Recipe is not ready to share."
    );

    return;
  }

  const title =
    recipe.title ||
    recipe.recipeName ||
    "Recipe";

  const shareUrl =
    window.location.href;

  const shareData = {
    title: `${title} | Just Recipes`,
    text:
      recipe.description ||
      `Check out ${title} on Just Recipes.`,
    url: shareUrl,
  };


  /*
  ========================================
  NATIVE SHARE
  ========================================
  */

  if (
    navigator.share &&
    typeof navigator.share === "function"
  ) {

    try {

      await navigator.share(shareData);

      return;

    } catch (error) {

      /*
       * User closing/canceling the share
       * menu is not an actual error.
       */

      if (
        error.name === "AbortError"
      ) {

        return;

      }

      console.error(
        "Error sharing recipe:",
        error
      );

    }

  }


  /*
  ========================================
  CLIPBOARD FALLBACK
  ========================================
  */

  try {

    await navigator.clipboard.writeText(
      shareUrl
    );

    toast.success(
      "Recipe link copied to clipboard!"
    );

  } catch (error) {

    console.error(
      "Error copying recipe link:",
      error
    );

    toast.error(
      "Unable to share recipe."
    );

  }

}


  /*
  ========================================
  DELETE RECIPE
  ========================================
  */

  async function handleDelete() {
  try {
    // Guest recipes live in localStorage.
    if (recipe.source === "guest") {
      const guestRecipes =
        JSON.parse(
          localStorage.getItem("guestRecipes")
        ) || [];

      const updatedRecipes =
        guestRecipes.filter(
          (item) => item.id !== recipe.id
        );

      localStorage.setItem(
        "guestRecipes",
        JSON.stringify(updatedRecipes)
      );

      toast.success(
        "Recipe deleted successfully!"
      );

      void navigate("/");
      return;
    }

    // Firestore recipes must be owned by the
    // currently authenticated user.
    await deleteRecipe(
      recipe.id,
      currentUser
    );

    toast.success(
      "Recipe deleted successfully!"
    );

    void navigate("/");
  } catch (error) {
    console.error(
      "Error deleting recipe:",
      error
    );

    toast.error(
      "Failed to delete recipe."
    );
  }
}


  /*
  ========================================
  LOADING
  ========================================
  */

  if (loading) {

    return (

      <h2 className="text-center text-2xl mt-10">

        Loading{" "}

        <span className="text-green-600 font-bold">
          recipe
        </span>

        {" "}...

      </h2>

    );

  }


  /*
  ========================================
  RECIPE NOT FOUND
  ========================================
  */

  if (!recipe) {

    return (

      <h2 className="text-center text-2xl mt-10">

        <span className="text-green-600 font-bold">
          Recipe
        </span>

        {" "}not found.

      </h2>

    );

  }


  /*
  ========================================
  NORMAL PAGE
  ========================================
  */

  return (

    <section className="max-w-6xl mx-auto px-6 py-12">


      {/* =====================================================
          NORMAL WEBSITE CONTENT
      ===================================================== */}

      <div className="screen-content">

        <div className="grid md:grid-cols-2 gap-10">


          {/* RECIPE IMAGE */}
         <img
         src={recipe.image || "/default-food.jpg"}
         alt={recipe.title || recipe.recipeName || "Recipe"}
         onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/default-food.jpg";
        }}
        className="rounded-xl w-full"/>


          {/* RECIPE INFORMATION */}

          <div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">

              {recipe.title ||
                recipe.recipeName}

            </h1>


            <p className="text-gray-500 mb-6">

              {recipe.description}

            </p>


            {/* RECIPE STATS */}

            <div className="flex gap-6 mb-4 flex-wrap">

              <span className="flex items-center gap-1 text-yellow-500">

                <FaStar />

                {recipe.rating > 0
                  ? recipe.rating.toFixed(1)
                  : "No rating"}

              </span>


              <span className="flex items-center gap-1">

                <LuClock3 />

                {recipe.time ||
                  `${recipe.cookTime || ""} ${
                    recipe.cookTimeUnit || ""
                  }`.trim()}

              </span>


              <span className="flex items-center gap-1">

                <FaFire />

                {recipe.calories || "N/A"} kcal

              </span>

            </div>


            {/* DIFFICULTY */}

            <div className="mt-6">

              <h3 className="text-lg font-semibold mb-2">

                Difficulty

              </h3>


              <div className="flex items-center gap-2">

                <span className="w-3 h-3 rounded-full bg-green-500"></span>

                <span className="font-medium">

                  {recipe.difficulty || "N/A"}

                </span>

              </div>

            </div>
            <div className="flex flex-wrap gap-4 mt-10">

            {/* PRINT BUTTON */}
            <button
              type="button"
              onClick={handlePrint}
              className="mt-8 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition font-medium flex items-center gap-2"
            >

              <FaPrint />

              Print Recipe

            </button>

            {/* SHARE BUTTON */}
            <button 
            type="button" 
            onClick={handleShare}
            className="w-fit! h-fit! px-6! py-3! mt-8 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition font-medium flex items-center gap-2"
            >
              <FaShareAlt />
              Share Recipe
              </button>

              </div>

            {/* START COOKING */}

            <button
              type="button"
              onClick={() => setCookingMode(true)}
              className="mt-8 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >

              Start Cooking

            </button>
            

            {/* RATING */}

            <Rating
              recipeId={recipe.id}
              onRatingChange={(newAverage, newCount) => {

                setRecipe((prev) => ({

                  ...prev,

                  rating: newAverage,

                  ratingCount: newCount,

                }));

              }}
            />


            {/* DELETE RECIPE */}

           {(
  recipe.source === "guest" ||
  (currentUser &&
    recipe.ownerId === currentUser.uid)
) && (

  <button
    type="button"
    onClick={() =>
      setShowDeleteModal(true)
    }
    className="mt-8 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
  >
    Delete Recipe
  </button>

)}

          </div>

        </div>


        {/* COOKING MODE */}

        {cookingMode ? (

          <CookingMode
            steps={
              recipe.instructions ||
              recipe.steps
            }
            onExit={() =>
              setCookingMode(false)
            }
          />

        ) : (

          <>

            {/* INGREDIENTS */}

            <Ingredients
              ingredients={recipe.ingredients}
              recipeId={recipe.id}
              servings={recipe.servings}
            />


            {/* INSTRUCTIONS */}

            <Instructions
              steps={
                recipe.instructions ||
                recipe.steps
              }
            />


            {/* NUTRITION */}

            {recipe.nutrition && (

              <Nutrition
                nutrition={recipe.nutrition}
              />

            )}

          </>

        )}

      </div>


      {/* =====================================================
          SIMILAR RECIPES
      ===================================================== */}

      {!cookingMode && (

        <div className="screen-content">

          <SimilarRecipes
            category={recipe.category}
            currentId={recipe.id}
          />


          <Comments
            recipeId={recipe.id}
          />

        </div>

      )}


      {/* =====================================================
          PRINT-ONLY RECIPE
      ===================================================== */}

      <div className="print-recipe">


        {/* PRINT HEADER */}

        <header className="print-header">

          <div className="print-brand">
            Just Recipes
          </div>


          <h1>

            {recipe.title ||
              recipe.recipeName}

          </h1>


          {recipe.description && (

            <p className="print-description">

              {recipe.description}

            </p>

          )}

        </header>


        {/* PRINT IMAGE */}

        <img
        src={recipe.image || "/default-food.jpg"}
        alt={recipe.title || recipe.recipeName || "Recipe"}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/default-food.jpg";
        }}
        className="print-image"/>


        {/* PRINT RECIPE INFORMATION */}

        <div className="print-info">


          <div>

            <strong>
              Category
            </strong>

            <span>
              {recipe.category || "N/A"}
            </span>

          </div>


          <div>

            <strong>
              Difficulty
            </strong>

            <span>
              {recipe.difficulty || "N/A"}
            </span>

          </div>


          <div>

            <strong>
              Cooking Time
            </strong>

            <span>

              {recipe.time ||
                `${recipe.cookTime || ""} ${
                  recipe.cookTimeUnit || ""
                }`.trim() ||
                "N/A"}

            </span>

          </div>


          <div>

            <strong>
              Servings
            </strong>

            <span>
              {recipe.servings || "N/A"}
            </span>

          </div>


          <div>

            <strong>
              Rating
            </strong>

            <span>

              {recipe.rating > 0
                ? Number(recipe.rating).toFixed(1)
                : "No rating"}

            </span>

          </div>


          <div>

            <strong>
              Calories
            </strong>

            <span>
              {recipe.calories || "N/A"} kcal
            </span>

          </div>

        </div>


        {/* =================================================
            INGREDIENTS
        ================================================= */}

        <section className="print-section">

          <h2>
            Ingredients
          </h2>


          <ul>

            {Array.isArray(recipe.ingredients) &&
              recipe.ingredients.map(
                (ingredient) => (

                  <li key={ingredient}>

                    {ingredient}

                  </li>

                )
              )}

          </ul>

        </section>


        {/* =================================================
            INSTRUCTIONS
        ================================================= */}

        <section className="print-section">

          <h2>
            Instructions
          </h2>


          <ol>

            {Array.isArray(
              recipe.instructions ||
              recipe.steps
            ) &&

              (
                recipe.instructions ||
                recipe.steps
              ).map(
                (step) => (

                  <li key={step}>

                    {step}

                  </li>

                )
              )}

          </ol>

        </section>


        {/* =================================================
            NUTRITION
        ================================================= */}

        {recipe.nutrition && (

          <section className="print-section">

            <h2>
              Nutrition
            </h2>


            {typeof recipe.nutrition ===
              "object" ? (

              <div className="print-nutrition">

                {Object.entries(
                  recipe.nutrition
                ).map(
                  ([key, value]) => (

                    <div key={key}>

                      <strong>
                        {key}
                      </strong>

                      <span>
                        {String(value)}
                      </span>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p>
                {recipe.nutrition}
              </p>

            )}

          </section>

        )}


        {/* PRINT FOOTER */}

        <footer className="print-footer">

          Printed from Just Recipes

        </footer>

      </div>


      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDeleteModal && (

        <dialog
        open
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-9999"
        aria-modal="true"
        aria-labelledby="delete-recipe-title">

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-96 shadow-xl">

           <h2
           id="delete-recipe-title"
           className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
              Delete Recipe?
            </h2>


            <p className="text-gray-500 dark:text-gray-300 mb-6">

              Are you sure you want to delete this recipe?

              <br />

              This action cannot be undone.

            </p>


            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >

                Cancel

              </button>


              <button
                type="button"
                onClick={async () => {

                  await handleDelete();

                  setShowDeleteModal(false);

                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >

                Delete

              </button>

            </div>

          </div>

        </dialog>

      )}

    </section>

  );

}