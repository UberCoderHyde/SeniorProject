import React, { useRef } from "react";
import RecipeCard from "./RecipeCard";

const RecipeCarousel = ({ recipes, onToggleFavorite, favorites = new Set() }) => {
  const scrollRef = useRef();

  const scroll = (dir) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth;
      scrollRef.current.scrollBy({ left: dir === "left" ? -width : width, behavior: "smooth" });
    }
  };

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

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute top-1/2 left-0 z-10 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-l hover:bg-opacity-80"
      >
        ◀
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute top-1/2 right-0 z-10 -translate-y-1/2 bg-black bg-opacity-50 text-white px-3 py-2 rounded-r hover:bg-opacity-80"
      >
        ▶
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-4 px-8"
      >
        {recipes.map((recipe) => (
          <div key={recipe.id} className="snap-start shrink-0 w-[300px]">
            <RecipeCard
              recipe={recipe}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavoriteFn(recipe.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeCarousel;
