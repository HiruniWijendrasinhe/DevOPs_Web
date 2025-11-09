// components/AdminDashboard.js
import React, { useState } from "react";
import UserManagement from "./UserManagement";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your incident management system</p>
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
          <div className="reports-placeholder">
            <h2>Reports & Analytics</h2>
            <p>Incident reports and analytics will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;