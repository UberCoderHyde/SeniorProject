const API_BASE_URL = "http://127.0.0.1:8000/api"; // Update if needed

export const fetchIngredients = async () => {
  const response = await fetch(`${API_BASE_URL}/ingredients/`);
  if (!response.ok) {
    throw new Error("Failed to fetch ingredients");
  }
  return await response.json();
};
