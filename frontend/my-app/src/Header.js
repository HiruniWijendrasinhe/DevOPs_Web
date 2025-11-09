// components/Header.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Alertify_new from "./Pictures/Alertify_new.png";
import admin from "./Pictures/admin.png";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [profileUrl, setProfileUrl] = useState(admin);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  const fetchUserProfile = async () => {
    try {
      if (!token) {
        setProfileUrl(admin);
        setUser(null);
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/auth/current-user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userData = response.data;
      console.log("=== DEBUG USER DATA ===");
      console.log("Full user data:", userData);
      console.log("User role:", userData.role);
      console.log("User ID:", userData.id);
      console.log("User name:", userData.username);
      const Back_End_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      // If the profileUrl is already an absolute URL (Cloudinary), use it as-is,
      // otherwise prefix with backend URL for local uploads.
      setProfileUrl(
        userData.profileUrl
          ? (userData.profileUrl.startsWith("http") ? userData.profileUrl : `${Back_End_URL}${userData.profileUrl}`)
          : admin
      );
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setProfileUrl(admin);
      setUser(null);
    }
  };

  useEffect(() => {
    // Attempt to use cached user from localStorage for instant display
    try {
      const cached = localStorage.getItem("user");
      if (cached) {
        const parsed = JSON.parse(cached);
        const Back_End_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
        setProfileUrl(parsed.profileUrl ? (parsed.profileUrl.startsWith("http") ? parsed.profileUrl : `${Back_End_URL}${parsed.profileUrl}`) : admin);
        setUser(parsed);
      }
    } catch (e) {
      // ignore parse errors and fall back to fetching
    }

    fetchUserProfile();
  }, [token]);

  // Listen for profile updates from other parts of the app (e.g. Profile page upload)
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail) {
        const data = e.detail;
        const Back_End_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
        setProfileUrl(data.profileUrl ? (data.profileUrl.startsWith("http") ? data.profileUrl : `${Back_End_URL}${data.profileUrl}`) : admin);
        setUser(data);
      } else {
        // fallback: re-fetch
        fetchUserProfile();
      }
    };

    window.addEventListener("profileUpdated", handler);
    return () => window.removeEventListener("profileUpdated", handler);
  }, [token]);

  const handleAdminClick = () => {
    if (token) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfileUrl(admin);
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="NaviBack">
      <div className="TopBar">
        <img src={Alertify_new} alt="Logo" className="Logo" />
        <div className="NewBar">
          <ul className="NaviBar">
            {/* Always show these navigation links */}
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/incidents">Report</Link></li>
            <li><Link to="/progress">Progress</Link></li>
            <li><Link to="/contact">ContactUs</Link></li>
            
            {/* Show Admin Dashboard link only for admins */}
            {user && user.role === 'admin' && (
              <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
            )}
            
            {/* Show Login/Signup or Logout based on authentication */}
            {!token ? (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">SignUp</Link></li>
              </>
            ) : (
              <li>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Profile icon */}
        <img
          src={profileUrl}
          alt="Profile"
          className="AdminIcon"
          onClick={handleAdminClick}
          style={{ cursor: "pointer" }}
          onError={(e) => { e.target.onerror = null; e.target.src = admin; }}
        />
      </div>
    </div>
  );
}

export default Header;