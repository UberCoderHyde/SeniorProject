const API_BASE_URL = "http://localhost:8000/api";

export const fetchIngredients = async () => {
  const response = await fetch(`${API_BASE_URL}/ingredients/`);
  if (!response.ok) {
    throw new Error("Failed to fetch ingredients");
  }
  return await response.json();
};
