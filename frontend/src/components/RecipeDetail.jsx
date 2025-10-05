import { useParams, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiOutlineHashtag } from "react-icons/hi";

const RecipeDetail = ({ recipes }) => {
  const { id } = useParams();
  const location = useLocation();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const selectedRecipe = recipes.find((r) => r.id === parseInt(id));
    setRecipe(selectedRecipe);
  }, [id, recipes]);

  if (!recipe) {
    return <div className="text-center">Recipe not found!</div>;
  }

  // Render star rating based on the recipe's rating (out of 5)
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
    <div className="max-w-4xl mx-auto bg-gray-100 border border-gray-200 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          {recipe.title}
        </h1>
        <p className="text-gray-600 mb-2">
          <strong>Description:</strong> {recipe.desc}
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Date:</strong> {new Date(recipe.date).toLocaleDateString()}
        </p>
      </div>

      {/* Add horizontal line */}
      <hr className="my-4 border-gray-300" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Ingredients
        </h2>
        <ul className="list-disc list-inside text-gray-600">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      {/* Add horizontal line */}
      <hr className="my-4 border-gray-300" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Directions
        </h2>
        <ol className="list-decimal list-inside text-gray-600">
          {recipe.directions.map((direction, index) => (
            <li key={index} className="mb-2">
              {direction}
            </li>
          ))}
        </ol>
      </div>

      {/* Add horizontal line */}
      <hr className="my-4 border-gray-300" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Nutrition Facts
        </h2>
        <table className="table-auto w-full text-left text-gray-600 mb-3">
          <thead>
            <tr>
              <th className="px-4 py-2">Calories</th>
              <th className="px-4 py-2">Fat</th>
              <th className="px-4 py-2">Sodium</th>
              <th className="px-4 py-2">Protein</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">
                {recipe.calories ? `${recipe.calories} kcal` : "N/A"}
              </td>
              <td className="border px-4 py-2">
                {recipe.fat ? `${recipe.fat}g` : "N/A"}
              </td>
              <td className="border px-4 py-2">
                {recipe.sodium ? `${recipe.sodium}mg` : "N/A"}
              </td>
              <td className="border px-4 py-2">
                {recipe.protein ? `${recipe.protein}g` : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center mb-3">
          <strong className="mr-2">Rating:</strong> {renderStars()}
        </div>
      </div>

      {/* Add horizontal line */}
      <hr className="my-4 border-gray-300" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {recipe.categories.map((category, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm font-medium flex bg-gray-200 text-gray-900 rounded-lg"
            >
              <HiOutlineHashtag className="mt-1 font-extralight" />
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/"
          state={location.state}
          className="inline-block px-5 py-3 mt-4 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Back to Recipes
        </Link>
      </div>
    </div>
  );
};

export default RecipeDetail;
