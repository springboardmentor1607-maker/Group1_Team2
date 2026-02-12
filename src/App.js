import React from "react";
import "./App.css";
import { FaExclamationTriangle, FaClock, FaSpinner, FaCheckCircle } from "react-icons/fa";

function App() {
  // Dummy data (0 for now, will update dynamically later)
  const totalIssues = 0;
  const pending = 0;
  const inProgress = 0;
  const resolved = 0;

  const recentActivities = []; // Empty for now

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <h1 className="logo">CleanStreet</h1>
        <div className="auth-buttons">
          <button className="btn-outline">Login</button>
          <button className="btn-outline">Register</button>
        </div>
      </header>

      {/* Cards Section */}
      <div className="cards">
        <div className="card glow">
          <FaExclamationTriangle />
          <h3>Total Issues</h3>
          <p>{totalIssues}</p>
        </div>

        <div className="card glow">
          <FaClock />
          <h3>Pending</h3>
          <p>{pending}</p>
        </div>

        <div className="card glow">
          <FaSpinner />
          <h3>In Progress</h3>
          <p>{inProgress}</p>
        </div>

        <div className="card glow">
          <FaCheckCircle />
          <h3>Resolved</h3>
          <p>{resolved}</p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="recent-activity glow-box">
          <h2>Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <div className="empty-state">
              ✨ No activity yet.
              <br />
              Be the first to report an issue!
            </div>
          ) : (
            <ul>
              {recentActivities.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="quick-actions glow-box">
          <h2>Quick Actions</h2>
          <button className="btn-primary">+ Report New Issue</button>
          <button className="btn-primary">View All Complaints</button>
          <button className="btn-primary">Issue Map</button>
        </div>
      </div>
    </div>
  );
}

export default App;