import { createComment, updateComment, deleteComment, getCommentById, getCommentsByIncident } from '../Models/Comment_model.js';
import { getIncidentById } from '../Models/Incident_model.js';

// Create comment
export const createCommentController = async (req, res) => {
  try {
    const { Incident_ID, Content } = req.body;
    // Fetch the incident to check assigned user
    const incident = await getIncidentById(Incident_ID);
    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }
    if (req.user.id !== incident.Assigned_To) {
      return res.status(403).json({ message: "Only the assigned person can add a comment." });
    }
    const commentId = await createComment({
      Incident_ID,
      Comment_Text: Content,
      Created_By: req.user.id,
      Assigned_To: incident.Assigned_To
    });
    res.status(201).json({ message: "Comment added", commentId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update comment
export const updateCommentController = async (req, res) => {
  try {
    const { id } = req.params;
    const { Comment_Text } = req.body;
    const comment = await getCommentById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (req.user.id !== comment.Assigned_To) {
      return res.status(403).json({ message: "Only the assigned person can update this comment." });
    }
    await updateComment(id, { Comment_Text });
    res.status(200).json({ message: "Comment updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete comment
export const deleteCommentController = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await getCommentById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (req.user.id !== comment.Assigned_To) {
      return res.status(403).json({ message: "Only the assigned person can delete this comment." });
    }
    await deleteComment(id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all comments for an incident
export const getCommentsByIncidentController = async (req, res) => {
  try {
    const { incidentId } = req.params;
    const comments = await getCommentsByIncident(incidentId);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};