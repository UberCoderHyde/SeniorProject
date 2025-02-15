import React, { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);

  // Placeholder: Replace with an actual API call to fetch recipes.
  useEffect(() => {
    const sampleRecipes = [
      {
        id: 1,
        title: "Spaghetti Carbonara",
        image_url: "https://via.placeholder.com/400x300",
        instructions: "Boil pasta. Fry bacon. Mix eggs with cheese. Combine all.",
      },
      {
        id: 2,
        title: "Chicken Salad",
        image_url: "https://via.placeholder.com/400x300",
        instructions: "Chop veggies, grill chicken, toss with dressing.",
      },
    ];
    setRecipes(sampleRecipes);
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
