// src/components/RecipeCarousel.jsx

import React from "react";
import Slider from "react-slick";
import RecipeCard from "./RecipeCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const RecipeCarousel = ({ recipes, onToggleFavorite, favorites = new Set() }) => {
  const isFavoriteFn = (id) => {
    if (favorites instanceof Set) return favorites.has(id);
    if (Array.isArray(favorites)) return favorites.includes(id);
    return false;
  };

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No recipes found for this category.
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 2, infinite: false, dots: true }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, slidesToScroll: 1, infinite: false, dots: true }
      }
    ]
  };

  return (
    <div className="slider-container py-4">
      <Slider {...settings}>
        {recipes.map((recipe) => (
          <div key={recipe.id} className="px-2">
            <RecipeCard
              recipe={recipe}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavoriteFn(recipe.id)}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default RecipeCarousel;
