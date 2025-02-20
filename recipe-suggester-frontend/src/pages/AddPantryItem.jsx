import React, { useState, useEffect } from "react";
import { fetchIngredients, addPantryItem, addIngredient } from "../services/pantryService";

const AddPantryItem = () => {
  // For existing ingredients
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [quantity, setQuantity] = useState("");

  // For adding a new ingredient if needed
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("");
  const [newIngredientDescription, setNewIngredientDescription] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch available ingredients on mount
  useEffect(() => {
    const getIngredients = async () => {
      try {
        const data = await fetchIngredients();
        setIngredients(data);
      } catch (err) {
        console.error("Error fetching ingredients:", err);
        setError("Failed to load ingredients.");
      }
    };
    getIngredients();
  }, []);

  const handleIngredientChange = (e) => {
    const value = e.target.value;
    setSelectedIngredient(value);
    // If user selects the "new" option, show new ingredient fields.
    if (value === "new") {
      setIsAddingNew(true);
    } else {
      setIsAddingNew(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let ingredientId = selectedIngredient;

      // If the user is adding a new ingredient:
      if (isAddingNew) {
        const newIng = await addIngredient({
          name: newIngredientName,
          unit: newIngredientUnit,
          description: newIngredientDescription,
        });
        ingredientId = newIng.id;
        // Optionally, refresh the ingredients list
        setIngredients((prev) => [...prev, newIng]);
      }

      // Now add the pantry item using the determined ingredientId.
      await addPantryItem({ ingredient_id: ingredientId, quantity });
      setMessage("Pantry item added successfully!");
      setError("");

      // Reset form fields
      setSelectedIngredient("");
      setQuantity("");
      setIsAddingNew(false);
      setNewIngredientName("");
      setNewIngredientUnit("");
      setNewIngredientDescription("");
    } catch (err) {
      console.error("Error adding pantry item:", err);
      setError("Failed to add pantry item.");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Add Pantry Item</h1>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded">
          <label className="block mb-4">
            <span className="text-gray-200">Ingredient</span>
            <select
              value={selectedIngredient}
              onChange={handleIngredientChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded"
              required
            >
              <option value="">Select an ingredient</option>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} {ing.unit ? `(${ing.unit})` : ""}
                </option>
              ))}
              <option value="new">Add New Ingredient</option>
            </select>
          </label>

          {isAddingNew && (
            <>
              <label className="block mb-4">
                <span className="text-gray-200">New Ingredient Name</span>
                <input
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  required
                />
              </label>
              <label className="block mb-4">
                <span className="text-gray-200">Measurement Unit</span>
                <select
                  value={newIngredientUnit}
                  onChange={(e) => setNewIngredientUnit(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  required
                >
                  <option value="">Select a unit</option>
                  <option value="tsp">Teaspoon (tsp)</option>
                  <option value="tbsp">Tablespoon (tbsp)</option>
                  <option value="cup">Cup</option>
                  <option value="lb">Pound (lb)</option>
                  <option value="oz">Ounce (oz)</option>
                  <option value="g">Gram (g)</option>
                  <option value="ml">Milliliter (ml)</option>
                </select>
              </label>
              <label className="block mb-4">
                <span className="text-gray-200">Description / Conversion Info (optional)</span>
                <textarea
                  value={newIngredientDescription}
                  onChange={(e) => setNewIngredientDescription(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  rows="3"
                  placeholder="For example: 1 cup = 16 tbsp, 1 lb = 16 oz"
                ></textarea>
              </label>
            </>
          )}

          <label className="block mb-4">
            <span className="text-gray-200">Quantity</span>
            <input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-highlight transition"
          >
            Add to Pantry
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPantryItem;
