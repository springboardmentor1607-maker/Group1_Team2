import React from "react";

function Navbar() {
  return (
    <div className="navbar">
      <h2 className="logo">CleanStreet</h2>
      <div className="nav-links">
        <span>Dashboard</span>
        <span>Report Issue</span>
        <span>View Complaints</span>
      </div>
      <div className="auth-buttons">
        <button className="login">Login</button>
        <button className="register">Register</button>
      </div>
    </div>
  );
}

export default Navbar;