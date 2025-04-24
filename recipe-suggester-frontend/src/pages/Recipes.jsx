// src/pages/Recipes.jsx

import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RecipeCarousel from "../components/RecipeCarousel";
import { API_BASE_URL } from "../config";
import useAuth from "../hooks/useAuth";
import { toggleFavorite } from "../services/recipeService";

const dietaryOptions = ["vegan", "vegetarian", "keto_friendly", "nut_free"];

// Derive the backend base URL by stripping "/api" from API_BASE_URL
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const Recipes = () => {
  const [trending, setTrending]       = useState([]);
  const [random, setRandom]           = useState([]);
  const [dietary, setDietary]         = useState([]);
  const [favorites, setFavorites]     = useState(new Set());
  const [canMake, setCanMake]         = useState([]);
  const [almost, setAlmost]           = useState([]);
  const [diet, setDiet]               = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { token }                     = useAuth();

  // Trending recipes
  useEffect(() => {
    fetch(`${API_BASE_URL}/recipes/minimal/?trending=true`)
      .then((r) => r.json())
      .then(setTrending)
      .catch(console.error);
  }, []);

  // Random recipes
  useEffect(() => {
    fetch(`${API_BASE_URL}/recipes/minimal/?random=true`)
      .then((r) => r.json())
      .then(setRandom)
      .catch(console.error);
  }, []);

  // Dietary filter
  useEffect(() => {
    if (!diet) {
      setDietary([]);
      return;
    }
    fetch(`${API_BASE_URL}/recipes/minimal/?diet=${diet}`)
      .then((r) => r.json())
      .then(setDietary)
      .catch(console.error);
  }, [diet]);

  // Favorites
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/recipes/favorites/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Not authorized");
        return r.json();
      })
      .then((data) => setFavorites(new Set(data.map((r) => r.id))))
      .catch(console.error);
  }, [token]);

  // Suggestions: can_make=true
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/recipes/suggestions/?can_make=true`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((r) => r.json())
      .then((data) =>
        setCanMake(
          data.map((recipe) => ({
            ...recipe,
            image:
              recipe.image && recipe.image.startsWith("/media")
                ? `${BACKEND_BASE_URL}${recipe.image}`
                : recipe.image,
          }))
        )
      )
      .catch(console.error);
  }, [token]);

  // Suggestions: threshold=2
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/recipes/suggestions/?threshold=2`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((r) => r.json())
      .then((data) =>
        setAlmost(
          data.map((recipe) => ({
            ...recipe,
            image:
              recipe.image && recipe.image.startsWith("/media")
                ? `${BACKEND_BASE_URL}${recipe.image}`
                : recipe.image,
          }))
        )
      )
      .catch(console.error);
  }, [token]);

  const handleDietChange = (e) => {
    const selected = e.target.value;
    setDiet(selected);
    setSearchParams({ diet: selected });
  };

  const handleToggleFavorite = async (recipeId) => {
    try {
      await toggleFavorite(recipeId);
      setFavorites((prev) => {
        const next = new Set(prev);
        next.has(recipeId) ? next.delete(recipeId) : next.add(recipeId);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 text-gray-100">
      <h1 className="text-4xl font-bold text-primary mb-6">Explore Recipes</h1>

      {/* Diet filter */}
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

      {/* You Can Make */}
      {token && canMake.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">You Can Make</h2>
          <RecipeCarousel
            recipes={canMake}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        </section>
      )}

      {/* Almost There */}
      {token && almost.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Almost There (≤2 missing)
          </h2>
          <RecipeCarousel
            recipes={almost}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        </section>
      )}

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
      {diet && dietary.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            {diet
              .replace("_", " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
            Recipes
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
              See More
            </Link>
          </div>
        </section>
      )}

      {/* Favorites */}
      {token && favorites.size > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Your Favorites</h2>
          <RecipeCarousel
            recipes={[...trending, ...random, ...dietary].filter((r) =>
              favorites.has(r.id)
            )}
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
