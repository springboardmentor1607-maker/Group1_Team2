import React from "react";
import "../styles/dashboard.css";

function StatusCard({ icon, title, count }) {
  return (
    <div className="status-card">
      <div className="status-icon">{icon}</div>
      <h4>{title}</h4>
      <h2>{count}</h2>
    </div>
  );
}

export default StatusCard;
