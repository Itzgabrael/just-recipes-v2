import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaEllipsisV,
  FaStar,
  FaEdit,
  FaTrash,
  FaPrint
} from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";
import { deleteRecipe } from "../services/recipeService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";


function MyRecipeCard({ recipe, onDelete }) {
const [showMenu, setShowMenu] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const navigate = useNavigate();
const { currentUser } = useAuth();
  /*
  =========================================================
  PRINT RECIPE
  =========================================================
  */

  const handlePrintRecipe = () => {

    setShowMenu(false);

   void navigate(
      `/recipe/${recipe.id}?print=true`
    );

  };


  /*
  =========================================================
  DELETE GUEST RECIPE
  =========================================================
  */

  const deleteGuestRecipe = () => {

    try {

      const guestRecipes =
        JSON.parse(
          localStorage.getItem(
            "guestRecipes"
          )
        ) || [];


      const updatedRecipes =
        guestRecipes.filter(
          (item) =>
            item.id !== recipe.id
        );


      localStorage.setItem(

        "guestRecipes",

        JSON.stringify(
          updatedRecipes
        )

      );


      setShowDeleteModal(false);


      onDelete(recipe.id);


      toast.success(
        "Recipe deleted successfully!"
      );


    } catch (error) {

      console.error(
        "Error deleting guest recipe:",
        error
      );


      toast.error(
        "Failed to delete recipe."
      );

    }

  };

  /*
  =========================================================
  DELETE
  =========================================================
  */

 const handleDelete = async () => {
  if (
    recipe.source === "guest" ||
    recipe.id?.startsWith("guest-")
  ) {
    deleteGuestRecipe();
    return;
  }

  if (!currentUser) {
    toast.error(
      "You must be signed in to delete this recipe."
    );
    return;
  }

  try {
    await deleteRecipe(
      recipe.id,
      currentUser
    );

    setShowDeleteModal(false);

    onDelete(recipe.id);

    toast.success(
      "Recipe deleted successfully!"
    );

  } catch (error) {
    console.error(
      "Error deleting recipe:",
      error
    );

    toast.error(
      error.message ||
      "Failed to delete recipe."
    );
  }
};


  /*
  =========================================================
  CARD
  =========================================================
  */

  return (
    <div
      className="
        bg-white
        dark:bg-gray-800
        text-gray-900
        dark:text-gray-100
        rounded-xl
        shadow
        hover:shadow-lg
        dark:hover:shadow-black/30
        transition
        relative
        overflow-visible
      "
    >
    <Link
  to={`/recipe/${recipe.id}`}
  aria-label={`View recipe: ${recipe.title || recipe.recipeName || "Recipe"}`}
  className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">

            <img
        src={recipe.image || "/default-food.jpg"}
        alt={recipe.title || recipe.recipeName || "Recipe"}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/default-food.jpg";
        }}
        className="w-full h-52 object-cover"
      />

      <div className="p-5">
        <h2 className="text-xl font-bold">

          {
            recipe.title ||
            recipe.recipeName
          }

        </h2>


        <p className="flex items-center gap-2 text-yellow-500 mt-2">

          <FaStar />

          {recipe.rating ?? 0}

        </p>


        <p className="flex items-center gap-2 text-gray-500 mt-2">

          <LuClock3 />

          {
            recipe.time ||
            `${recipe.cookTime} ${recipe.cookTimeUnit}`
          }

        </p>


        {recipe.source === "guest" ? (
  <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
    Saved on this device
  </p>
) : (
  <p className="text-xs text-green-600 dark:text-green-400 mt-3">
    Saved to your account
  </p>
)}
</div>
</Link>


        <div className="flex justify-between items-center gap-3 p-5 pt-0 mt-1">


          <Link

            to={`/recipe/${recipe.id}`}

            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"

          >

            View Recipe

          </Link>


          <div className="relative">


            <button

              type="button"

              onClick={() =>
                setShowMenu(
                  !showMenu
                )
              }

              className="p-2 rounded-full hover:bg-gray-100 transition"

            >

              <FaEllipsisV />

            </button>


            {showMenu && (

              <div className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-9999">


                {/* EDIT */}

                <button

                  type="button"

                  onClick={() => {

                    setShowMenu(false);

                   void navigate(
                      `/edit-recipe/${recipe.id}`
                    );

                  }}

                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 transition"

                >

                  <FaEdit className="text-green-600" />

                  Edit Recipe

                </button>


                {/* PRINT */}

                <button

                  type="button"

                  onClick={
                    handlePrintRecipe
                  }

                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 transition"

                >

                  <FaPrint className="text-gray-600" />

                  Print Recipe

                </button>


                {/* DELETE */}

                <button
                  type="button"
                  onClick={() => {setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-600 transition"
                >

                  <FaTrash />

                  Delete Recipe

                </button>


              </div>

            )}


          </div>


        </div>

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {showDeleteModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-9999 px-4">


          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">


            <h2 className="text-xl font-bold mb-3">

              Delete Recipe?

            </h2>


            <p className="text-gray-500 mb-6">

              Are you sure you want to delete this recipe?

              <br />

              This action cannot be undone.

            </p>


            <div className="flex justify-end gap-3">


              <button

                type="button"

                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }

                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"

              >

                Cancel

              </button>


              <button

                type="button"

                onClick={
                  handleDelete
                }

                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"

              >

                Delete

              </button>


            </div>


          </div>

        </div>

      )}


    </div>

  );

}


export default MyRecipeCard;