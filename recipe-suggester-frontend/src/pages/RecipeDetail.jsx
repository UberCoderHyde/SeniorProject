// src/pages/RecipeDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";

const RecipeDetail = () => {
  const { id } = useParams();

  // Placeholder data – replace with an API call to fetch recipe details.
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
      <Link
        to={`/recipes/${id}/shopping-list`}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-highlight transition mt-4 inline-block"
      >
        Generate Shopping List
      </Link>
    </div>
  );
};

export default RecipeDetail;
