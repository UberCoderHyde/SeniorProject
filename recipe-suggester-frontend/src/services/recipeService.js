const API_BASE_URL = "http://localhost:8000/api";

// Helper function to get the token from localStorage
export const getAuthHeaders = () => {
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
    if (!response.ok) throw new Error("Failed to fetch recipe");
    return await response.json();
  } catch (error) {
    console.error("Error in fetchRecipeById:", error);
    throw error;
  }
};

export const fetchNotes = async (recipeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/notes/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to load notes");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in fetchNotes:", error);
    throw error;
  }
};

export const createNote = async (recipeId, noteText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/notes/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content: noteText }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to create note");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in createNote:", error);
    throw error;
  }
};

export const fetchIngredients = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredients/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch ingredients");
    return await response.json();
  } catch (error) {
    console.error("Error in fetchIngredients:", error);
    throw error;
  }
};

export const fetchRecipes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch recipes");
    return await response.json();
  } catch (error) {
    console.error("Error in fetchRecipes:", error);
    throw error;
  }
};

export const fetchPantryItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pantry/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch pantry items");
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
    if (!response.ok) throw new Error("Failed to add pantry item");
    return await response.json();
  } catch (error) {
    console.error("Error in addPantryItem:", error);
    throw error;
  }
};

export const fetchPaginatedRecipes = async ({ diet, favorite, random, sort, page = 1 }) => {
  const params = new URLSearchParams();
  if (diet) params.append("diet", diet);
  if (favorite) params.append("favorite", "true");
  if (random) params.append("random", "true");
  if (sort) params.append("sort", sort);
  params.append("page", page);

  try {
    const response = await fetch(`${API_BASE_URL}/recipes/browse/?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch paginated recipes");
    return await response.json();
  } catch (error) {
    console.error("Error in fetchPaginatedRecipes:", error);
    throw error;
  }
};

export const toggleFavorite = async (recipeId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/toggle-favorite/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Token ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to toggle favorite");
    return await response.json();
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
    throw error;
  }
};

export const fetchGroceryList = async (recipeIds = []) => {
  if (!recipeIds.length) return [];
  const qs = recipeIds.join(",");
  try {
    const response = await fetch(`${API_BASE_URL}/grocery-list/?recipes=${qs}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch grocery list");
    return await response.json();
  } catch (error) {
    console.error("Error in fetchGroceryList:", error);
    throw error;
  }
};
