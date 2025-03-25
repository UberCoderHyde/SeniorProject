import React from "react";
import { Link } from "react-router-dom";

const RecipeCard = ({ recipe }) => {
  const { id, title, image, ingredients } = recipe;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
        <p className="text-gray-300 text-sm">
          {ingredients.join(", ")}
        </p>
        <Link
          to={`/recipes/${id}`}
          className="mt-4 inline-block bg-accent text-white px-3 py-1 rounded hover:bg-highlight transition"
        >
          View Recipe
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
