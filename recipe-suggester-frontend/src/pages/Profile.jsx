import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { fetchPantryItems } from "../services/pantryService";

const Profile = () => {
  const { user } = useAuth();
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPantryItems = async () => {
      try {
        const data = await fetchPantryItems();
        setPantryItems(data);
      } catch (error) {
        console.error("Error fetching pantry items:", error);
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
    return <div className="p-6">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center">
              <span className="text-xl font-bold">{user.username.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-primary">{user.username}</h1>
            <p className="text-gray-300">{user.email}</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4">My Pantry</h2>
        {loading ? (
          <p>Loading pantry items...</p>
        ) : pantryItems.length === 0 ? (
          <p>Your pantry is empty. Add some ingredients!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pantryItems.map((item) => (
              <div key={item.id} className="border p-4 rounded bg-gray-800">
                <h3 className="font-bold text-lg">{item.ingredient.name}</h3>
                <p>
                  Quantity: {item.quantity} {item.ingredient.unit || ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
