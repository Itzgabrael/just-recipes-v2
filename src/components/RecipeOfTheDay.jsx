import { FaStar, FaArrowRight, FaUtensils } from "react-icons/fa";
import { GiChefToque, GiKnifeFork } from "react-icons/gi";
import { LuClock3 } from "react-icons/lu";
import { Link } from "react-router-dom";
function RecipeOfTheDay({ recipe }) {
  if (!recipe) {
    return null;
  }
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <GiKnifeFork />
          Daily Inspiration
          </div>

  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">
    Recipe of the Day
  </h2>

  <p className="text-gray-500 mt-3 px-2 sm:px-0 max-w-2xl mx-auto">
    Discover something delicious to cook today.
  </p>
</div>

      <div className="recipe-of-the-day-card grid md:grid-cols-2 gap-0 items-stretch bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-500 overflow-hidden border border-gray-100">

        <div className="relative h-[280px] sm:h-[340px] md:h-auto md:min-h-[500px] overflow-hidden group">
          <img
          src={recipe.image || "/default-food.jpg"}
          alt={recipe.title || recipe.recipeName || "Recipe of the Day"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
          <FaUtensils />
          Today's Pick
          </div>
          </div>
          <div className="p-5 sm:p-7 md:p-10 flex flex-col justify-center min-w-0">
          <div className="inline-flex w-fit items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
            <GiKnifeFork />
            Recipe of the Day
            </div>
            {recipe.source === "TheMealDB" && (
  <span className="inline-flex w-fit items-center mt-3 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
    From TheMealDB
  </span>
)}

          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4 sm:mt-5 mb-4 sm:mb-5 leading-tight break-words">
            {recipe.title || recipe.recipeName || "Creamy Garlic Chicken Pasta"}
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 sm:mb-7 max-w-xl">
              {recipe.description ||
              "Discover a delicious recipe selected especially for today's inspiration."}
              </p>

          <div className="flex flex-wrap items-center gap-3 mb-8">
  <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm font-semibold">
    <FaStar />
    {recipe.rating ?? "New"} 
  </div>

  <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold">
    <LuClock3 />
    {recipe.time || "Time Varies"}
  </div>

  <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold">
    <GiChefToque />
    {recipe.difficulty || "Not specified"}
  </div>
</div>

          <Link
          to={`/recipe/${recipe.id}`}
          className="group w-full sm:w-fit justify-center inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            View Recipe
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
        </div>

      </div>
    </section>
  );
}

export default RecipeOfTheDay;