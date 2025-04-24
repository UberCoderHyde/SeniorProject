// src/pages/CreateRecipe.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { API_BASE_URL } from "../config";

const CreateRecipe = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [recipeIngred, setRecipeIngred] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("recipeIngred", recipeIngred);
    formData.append("instructions", instructions);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/recipes/create/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create recipe");
      }

      const json = await res.json();
      // assume the response is { message: "...", data: { id, ... } }
      navigate(`/recipes/${json.data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">Please log in to create a recipe.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-black text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-primary">Create a New Recipe</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
          />
        </div>

        {/* Ingredients (one per line) */}
        <div>
          <label className="block mb-2">Ingredients (one per line)</label>
          <textarea
            value={recipeIngred}
            onChange={(e) => setRecipeIngred(e.target.value)}
            required
            rows={5}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
            placeholder="e.g. 1 cup flour\n2 eggs\n..."
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block mb-2">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
            rows={8}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
            placeholder="Write step-by-step instructions..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-2">Recipe Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-gray-200"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-white px-6 py-2 rounded hover:bg-highlight transition"
        >
          {loading ? "Creating…" : "Create Recipe"}
        </button>
      </form>
    </div>
  );
};

export default CreateRecipe;
