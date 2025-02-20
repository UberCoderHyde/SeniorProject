const API_BASE_URL = "http://127.0.0.1:8000/api/users";

export const registerUser = async ({ email, username, password }) => {
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
};

export const loginUser = async ({ email, password }) => {
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
};
