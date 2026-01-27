// components/UserManagement.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";
import admin from "./Pictures/admin.png";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const Back_End_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${Back_End_URL}/api/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${Back_End_URL}/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  const updateUserTeam = async (userId, newTeam) => {
    try {
      await axios.put(
        `${Back_End_URL}/api/auth/admin/users/${userId}/team`,
        { team: newTeam },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      console.error("Error updating user team:", error);
      alert("Failed to update user team");
    }
  };

  // Filter users based on role and search term
  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === "all" || user.Role === filter;
    const matchesSearch = user.User_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.Email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management-container">
      <div className="management-header">
        <h1>User Management</h1>
        <p>Manage user roles and team assignments</p>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={filter === "all" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("all")}
          >
            All Users
          </button>
          <button 
            className={filter === "admin" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("admin")}
          >
            Admins
          </button>
          <button 
            className={filter === "user" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("user")}
          >
            Users
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.ID} className="user-row">
                <td className="user-info">
                  <div className="user-avatar">
                    <img
                      src={
                        user.Profile_Url
                          ? (user.Profile_Url.startsWith("http") ? user.Profile_Url : `${Back_End_URL}${user.Profile_Url}`)
                          : admin
                      }
                      alt={user.User_Name}
                      onError={(e) => { e.target.onerror = null; e.target.src = admin; }}
                    />
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.User_Name}</div>
                  </div>
                </td>
                
                <td className="user-email">{user.Email}</td>
                
                <td className="role-cell">
                  <select
                    value={user.Role}
                    onChange={(e) => updateUserRole(user.ID, e.target.value)}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <span className={`role-badge ${user.Role}`}>
                    {user.Role}
                  </span>
                </td>
                
                <td className="team-cell">
                  <select
                    value={user.Team}
                    onChange={(e) => updateUserTeam(user.ID, e.target.value)}
                    className="team-select"
                  >
                    <option value="Development">Development</option>
                    <option value="QA">QA Team</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                  </select>
                  <span className="team-badge">{user.Team}</span>
                </td>
                
                
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.Role === 'admin').length}</h3>
          <p>Admins</p>
        </div>
        <div className="stat-card">
          <h3>{users.filter(u => u.Role === 'user').length}</h3>
          <p>Regular Users</p>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;