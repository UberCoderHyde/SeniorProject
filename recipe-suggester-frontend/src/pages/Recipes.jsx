import React, { useState } from "react";
import RecipeCarousel from "../components/RecipeCarousel";

const Recipes = () => {
  // State for the dietary filter (can be expanded to include more filters)
  const [dietFilter, setDietFilter] = useState("vegetarian");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-primary mb-6">Recipes</h1>

      {/* Recommended Carousel: fetching random recipes */}
      <RecipeCarousel
        title="Recommended"
        endpoint="recipes/minimal/"
        queryParams={{ random: "true" }}
      />

      {/* Trending Carousel: backend should filter trending recipes if implemented */}
      <RecipeCarousel
        title="Trending"
        endpoint="recipes/minimal/"
        queryParams={{ trending: "true" }}
      />

      {/* Dietary Carousel: includes a dropdown for dietary filtering */}
      <div className="mb-4">
        <label className="mr-2">Dietary Filter:</label>
        <select
          value={dietFilter}
          onChange={(e) => setDietFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="gluten-free">Gluten-Free</option>
          <option value="keto">Keto</option>
          {/* Add additional options as needed */}
        </select>
      </div>
      <RecipeCarousel
        title="Dietary"
        endpoint="recipes/minimal/"
        queryParams={{ diet: dietFilter }}
      />

      {/* Favorites Carousel: requires an authenticated user */}
      <RecipeCarousel
        title="Favorites"
        endpoint="recipes/favorites/"
        queryParams={{}}
      />
    </div>
  );
};

export default Recipes;
