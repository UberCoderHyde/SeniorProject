import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Ingredients from "./pages/Ingredients";
import MyPantry from "./pages/MyPantry";
import AddPantryItem from "./pages/AddPantryItem";

function App() {
  return (
    <main className="bg-tertiary">
    <AuthProvider>
      <Router>
        <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pantry" element={<MyPantry />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/add-ingredient" element={<AddPantryItem />} />
            </Routes>
        <Footer />
      </Router>
    </AuthProvider>
    </main>
  );
}

export default App;
