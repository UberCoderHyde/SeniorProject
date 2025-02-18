import React, { useEffect, useState } from "react";
import { fetchIngredients } from "../services/ingredientService";

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getIngredients = async () => {
      try {
        const data = await fetchIngredients();
        setIngredients(data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      } finally {
        setLoading(false);
      }
    };

    getIngredients();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-primary mb-4">Ingredients</h1>
      {ingredients.length === 0 ? (
        <p className="text-secondary">No ingredients found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((ingredient) => (
            <div key={ingredient.id} className="border p-4 rounded shadow">
              <h2 className="font-bold text-lg">{ingredient.name}</h2>
              {ingredient.unit && <p>Unit: {ingredient.unit}</p>}
              {ingredient.description && <p>{ingredient.description}</p>}
            </div>
            // Alternatively, use a separate component like <IngredientCard ingredient={ingredient} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Ingredients;
