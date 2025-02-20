const API_BASE_URL = "http://127.0.0.1:8000/api";

export const fetchPantryItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pantry/`, {
      credentials: "include", // include cookies if using session authentication
    });
    if (!response.ok) {
      throw new Error("Failed to fetch pantry items");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchPantryItems:", error);
    throw error;
  }
};
