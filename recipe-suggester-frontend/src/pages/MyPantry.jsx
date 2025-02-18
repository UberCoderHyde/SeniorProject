import React, { useEffect, useState } from "react";
import { fetchPantryItems } from "../services/pantryService";

const MyPantry = () => {
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

    getPantryItems();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-primary mb-4">My Pantry</h1>
      {pantryItems.length === 0 ? (
        <p className="text-secondary">Your pantry is empty. Start by adding some ingredients.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pantryItems.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow">
              <h2 className="font-bold text-lg">{item.ingredient.name}</h2>
              <p>
                Quantity: {item.quantity} {item.ingredient.unit || ""}
              </p>
            </div>
            // Alternatively, use a separate component like <PantryItemCard item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPantry;
