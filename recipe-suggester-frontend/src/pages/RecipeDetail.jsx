// src/pages/RecipeDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchRecipeById, getAuthHeaders } from "../services/recipeService";
import { FaStar } from "react-icons/fa";
import { API_BASE_URL } from "../config";
import GroceryList from "../components/GroceryList";

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, review_text: "" });
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const data = await fetchRecipeById(id);
        setRecipe(data);

        const res = await fetch(`${API_BASE_URL}/recipes/${id}/reviews/`, {
          headers: getAuthHeaders(),
        });
        const revs = await res.json();
        setReviews(revs);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch recipe details.");
      }
    };
    loadRecipe();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/recipes/${id}/reviews/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newReview),
      });
      if (!res.ok) throw new Error("Submission failed");
      const created = await res.json();
      setReviews((prev) => [...prev, created]);
      setNewReview({ rating: 5, review_text: "" });
    } catch {
      setError("You must be logged in to submit a review.");
    }
  };
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await createNote(id, newNoteText);
      setNotes((prev) => [...prev, created]);
      setNewNoteText("");
    } catch {
      setError("You must be logged in to add a note.");
    }
  };
  const renderStars = (rating) => {
    return Array.from({ length: rating }).map((_, i) => (
      <FaStar key={i} className="text-yellow-400 inline" />
    ));
  };

  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!recipe) return <p className="p-6 text-center">Loading...</p>;

  const { title, image, instructions, recipeIngred } = recipe;

  // Parse ingredients list
  let ingredientsArray = [];
  if (Array.isArray(recipeIngred)) {
    ingredientsArray = recipeIngred;
  } else if (typeof recipeIngred === "string") {
    try {
      ingredientsArray = JSON.parse(recipeIngred);
    } catch {
      ingredientsArray = recipeIngred
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    }
  }

  // Parse instruction steps
  const steps = instructions
    ? instructions.split("\n").filter((s) => s.trim())
    : [];

  return (
    <div className="container mx-auto p-6 bg-black text-gray-300">
      <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>

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
        {ingredientsArray.length ? (
          <ul className="list-disc ml-6 space-y-1">
            {ingredientsArray.map((item, idx) => (
              <li key={idx} className="text-lg">
                {typeof item === "string"
                  ? item
                  : item.ingredient?.name || item}
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
        {steps.length ? (
          <ol className="list-decimal ml-6 space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="text-base">
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-base">No instructions available.</p>
        )}
      </section>

      {/* Reviews */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {reviews.length ? (
          <ul className="space-y-4 mb-4">
            {reviews.map((rev, i) => (
              <li key={i} className="border-b pb-2">
                <div className="text-yellow-400">
                  {renderStars(rev.rating)}
                </div>
                <p className="text-sm text-gray-200 mt-1">
                  {rev.review_text}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 mb-4">No reviews yet.</p>
        )}

        <form onSubmit={handleReviewSubmit} className="mt-4 space-y-2">
          <select
            value={newReview.rating}
            onChange={(e) =>
              setNewReview({ ...newReview, rating: +e.target.value })
            }
            className="bg-black text-white border border-gray-600 rounded px-2 py-1"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} Star{n > 1 && "s"}
              </option>
            ))}
          </select>
          <textarea
            value={newReview.review_text}
            onChange={(e) =>
              setNewReview({ ...newReview, review_text: e.target.value })
            }
            className="w-full bg-black text-white border border-gray-600 rounded p-2"
            placeholder="Write your review..."
          />
          <button
            type="submit"
            className="bg-accent text-white px-4 py-2 rounded hover:bg-highlight"
          >
            Submit Review
          </button>
        </form>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">My Notes</h2>
        {notes.length ? (
          <ul className="list-disc ml-6 space-y-1 mb-4">
            {notes.map((note) => (
              <li key={note.id} className="text-lg">
                {note.note_text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 mb-4">No notes yet.</p>
        )}
        <form onSubmit={handleNoteSubmit} className="mt-4 space-y-2">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            className="w-full bg-black text-white border border-gray-600 rounded p-2"
            placeholder="Add notes here..."
          />
          <button
            type="submit"
            className="bg-accent text-white px-4 py-2 rounded hover:bg-highlight"
          >
            Submit Note
          </button>
        </form>
      </section>
      {/* Grocery List Toggle */}
      <div className="mb-8">
        <button
          onClick={() => setShowList((s) => !s)}
          className="bg-primary text-white px-6 py-3 rounded hover:bg-highlight transition"
        >
          {showList ? "Hide Shopping List" : "Generate Shopping List"}
        </button>
      </div>

      {/* Embedded Grocery List */}
      {showList && (
        <section className="mb-8">
          <GroceryList recipeIds={[parseInt(id, 10)]} />
        </section>
      )}
    </div>
  );
};

export default RecipeDetail;
