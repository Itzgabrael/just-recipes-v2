export default function Nutrition({ nutrition }) {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Nutrition
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg">
          <h3 className="text-green-800 dark:text-green-300">Calories</h3>
          <p className="text-gray-900 dark:text-gray-200">{nutrition.calories}</p>
        </div>

        <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg">
          <h3 className="text-green-800 dark:text-green-300">Protein</h3>
          <p className="text-gray-900 dark:text-gray-200">{nutrition.protein}</p>
        </div>

        <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg">
          <h3 className="text-green-800 dark:text-green-300">Carbs</h3>
          <p className="text-gray-900 dark:text-gray-200">{nutrition.carbs}</p>
        </div>

        <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg">
          <h3 className="text-green-800 dark:text-green-300">Fat</h3>
          <p className="text-gray-900 dark:text-gray-200">{nutrition.fat}</p>
        </div>
      </div>
    </div>
  );
}