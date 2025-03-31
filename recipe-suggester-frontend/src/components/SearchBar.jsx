import React, { useState } from "react";
import axios from "axios";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Adjust the URL if you are using the minimal endpoint or not.
      const response = await axios.get("/api/recipes/", {
        params: { query },
      });
      setResults(response.data);
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching recipes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center justify-center">
        <input
          type="text"
          placeholder="Search recipes by ingredient or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="ml-2 bg-primary text-white rounded-r px-4 py-2 hover:bg-highlight transition"
        >
          Search
        </button>
      </form>
      {loading && <p>Loading recipes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-4">
        {results.length > 0 ? (
          <ul>
            {results.map((recipe) => (
              <li key={recipe.id} className="mb-4">
                <h3 className="font-bold">{recipe.title}</h3>
                {/* Optionally render additional recipe details */}
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
