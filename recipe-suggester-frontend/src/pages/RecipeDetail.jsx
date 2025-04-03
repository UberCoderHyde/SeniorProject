import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRecipeById } from "../services/recipeService";
import { FaStar } from "react-icons/fa";
import { API_BASE_URL } from "../config";

import { getAuthHeaders } from "../services/recipeService"; // make sure this is exported


const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, review_text: "" });

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const data = await fetchRecipeById(id);
        setRecipe(data);
        const res = await fetch(`${API_BASE_URL}/recipes/${id}/reviews/`);
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
        headers: getAuthHeaders(), // ✅ use your token-based headers
        body: JSON.stringify(newReview),
      });
  
      if (!res.ok) {
        throw new Error("Unauthorized or failed submission.");
      }
  
      const created = await res.json();
      setReviews([...reviews, created]);
      setNewReview({ rating: 5, review_text: "" });
    } catch (err) {
      console.error("Error submitting review", err);
      setError("You must be logged in to submit a review.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400 inline" />);
    }
    return stars;
  };

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

  let ingredientsArray = [];
  if (Array.isArray(recipeIngred)) {
    ingredientsArray = recipeIngred;
  } else if (typeof recipeIngred === "string") {
    try {
      const parsed = JSON.parse(recipeIngred);
      ingredientsArray = Array.isArray(parsed) ? parsed : [];
    } catch {
      ingredientsArray = recipeIngred
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
    }
  }

  const steps =
    instructions && instructions.includes("\n")
      ? instructions.split("\n").filter((step) => step.trim() !== "")
      : [instructions];

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

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review, index) => (
              <li key={index} className="border-b pb-2">
                <div className="text-yellow-400">{renderStars(review.rating)}</div>
                <p className="text-sm text-gray-200 mt-1">{review.review_text}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleReviewSubmit} className="mt-6">
          <h3 className="text-xl mb-2">Leave a Review</h3>
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
            className="bg-black text-white border border-gray-600 rounded px-2 py-1 mb-2"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>{num} Star{num > 1 && 's'}</option>
            ))}
          </select>
          <textarea
            value={newReview.review_text}
            onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
            className="w-full bg-black text-white border border-gray-600 rounded p-2 mb-2"
            placeholder="Write your review here..."
          />
          <button
            type="submit"
            className="bg-accent text-white px-4 py-2 rounded hover:bg-highlight transition"
          >
            Submit Review
          </button>
        </form>
      </section>

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
