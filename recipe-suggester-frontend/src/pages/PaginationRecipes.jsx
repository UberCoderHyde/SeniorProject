import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPaginatedRecipes, toggleFavorite } from "../services/recipeService";
import RecipeCard from "../components/RecipeCard";
import { API_BASE_URL } from "../config";

const PaginatedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "trending";
  const diet = searchParams.get("diet") || null;

  // Load paginated recipes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = { page, sort };
      if (diet) params.diet = diet;

      try {
        const { results, count } = await fetchPaginatedRecipes(params);
        setRecipes(results);
        setCount(count);
      } catch (err) {
        console.error("Failed to load recipes:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, sort, diet]);

  // Load user's favorite recipes
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/recipes/minimal/?favorite=true`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(new Set(data.map((r) => r.id)));
        }
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      }
    };
    loadFavorites();
  }, []);

  const handleToggleFavorite = async (recipeId) => {
    try {
      await toggleFavorite(recipeId);
      setFavorites((prev) => {
        const updated = new Set(prev);
        if (updated.has(recipeId)) {
          updated.delete(recipeId);
        } else {
          updated.add(recipeId);
        }
        return new Set(updated);
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const totalPages = Math.ceil(count / 50);

  return (
    <div className="container mx-auto p-6 bg-black text-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-primary capitalize">{sort} Recipes</h1>

      {loading ? (
        <p>Loading recipes...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.has(recipe.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-10 space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`px-4 py-2 rounded shadow-md text-white ${
                  index + 1 === page
                    ? "bg-primary"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() =>
                  setSearchParams({ page: index + 1, sort, ...(diet && { diet }) })
                }
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PaginatedRecipes;
