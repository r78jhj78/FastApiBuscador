import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import Filters from "./components/Filters";
import RecipeList from "./components/RecipeList";
import RecipeDetail from "./components/RecipeDetail";

const App = () => {
  const location = useLocation();
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState(location.state?.query || "");
  const [filters, setFilters] = useState(
    location.state?.filters || {
      category: "",
      ingredients: [],
      min_rating: 0,
      max_rating: 5,
      min_protein: 0,
      max_protein: 100,
    }
  );
  const [page, setPage] = useState(location.state?.page || 1);
  const [size] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // New error state
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchRecipes = () => {
    setLoading(true);
    setError(null); // Reset error state
    const params = new URLSearchParams();

    if (query) params.append("query", query);
    if (filters.category) params.append("category", filters.category);
    if (filters.ingredients.length > 0) {
      filters.ingredients.forEach((ing) => params.append("ingredients", ing));
    }
    if (filters.min_rating) params.append("min_rating", filters.min_rating);
    if (filters.max_rating) params.append("max_rating", filters.max_rating);
    if (filters.min_protein) params.append("min_protein", filters.min_protein);
    if (filters.max_protein) params.append("max_protein", filters.max_protein);

    params.append("page", page);
    params.append("size", size);

    fetch(`${apiBaseUrl}/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setRecipes(data.recipes);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while fetching recipes.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line
  }, [query, filters, page]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    setPage(1);
  };

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / size);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional, smooth scrolling animation
    });
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      scrollToTop(); // Scroll to top when page changes
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      scrollToTop(); // Scroll to top when page changes
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="bg-white shadow-md">
        <div className="container px-4 py-6 mx-auto flex items-center justify-between">
          <img src="/image.png" className="w-14 h-14" alt="Logo" />
          <h1 className="text-2xl font-bold text-gray-900 text-center flex-grow">
            Recipes Search Platform
          </h1>
        </div>
      </header>

      <main className="container px-4 py-6 mx-auto">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {!error && <SearchBar onSearch={handleSearch} />}
                <div className="flex flex-col lg:flex-row gap-6">
                  {!error && (
                    <aside className="lg:w-1/4">
                      <Filters onFilterChange={handleFilterChange} />
                    </aside>
                  )}
                  <section className="lg:w-3/4">
                    {loading ? (
                      <p className="text-center text-gray-600">Loading...</p>
                    ) : error ? (
                      <div className="flex flex-col text-center items-center justify-center min-h-full">
                        <img
                          src="/Page-Not-Found-Error-404.png"
                          alt="No recipes found"
                          className="mx-auto mb-4 w-64 h-64"
                        />
                      </div>
                    ) : recipes.length === 0 ? (
                      <div className="text-center flex flex-col items-center justify-center min-h-full">
                        <p className="text-gray-600">
                          No recipes found. Try adjusting your search or
                          filters.
                        </p>
                      </div>
                    ) : (
                      <>
                        <RecipeList recipes={recipes} />
                        <div className="flex justify-center mt-6 space-x-4">
                          <button
                            onClick={handlePrevPage}
                            disabled={page === 1}
                            className={`px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-transform ${
                              page === 1 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            Previous
                          </button>
                          <span className="self-center">
                            Page {page} of {totalPages}
                          </span>
                          <button
                            onClick={handleNextPage}
                            disabled={page === totalPages || totalPages === 0}
                            className={`px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 transition-transform ${
                              page === totalPages || totalPages === 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </>
            }
          />
          <Route
            path="/recipe/:id"
            element={<RecipeDetail recipes={recipes} />}
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
