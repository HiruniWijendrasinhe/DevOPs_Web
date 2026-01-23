// Controllers/IncidentController.js
import { createIncident, getAllIncidents, updateIncident, getIncidentsByUser } from "../Models/Incident_model.js";
import { deleteIncident} from '../Models/Incident_model.js';
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

// Update incident (admin or complainer can update)
export const updateIncidentController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const incidents = await getAllIncidents();
    const foundIncident = incidents.find(inc => String(inc.ID) === String(id));
    if (!foundIncident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    // Allow if user is complainer, assigned person, or admin
    if (
      foundIncident.Complainer_ID !== req.user.id &&
      foundIncident.Assigned_To !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: "You are not allowed to update this incident" });
    }
    const allowedUpdates = ['Title', 'Description', 'Team', 'Assigned_To', 'Stage', 'Priority','Severity'];
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });
    // If no Assigned_To is provided in the update, reset assignment to null only if the editor is not the assigned person
    if (!('Assigned_To' in updates) && foundIncident.Assigned_To !== req.user.id) {
      updateData['Assigned_To'] = null;
    }
    await updateIncident(id, updateData);
    res.status(200).json({ message: "Incident updated successfully" });
  } catch (error) {
    console.error("Error updating incident:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete incident (only complainer can delete)
export const deleteIncidentController = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch all incidents and find the one to delete
    const incidents = await getAllIncidents();
    const foundIncident = incidents.find(inc => String(inc.ID) === String(id));
    if (!foundIncident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    if (foundIncident.Complainer_ID !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to delete this incident" });
    }
    console.log(`Deleting incident ${id}`);
    await deleteIncident(id);
    res.status(200).json({ message: "Incident deleted successfully" });
  } catch (error) {
    console.error("Error deleting incident:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};