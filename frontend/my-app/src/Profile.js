import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";
import admin from "./Pictures/admin.png";
import { FaPen, FaCamera } from "react-icons/fa";

function Profile() {
  const [profile, setProfile] = useState({
    id: "",
    username: "",
    email: "",
    profileUrl: "",
  });
  const [editingField, setEditingField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState("");

  const Back_End_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");

  // Fetch current user profile
  const fetchMyProfile = async () => {
    try {
      const { data } = await axios.get(`${Back_End_URL}/api/auth/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile({
        id: data.id,
        username: data.username,
        email: data.email,
        profileUrl: data.profileUrl,
      });
      // store user in localStorage for other components (Header) and notify listeners
      try {
        localStorage.setItem("user", JSON.stringify(data));
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: data }));
      } catch (e) {
        console.warn("Could not persist user to localStorage or dispatch event", e);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  // Update user profile
  // if `fileOverride` is provided it will be used instead of state.photoFile (useful when calling immediately after selecting a file)
  const handleUpdate = async (field, fileOverride = null) => {
    try {
      const formData = new FormData();
      
      if (field === "username") formData.append("username", editValue);
      if (field === "email") formData.append("email", editValue);
      const fileToUpload = fileOverride || photoFile;
      if (field === "photo" && fileToUpload) formData.append("photo", fileToUpload);

      
        await axios.put(`${Back_End_URL}/api/auth/users/${profile.id}`, formData, {
          headers: {
            // Let the browser/axios set Content-Type including the multipart boundary
            Authorization: `Bearer ${token}`,
          },
        });
      

      setMessage("Profile updated successfully!");
      setEditingField("");
      setEditValue("");
      setPhotoFile(null);
      fetchMyProfile();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error updating profile");
    }
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
    <p>Welcome! You can update your profile photo, username, and email here.</p>
      
      {message && <div className="message">{message}</div>}

      <div className="profile-card">
        {/* Profile Photo */}
        <div className="photo-section">
          <img
            src={
              profile.profileUrl
                ? (profile.profileUrl.startsWith("http") ? profile.profileUrl : `${Back_End_URL}${profile.profileUrl}`)
                : admin
            }
            alt="profile"
            className="profile-pic"
            onError={(e) => { e.target.onerror = null; e.target.src = admin; }}
          />
          <div className="photo-controls">
            <label className="upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setPhotoFile(file);
                  // call handleUpdate with the selected file so we don't rely on state being updated
                  handleUpdate("photo", file);
                }}
                style={{ display: 'none' }}
              />
              <FaCamera className="photo-icon" />
            </label>
          </div>
        </div>

        {/* Profile Info */}
        <div className="info-section">
          {/* Username */}
          <div className="info-field">
            <label>Username:</label>
            {editingField === "username" ? (
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleUpdate("username")}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdate("username")}
                autoFocus
              />
            ) : (
              <span
                className="editable-field"
                onClick={() => {
                  setEditingField("username");
                  setEditValue(profile.username);
                }}
              >
                {profile.username} <FaPen className="edit-icon" />
              </span>
            )}
          </div>

          {/* Email */}
          <div className="info-field">
            <label>Email:</label>
            {editingField === "email" ? (
              <input
                type="email"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleUpdate("email")}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdate("email")}
                autoFocus
              />
            ) : (
              <span
                className="editable-field"
                onClick={() => {
                  setEditingField("email");
                  setEditValue(profile.email);
                }}
              >
                {profile.email} <FaPen className="edit-icon" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;