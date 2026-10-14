import Hero from "../components/Hero";
import RecipeOfTheDay from "../components/RecipeOfTheDay";
import Category from "../components/Category";
import RecipeCard from "../components/RecipeCard";
import recipes from "../data/recipes";
import { searchTheMealDBRecipes } from "../services/externalRecipeService";
import { getRecipes } from "../services/recipeService";
import { getRatingSummaries } from "../services/ratingService";
import useOnlineStatus from "../hooks/useOnlineStatus";
import OfflineFallback from "../components/OfflineFallback";
import RecentlyViewed from "../components/RecentlyViewed";
import { getDailyRecipe } from "../utils/helpers";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

function Home() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const [firestoreRecipes, setFirestoreRecipes] = useState([]);
  const [guestRecipes, setGuestRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ ratingSummaries, setRatingSummaries ] = useState({});
  const [firestoreRecipesError, setFirestoreRecipesError] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory
  ] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [
  externalRecipes,
  setExternalRecipes,
] = useState([]);

const [
  recipeOfTheDayExternalRecipes,
  setRecipeOfTheDayExternalRecipes,
] = useState([]);



const [
  loadingExternalRecipes,
  setLoadingExternalRecipes,
] = useState(false);

const [
  loadingRecipeOfTheDayExternal,
  setLoadingRecipeOfTheDayExternal,
] = useState(false);

const [
  recipeOfTheDayExternalError,
  setRecipeOfTheDayExternalError,
] = useState("");

const [
  externalRecipesError,
  setExternalRecipesError,
] = useState("");


  /*
  =========================================================
  LOAD FIRESTORE RECIPES
  =========================================================
  */

  useEffect(() => {
  async function fetchRecipes() {
    try {
      setFirestoreRecipesError(false);

      const recipesData = await getRecipes();

      setFirestoreRecipes(
        recipesData.map((recipe) => ({
          ...recipe,
          source: "firestore",
        }))
      );
    } catch (error) {
      console.error("Error loading recipes:", error);

      setFirestoreRecipes([]);
      setFirestoreRecipesError(true);
    } finally {
      setLoading(false);
    }
  }

  void fetchRecipes();
}, []);


  /*
  =========================================================
  LOAD GUEST RECIPES FROM LOCAL STORAGE
  =========================================================
  */

useEffect(() => {

  function loadGuestRecipes() {

    try {

      const storedRecipes =
        JSON.parse(
          localStorage.getItem("guestRecipes")
        ) || [];

      setGuestRecipes(
        Array.isArray(storedRecipes)
          ? storedRecipes
          : []
      );

    } catch (error) {

      console.error(
        "Error loading guest recipes:",
        error
      );

      setGuestRecipes([]);

    }

  }


  /*
  ====================================================
  LOAD GUEST RECIPES
  ====================================================
  */

  loadGuestRecipes();


  /*
  ====================================================
  LISTEN FOR GUEST RECIPE STORAGE UPDATES
  ====================================================
  */

  window.addEventListener(
    "guestRecipesUpdated",
    loadGuestRecipes
  );


  /*
  ====================================================
  CLEAN UP LISTENER
  ====================================================
  */

  return () => {

    window.removeEventListener(
      "guestRecipesUpdated",
      loadGuestRecipes
    );

  };

}, []);


  /*
  =========================================================
  CATEGORY SCROLL
  =========================================================
  */

  useEffect(() => {

    if (!selectedCategory) return;

    const section =
      document.getElementById(
        "category-recipes"
      );

    if (section) {

      section.scrollIntoView({

        behavior: "smooth",

        block: "start",

      });

    }

  }, [selectedCategory]);


  /*
  =========================================================
  SEARCH SCROLL
  =========================================================
  */

  useEffect(() => {

    if (!searchTerm.trim()) return;


    const scrollToResults = () => {

      const section =
        document.getElementById(
          "category-recipes"
        );

      if (!section) return;


      const navbarOffset = 90;


      const sectionPosition =
        section.getBoundingClientRect().top +
        window.scrollY -
        navbarOffset;


      window.scrollTo({

        top: sectionPosition,

        behavior: "smooth",

      });

    };


    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        scrollToResults();

      });

    });

  }, [searchTerm]);

  /*
=========================================================
SCROLL HOME TO TOP WHEN REQUESTED BY FOOTER BRAND
=========================================================
*/

useEffect(() => {
  if (!location.state?.scrollHomeToTop) return;

  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.history.replaceState(
    window.history.state,
    "",
    window.location.href
  );
}, [location.state]);

  /*
=========================================================
SEARCH THEMEALDB
=========================================================
*/

useEffect(() => {

  const searchExternalRecipes = async () => {

    const search = searchTerm.trim();

    if (!search) {

      setExternalRecipes([]);
      setExternalRecipesError("");

      return;

    }

    try {

      setLoadingExternalRecipes(true);
      setExternalRecipesError("");

      const results =
        await searchTheMealDBRecipes(
          search
        );

      setExternalRecipes(results);

    } catch (error) {

      console.error(
        "Error searching TheMealDB:",
        error
      );

      setExternalRecipes([]);

      setExternalRecipesError(
        "We couldn't search external recipes right now."
      );

    } finally {

      setLoadingExternalRecipes(false);

    }

  };

 void searchExternalRecipes();

}, [searchTerm]);

useEffect(() => {
  let cancelled = false;

  async function loadRecipeOfTheDayExternalRecipes() {
    try {
      setLoadingRecipeOfTheDayExternal(true);
      setRecipeOfTheDayExternalError("");

      const searchTerms = [
  "chicken",
  "pasta",
  "rice",
  "beef",
  "vegetable",
];

const today = new Date();

const dateNumber =
  today.getFullYear() +
  today.getMonth() +
  today.getDate();

const searchTerm =
  searchTerms[Math.abs(dateNumber) % searchTerms.length];

      const results =
        await searchTheMealDBRecipes(
          searchTerm
        );

      if (!cancelled) {
        setRecipeOfTheDayExternalRecipes(
          results
        );
      }
    } catch (error) {
      console.error(
        "Error loading Recipe of the Day external recipes:",
        error
      );

      if (!cancelled) {
        setRecipeOfTheDayExternalRecipes([]);
        setRecipeOfTheDayExternalError(
          "External recipes are currently unavailable."
        );
      }
    } finally {
      if (!cancelled) {
        setLoadingRecipeOfTheDayExternal(false);
      }
    }
  }

  void loadRecipeOfTheDayExternalRecipes();

  return () => {
    cancelled = true;
  };
}, []);


  /*
  =========================================================
  COMBINE ALL RECIPE SOURCES
  =========================================================
  */

  const allRecipes = useMemo(
    () => [...guestRecipes, ...firestoreRecipes, ...recipes],
    [guestRecipes, firestoreRecipes]
  );

    /*
  =========================================================
  LOAD RATING SUMMARIES
  =========================================================
  */

  
useEffect(() => {
  let cancelled = false;

  async function loadRatingSummaries() {
    try {
      const recipeIds = allRecipes.map(
        (recipe) => recipe.id
      );

      const summaries =
        await getRatingSummaries(recipeIds);

      if (!cancelled) {
        setRatingSummaries(summaries);
      }
    } catch (error) {
      console.error(
        "Error loading rating summaries:",
        error
      );

      if (!cancelled) {
        setRatingSummaries({});
      }
    }
  }

  void loadRatingSummaries();

  return () => {
    cancelled = true;
  };
}, [allRecipes]);



  const myHomeRecipes = currentUser
  ? firestoreRecipes.filter(
      (recipe) =>
        recipe.ownerId === currentUser.uid
    )
  : [];
  const recipeOfTheDayPool = [
  ...recipes,
  ...firestoreRecipes,
  ...recipeOfTheDayExternalRecipes,
];

const uniqueRecipeOfTheDayPool = Array.from(
  new Map(
    recipeOfTheDayPool.map((recipe) => {
      const normalizedTitle = (
        recipe.title ||
        recipe.recipeName ||
        ""
      )
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

      const source = recipe.source || "built-in";

      return [`${source}-${normalizedTitle}`, recipe];
    })
  ).values()
);

const recipeOfTheDay = getDailyRecipe(uniqueRecipeOfTheDayPool);
  const searchableRecipes = [
    ...allRecipes,

    ...externalRecipes,
  ];


  /*
  =========================================================
  FILTER RECIPES
  =========================================================
  */

  const filteredRecipes =
    searchableRecipes.filter((recipe) => {


      const matchesCategory =
        selectedCategory

          ? recipe.category?.toLowerCase() ===
            selectedCategory.toLowerCase()

          : true;


      const search =
        searchTerm
          .trim()
          .toLowerCase();


      const matchesSearch =
        search

          ? (

              recipe.title
                ?.toLowerCase()
                .includes(search)

              ||

              recipe.recipeName
                ?.toLowerCase()
                .includes(search)

              ||

              recipe.description
                ?.toLowerCase()
                .includes(search)

              ||

              recipe.category
                ?.toLowerCase()
                .includes(search)

              ||

              recipe.ingredients?.some((ingredient) =>

                ingredient
                  .toLowerCase()
                  .includes(search)

            )
          )
          : true;


      return (
        matchesCategory &&
        matchesSearch
      );

    });


  /*
  =========================================================
  SECTION TITLE
  =========================================================
  */

  let sectionTitle =
    "Popular Recipes";


  if (selectedCategory) {

    sectionTitle =
      `${selectedCategory} Recipes`;

  }


  if (searchTerm.trim()) {

    sectionTitle =
      `Search Results for "${searchTerm}"`;

  }


  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {

    return (

      <div className="text-center py-20 text-xl">

        Loading{" "}

        <span className="text-green-600 font-bold">

          recipes

        </span>
        {"..."}
        ...

      </div>

    );

  }


  /*
  =========================================================
  SEARCH HANDLER
  =========================================================
  */

  function handleSearch(term) {

    setSearchTerm(term);

    /*
    Searching should remove
    any previously selected category.
    */

    setSelectedCategory("");

  }


  /*
  =========================================================
  PAGE
  =========================================================
  */
 function handleCategorySelect(category) {

  setSelectedCategory(category);

  setSearchTerm("");

  setExternalRecipes([]);

  setExternalRecipesError("");

}

  let myRecipesContent;

  if (firestoreRecipesError) {
    myRecipesContent = (
      <OfflineFallback
        title={
          isOnline
            ? "Your recipes couldn't be loaded"
            : "Your recipes aren't available offline"
        }
        message={
          isOnline
            ? "We couldn't load your account recipes right now. Please try again later."
            : "Your account recipes haven't been cached on this device yet. Connect to the internet to load them."
        }
      />
    );
  } else if (myHomeRecipes.length === 0) {
    myRecipesContent = (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600 font-medium">
          You haven't created any recipes yet.
        </p>

        <p className="text-gray-400 text-sm mt-2">
          Create your first recipe and it will appear here.
        </p>

        <a
          href="/add-recipe"
          className="inline-block mt-5 bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Create a Recipe
        </a>
      </div>
    );
  } else {
    myRecipesContent = (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myHomeRecipes.slice(0, 3).map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            ratingSummary={ratingSummaries[recipe.id]}
          />
        ))}
      </div>
    );
  }

  return (

    <>

      <Hero
        onSearch={handleSearch}
      />


      {loadingRecipeOfTheDayExternal ? (
  <section className="max-w-6xl mx-auto px-6 py-10">
    <div className="recipe-of-the-day-loading rounded-3xl border border-gray-200 bg-white shadow-lg p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />

        <p className="text-gray-700 font-semibold">
          Preparing today's recipe...
        </p>

        <p className="text-sm text-gray-400 mt-1">
          Finding something delicious for you.
        </p>
      </div>
    </div>
  </section>
) : (
  <RecipeOfTheDay recipe={recipeOfTheDay} />
)}

{recipeOfTheDayExternalError && !loadingRecipeOfTheDayExternal && (
  <div className="max-w-6xl mx-auto px-6 -mt-4 mb-6">
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3">
      <p className="text-sm text-yellow-700">
        Today's external recipe couldn't be loaded, so we're showing recipes
        from Just Recipes instead.
      </p>
    </div>
  </div>
)}

{currentUser && (
  <section className="max-w-6xl mx-auto px-6 py-10">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-3xl font-bold">
          Your Recipes
        </h2>

        <p className="text-gray-500 mt-1">
          Recipes you've created and saved to your account.
        </p>
      </div>

      {myHomeRecipes.length > 0 && (
        <button
          type="button"
          onClick={() => {
            window.location.href = "/my-recipes";
          }}
          className="text-green-600 font-semibold hover:text-green-800 transition"
        >
          View All
        </button>
      )}
    </div>

    {myRecipesContent}
  </section>
)}


      <Category

        onCategorySelect={
          handleCategorySelect
        }

        recipes={allRecipes}

        selectedCategory={
          selectedCategory
        }

      />


      <section
        id="category-recipes"
        className="max-w-6xl mx-auto px-6 py-12"
      >


        <h2 className="text-3xl font-bold mb-8">

          {sectionTitle}

        </h2>

        {loadingExternalRecipes && (
  <p className="text-sm text-green-600 mb-5">
    Searching more recipes from TheMealDB...
  </p>
)}

{externalRecipesError && (
  <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl p-4">
    <p className="text-sm">
      {externalRecipesError}
    </p>

    <p className="text-xs mt-1">
      Your built-in and community recipes are still available.
    </p>
  </div>
)}

        {selectedCategory && (

          <button
            type="button"
            onClick={() =>
              setSelectedCategory("")
            }
            className="mb-6 text-green-600 hover:text-green-800 font-medium"
          >

            ← Show All Recipes

          </button>

        )}


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">


          {filteredRecipes.length === 0 && (
            <div className="col-span-full text-center py-10">
              
              <p className="text-gray-600 text-lg font-semibold">No recipes found for "{searchTerm}".
              </p>
              
              {searchTerm.trim() && !loadingExternalRecipes && !externalRecipesError && (
                <p className="text-gray-400 text-sm mt-2">
                  We couldn't find a matching recipe in your recipes
                  or from TheMealDB.
                  </p>
                )}
                
                </div>
              )}


          {filteredRecipes.map((recipe) => (

            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              ratingSummary={ratingSummaries[recipe.id]}
            />

          ))}


        </div>

      </section>
      <RecentlyViewed />
    </>

  );

}


export default Home;