import React, { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import { getAuthHeaders } from "../services/ingredientService"; // Ensure this helper is available.
const API_BASE_URL = "http://localhost:8000/api";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchMinimalRecipes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/minimal/?random=true`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch minimal recipes");
        }
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching minimal recipes: ", error);
      }
    };

    fetchMinimalRecipes();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-primary mb-6">Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};

export default Recipes;
