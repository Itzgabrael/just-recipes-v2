import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function readQuantity(text) {
  const numberMatch = text.match(/^(\d+(?:[./]\d+)?)/);

  if (!numberMatch) {
    return null;
  }

  let value = numberMatch[1];
  let consumed = numberMatch[0].length;
  const fractionMatch = text
    .slice(consumed)
    .match(/^\s+(\d+\/\d+)/);

  if (fractionMatch) {
    value += ` ${fractionMatch[1]}`;
    consumed += fractionMatch[0].length;
  }

  return {
    value,
    remaining: text.slice(consumed),
  };
}

export default function Ingredients({
  ingredients,
  recipeId,
  servings,
}) {
  const { currentUser } = useAuth();

  /* BASE SERVINGS */
  const baseServings = Number(servings) || 1;

  /*
   * The user can change this value
   * without changing the actual recipe
   * stored in Firebase.
   */
  const [servingOffset, setServingOffset] =
    useState(0);
  const currentServings = baseServings + servingOffset;

  /* CHECKLIST STORAGE KEYS */

  const guestStorageKey =
    `justRecipes_ingredients_guest_${recipeId}`;

  const userStorageKey = currentUser
    ? `justRecipes_ingredients_${currentUser.uid}_${recipeId}`
    : null;

  const [checklistLoaded, setChecklistLoaded] =
    useState(false);

  const [checkedIngredients, setCheckedIngredients] =
    useState([]);

  /* LOAD CHECKLIST */

  useEffect(() => {
    let cancelled = false;

    async function loadChecklist() {
      setChecklistLoaded(false);

      try {
        /* GUEST USER */

        if (!currentUser) {
          const savedGuestChecklist =
            localStorage.getItem(guestStorageKey);

          const guestChecklist = savedGuestChecklist
            ? JSON.parse(savedGuestChecklist)
            : [];

          if (!cancelled) {
            setCheckedIngredients(guestChecklist);
          }

          return;
        }

        /* SIGNED-IN USER */

        const savedGuestChecklist =
          localStorage.getItem(guestStorageKey);

        const guestChecklist = savedGuestChecklist
          ? JSON.parse(savedGuestChecklist)
          : [];

        const savedUserChecklist =
          localStorage.getItem(userStorageKey);

        const userLocalChecklist = savedUserChecklist
          ? JSON.parse(savedUserChecklist)
          : [];

        const checklistRef = doc(
          db,
          "users",
          currentUser.uid,
          "recipeChecklists",
          String(recipeId)
        );

        const snapshot = await getDoc(checklistRef);

        const firebaseChecklist = snapshot.exists()
          ? snapshot.data().checkedIngredients || []
          : [];

        /*
         * Merge all checklist sources.
         */
        const mergedChecklist = [
          ...new Set([
            ...firebaseChecklist,
            ...userLocalChecklist,
            ...guestChecklist,
          ]),
        ];

        if (!cancelled) {
          setCheckedIngredients(mergedChecklist);

          localStorage.setItem(
            userStorageKey,
            JSON.stringify(mergedChecklist)
          );
        }

        /*
         * Migrate guest checklist to Firebase.
         */
        if (guestChecklist.length > 0) {
          await setDoc(checklistRef, {
            checkedIngredients: mergedChecklist,
          });

          localStorage.removeItem(guestStorageKey);
        }
      } catch (error) {
        console.error(
          "Error loading ingredient checklist:",
          error
        );
      } finally {
        if (!cancelled) {
          setChecklistLoaded(true);
        }
      }
    }

    loadChecklist();

    return () => {
      cancelled = true;
    };
  }, [
    currentUser,
    recipeId,
    guestStorageKey,
    userStorageKey,
  ]);

  /* SAVE CHECKLIST LOCALLY */

  useEffect(() => {
    if (!checklistLoaded) return;

    const storageKey = currentUser
      ? userStorageKey
      : guestStorageKey;

    localStorage.setItem(
      storageKey,
      JSON.stringify(checkedIngredients)
    );
  }, [
    checkedIngredients,
    currentUser,
    userStorageKey,
    guestStorageKey,
    checklistLoaded,
  ]);

  /* SAVE CHECKLIST FIREBASE */

  useEffect(() => {
    if (!currentUser || !checklistLoaded) return;

    async function saveFirebaseChecklist() {
      try {
        const checklistRef = doc(
          db,
          "users",
          currentUser.uid,
          "recipeChecklists",
          String(recipeId)
        );

        await setDoc(checklistRef, {
          checkedIngredients,
        });
      } catch (error) {
        console.error(
          "Error saving ingredient checklist:",
          error
        );
      }
    }

    saveFirebaseChecklist();
  }, [
    checkedIngredients,
    currentUser,
    recipeId,
    checklistLoaded,
  ]);

  /* FRACTION HELPERS */

  function fractionToDecimal(value) {
    if (!value.includes("/")) {
      return Number(value);
    }

    const [numerator, denominator] =
      value.split("/").map(Number);

    if (!denominator) {
      return null;
    }

    return numerator / denominator;
  }

  /*
   * Convert decimal numbers back into
   * readable cooking fractions.
   */
  function formatQuantity(value) {
    const rounded =
      Math.round(value * 100) / 100;

    const commonFractions = [
      { value: 0.125, text: "1/8" },
      { value: 0.25, text: "1/4" },
      { value: 0.333, text: "1/3" },
      { value: 0.375, text: "3/8" },
      { value: 0.5, text: "1/2" },
      { value: 0.625, text: "5/8" },
      { value: 0.667, text: "2/3" },
      { value: 0.75, text: "3/4" },
      { value: 0.875, text: "7/8" },
    ];

    const whole = Math.floor(rounded);
    const decimal = rounded - whole;

    const fraction = commonFractions.find(
      (item) =>
        Math.abs(decimal - item.value) < 0.02
    );

    if (fraction) {
      if (whole === 0) {
        return fraction.text;
      }

      return `${whole} ${fraction.text}`;
    }

    /*
     * Handle values such as 2.5.
     */
    if (Number.isInteger(rounded)) {
      return String(rounded);
    }

    return String(rounded);
  }

  /*
   * =========================
   * SCALE ONE INGREDIENT
   * =========================
   *
   * Examples:
   *
   * "3 cups Rice"
   * -> 6 cups Rice
   *
   * "1/4 cup Vegetable Oil"
   * -> 1/2 cup Vegetable Oil
   *
   * "2-3 Tomatoes"
   * -> 4-6 Tomatoes
   *
   * "Salt to taste"
   * -> Salt to taste
   */

  function scaleIngredient(ingredient) {
    if (!ingredient || currentServings === baseServings) {
      return ingredient;
    }

    const multiplier =
      currentServings / baseServings;

    /*
     * Match:
     *
     * 3
     * 1/4
     * 2 1/2
     * 2-3
     * 1/2-1
     *
     * at the beginning of the ingredient.
     */

    const firstMatch = readQuantity(ingredient.trim());

    if (!firstMatch) {
      return ingredient;
    }

    const firstQuantity = firstMatch.value;
    let remainingText = firstMatch.remaining;
    let secondQuantity = null;

    const rangeMatch = remainingText.match(/^\s*-\s*/);

    if (rangeMatch) {
      const secondMatch = readQuantity(
        remainingText.slice(rangeMatch[0].length)
      );

      if (!secondMatch) {
        return ingredient;
      }

      secondQuantity = secondMatch.value;
      remainingText = secondMatch.remaining;
    }

    function parseQuantity(value) {
      if (!value) return null;

      const parts = value.trim().split(/\s+/);

      let total = 0;

      for (const part of parts) {
        if (part.includes("/")) {
          const fraction = fractionToDecimal(part);

          if (fraction === null) {
            return null;
          }

          total += fraction;
        } else {
          total += Number(part);
        }
      }

      return total;
    }

    const firstValue =
      parseQuantity(firstQuantity);

    if (firstValue === null || Number.isNaN(firstValue)) {
      return ingredient;
    }

    const scaledFirst =
      firstValue * multiplier;

    /*
     * Handle ranges such as:
     * 2-3 tomatoes
     */

    if (secondQuantity) {
      const secondValue =
        parseQuantity(secondQuantity);

      if (
        secondValue === null ||
        Number.isNaN(secondValue)
      ) {
        return ingredient;
      }

      const scaledSecond =
        secondValue * multiplier;

      return `${formatQuantity(
        scaledFirst
      )}-${formatQuantity(
        scaledSecond
      )}${remainingText}`;
    }

    return `${formatQuantity(
      scaledFirst
    )}${remainingText}`;
  }

  /*
   * =========================
   * SERVING CONTROLS
   * =========================
   */

  function decreaseServings() {
    setServingOffset((prev) =>
      Math.max(1, baseServings + prev - 1) - baseServings
    );
  }

  function increaseServings() {
    setServingOffset((prev) => prev + 1);
  }

  function resetServings() {
    setServingOffset(0);
  }

  /*
   * =========================
   * CHECKLIST
   * =========================
   */

  function toggleIngredient(item) {
    setCheckedIngredients((prev) =>
      prev.includes(item)
        ? prev.filter(
            (ingredient) =>
              ingredient !== item
          )
        : [...prev, item]
    );
  }

  /*
   * =========================
   * UI
   * =========================
   */

  return (
    <div className="mt-12">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <h2 className="text-3xl font-bold">
          Ingredients
        </h2>

        {/* Serving multiplier */}
        <div className="flex items-center gap-3">

          <span className="font-medium text-gray-600">
            Servings
          </span>

          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">

            <button
              type="button"
              onClick={decreaseServings}
              disabled={currentServings <= 1}
              className="px-4 py-2 text-xl font-bold bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Decrease servings"
            >
              −
            </button>

            <span className="px-5 py-2 font-semibold min-w-[55px] text-center">
              {currentServings}
            </span>

            <button
              type="button"
              onClick={increaseServings}
              className="px-4 py-2 text-xl font-bold bg-green-600 text-white hover:bg-green-700 transition"
              aria-label="Increase servings"
            >
              +
            </button>

          </div>

          {currentServings !== baseServings && (
            <button
              type="button"
              onClick={resetServings}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Reset
            </button>
          )}

        </div>

      </div>

      {/* Multiplier information */}

      {currentServings !== baseServings && (
        <p className="mt-3 text-sm text-gray-500">
          Ingredients adjusted from{" "}
          <span className="font-semibold">
            {baseServings}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-green-600">
            {currentServings}
          </span>{" "}
          servings.
        </p>
      )}

      {/* Checklist */}

      {checkedIngredients.length > 0 && (
        <button
          type="button"
          onClick={() =>
            setCheckedIngredients([])
          }
          className="mt-5 text-md text-red-500 hover:text-red-700 font-medium transition print-hide"
        >
          Clear checklist
        </button>
      )}

      <ul className="space-y-3 mt-4">

        {ingredients.map((item) => {

          const displayedIngredient =
            scaleIngredient(item);

          return (
            <li key={item}>

              <button
                type="button"
                onClick={() =>
                  toggleIngredient(item)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    toggleIngredient(item);
                  }
                }}
                className={`w-full flex items-center gap-3 cursor-pointer transition text-left ${
                  checkedIngredients.includes(item)
                    ? "text-gray-500"
                    : "text-gray-800"
                }`}
              >

                <span
                  className={`w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition ${
                    checkedIngredients.includes(item)
                      ? ""
                      : "bg-white border-green-500"
                  }`}
                >

                  {checkedIngredients.includes(item) && (
                    <span
                      className="text-4xl text-green-500 drop-shadow-[0_0_0.5px_currentColor]"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}

                </span>

                <span
                  className={
                    checkedIngredients.includes(item)
                      ? "line-through"
                      : ""
                  }
                >
                  {displayedIngredient}
                </span>

              </button>

            </li>
          );
        })}

      </ul>

    </div>
  );
}