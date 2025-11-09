import { findUserById, updateUserProfile } from "../Models/User.js";
import cloudinary from "../Utils/cloudinary.js";
import fs from "fs";

// Get current user profile
export const getCurrentUserController = async (req, res) => {
  try {
    console.log("=== GET CURRENT USER ===");
    console.log("Request user object:", req.user);
    console.log("User ID from token:", req.user.id);
    
    const user = await findUserById(req.user.id);
    console.log("User found in database:", user);

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FIX: Add role and team fields to the response
    res.status(200).json({
      id: user.ID,           // ← 'ID'
      username: user.User_Name, // ← 'User_Name'
      email: user.Email,       // ← 'Email'
      profileUrl: user.Profile_Url, // ← 'Profile_Url'
      role: user.Role,        // ← ADD THIS LINE
      team: user.Team         // ← ADD THIS LINE
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
export const updateUserProfileController = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    
    console.log("Updating profile for user:", id);
    console.log("Request body:", { username, email });
    console.log("File received:", req.file);

    // Check if user is authorized (coerce types to avoid string/number mismatch)
    const tokenUserId = parseInt(req.user.id);
    const paramUserId = parseInt(id);
    console.log("Authorizing update: tokenUserId=", tokenUserId, " paramUserId=", paramUserId);
    if (Number.isNaN(tokenUserId) || tokenUserId !== paramUserId) {
      console.warn("Unauthorized profile update attempt", { tokenUserId, paramUserId });
      return res.status(403).json({ message: "Unauthorized" });
    }

    let profileUrl = null;
    if (req.file) {
      // If a file was uploaded via multer, upload it to Cloudinary and use the returned URL
      try {
        console.log("Uploading file to Cloudinary:", req.file.path);
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          folder: "profiles",
          use_filename: true,
          unique_filename: false,
        });
        profileUrl = uploadRes.secure_url;
        console.log("Cloudinary upload result:", uploadRes.secure_url);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        // fallback to local path if upload fails
        profileUrl = `/uploads/${req.file.filename}`;
      } finally {
        // remove local temp file
        try {
          await fs.promises.unlink(req.file.path);
        } catch (e) {
          console.warn("Failed to remove temp upload file:", e);
        }
      }
    }

    // Get current user to preserve existing profile URL if no new photo
    const currentUser = await findUserById(id);
    const finalProfileUrl = profileUrl || currentUser.Profile_Url;
    const finalUsername = username || currentUser.User_Name;
    const finalEmail = email || currentUser.Email;

    console.log("Final data to update:", {
      finalUsername,
      finalEmail,
      finalProfileUrl
    });

    await updateUserProfile(id, finalUsername, finalEmail, finalProfileUrl);

    res.status(200).json({ 
      message: "Profile updated successfully",
      profileUrl: finalProfileUrl 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};