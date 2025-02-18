const API_BASE_URL = "http://127.0.0.1:8000/api"; // Adjust your backend URL if needed

export const fetchRecipes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/`);
    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchRecipeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch recipe");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
