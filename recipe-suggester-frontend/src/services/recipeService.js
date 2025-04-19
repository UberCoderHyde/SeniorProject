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

export const fetchPaginatedRecipes = async ({ diet, favorite, random, sort, page = 1 }) => {
  const params = new URLSearchParams();

  if (diet) params.append("diet", diet);
  if (favorite) params.append("favorite", "true");
  if (random) params.append("random", "true");
  if (sort) params.append("sort", sort);
  params.append("page", page);

  const response = await fetch(`${API_BASE_URL}/recipes/browse/?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch paginated recipes");
  }

  return await response.json();
};
export const toggleFavorite = async (recipeId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/toggle-favorite/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Token ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to toggle favorite");
  }

  return response.json();
};
export const fetchGroceryList = async (recipeIds=[]) => {
  if (!recipeIds.length) return [];
  const qs = recipeIds.join(",");
  const res = await fetch(`${API}/grocery-list/?recipes=${qs}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch grocery list");
  return await res.json();  // array of { id, name, ... }
};
