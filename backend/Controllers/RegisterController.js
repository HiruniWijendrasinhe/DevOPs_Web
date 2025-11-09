import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createUser, findUserByEmail, findUserById } from "../Models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "e42ddbde95fd3b4d6ff323bf0f3a2ad6d0f08b5c2f335fcfc04b94e9c392b47a0c732909764a8b15f5bbe185fc5fe3709b0b664b97a22790b098c7da59b7e2fc";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("Signup request body:", req.body);

    if (!username || !email || !password) {
      console.log("Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log("Email already registered");
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user - this now includes Role and Team with defaults
    const userId = await createUser(username, email, hashedPassword);
    console.log("User created with ID:", userId);

    // Fetch the complete user after creation
    const newUser = await findUserById(userId);
    if (!newUser) {
      return res.status(500).json({ message: "User creation failed" });
    }

    console.log("New user data:", newUser);

    // Generate JWT token with correct user ID
    const token = jwt.sign(
      { 
        id: newUser.ID,
        email: newUser.Email,
        role: newUser.Role // Include role in token
      }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.ID,
        username: newUser.User_Name,
        email: newUser.Email,
        profileUrl: newUser.Profile_Url,
        role: newUser.Role, // Send role to frontend
        team: newUser.Team  // Send team to frontend
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};