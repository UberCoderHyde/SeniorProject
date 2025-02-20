import React from "react";
import { Link } from "react-router-dom";

const RecipeCard = ({ recipe }) => {
  const { id, title, image_url, instructions } = recipe;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {image_url && (
        <img
          src={image_url}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
        <p className="text-gray-300 text-sm">
          {instructions.substring(0, 100)}...
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
