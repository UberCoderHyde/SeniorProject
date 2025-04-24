// src/components/Profile.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import {
  fetchPantryItems,
  fetchTrendingIngredients,
} from "../services/ingredientService";

// — Axios global configuration —
axios.defaults.baseURL        = "http://localhost:8000/api";
axios.defaults.withCredentials = false;  // token auth

const Profile = () => {
  const { user, token, setUser } = useAuth();
  const [pantryItems, setPantryItems]             = useState([]);
  const [trendingIngredients, setTrendingIngredients] = useState([]);
  const [loadingPantry, setLoadingPantry]         = useState(true);
  const [loadingTrending, setLoadingTrending]     = useState(true);
  const [error, setError]                         = useState("");
  const [uploadError, setUploadError]             = useState("");
  const [uploading, setUploading]                 = useState(false);
  const fileInputRef                              = useRef();

  // 1) attach token to all requests
  useEffect(() => {
    if (token) axios.defaults.headers.common["Authorization"] = `Token ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }, [token]);

  // 2) on mount (or token change) fetch the fresh profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await axios.get("/users/profile/");
        // if your view returns { user: {...} }, do setUser(data.user)
        setUser(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    if (token) loadProfile();
  }, [token, setUser]);

  // open file picker
  const handleClick = () => fileInputRef.current.click();

  // upload new profile picture
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const { data } = await axios.patch(
        "/users/profile/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUser(data);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  // load pantry items
  useEffect(() => {
    const loadPantry = async () => {
      try {
        const resp = await axios.get("/pantry/");
        setPantryItems(resp.data);
      } catch (err) {
        console.error("Error fetching pantry items:", err);
        setError("Failed to load pantry items.");
      } finally {
        setLoadingPantry(false);
      }
    };
    if (user) loadPantry();
    else setLoadingPantry(false);
  }, [user]);

  // load trending ingredients
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const resp = await axios.get("/ingredients/trending/");
        setTrendingIngredients(resp.data);
      } catch (err) {
        console.error("Error fetching trending ingredients:", err);
      } finally {
        setLoadingTrending(false);
      }
    };
    if (user) loadTrending();
    else setLoadingTrending(false);
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center space-x-4 mb-6">
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={`${user.first_name}'s avatar`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center">
              <span className="text-xl font-bold">
                {user.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-gray-300">{user.email}</p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            onClick={handleClick}
            className="ml-6 px-3 py-1 bg-red-500 rounded text-white"
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Change Profile Picture"}
          </button>
        </div>

        {uploadError && <p className="text-red-500 mb-4">{uploadError}</p>}

        {/* My Pantry */}
        <h2 className="text-2xl font-semibold mb-4">My Pantry</h2>
        {loadingPantry ? (
          <p>Loading pantry items...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : pantryItems.length === 0 ? (
          <p>Your pantry is empty. Add some ingredients!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {pantryItems.map((item) => (
              <div key={item.id} className="border p-4 rounded bg-gray-800">
                <h3 className="font-bold text-lg">
                  {item.ingredient.name}
                </h3>
              </div>
            ))}
          </div>
        )}

        {/* Trending Ingredients */}
        <h2 className="text-2xl font-semibold mb-4">
          Trending Ingredients
        </h2>
        {loadingTrending ? (
          <p>Loading trending ingredients...</p>
        ) : trendingIngredients.length === 0 ? (
          <p>No trending ingredients at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingIngredients.map((ing) => (
              <div
                key={ing.id}
                className="border p-4 rounded bg-gray-800"
              >
                <h3 className="font-bold text-lg">{ing.name}</h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
