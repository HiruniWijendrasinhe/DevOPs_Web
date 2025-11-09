// Models/Incident.js
import pool from "../Configure/db.js";

// Create new incident
export const createIncident = async (incidentData) => {
  const sql = `
    INSERT INTO incidents (Title, Description, Complainer_ID, Team)
    VALUES (?, ?, ?, ?)
  `;
  
  const [result] = await pool.query(sql, [
    incidentData.Title,
    incidentData.Description,
    incidentData.Complainer_ID,
    incidentData.Team
  ]);
  return result.insertId;
};

// Get all incidents with user details
export const getAllIncidents = async () => {
  const sql = `
    SELECT 
      i.*,
      complainer.User_Name as Complainer_Name,
      assigned.User_Name as Assigned_To_Name
    FROM incidents i
    LEFT JOIN user complainer ON i.Complainer_ID = complainer.ID
    LEFT JOIN user assigned ON i.Assigned_To = assigned.ID
    ORDER BY i.Created_At DESC
  `;
  
  const [rows] = await pool.query(sql);
  return rows;
};

// Get incidents reported by a specific user
export const getIncidentsByUser = async (userId) => {
  const sql = `
    SELECT 
      i.*,
      complainer.User_Name as Complainer_Name,
      assigned.User_Name as Assigned_To_Name
    FROM incidents i
    LEFT JOIN user complainer ON i.Complainer_ID = complainer.ID
    LEFT JOIN user assigned ON i.Assigned_To = assigned.ID
    WHERE i.Complainer_ID = ?
    ORDER BY i.Created_At DESC
  `;

  const [rows] = await pool.query(sql, [userId]);
  return rows;
};

// Update incident
export const updateIncident = async (id, updates) => {
  const allowedFields = ['Assigned_To', 'Resolver_Team', 'Stage', 'Priority'];
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
  const sql = `UPDATE incidents SET ${setClause.join(', ')} WHERE ID = ?`;
  
  const [result] = await pool.query(sql, values);
  return result;
};