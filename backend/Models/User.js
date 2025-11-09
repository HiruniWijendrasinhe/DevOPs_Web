import pool from "../Configure/db.js";

// Create a new user with username, email, and password
export const createUser = async (username, email, hashedPassword) => {
  const sql = `
    INSERT INTO user (User_Name, Email, Password, Profile_Url, Team, Role)
    VALUES (?, ?, ?, NULL, 'Development', 'user')
  `;
  
  const [result] = await pool.query(sql, [username, email, hashedPassword]);
  return result.insertId;
};

// Find a user by email
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM user WHERE Email = ?", [email]);
  return rows[0];
};

// Find a user by ID
export const findUserById = async (id) => {
  console.log("Searching for user with ID:", id);
  const [rows] = await pool.query("SELECT * FROM user WHERE ID = ?", [id]);
  return rows[0];
};

// Update user profile
export const updateUserProfile = async (id, username, email, profileUrl) => {
  const sql = `
    UPDATE user
    SET User_Name = ?, Email = ?, Profile_Url = ?
    WHERE ID = ?
  `;
  const [result] = await pool.query(sql, [username, email, profileUrl, id]);
  return result;
};

// Get all users - FIXED: Added FROM user and ORDER BY
export const getAllUsers = async () => {
  const [rows] = await pool.query("SELECT ID, User_Name, Email, Profile_Url, Team, Role FROM user ORDER BY ID DESC");
  return rows;
};

// Update user role
export const updateUserRole = async (id, role) => {
  const sql = "UPDATE user SET Role = ? WHERE ID = ?";
  const [result] = await pool.query(sql, [role, id]);
  return result;
};

// Update user team
export const updateUserTeam = async (id, team) => {
  const sql = "UPDATE user SET Team = ? WHERE ID = ?";
  const [result] = await pool.query(sql, [team, id]);
  return result;
};