import React, { useState, useEffect } from "react";
import { fetchIngredients, addIngredient, addPantryItem } from "../services/ingredientService";

const AddPantryItemMultiSelect = () => {
  const [ingredients, setIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("");
  const [newIngredientDescription, setNewIngredientDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch all ingredients on component mount.
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

  // Filter ingredients based on the search query.
  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle ingredient selection.
  const toggleSelection = (ingredientId) => {
    if (selectedIngredients.includes(ingredientId)) {
      setSelectedIngredients(selectedIngredients.filter((id) => id !== ingredientId));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientId]);
    }
  };

  // If no ingredients match and the search query is non-empty, allow adding it as a new ingredient.
  const handleAddNewIngredientToggle = () => {
    setIsAddingNew(true);
    setNewIngredientName(searchQuery);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalSelected = [...selectedIngredients];

      // If the user opts to add a new ingredient, add it and include its ID.
      if (isAddingNew) {
        const newIng = await addIngredient({
          name: newIngredientName,
          unit: newIngredientUnit,
          description: newIngredientDescription,
        });
        finalSelected.push(newIng.id);
        // Optionally update the ingredients list.
        setIngredients((prev) => [...prev, newIng]);
        setIsAddingNew(false);
        setNewIngredientName("");
        setNewIngredientUnit("");
        setNewIngredientDescription("");
      }

      // Loop through each selected ingredient and add it to the pantry.
      for (const id of finalSelected) {
        try {
          await addPantryItem({ ingredient_id: id });
        } catch (err) {
          // Optionally, ignore duplicate errors or show an error message.
          console.error(`Error adding ingredient with id ${id}:`, err);
        }
      }
      setMessage("Pantry items added successfully!");
      setError("");
      setSelectedIngredients([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Error adding pantry items:", err);
      setError("Failed to add pantry items.");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Add Pantry Items</h1>
        {message && <p className="text-green-500 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded">
          <label className="block mb-4">
            <span className="text-gray-200">Search Ingredients</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded"
              placeholder="Type an ingredient..."
            />
          </label>
          <div className="mb-4">
            <p className="text-gray-200 mb-2">Select Ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {filteredIngredients.map((ing) => (
                <button
                  key={ing.id}
                  type="button"
                  onClick={() => toggleSelection(ing.id)}
                  className={`px-3 py-1 rounded transition ${
                    selectedIngredients.includes(ing.id)
                      ? "bg-primary text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {ing.name}
                </button>
              ))}
            </div>
          </div>
          {filteredIngredients.length === 0 && searchQuery.trim() !== "" && !isAddingNew && (
            <div className="mb-4">
              <p className="text-gray-200">No matching ingredients found.</p>
              <button
                type="button"
                onClick={handleAddNewIngredientToggle}
                className="mt-2 bg-primary text-white px-4 py-2 rounded hover:bg-highlight transition"
              >
                Add "{searchQuery}" as a new ingredient
              </button>
            </div>
          )}
          {isAddingNew && (
            <div className="mb-4">
              <label className="block mb-2">
                <span className="text-gray-200">New Ingredient Name</span>
                <input
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded"
                  required
                />
              </label>
            </div>
          )}
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

export default AddPantryItemMultiSelect;
