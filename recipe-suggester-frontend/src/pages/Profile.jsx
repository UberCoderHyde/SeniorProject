import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);

  // Placeholder: Replace with an API call to fetch user profile data.
  useEffect(() => {
    const userData = {
      id: 1,
      username: "johndoe",
      email: "johndoe@example.com",
      bio: "I love cooking and trying new recipes.",
      profile_picture: "https://via.placeholder.com/150",
    };
    setUser(userData);
  }, []);

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-tertiary p-6 flex flex-col items-center">
      <div className="bg-white rounded-full overflow-hidden w-32 h-32 mb-4">
        <img
          src={user.profile_picture}
          alt={user.username}
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-3xl font-bold text-primary mb-2">{user.username}</h1>
      <p className="text-gray-700 mb-2">{user.email}</p>
      <p className="text-gray-600 max-w-md text-center">{user.bio}</p>
    </div>
  );
};

export default Profile;
