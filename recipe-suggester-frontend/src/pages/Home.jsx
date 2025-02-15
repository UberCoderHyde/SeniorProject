import React from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const Home = () => {
  return (
    <div className="min-h-screen bg-tertiary flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold text-primary mb-4">Recipe Suggester</h1>
      <p className="text-lg text-secondary mb-6">
        Find recipes based on the ingredients you have at home.
      </p>
      <SearchBar onSearch={(query) => console.log("Searching for", query)} />
      <div className="mt-8">
        <Link
          to="/recipes"
          className="bg-primary text-white px-6 py-3 rounded hover:bg-highlight transition"
        >
          Browse Recipes
        </Link>
      </div>
    </div>
  );
};

export default Home;
