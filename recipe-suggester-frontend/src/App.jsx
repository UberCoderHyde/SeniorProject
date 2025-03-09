import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Import pages
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AddIngredient from "./pages/AddIngredient";
import AddPantryItem from "./pages/AddPantryItem";

function App() {
  return (
    <Router>
      <Navbar />
      <main className="min-h-screen bg-black text-gray-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-ingredient" element={<AddIngredient />} />
          <Route path="/add-pantry-item" element={<AddPantryItem />} />
          {/* Add additional routes as needed */}
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
