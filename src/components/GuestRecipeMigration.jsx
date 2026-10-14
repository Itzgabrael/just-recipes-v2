import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { migrateGuestRecipes } from "../services/recipeService";
import { LuEggFried } from "react-icons/lu";
import toast from "react-hot-toast";

function GuestRecipeMigration() {

  const { currentUser } = useAuth();

  const [guestRecipes, setGuestRecipes] = useState([]);

  const [dismissed, setDismissed] = useState(false);

  const [migrating, setMigrating] = useState(false);


  /*
  ====================================================
  CHECK FOR GUEST RECIPES
  ====================================================
  */

  useEffect(() => {

    if (!currentUser) {
      return;
    }

    let loadRecipesTimer;

    try {

      const storedRecipes =
        JSON.parse(
          localStorage.getItem("guestRecipes")
        ) || [];


      if (
        Array.isArray(storedRecipes)
      ) {

        loadRecipesTimer = setTimeout(() => {
          setGuestRecipes(storedRecipes);
        }, 0);

      }

    } catch (error) {

      console.error(
        "Error reading guest recipes:",
        error
      );

    }

    return () => {
      if (loadRecipesTimer) {
        clearTimeout(loadRecipesTimer);
      }
    };

  }, [currentUser]);


  /*
  ====================================================
  MOVE RECIPES TO ACCOUNT
  ====================================================
  */

  const handleMigrate = async () => {

    if (!currentUser) {
      return;
    }

    setMigrating(true);

    try {

      const result =
        await migrateGuestRecipes(
          currentUser
        );


      /*
      ================================================
      EVERYTHING SUCCESSFULLY MIGRATED
      ================================================
      */

      if (
        result.migratedCount > 0 &&
        result.failedCount === 0
      ) {

        toast.success(
          `${result.migratedCount} ${
            result.migratedCount === 1
              ? "recipe"
              : "recipes"
          } moved to your account!`
        );
        
        setGuestRecipes([]);
        window.dispatchEvent(
          new Event("guestRecipesUpdated"));
          
          setDismissed(true);

      }


      /*
      ================================================
      SOME SUCCESSFUL, SOME FAILED
      ================================================
      */

      else if (
        result.migratedCount > 0 &&
        result.failedCount > 0
      ) {

        toast.error(
          `${result.migratedCount} migrated, but ${
            result.failedCount
          } failed.`
        );


        /*
        Reload remaining recipes from localStorage.
        */

        try {

          const remaining =
            JSON.parse(
              localStorage.getItem(
                "guestRecipes"
              )
            ) || [];

          setGuestRecipes(
            Array.isArray(remaining)
              ? remaining
              : []
          );
          setGuestRecipes(
            Array.isArray(remaining)
            ? remaining
            : []
          );
          
          window.dispatchEvent(
            new Event("guestRecipesUpdated")
          );

        } catch (error) {

          console.error(
            "Error loading remaining recipes:",
            error
          );

        }

      }


      /*
      ================================================
      NOTHING MIGRATED
      ================================================
      */

      else {

        toast.error(
          "No recipes could be migrated."
        );

      }


    } catch (error) {

      console.error(
        "Recipe migration error:",
        error
      );

      toast.error(
        "Failed to move your recipes."
      );

    } finally {

      setMigrating(false);

    }

  };


  /*
  ====================================================
  KEEP RECIPES ON DEVICE
  ====================================================
  */

  const handleKeepOnDevice = () => {

  window.dispatchEvent(
    new Event("guestRecipesUpdated")
  );

  setDismissed(true);

  toast.success(
    "Your recipes will stay saved on this device."
  );

};


  /*
  ====================================================
  DON'T DISPLAY ANYTHING
  ====================================================
  */

  if (
    !currentUser ||
    guestRecipes.length === 0 ||
    dismissed
  ) {

    return null;

  }


  /*
  ====================================================
  MIGRATION MODAL
  ====================================================
  */

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-[10000]">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-7">

        {/* ICON */}

        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">

          <LuEggFried/>

        </div>


        {/* TITLE */}

        <h2 className="text-2xl font-bold text-center mb-3">

          You have saved recipes!

        </h2>


        {/* DESCRIPTION */}

        <p className="text-gray-600 text-center leading-relaxed mb-6">

          We found{" "}

          <span className="font-bold text-green-600">

            {guestRecipes.length}

          </span>{" "}

          {guestRecipes.length === 1
            ? "recipe"
            : "recipes"}{" "}

          saved on this device.

          <br />

          Would you like to move{" "}

          {guestRecipes.length === 1
            ? "it"
            : "them"}{" "}

          to your account?

        </p>


        {/* RECIPE PREVIEW */}

        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-40 overflow-y-auto">

          {guestRecipes.map(
            (recipe, index) => (

              <div
                key={
                  recipe.id ||
                  `${recipe.recipeName}-${index}`
                }
                className="flex items-center gap-3 py-2 border-b last:border-b-0 border-gray-200"
              >

                <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">

                  {index + 1}

                </span>


                <span className="font-medium text-gray-700 truncate">

                  {recipe.recipeName ||
                    recipe.title ||
                    "Untitled Recipe"}

                </span>

              </div>

            )
          )}

        </div>


        {/* BUTTONS */}

        <div className="flex flex-col gap-3">

          {/* MOVE */}

          <button
            type="button"
            onClick={handleMigrate}
            disabled={migrating}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >

            {migrating
              ? "Moving Recipes..."
              : "Move Recipes to My Account"}

          </button>


          {/* KEEP */}

          <button
            type="button"
            onClick={handleKeepOnDevice}
            disabled={migrating}
            className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-60"
          >

            Keep Them on This Device

          </button>

        </div>


        {/* NOTE */}

        <p className="text-xs text-gray-400 text-center mt-5">

          Your recipes will only be moved when you choose
          the option above.

        </p>

      </div>

    </div>

  );

}

export default GuestRecipeMigration;