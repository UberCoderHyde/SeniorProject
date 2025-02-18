const API_BASE_URL = "http://127.0.0.1:8000/api"; // Update if needed

export const fetchPantryItems = async () => {
  const response = await fetch(`${API_BASE_URL}/pantry/`, {
    credentials: "include", // if authentication is needed
  });
  if (!response.ok) {
    throw new Error("Failed to fetch pantry items");
  }
  return await response.json();
};
