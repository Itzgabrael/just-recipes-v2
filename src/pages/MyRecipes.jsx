import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {FaUtensils} from "react-icons/fa";
import { getMyRecipes } from "../services/recipeService";
import useOnlineStatus from "../hooks/useOnlineStatus";
import OfflineFallback from "../components/OfflineFallback";
import { useAuth } from "../context/AuthContext";
import MyRecipeCard from "../components/MyRecipeCard";
import { categories } from "../data/categories";

function MyRecipes() {
  const { currentUser } = useAuth();
  const isOnline = useOnlineStatus();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipesError, setRecipesError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("newest");

  /*
  =========================================================
  LOAD RECIPES
  =========================================================
  */

  useEffect(() => {
  async function loadRecipes() {
    setLoading(true);
    setRecipesError(false);

    /*
    =====================================================
    GUEST USER
    =====================================================
    */

    if (!currentUser) {
      try {
        const storedRecipes =
          JSON.parse(
            localStorage.getItem("guestRecipes")
          ) || [];

        const guestRecipes = storedRecipes.map((recipe) => ({
          ...recipe,
          source: "guest",
        }));

        setRecipes(guestRecipes);
      } catch (error) {
        console.error(
          "Error loading guest recipes:",
          error
        );

        setRecipes([]);
      } finally {
        setLoading(false);
      }

      return;
    }

    /*
    =====================================================
    LOGGED-IN USER
    =====================================================
    */

    try {
      const myRecipes = await getMyRecipes(currentUser);

      setRecipes(
        myRecipes.map((recipe) => ({
          ...recipe,
          source: "firestore",
        }))
      );
    } catch (error) {
      console.error(
        "Error loading recipes:",
        error
      );

      setRecipes([]);
      setRecipesError(true);
    } finally {
      setLoading(false);
    }
  }

  void loadRecipes();
}, [currentUser]);


  /*
  =========================================================
  DELETE HANDLER
  =========================================================
  */

  function handleDelete(recipeId) {

    setRecipes((prev) =>
      prev.filter(
        (recipe) =>
          recipe.id !== recipeId
      )
    );

  }
  const filteredRecipes = recipes
  .filter((recipe) => {
    const title =
      recipe.recipeName ||
      recipe.title ||
      "";

    return title
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      );
  })
  .filter((recipe) => {
    if (selectedCategory === "All") {
      return true;
    }

    return (
      recipe.category?.toLowerCase() ===
      selectedCategory.toLowerCase()
    );
  })
  .sort((a, b) => {
    if (sortOption === "oldest") {
      return (
        new Date(a.createdAt || 0) -
        new Date(b.createdAt || 0)
      );
    }

    if (sortOption === "name") {
      const nameA =
        a.recipeName ||
        a.title ||
        "";

      const nameB =
        b.recipeName ||
        b.title ||
        "";

      return nameA.localeCompare(nameB);
    }

    return (
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
    );
  });


  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-green-200 dark:border-green-900 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin" />

        <h2 className="mt-5 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Loading your{" "}
          <span className="text-green-600 dark:text-green-400">
            recipes
          </span>
          {" "}...
        </h2>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Getting everything ready for you.
        </p>
      </div>
    </section>
  );
}

  /*
  =========================================================
  EMPTY STATE
  =========================================================
  */

  if (recipesError) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <OfflineFallback
        title={
          isOnline
            ? "Your recipes couldn't be loaded"
            : "Your recipes aren't available offline"
        }
        message={
          isOnline
            ? "We couldn't load your recipe collection right now. Please try again later."
            : "Your recipes haven't been cached on this device yet. Connect to the internet to load them."
        }
      />
    </section>
  );
}

if (recipes.length === 0) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-xl mx-auto">

        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <span className="text-4xl">
            <FaUtensils className="inline text-green-600 text-lg"/>
          </span>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          My Recipes
        </h1>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {currentUser
            ? "Your recipe collection is empty."
            : "You haven't saved any recipes on this device yet."
          }
        </h2>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-7">
          {currentUser
            ? "Start building your personal recipe collection by adding your first recipe."
            : "Recipes you create while browsing as a guest will appear here on this device."
          }
        </p>

        <Link
          to="/add-recipe"
          className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
        >
          Add Your First Recipe
        </Link>

      </div>
    </section>
  );
}


  /*
  =========================================================
  PAGE
  =========================================================
  */

  return (

    <section className="max-w-6xl mx-auto px-6 py-12 text-gray-900 dark:text-gray-100">


      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

  <div>
    <div className="flex items-center gap-3 flex-wrap">

      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
        My Recipes
      </h1>

      <span className="inline-flex items-center justify-center min-w-8 h-8 px-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold">
        {recipes.length}
      </span>

    </div>

    <p className="text-gray-600 dark:text-gray-400 mt-2">
      {currentUser
        ? "Your personal collection of recipes."
        : "Recipes saved locally on this device."
      }
    </p>

    {!currentUser && (
      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
        You're currently using My Recipes as a guest.
      </p>
    )}
  </div>

  <Link
    to="/add-recipe"
    className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 text-white font-semibold px-5 py-3 rounded-xl transition-colors duration-200"
  >
    + Add Recipe
  </Link>
  </div>

  <div className="grid md:grid-cols-3 gap-4 mb-8">

  <input
    type="search"
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
    placeholder="Search your recipes..."
    className="
      w-full
      rounded-xl
      border
      border-gray-300
      dark:border-gray-600
      bg-white
      dark:bg-gray-800
      text-gray-900
      dark:text-gray-100
      px-4
      py-3
      outline-none
      focus:ring-2
      focus:ring-green-500
    "
  />

  <select
    value={selectedCategory}
    onChange={(e) =>
      setSelectedCategory(e.target.value)
    }
    className="
      w-full
      rounded-xl
      border
      border-gray-300
      dark:border-gray-600
      bg-white
      dark:bg-gray-800
      text-gray-900
      dark:text-gray-100
      px-4
      py-3
      outline-none
      focus:ring-2
      focus:ring-green-500
    "
  >
    <option value="All">
      All Categories
    </option>

    {categories.map((category) => (
      <option
        key={category.id}
        value={category.name}
      >
        {category.name}
      </option>
    ))}
  </select>

  <select
    value={sortOption}
    onChange={(e) =>
      setSortOption(e.target.value)
    }
    className="
      w-full
      rounded-xl
      border
      border-gray-300
      dark:border-gray-600
      bg-white
      dark:bg-gray-800
      text-gray-900
      dark:text-gray-100
      px-4
      py-3
      outline-none
      focus:ring-2
      focus:ring-green-500
    "
  >
    <option value="newest">
      Newest First
    </option>

    <option value="oldest">
      Oldest First
    </option>

    <option value="name">
      Name A–Z
    </option>
  </select>

</div>

{filteredRecipes.length === 0 && (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
      No matching recipes
    </h2>

    <p className="mt-2 text-gray-500 dark:text-gray-400">
      Try a different search or category.
    </p>

    <button
      type="button"
      onClick={() => {
        setSearchTerm("");
        setSelectedCategory("All");
      }}
      className="
        mt-5
        bg-green-600
        hover:bg-green-700
        text-white
        px-5
        py-3
        rounded-xl
        font-semibold
        transition
      "
    >
      Clear Filters
    </button>
  </div>
)}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">


        {filteredRecipes.map((recipe) => (

          <MyRecipeCard

            key={recipe.id}

            recipe={recipe}

            onDelete={handleDelete}

          />

        ))}


      </div>


    </section>

  );

}


export default MyRecipes;