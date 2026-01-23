// Routes/commentRoutes.js
import express from 'express';
import { authenticateToken } from '../Middleware/AuthMiddleware.js';
import {
  createCommentController,
  getCommentsByIncidentController,
  updateCommentController,
  deleteCommentController
} from '../Controllers/CommentsController.js';

const router = express.Router();

// Create a comment (only assigned person can create)
router.post('/', authenticateToken, createCommentController);

// Get all comments for an incident
router.get('/incident/:incidentId', authenticateToken, getCommentsByIncidentController);

// Update a comment (only assigned person can update)
router.put('/:id', authenticateToken, updateCommentController);

// Delete a comment (only assigned person can delete)
router.delete('/:id', authenticateToken, deleteCommentController);

export default router;
