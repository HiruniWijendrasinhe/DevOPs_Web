// Get a single comment by ID
export const getCommentById = async (id) => {
  const sql = `SELECT * FROM comments WHERE ID = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};
// Models/Comment_model.js
import pool from "../Configure/db.js";

// Create a new comment
export const createComment = async (commentData) => {
  const sql = `
    INSERT INTO comments (Incident_ID, Comment_Text, Created_By, Assigned_To)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [
    commentData.Incident_ID,
    commentData.Comment_Text,
    commentData.Created_By,
    commentData.Assigned_To || null
  ]);
  return result.insertId;
};

// Get all comments for an incident
export const getCommentsByIncident = async (incidentId) => {
  const sql = `
    SELECT c.*, u.User_Name as Created_By_Name, a.User_Name as Assigned_To_Name
    FROM comments c
    LEFT JOIN user u ON c.Created_By = u.ID
    LEFT JOIN user a ON c.Assigned_To = a.ID
    WHERE c.Incident_ID = ?
    ORDER BY c.Created_At ASC
  `;
  const [rows] = await pool.query(sql, [incidentId]);
  return rows;
};

// Delete a comment by ID
export const deleteComment = async (id) => {
  const sql = `DELETE FROM comments WHERE ID = ?`;
  const [result] = await pool.query(sql, [id]);
  return result;
};

// Update a comment (only text and assigned_to)
export const updateComment = async (id, updates) => {
  const allowedFields = ['Comment_Text', 'Assigned_To'];
  const setClause = [];
  const values = [];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      setClause.push(`${field} = ?`);
      values.push(updates[field]);
    }
  });

  if (setClause.length === 0) {
    throw new Error("No valid fields to update");
  }

  values.push(id);
  const sql = `UPDATE comments SET ${setClause.join(', ')} WHERE ID = ?`;
  const [result] = await pool.query(sql, values);
  return result;
};