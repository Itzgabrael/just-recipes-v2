import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { FaStar } from "react-icons/fa";

import recipes from "../data/recipes";
import { db } from "../services/firebase";


export default function SimilarRecipes({
  category,
  currentId,
}) {

  const navigate = useNavigate();

  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadSimilarRecipes() {

      try {

        /*
        ========================================
        BUILT-IN RECIPES
        ========================================
        */

        const localMatches = recipes.filter((recipe) => {

          const sameCategory =
            recipe.category?.toLowerCase() ===
            category?.toLowerCase();

          const isNotCurrentRecipe =
            String(recipe.id) !== String(currentId);

          return (
            sameCategory &&
            isNotCurrentRecipe
          );

        });


        /*
        ========================================
        FIREBASE RECIPES
        ========================================
        */

        let firebaseMatches = [];


        try {

          const snapshot = await getDocs(
            collection(db, "recipes")
          );


          firebaseMatches = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((recipe) => {

              const sameCategory =
                recipe.category?.toLowerCase() ===
                category?.toLowerCase();

              const isNotCurrentRecipe =
                String(recipe.id) !== String(currentId);

              return (
                sameCategory &&
                isNotCurrentRecipe
              );

            });

        } catch (firebaseError) {

          console.error(
            "Error loading Firebase recipes:",
            firebaseError
          );

        }


        /*
        ========================================
        COMBINE RECIPES
        ========================================
        */

        const combinedRecipes = [
          ...localMatches,
          ...firebaseMatches,
        ];


        /*
        ========================================
        REMOVE DUPLICATES
        ========================================
        */

        const uniqueRecipes = combinedRecipes.filter(
          (recipe, index, array) =>
            index ===
            array.findIndex(
              (item) =>
                String(item.id) ===
                String(recipe.id)
            )
        );


        /*
        ========================================
        LIMIT RESULTS
        ========================================
        */

        setSimilarRecipes(
          uniqueRecipes.slice(0, 4)
        );

      } catch (error) {

        console.error(
          "Error loading similar recipes:",
          error
        );

        setSimilarRecipes([]);

      } finally {

        setLoading(false);

      }

    }


    if (category) {

      loadSimilarRecipes();

    }

  }, [category, currentId]);


  /*
  ========================================
  LOADING
  ========================================
  */

  if (!category) {

    return null;

  }

  if (loading) {

    return (

      <div className="mt-12">

        <h2 className="text-3xl font-bold mb-6">
          You Might Also Like
        </h2>

        <p className="text-gray-500">
          Finding similar recipes...
        </p>

      </div>

    );

  }


  /*
  ========================================
  NO SIMILAR RECIPES
  ========================================
  */

  if (similarRecipes.length === 0) {

    return (

      <div className="mt-12">

        <h2 className="text-3xl font-bold mb-6">
          You Might Also Like
        </h2>

        <p className="text-gray-500">
          No similar recipes found yet.
        </p>

      </div>

    );

  }


  /*
  ========================================
  RECIPE CARDS
  ========================================
  */

  return (

    <div className="mt-12">

      <h2 className="text-3xl font-bold mb-6">
        You Might Also Like
      </h2>


      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {similarRecipes.map((recipe) => {

          const title =
            recipe.title ||
            recipe.recipeName ||
            "Untitled Recipe";


          const rating =
            Number(recipe.rating) > 0
              ? Number(recipe.rating).toFixed(1)
              : null;


          const cookingTime =
            recipe.time ||
            `${recipe.cookTime || ""} ${
              recipe.cookTimeUnit || ""
            }`.trim();


          return (

            <button
            type="button"
              key={recipe.id}
              onClick={() =>
                navigate(`/recipe/${recipe.id}`)
              }
              className="
                bg-white
                rounded-xl
                overflow-hidden
                shadow-sm
                border
                border-gray-100
                cursor-pointer
                transition
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
                text-left
              "
            >

              {/* IMAGE */}

              <div className="h-48 overflow-hidden bg-gray-100">

                {recipe.image ? (

                  <img
                    src={recipe.image}
                    alt={title}
                    className="
                      w-full
                      h-full
                      object-cover
                      transition
                      duration-300
                      hover:scale-105
                    "
                  />

                ) : (

                  <div className="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    text-gray-400
                  ">
                    No image
                  </div>

                )}

              </div>


              {/* CONTENT */}

              <div className="p-4">

                <h3 className="
                  font-bold
                  text-lg
                  mb-2
                  line-clamp-2
                ">

                  {title}

                </h3>


                {/* CATEGORY */}

                {recipe.category && (

                  <p className="
                    text-sm
                    text-gray-500
                    mb-3
                  ">

                    {recipe.category}

                  </p>

                )}


                {/* BOTTOM INFO */}

                <div className="
                  flex
                  items-center
                  justify-between
                  gap-2
                  text-sm
                ">


                  {/* RATING */}

                  {rating ? (

                    <span className="
                      flex
                      items-center
                      gap-1
                      text-yellow-500
                    ">

                      <FaStar />

                      <span className="text-gray-700">
                        {rating}
                      </span>

                    </span>

                  ) : (

                    <span className="text-gray-400">
                      No rating
                    </span>

                  )}


                  {/* COOKING TIME */}

                  {cookingTime && (

                    <span className="
                      text-gray-500
                      truncate
                    ">

                      {cookingTime}

                    </span>

                  )}

                </div>

              </div>

            </button>

          );

        })}

      </div>

    </div>

  );

}