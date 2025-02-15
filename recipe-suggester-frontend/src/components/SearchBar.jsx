import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-center">
      <input
        type="text"
        placeholder="Search recipes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button
        type="submit"
        className="bg-primary text-white rounded-r px-4 py-2 hover:bg-highlight transition"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
