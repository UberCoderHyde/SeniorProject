const API_BASE_URL = "http://localhost:8000/api";

export const loginUser = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}-token-auth/`, {  // Alternatively: http://localhost:8000/api-token-auth/
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: email, password }), // DRF's token auth by default uses "username" field. If you use a custom user model and authentication backend that uses email, adjust accordingly.
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return await response.json(); // This returns {"token": "YOUR_TOKEN"}
};

export const registerUser = async ({ email, username, first_name, last_name, password }) => {
  const response = await fetch(`${API_BASE_URL}/user/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, username, first_name, last_name, password }),
  });
  if (!response.ok) {
    throw new Error("Registration failed");
  }
  return await response.json();
};