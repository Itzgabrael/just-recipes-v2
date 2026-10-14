import { useState } from "react";
import { FaSearch } from "react-icons/fa";

function SearchBar({ onSearch }) {

  const [searchTerm, setSearchTerm] = useState("");

  function handleSubmit(event) {

    event.preventDefault();

    onSearch(searchTerm);

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto flex items-center gap-2"
    >

      <input
      id="recipe-search"
        type="search"
        value={searchTerm}
        onChange={(event) => {
          const value = event.target.value;
          setSearchTerm(value);
          if (!value.trim()) {
            onSearch("");
          }
        }}
        placeholder="Search recipes..."
        enterKeyHint="search"
        className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      <button
        type="submit"
        aria-label="Search recipes"
        className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
      >

        <FaSearch />

      </button>

    </form>

  );

}
export default SearchBar;