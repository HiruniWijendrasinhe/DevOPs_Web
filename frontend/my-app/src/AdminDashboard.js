// components/AdminDashboard.js
import React, { useState } from "react";

import UserManagement from "./UserManagement";
import CreateIncident from "./CreateIncident";
import "./AdminDashboard.css";

// Wrapper to show only the incident list for admin reports
function IncidentReportsView() {
  // Render CreateIncident, hide create/refresh actions, headings, and use admin styling
  return <div className="admin-incident-reports"><CreateIncident hideCreateActions showResolverAssign hideHeadings adminAssignedStyle /></div>;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your incident management system</p>
        {/* Removed + and refresh buttons from right corner */}
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === "users" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("users")}
        >
           User Management
        </button>
        <button 
          className={activeTab === "reports" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("reports")}
        >
           Reports
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "users" && <UserManagement />}
        {activeTab === "reports" && (
          <div className="reports-tab-content">
            <h2>Incident Reports</h2>
            <div style={{marginTop: '2rem'}}>
              <IncidentReportsView />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;