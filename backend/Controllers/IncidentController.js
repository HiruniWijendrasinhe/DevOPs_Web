// Controllers/IncidentController.js
import { createIncident, getAllIncidents, updateIncident, getIncidentsByUser } from "../Models/ Incident_model.js";

// Create new incident
export const createIncidentController = async (req, res) => {
  try {
    const { Title, Description, Team } = req.body;
    
    console.log("Creating new incident:", { Title, Description, Team, Complainer_ID: req.user.id });

    if (!Title || !Description || !Team) {
      return res.status(400).json({ message: "Title, Description, and Team are required" });
    }

    const incidentId = await createIncident({
      Title,
      Description,
      Team,
      Complainer_ID: req.user.id
    });

    res.status(201).json({
      message: "Incident reported successfully",
      incidentId
    });
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all incidents (for admin)
export const getIncidentsController = async (req, res) => {
  try {
    console.log("Fetching all incidents for admin");
    const incidents = await getAllIncidents();
    res.status(200).json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get incidents for the authenticated user
export const getUserIncidentsController = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching incidents for user ${userId}`);
    const incidents = await getIncidentsByUser(userId);
    res.status(200).json(incidents);
  } catch (error) {
    console.error("Error fetching user incidents:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update incident (admin only)
export const updateIncidentController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`Updating incident ${id} with:`, updates);

    // Only allow specific fields to be updated
    const allowedUpdates = ['Assigned_To', 'Resolver_Team', 'Stage', 'Priority'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    await updateIncident(id, updateData);
    res.status(200).json({ message: "Incident updated successfully" });
  } catch (error) {
    console.error("Error updating incident:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};