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
                Citizen
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
          </div>
        </div>
      </div>
    </div>
  );
}