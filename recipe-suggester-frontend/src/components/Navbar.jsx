import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-primary text-white py-4 shadow-md">
      {/* Fixed container width */}
      <div className="mx-auto max-w-screen-xl flex justify-between items-center px-4">
        <div className="flex-shrink-0">
          <Link to="/" className="text-2xl font-bold">
            Recipe Suggester
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/recipes" className="hover:underline">
            Recipes
          </Link>
          {user ? (
            <>
              <span className="font-semibold">Hi, {user.first_name}</span>
              <Link to="/add-ingredient" className="hover:underline">
                Add Ingredient
              </Link>
              <Link to="/profile" className="hover:underline">
                Profile
              </Link>
              <button onClick={logout} className="hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
