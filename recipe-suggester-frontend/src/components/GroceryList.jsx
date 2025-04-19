import React, { useState, useEffect } from "react";
import { fetchGroceryList } from "../services/recipeService";

const GroceryList = ({ recipeIds }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchGroceryList(recipeIds);
        setList(data);
      } catch (err) {
        console.error(err);
        setError("Could not load grocery list.");
      } finally {
        setLoading(false);
      }
    })();
  }, [recipeIds]);

  const downloadTxt = () => {
    const content = list.map((ing) => `- ${ing.name}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grocery-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p>Loading grocery list…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-2">Grocery List</h2>
      {list.length === 0 ? (
        <p>You have all ingredients on hand!</p>
      ) : (
        <>
          <ul className="list-disc list-inside mb-4">
            {list.map((ing) => (
              <li key={ing.id}>{ing.name}</li>
            ))}
          </ul>
          <button
            onClick={downloadTxt}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-highlight"
          >
            Download as TXT
          </button>
        </>
      )}
    </div>
  );
};

export default GroceryList;
// This component fetches the grocery list based on selected recipe IDs and allows the user to download it as a TXT file. It handles loading and error states gracefully.