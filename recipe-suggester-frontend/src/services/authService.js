const API_BASE_URL = "http://127.0.0.1:8000/api/users"; // Adjust backend URL if needed

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Login failed");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const registerUser = async (email, username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });
    if (!response.ok) {
      throw new Error("Registration failed");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
