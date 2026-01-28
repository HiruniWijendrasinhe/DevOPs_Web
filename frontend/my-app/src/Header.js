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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const token = localStorage.getItem("token");

  const fetchUserProfile = async () => {
    try {
      if (!token) {
        setProfileUrl(admin);
        setUser(null);
        return;
      }

      const response = await axios.get(
        `http://174.129.55.24:82/api/auth/current-user`,
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
      const Back_End_URL = "http://174.129.55.24:82";
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
        const Back_End_URL = "http://174.129.55.24:82";
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
        const Back_End_URL = "http://174.129.55.24:82";
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
    if (!token) {
      navigate("/login");
      return;
    }
    setShowProfileMenu((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfileUrl(admin);
    setUser(null);
    setShowProfileMenu(false);
    navigate("/login");
  };

  return (
    <div className="NaviBack">
      <div className="TopBar" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src={Alertify_new} alt="Logo" className="Logo" style={{ height: '150px', width: 'auto', marginLeft: 12, verticalAlign: 'top' }} />
        <div className="NewBar" style={{ flex: 1 }}>
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
            {/* Show Login/Signup if not logged in */}
            {!token && (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">SignUp</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Profile icon at top right */}
        <div style={{ position: 'absolute', top: 0, right: 24, display: 'inline-block', zIndex: 101 }}>
          <img
            src={profileUrl}
            alt="Profile"
            className="AdminIcon"
            onClick={handleAdminClick}
            style={{ cursor: "pointer", height: '100px', width: '100px', borderRadius: '50%', boxShadow: '0 1px 4px #0002', verticalAlign: 'top' }}
            onError={(e) => { e.target.onerror = null; e.target.src = admin; }}
          />
          {/* Dropdown menu for profile actions */}
          {showProfileMenu && token && (
            <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px #0002', zIndex: 100, minWidth: 120, padding: '2px 0' }}>
              <button onClick={() => window.location.href='/profile'} style={{ width: '90%', padding: '0px 0', border: 'none', background: 'none', color: '#222', fontWeight: 400, borderRadius: 8, cursor: 'pointer', fontSize: '0.93em', display: 'block', marginBottom: '0' }}>Edit Profile</button>
              
              <button onClick={handleLogout} style={{ width: '90%', padding: '0px 0', border: 'none', background: 'none', color: '#222', fontWeight: 400, borderRadius: 8, cursor: 'pointer', fontSize: '0.93em', display: 'block', marginTop: '0' }}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;