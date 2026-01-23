import jwt from "jsonwebtoken";
import { findUserByEmail, resetPassword } from "../Models/User.js";
// Reset password controller
import bcrypt from "bcrypt";

export const resetPasswordController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await resetPassword(email, hashedPassword);
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password){
      console.log("All fields are required");
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await findUserByEmail(email);
    if (!user)  {
      console.log("User is not founded");
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.Password); // ← 'Password'
    if (!isMatch) {
      console.log("Incorrect password");
      console.log("Frontend password:", password);
      console.log("Stored hash from DB:", user.Password); // ← 'Password'
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Use JWT secret from environment; require in production
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
      console.error('FATAL: JWT_SECRET not set in environment. Cannot sign tokens.');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const SIGN_SECRET = JWT_SECRET || 'dev-secret'; // short dev fallback only

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.ID, // ← 'ID'
        email: user.Email,
        role: user.Role
      },
      SIGN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.ID,           // ← 'ID'
        username: user.User_Name, // ← 'User_Name'
        email: user.Email,
        profileUrl: user.Profile_Url,
        role: user.Role,    // ← Make sure this is included
        team: user.Team     // ← And this // ← 'Profile_Url'
      }
    });

  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};