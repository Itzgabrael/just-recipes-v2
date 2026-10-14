import { useMemo, useState } from "react";
import {
  FaCheck,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

const defaultIngredients = [
  "Rice",
  "Chicken",
  "Beef",
  "Fish",
  "Egg",
  "Tomato",
  "Onion",
  "Garlic",
  "Pepper",
  "Potato",
  "Carrot",
  "Cabbage",
  "Spinach",
  "Lettuce",
  "Cheese",
  "Milk",
  "Butter",
  "Pasta",
  "Flour",
  "Bread",
  "Beans",
  "Corn",
  "Peas",
  "Mushroom",
  "Ginger",
];

function IngredientSelector({ onFindRecipes, onSearchClear, availableIngredients = [], }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredients, setSelectedIngredients] =
    useState([]);

  const allAvailableIngredients = useMemo(
    () =>
      Array.from(
        new Map(
          [...defaultIngredients, ...availableIngredients].map(
            (ingredient) => [
              ingredient.toLowerCase().trim(),
              ingredient,
            ]
          )
        ).values()
      ).sort((a, b) => a.localeCompare(b)),
    [availableIngredients]
  );
  const filteredIngredients = useMemo(() => {
    return allAvailableIngredients.filter((ingredient) =>
      ingredient
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [allAvailableIngredients, searchTerm]);

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients((current) => {
      if (current.includes(ingredient)) {
        return current.filter(
          (item) => item !== ingredient
        );
      }

      return [...current, ingredient];
    });
  };

  const removeIngredient = (ingredient) => {
    setSelectedIngredients((current) =>
      current.filter((item) => item !== ingredient)
    );
  };

  const clearIngredients = () => {
    setSelectedIngredients([]);
  };

  const handleFindRecipes = () => {
    if (selectedIngredients.length === 0) {
      return;
    }

    onFindRecipes(selectedIngredients);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Heading */}
      <div className="text-center mb-8">
        <p className="text-green-600 font-semibold uppercase tracking-wide text-sm">
          Cook smarter
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
          Cook With What You Have
        </h1>

        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Select the ingredients you already have and
          we'll help you discover recipes you can make.
        </p>
      </div>

      {/* Main selector */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-8">

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              const value = event.target.value;
              setSearchTerm(value);
              if (!value.trim()) {
                onSearchClear?.();
              }
            }}
            placeholder="Search for an ingredient..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
          />
        </div>

        {/* Selected ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="mt-6">

            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-semibold text-gray-900">
                Your ingredients
              </h2>

              <button
                type="button"
                onClick={clearIngredients}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition"
              >
                <FaTrash />
                Clear all
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium"
                >
                  <FaCheck className="text-xs" />

                  {ingredient}

                  <button
                    type="button"
                    onClick={() =>
                      removeIngredient(ingredient)
                    }
                    className="hover:text-red-500 transition"
                    aria-label={`Remove ${ingredient}`}
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available ingredients */}
        <div className="mt-8">

          <h2 className="font-semibold text-gray-900 mb-4">
            Choose ingredients
          </h2>

          {filteredIngredients.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

              {filteredIngredients.map((ingredient) => {
                const isSelected =
                  selectedIngredients.includes(
                    ingredient
                  );

                return (
                  <button
                    key={ingredient}
                    type="button"
                    onClick={() =>
                      toggleIngredient(ingredient)
                    }
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-green-600 text-white border-green-600 shadow-md scale-[1.02]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-500 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {isSelected && (
                      <FaCheck className="inline mr-2 text-xs" />
                    )}

                    {ingredient}
                  </button>
                );
              })}

            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No ingredients found.
            </div>
          )}
        </div>

        {/* Find recipes */}
        <div className="mt-8 flex justify-center">

          <button
            type="button"
            onClick={handleFindRecipes}
            disabled={selectedIngredients.length === 0}
            className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Find Recipes
          </button>

        </div>

      </div>
    </section>
  );
}

export default IngredientSelector;