const API_BASE_URL = "http://localhost:8000/api";

// Helper function to get the token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
};
export const fetchRecipeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch recipe");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export const fetchIngredients = async () => {
  const response = await fetch(`${API_BASE_URL}/ingredients/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch ingredients");
  }
  return await response.json();
};

export const fetchRecipes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const fetchPantryItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pantry/`, {
      headers: getAuthHeaders(),
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

export const addPantryItem = async ({ ingredient_id, quantity }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pantry/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ingredient_id, quantity }),
    });
    if (!response.ok) {
      throw new Error("Failed to add pantry item");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in addPantryItem:", error);
    throw error;
  }
};
