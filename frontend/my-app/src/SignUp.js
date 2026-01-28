import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Home from "./Home";
import "./SignUp.css";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  //const Back_End_URL = process.env.REACT_APP_BACKEND_URL;
  const Back_End_URL = "http://174.129.55.24:82";
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${Back_End_URL}/api/auth/register`, {
        username,
        email,
        password,
      });

      console.log("User registered:", res.data);
      alert("Signup successful!");

      // Save token & user data to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Save user and notify other components, then go to home
      try {
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: res.data.user }));
      } catch (e) {
        console.warn("Could not dispatch profileUpdated event", e);
      }

      // Redirect to HOME page after signup
      navigate("/");
    } catch (err) {
      console.error("Signup failed:", err.response ? err.response.data : err);
      alert("Signup failed. Try again.");
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <>
      <Home />
      <div className="backdrop">
        <div className="modal">
          <h3>Sign Up</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input"
            />
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

            <button type="submit" className="button">
              Sign Up
            </button>
            <button type="button" onClick={handleCancel} className="button">
              Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignUp;