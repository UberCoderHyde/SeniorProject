import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import RecipeCarousel from "../components/RecipeCarousel";
import { API_BASE_URL } from "../config";
import { toggleFavorite } from "../services/recipeService";

const dietaryOptions = ["vegan", "vegetarian", "keto_friendly", "nut_free"];

const Recipes = () => {
  const [trending, setTrending] = useState([]);
  const [dietary, setDietary] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [random, setRandom] = useState([]);
  const [diet, setDiet] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch trending
  useEffect(() => {
    fetch(`${API_BASE_URL}/recipes/minimal/?trending=true`)
      .then((res) => res.json())
      .then(setTrending)
      .catch(console.error);
  }, []);

  // Fetch random
  useEffect(() => {
    fetch(`${API_BASE_URL}/recipes/minimal/?random=true`)
      .then((res) => res.json())
      .then(setRandom)
      .catch(console.error);
  }, []);

  // Fetch diet-specific
  useEffect(() => {
    if (diet) {
      fetch(`${API_BASE_URL}/recipes/minimal/?diet=${diet}`)
        .then((res) => res.json())
        .then(setDietary)
        .catch(console.error);
    } else {
      setDietary([]);
    }
  }, [diet]);

  // Fetch favorites
  fetch(`${API_BASE_URL}/recipes/minimal/?favorite=true`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${localStorage.getItem("token")}`,
    },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Unauthorized or bad response");
      const data = await res.json();
      setFavorites(new Set(data.map((r) => r.id)));
    })
    .catch((err) => {
      console.error("Failed to fetch favorites:", err);
    });

  const handleDietChange = (e) => {
    const selected = e.target.value;
    setDiet(selected);
    setSearchParams({ diet: selected });
  };

  const handleToggleFavorite = async (recipeId) => {
    try {
      await toggleFavorite(recipeId);
      setFavorites((prev) => {
        const updated = new Set(prev);
        if (updated.has(recipeId)) {
          updated.delete(recipeId);
        } else {
          updated.add(recipeId);
        }
        return new Set(updated);
      });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
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

      {/* Trending */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Trending Recipes</h2>
        <RecipeCarousel
          recipes={trending}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
        />
        <div className="mt-4 text-center">
          <Link
            to="/recipes/browse?sort=trending&page=1"
            className="bg-accent text-white px-6 py-2 rounded hover:bg-highlight transition"
          >
            See More Trending
          </Link>
        </div>
      </section>

      {/* Random */}
      {random.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Random Recipes</h2>
          <RecipeCarousel
            recipes={random}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
          <div className="mt-4 text-center">
            <Link
              to="/recipes/browse?random=true&page=1"
              className="bg-accent text-white px-6 py-2 rounded hover:bg-highlight transition"
            >
              See More Random
            </Link>
          </div>
        </section>
      )}

      {/* Dietary */}
      {diet && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Showing: {diet.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </h2>
          <RecipeCarousel
            recipes={dietary}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
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

      {/* Favorites */}
      {favorites.size > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Favorites</h2>
          <RecipeCarousel
            recipes={[...trending, ...random, ...dietary].filter((r) => favorites.has(r.id))}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
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
