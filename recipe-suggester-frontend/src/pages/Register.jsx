import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: Replace with an API call for user registration.
    console.log("Registering", { email, username, password });
    // On successful registration, redirect to Home.
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tertiary p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <label className="block mb-2">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </label>
        <label className="block mb-2">
          <span className="text-gray-700">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </label>
        <label className="block mb-4">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:bg-highlight transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
