import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";

const RecipeCard = ({ recipe, onToggleFavorite, isFavorite }) => {
  const { id, title, image, cleaned_ingredients = [], average_rating = 0, review_count = 0 } = recipe;

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < Math.round(average_rating); i++) {
      stars.push(<FaStar key={i} className="text-yellow-400 inline-block mr-1" />);
    }
    return stars;
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold text-primary mb-2">{title}</h2>
        <p className="text-gray-300 text-sm mb-2">
          {cleaned_ingredients.map((ing) => ing.name).join(", ")}
        </p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="text-sm text-gray-400">({review_count})</span>
          </div>
          <button onClick={() => onToggleFavorite(id)}>
            {isFavorite ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-400 hover:text-red-500" />
            )}
          </button>
        </div>
        <Link
          to={`/recipes/${id}`}
          className="mt-2 inline-block bg-accent text-white px-3 py-1 rounded hover:bg-highlight transition"
        >
          View Recipe
        </Link>

      </div>
    </div>
  );
};

export default RecipeCard;
