import { categories } from "../data/categories.js";

export default function Category({
  onCategorySelect,
  recipes,
  selectedCategory,
}) {
  return (
    <section className="categories">
      <div className="container">
        <h2>Browse by Category</h2>

        <p>
          Find recipes based on your favourite food category.
        </p>

        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            const count = recipes.filter(
              (recipe) =>
                recipe.category?.toLowerCase() ===
                category.name.toLowerCase()
            ).length;

            const isSelected =
              selectedCategory?.toLowerCase() ===
              category.name.toLowerCase();

            let categoryClassName;

            if (count === 0) {
              categoryClassName =
                "opacity-50 grayscale cursor-not-allowed";
            } else if (isSelected) {
              categoryClassName =
                "cursor-pointer category-active";
            } else {
              categoryClassName =
                "cursor-pointer";
            }

            return (
              <button
                type="button"
                className={`category-card ${categoryClassName}`}
                key={category.id}
                onClick={() => {
                  if (count > 0) {
                    onCategorySelect(category.name);
                  }
                }}
              >
                <div className="category-icon">
                  <Icon />
                </div>

                <h3>{category.name}</h3>

                <span
                  className={`recipe-badge ${
                    count === 0
                      ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400"
                      : ""
                  }`}
                >
                  <span className="dot"></span>

                  {count}{" "}
                  {count === 1
                    ? "Recipe"
                    : "Recipes"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}