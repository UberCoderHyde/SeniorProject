import React from "react";
import { useParams } from "react-router-dom";

const RecipeDetail = () => {
  const { id } = useParams();

  // Placeholder: In a real app, fetch recipe details using the id.
  const recipe = {
    id,
    title: "Spaghetti Carbonara",
    image_url: "https://via.placeholder.com/800x600",
    instructions: "1. Boil pasta. 2. Fry bacon. 3. Mix eggs and cheese. 4. Combine all together.",
    ingredients: "Pasta, bacon, eggs, cheese, salt, pepper",
  };

  return (
    <div className="container mx-auto p-6 bg-black text-gray-300">
      <h1 className="text-4xl font-bold text-primary mb-4">{recipe.title}</h1>
      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-auto rounded mb-4"
        />
      )}
      <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
      <p className="mb-4">{recipe.ingredients}</p>
      <h2 className="text-2xl font-semibold mb-2">Instructions</h2>
      <p>{recipe.instructions}</p>
    </div>
  );
};

export default RecipeDetail;
