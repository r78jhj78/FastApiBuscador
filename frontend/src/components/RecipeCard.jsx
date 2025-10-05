import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const RecipeCard = ({ recipe, filters, page, query }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const handleViewRecipe = () => {
    navigate(`/recipe/${recipe.id}`, {
      state: {
        filters,
        page,
        query,
      },
    });
  };

  // Render stars based on the recipe rating (out of 5)
  const renderStars = () => {
    const rating = recipe.rating || 0;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        // Fully filled stars
        stars.push(
          <svg
            key={i}
            viewBox="0 0 576 512"
            height="20px"
            fill="#ffc107" // Fully filled star color
            xmlns="http://www.w3.org/2000/svg"
            className="star"
          >
            <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
          </svg>
        );
      } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
        // Half-filled star
        stars.push(
          <svg
            key={i}
            viewBox="0 0 576 512"
            height="20px"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="star"
          >
            <linearGradient id={`half-fill-${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="50%" stopColor="#ffc107" />
              <stop offset="50%" stopColor="#e4e5e9" />
            </linearGradient>
            <path
              d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
              fill={`url(#half-fill-${i})`}
            />
          </svg>
        );
      } else {
        // Empty star
        stars.push(
          <svg
            key={i}
            viewBox="0 0 576 512"
            height="20px"
            fill="#e4e5e9" // Empty star color
            xmlns="http://www.w3.org/2000/svg"
            className="star"
          >
            <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
          </svg>
        );
      }
    }

    return <div className="flex">{stars}</div>;
  };

  return (
    <div
      className={`flex flex-col justify-between max-w-sm h-full bg-white border border-gray-200 rounded-lg shadow-lg p-6 transition-all duration-300 ease-out transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } hover:scale-105 hover:shadow-xl hover:bg-gray-50`}
    >
      <div className="flex-grow">
        <h5 className="mb-4 text-xl font-semibold tracking-tight text-gray-900">
          {recipe.title}
        </h5>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Calories:</strong>{" "}
          {recipe.calories ? `${recipe.calories} kcal` : "N/A"}
        </p>
        <div className="mb-6 flex items-center">
          <strong className="mr-2">Rating:</strong>
          {recipe.rating ? renderStars() : "Unrated"}
        </div>
      </div>
      <div className="mt-auto">
        <button
          onClick={handleViewRecipe}
          className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg transition-colors duration-300 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          View Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
