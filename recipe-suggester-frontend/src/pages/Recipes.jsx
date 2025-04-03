// src/pages/Recipes.jsx
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import RecipeCarousel from "../components/RecipeCarousel";

const dietaryOptions = ["vegan", "vegetarian", "keto_friendly", "nut_free"];

const Recipes = () => {
  const [trending, setTrending] = useState([]);
  const [dietary, setDietary] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [diet, setDiet] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch trending recipes
  useEffect(() => {
    fetch("/api/recipes/minimal/?trending=true")
      .then((res) => res.json())
      .then(setTrending);
  }, []);

  // Fetch dietary filtered recipes
  useEffect(() => {
    if (diet) {
      fetch(`/api/recipes/minimal/?diet=${diet}`)
        .then((res) => res.json())
        .then(setDietary);
    } else {
      setDietary([]);
    }
  }, [diet]);

  // Fetch favorites
  useEffect(() => {
    fetch("/api/recipes/minimal/?favorite=true")
      .then((res) => res.json())
      .then(setFavorites);
  }, []);

  const handleDietChange = (e) => {
    const selected = e.target.value;
    setDiet(selected);
    setSearchParams({ diet: selected });
  };

  return (
    <div className="container mx-auto px-6 py-8 text-gray-100">
      <h1 className="text-4xl font-bold text-primary mb-6">Explore Recipes</h1>

      <div className="mb-6 flex gap-4 items-center">
        <label className="text-lg">Filter by Diet:</label>
        <select
          value={diet}
          onChange={handleDietChange}
          className="bg-black border border-gray-600 px-4 py-2 rounded text-white"
        >
          <option value="">All</option>
          {dietaryOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Trending Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Trending Recipes</h2>
        <RecipeCarousel recipes={trending} />
        <div className="mt-4 text-center">
          <Link
            to="/recipes/browse?sort=trending&page=1"
            className="bg-accent text-white px-6 py-2 rounded hover:bg-highlight transition"
          >
            See More Trending
          </Link>
        </div>
      </section>

      {/* Dietary Filtered Section */}
      {diet && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Showing: {diet.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </h2>
          <RecipeCarousel recipes={dietary} />
          <div className="mt-4 text-center">
            <Link
              to={`/recipes/browse?diet=${diet}&page=1`}
              className="bg-accent text-white px-6 py-2 rounded hover:bg-highlight transition"
            >
              See More {diet.replace("_", " ")}
            </Link>
          </div>
        </section>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Favorites</h2>
          <RecipeCarousel recipes={favorites} />
          <div className="mt-4 text-center">
            <Link
              to="/recipes/browse?favorite=true&page=1"
              className="bg-accent text-white px-6 py-2 rounded hover:bg-highlight transition"
            >
              See All Favorites
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Recipes;
