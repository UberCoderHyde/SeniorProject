import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPaginatedRecipes } from "../services/recipeService";
import RecipeCard from "../components/RecipeCard";

const PaginatedRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "trending";
  const diet = searchParams.get("diet") || null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = { page, sort };
      if (diet) params.diet = diet;
      const { results, count } = await fetchPaginatedRecipes(params);
      setRecipes(results);
      setCount(count);
      setLoading(false);
    };
    load();
  }, [page, sort, diet]);

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
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* Pagination controls */}
          <div className="flex justify-center mt-10 space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`px-4 py-2 rounded shadow-md text-white ${
                  index + 1 === page
                    ? "bg-primary"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setSearchParams({ page: index + 1, sort, ...(diet && { diet }) })}
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