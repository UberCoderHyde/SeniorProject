// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { fetchPantryItems } from "../services/ingredientService";

const Profile = () => {
  const { user } = useAuth();
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getPantryItems = async () => {
      try {
        const data = await fetchPantryItems();
        setPantryItems(data);
      } catch (error) {
        console.error("Error fetching pantry items:", error);
        setError("Failed to load pantry items.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      getPantryItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.first_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center">
              <span className="text-xl font-bold">
                {user.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-300">{user.email}</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">My Pantry</h2>
        {loading ? (
          <p>Loading pantry items...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : pantryItems.length === 0 ? (
          <p>Your pantry is empty. Add some ingredients!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pantryItems.map((item) => (
              <div key={item.id} className="border p-4 rounded bg-gray-800">
                <h3 className="font-bold text-lg">{item.ingredient.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
