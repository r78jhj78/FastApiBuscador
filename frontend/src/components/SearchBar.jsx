import { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    const placeholderText = "Search recipes...";
    let index = 0;

    const typePlaceholder = () => {
      if (index < placeholderText.length) {
        setPlaceholder(placeholderText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    };

    const typingInterval = setInterval(typePlaceholder, 150); // Typing speed (150ms)

    return () => clearInterval(typingInterval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full max-w-lg mx-auto my-4 shadow-md rounded-lg"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder} // Dynamic placeholder
        className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all"
      />
      <button
        type="submit"
        className="px-4 py-3 bg-blue-500 font-extrabold text-2xl text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
      >
        <IoSearch />
      </button>
    </form>
  );
};

export default SearchBar;
