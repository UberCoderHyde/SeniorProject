import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
      const response = await axios.get("http://localhost:8000/api/recipes/minimal/", {
        params: { search: query },
      });

      // Safeguard: ensure we only set an array
      const data = response.data;
      if (Array.isArray(data)) {
        setResults(data);
      } else if (Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching recipes.");
      setResults([]);
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
        {Array.isArray(results) && results.length > 0 ? (
          <ul>
            {results.map((recipe) => (
              <li key={recipe.id} className="mb-4">
                <Link
                  to={`/recipes/${recipe.id}`}
                  className="block bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                  {recipe.title}
                </Link>
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
