import React, { createContext, useState } from "react";

// Create the AuthContext with default value of null for user
export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

// Provider component that wraps your app and provides auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Sample login function
  const login = (userData) => {
    // In a real app, you'll call your auth API and update user accordingly.
    setUser(userData);
  };

  // Sample logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
