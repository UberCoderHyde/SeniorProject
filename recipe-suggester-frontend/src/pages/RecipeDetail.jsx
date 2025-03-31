import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRecipeById } from "../services/recipeService";

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const data = await fetchRecipeById(id);
        setRecipe(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recipe details.");
      }
    };
    loadRecipe();
  }, [id]);

  if (error) {
    return (
      <div className="container mx-auto p-6 bg-black text-gray-300">
        <p>{error}</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto p-6 bg-black text-gray-300">
        <p>Loading...</p>
      </div>
    );
  }

  const { title, image, instructions, recipeIngred } = recipe;

  // Safely process ingredients (string or array)
  let ingredientsArray = [];
  if (Array.isArray(recipeIngred)) {
    ingredientsArray = recipeIngred;
  } else if (typeof recipeIngred === "string") {
    try {
      const parsed = JSON.parse(recipeIngred);
      ingredientsArray = Array.isArray(parsed) ? parsed : [];
    } catch {
      // fallback: split by newlines if not valid JSON
      ingredientsArray = recipeIngred
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
    }
  }

  // Format instructions
  const steps =
    instructions && instructions.includes("\n")
      ? instructions.split("\n").filter((step) => step.trim() !== "")
      : [instructions];

  return (
    <div className="container mx-auto p-6 bg-black text-gray-300">
      {/* Title */}
      <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>

      {/* Image */}
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-auto rounded mb-8 shadow-md"
        />
      )}

      {/* Ingredients */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        {ingredientsArray.length > 0 ? (
          <ul className="list-disc ml-6 space-y-1">
            {ingredientsArray.map((item, index) => (
              <li key={index} className="text-lg">
                {typeof item === "string"
                  ? item
                  : typeof item.ingredient === "string"
                  ? item.ingredient
                  : item.ingredient?.name || "Unknown"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lg">No ingredients listed.</p>
        )}
      </section>

      {/* Instructions */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        {steps.length > 0 && steps[0] ? (
          <ol className="list-decimal ml-6 space-y-2">
            {steps.map((step, index) => (
              <li key={index} className="text-base">
                {step.trim()}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-base">No instructions available.</p>
        )}
      </section>

      {/* Shopping List Link */}
      <div className="mt-10">
        <Link
          to={`/recipes/${id}/shopping-list`}
          className="bg-primary text-white px-6 py-3 rounded hover:bg-highlight transition"
        >
          Generate Shopping List
        </Link>
      </div>
    </div>
  );
};

export default RecipeDetail;
