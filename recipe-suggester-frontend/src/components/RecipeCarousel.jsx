import React, { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";
import { getAuthHeaders } from "../services/ingredientService"; // Ensure this helper is available.

const API_BASE_URL = "http://localhost:8000/api";

const RecipeCarousel = ({ title, endpoint, queryParams = {} }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build the URL with query parameters.
  const buildUrl = () => {
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    Object.keys(queryParams).forEach((key) =>
      url.searchParams.append(key, queryParams[key])
    );
    return url.toString();
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = buildUrl();
        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [endpoint, JSON.stringify(queryParams)]);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="min-w-[250px]">
            <RecipeCard recipe={recipe} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeCarousel;
