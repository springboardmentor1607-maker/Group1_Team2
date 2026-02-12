import React from "react";
import Navbar from "../components/Navbar";
import StatusCard from "../components/StatusCard";
import RecentActivity from "../components/RecentActivity";
import QuickActions from "../components/QuickActions";

import {
  FaExclamationTriangle,
  FaClock,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="status-section">
        <StatusCard
          icon={<FaExclamationTriangle />}
          title="Total Issues"
          count="0"
        />
        <StatusCard
          icon={<FaClock />}
          title="Pending"
          count="0"
        />
        <StatusCard
          icon={<FaSpinner />}
          title="In Progress"
          count="0"
        />
        <StatusCard
          icon={<FaCheckCircle />}
          title="Resolved"
          count="0"
        />
      </div>

      <div className="bottom-section">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  );
}

export default Dashboard;