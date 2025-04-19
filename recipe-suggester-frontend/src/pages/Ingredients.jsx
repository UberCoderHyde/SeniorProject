import React, { useEffect, useState } from "react";
import {
  fetchIngredients,
  fetchPantryItems,
  togglePantryItem,
} from "../services/ingredientService";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [bookmarked, setBookmarked] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Load all ingredients + which are in the user's pantry
  useEffect(() => {
    const load = async () => {
      try {
        const [all, pantry] = await Promise.all([
          fetchIngredients(),
          fetchPantryItems(),
        ]);
        setIngredients(all);
        setBookmarked(new Set(pantry.map((i) => i.ingredient.id)));
      } catch (err) {
        console.error("Error loading ingredients or pantry:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = async (ingredientId) => {
    try {
      await togglePantryItem(ingredientId);
      setBookmarked((prev) => {
        const next = new Set(prev);
        if (next.has(ingredientId)) next.delete(ingredientId);
        else next.add(ingredientId);
        return next;
      });
    } catch (err) {
      console.error("Failed to toggle pantry item:", err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-primary mb-4">Ingredients</h1>
      {ingredients.length === 0 ? (
        <p className="text-secondary">No ingredients found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((ingredient) => {
            const isBookmarked = bookmarked.has(ingredient.id);
            return (
              <div
                key={ingredient.id}
                className="border p-4 rounded shadow relative"
              >
                <h2 className="font-bold text-lg">{ingredient.name}</h2>
                <button
                  onClick={() => handleToggle(ingredient.id)}
                  className="absolute top-2 right-2 text-xl text-gray-400 hover:text-yellow-500"
                  aria-label={
                    isBookmarked
                      ? "Remove from pantry"
                      : "Add to pantry"
                  }
                >
                  {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Ingredients;
