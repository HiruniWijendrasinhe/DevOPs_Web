import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Home from "./Home";
import "./Login.css";
import PropTypes from "prop-types";

function Login({ show, onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();
  const Back_End_URL = "http://174.129.55.24:82";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please fill in both Email and Password.");
      return;
    }

    try {
      console.log("Sending login data:", { email, password });

      const res = await axios.post(`${Back_End_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log("Login success:", res.data);

      //  Save token & user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Notify other components (Header) that profile/user data is available
      try {
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: res.data.user }));
      } catch (e) {
        console.warn("Could not dispatch profileUpdated event", e);
      }

      // Navigate to home
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.response ? err.response.data : err);
      alert("Login failed. Try again.");
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setResetMessage("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetMessage("Passwords do not match.");
      return;
    }
    try {
      // Ensure this path matches your backend route (e.g., /api/reset-password)
      const res = await axios.post(`${Back_End_URL}/api/reset-password`, {
        email: resetEmail,
        newPassword: newPassword,
      });
      setResetMessage(res.data.message || "Password reset successful. You can now log in.");
      // If successful, close modal and redirect to home after a short delay
      setTimeout(() => {
        setShowReset(false);
        setResetMessage("");
        setResetEmail("");
        setNewPassword("");
        setConfirmPassword("");
        navigate("/");
      }, 1200); // 1.2 seconds for user to see the message
    } catch (err) {
      setResetMessage(
        err.response?.data?.message || "Password reset failed. Try again."
      );
    }
  };

  return (
    <>
      <Home />
      <div className="backdrop">
        <div className="modal">
          <h3>Login</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
            <div style={{ textAlign: "right", marginBottom: "10px" }}>
              <span
                style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
                onClick={() => setShowReset(true)}
              >
                Forgot Password?
              </span>
            </div>
            <div className="formatnew">
              <button type="submit" className="button">
                Login
              </button>
              <button type="button" onClick={handleCancel} className="button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      {showReset && (
        <div className="backdrop" style={{ zIndex: 1000 }}>
          <div className="modal">
            <h3>Reset Password</h3>
            <form onSubmit={handleResetPassword}>
              <input
                type="text"
                placeholder="Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="input"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="input"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input"
              />
              {resetMessage && (
                <div style={{ color: resetMessage.includes("successful") ? "green" : "red", marginBottom: "8px" }}>
                  {resetMessage}
                </div>
              )}
              <div className="formatnew">
                <button type="submit" className="button">
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(false);
                    setResetMessage("");
                    setResetEmail("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

Login.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func,
};

export default Login;
