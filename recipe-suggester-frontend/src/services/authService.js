// src/services/authService.js
const API_BASE_URL = "http://localhost:8000/api/users";

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Our custom login view accepts "email" and "password"
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return await response.json(); // Expected format: { token: "YOUR_TOKEN", user: { ... } }
};

export const registerUser = async ({ email, username, first_name, last_name, password }) => {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, username, first_name, last_name, password }),
  });
  if (!response.ok) {
    throw new Error("Registration failed");
  }
  return await response.json(); // Expected format: { user: { ... } }
};
