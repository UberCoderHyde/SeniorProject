import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-primary mb-4">Welcome to Recipe Suggester</h1>
      <p className="mb-6">Find recipes based on your ingredients and save money!</p>
      <Link to="/recipes" className="bg-primary text-white px-6 py-3 rounded hover:bg-highlight transition">
        View Recipes
      </Link>
    </div>
  );
};

export default Home;
