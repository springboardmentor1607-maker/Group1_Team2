import React, { useState, useEffect } from "react";
import { api } from "../lib/api";

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    role: ""
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const user = response.user;
      
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} of CleanStreet`,
        role: user.role || "citizen"
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="fs-2 fw-bold text-body mb-4">
        Edit Profile
      </h1>

      <div className="row g-4">

        {/* Left Profile Card */}
        <div className="col-12 col-md-4">
          <div className="card border shadow-sm p-4 rounded-xl h-100">
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3" style={{ width: '5rem', height: '5rem' }}>
                {formData.fullName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <h2 className="mt-3 fs-5 fw-semibold text-body">
                {formData.fullName}
              </h2>

              <p className="text-body-secondary small">
                @{formData.fullName.toLowerCase().replace(" ", "_")}
              </p>

              <span className="mt-2 badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Account Info */}
        <div className="col-12 col-md-8">
          <div className="card border shadow-sm p-4 rounded-xl">
            <h2 className="fs-5 fw-semibold mb-4 text-body">
              Account Information
            </h2>

            <div className="row g-3">
              <div className="col-md-6">
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Full Name"
                />
              </div>

              <div className="col-md-6">
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Email"
                />
              </div>

              <div className="col-md-6">
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Phone Number"
                />
              </div>

              <div className="col-md-6">
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Location"
                />
              </div>
            </div>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-control mt-3"
              placeholder="Bio"
              rows="4"
            />

            <button
              onClick={handleSave}
              className="btn btn-primary mt-4 px-4 py-2"
            >
              Save Changes
            </button>

            {saved && (
              <p className="mt-3 text-success fw-medium">
                Profile updated successfully!
              </p>
            )}

            {error && (
              <p className="mt-3 text-danger fw-medium">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}