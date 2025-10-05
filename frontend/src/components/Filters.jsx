import { useState, useEffect } from "react";

// Debounce function to delay the execution of filtering logic
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Filters = ({ onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [minProtein, setMinProtein] = useState(0);
  const [maxProtein, setMaxProtein] = useState(100);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // Debounce the slider values to avoid fetching during every small change
  const debouncedMinRating = useDebounce(minRating, 300);
  const debouncedMaxRating = useDebounce(maxRating, 300);
  const debouncedMinProtein = useDebounce(minProtein, 300);
  const debouncedMaxProtein = useDebounce(maxProtein, 300);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const categoryRes = await fetch(`${apiBaseUrl}/filter/categories`);
        const categoryData = await categoryRes.json();
        setCategories(categoryData);

        const ingredientRes = await fetch(`${apiBaseUrl}/filter/ingredients`);
        const ingredientData = await ingredientRes.json();
        setIngredients(ingredientData);
      } catch (err) {
        console.error("Failed to fetch categories or ingredients", err);
      }
    };

    fetchFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update filters based on debounced values
  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      ingredients: selectedIngredients,
      min_rating: debouncedMinRating,
      max_rating: debouncedMaxRating,
      min_protein: debouncedMinProtein,
      max_protein: debouncedMaxProtein,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    selectedIngredients,
    debouncedMinRating,
    debouncedMaxRating,
    debouncedMinProtein,
    debouncedMaxProtein,
  ]);

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);

  const handleIngredientChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setSelectedIngredients((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  return (
    <div className="p-4 bg-gray-100 text-gray-900 rounded-lg shadow-md">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Filters</h2>

      <button
        className="block lg:hidden mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
        onClick={() => setIsFilterVisible(!isFilterVisible)}
      >
        {isFilterVisible ? "Hide Filters" : "Show Filters"}
      </button>

      <div className={`${isFilterVisible ? "block" : "hidden"} lg:block`}>
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-900">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          {/* <label className="block mb-1 font-medium text-gray-900">
            Ingredients
          </label> */}
          <div className="max-h-40 overflow-y-auto">
            {ingredients.map((ingredient) => (
              <div key={ingredient} className="flex items-center">
                <input
                  type="checkbox"
                  id={ingredient}
                  value={ingredient}
                  onChange={handleIngredientChange}
                  className="w-4 h-4 mr-2 bg-gray-100 border border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={ingredient} className="text-sm text-gray-900">
                  {ingredient}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Slider */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-900">Rating</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="w-full h-2 bg-gray-100 rounded-lg cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={maxRating}
            onChange={(e) => setMaxRating(e.target.value)}
            className="w-full h-2 bg-gray-100 rounded-lg cursor-pointer mt-2"
          />
          <div className="flex justify-between text-gray-600 mt-2">
            <span>Min: {minRating}</span>
            <span>Max: {maxRating}</span>
          </div>
        </div>

        {/* Protein Slider */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-900">
            Protein (grams)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={minProtein}
            onChange={(e) => setMinProtein(e.target.value)}
            className="w-full h-2 bg-gray-100 rounded-lg cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={maxProtein}
            onChange={(e) => setMaxProtein(e.target.value)}
            className="w-full h-2 bg-gray-100 rounded-lg cursor-pointer mt-2"
          />
          <div className="flex justify-between text-gray-600 mt-2">
            <span>Min: {minProtein}g</span>
            <span>Max: {maxProtein}g</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
