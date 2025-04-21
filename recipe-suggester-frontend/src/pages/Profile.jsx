import React, { useEffect, useState, useRef } from "react";
import useAuth from "../hooks/useAuth";
import {
  fetchPantryItems,
  fetchTrendingIngredients,
} from "../services/ingredientService";

const Profile = () => {
  const { user } = useAuth();
  const [pantryItems, setPantryItems] = useState([]);
  const [trendingIngredients, setTrendingIngredients] = useState([]);
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File:", file.name);
      // Update Profile Picture for User
      // user.profile_picture = file.name;
    }
  };
  // Load pantry items
  useEffect(() => {
    const loadPantry = async () => {
      try {
        const data = await fetchPantryItems();
        setPantryItems(data);
      } catch (err) {
        console.error("Error fetching pantry items:", err);
        setError("Failed to load pantry items.");
      } finally {
        setLoadingPantry(false);
      }
    };
    if (user) loadPantry();
    else setLoadingPantry(false);
  }, [user]);

  // Load trending ingredients (#53)
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await fetchTrendingIngredients();
        setTrendingIngredients(data);
      } catch (err) {
        console.error("Error fetching trending ingredients:", err);
      } finally {
        setLoadingTrending(false);
      }
    };
    if (user) loadTrending();
    else setLoadingTrending(false);
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
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            onClick={handleClick}
            className="text-2x1 font-bold"
            style={{
              marginLeft: '30px',
              padding: '5px 9px',
              backgroundColor: 'rgb(255 99 71 / var(--tw-bg-opacity, 1))',
              border: 'none',
              borderRadius: '3px',
            }}
          >
            Change Profile Picture
          </button>
          <p className="text-gray-300"></p>
        </div>

        {/* My Pantry */}
        <h2 className="text-2xl font-semibold mb-4">My Pantry</h2>
        {loadingPantry ? (
          <p>Loading pantry items...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : pantryItems.length === 0 ? (
          <p>Your pantry is empty. Add some ingredients!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {pantryItems.map((item) => (
              <div
                key={item.id}
                className="border p-4 rounded bg-gray-800"
              >
                <h3 className="font-bold text-lg">
                  {item.ingredient.name}
                </h3>
              </div>
            ))}
          </div>
        )}

        {/* Trending Ingredients */}
        <h2 className="text-2xl font-semibold mb-4">
          Trending Ingredients
        </h2>
        {loadingTrending ? (
          <p>Loading trending ingredients...</p>
        ) : trendingIngredients.length === 0 ? (
          <p>No trending ingredients at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingIngredients.map((ing) => (
              <div
                key={ing.id}
                className="border p-4 rounded bg-gray-800"
              >
                <h3 className="font-bold text-lg">{ing.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
