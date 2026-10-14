import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

function Hero({ onSearch }) {
  const text = "Discover delicious recipes from around the world.";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      currentIndex += 1;

      setDisplayedText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(typingInterval);
      }
    }, 45);

    return () => {
      clearInterval(typingInterval);
    };
  }, []);

  return (
    <section className="bg-green-50 dark:bg-gray-900 py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">

        <h1 className="text-5xl font-bold text-green-700 dark:text-green-400">
          Cook. Share. Enjoy.
        </h1>

        <p className="mt-5 text-lg font-semibold text-gray-600 dark:text-gray-300 min-h-7">
          {displayedText}
        </p>

        <div className="mt-8">
          <SearchBar onSearch={onSearch} />
        </div>

      </div>
    </section>
  );
}

export default Hero;