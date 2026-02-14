import React, { useState } from "react";

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: "Demo User",
    email: "demo@gmail.com",
    phone: "9876543210",
    location: "Coimbatore",
    bio: "Citizen of CleanStreet",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Here you can later connect backend API
    console.log("Saved Data:", formData);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Profile Card */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
              {formData.fullName
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {formData.fullName}
            </h2>

            <p className="text-gray-500 dark:text-gray-400">
              @{formData.fullName.toLowerCase().replace(" ", "_")}
            </p>

            <span className="mt-3 px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
              Citizen
            </span>
          </div>
        </div>

        {/* Right Account Info */}
        <div className="md:col-span-2 bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white"
              placeholder="Full Name"
            />

            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white"
              placeholder="Email"
            />

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white"
              placeholder="Phone Number"
            />

            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white"
              placeholder="Location"
            />
          </div>

          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="mt-4 w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white"
            placeholder="Bio"
            rows="4"
          />

          <button
            onClick={handleSave}
            className="mt-6 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>

          {saved && (
            <p className="mt-4 text-green-600 dark:text-green-400 font-medium">
              Profile updated successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}