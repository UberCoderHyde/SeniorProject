import React, { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import { fetchRecipes } from "../services/ingredientService";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const data = await fetchRecipes();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    getRecipes();
  }, []);

  return (
    <div className="container mx-auto p-6 bg-black text-gray-300">
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
