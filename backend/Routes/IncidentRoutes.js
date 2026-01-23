// Routes/incidentRoutes.js
import express from 'express';
import { 
  createIncidentController, 
  getIncidentsController, 
  updateIncidentController,
  
  deleteIncidentController
} from '../Controllers/IncidentController.js';
import { authenticateToken } from "../Middleware/AuthMiddleware.js";
import { requireAdmin } from "../Middleware/AdminMiddleware.js";

const router = express.Router();

// All users can report incidents
router.post("/", authenticateToken, createIncidentController);

// Authenticated users can fetch their own incidents
//router.get("/mine", authenticateToken, getUserIncidentsController);

// Authenticated users (any role) can fetch all incidents (visible to everyone logged-in)
router.get("/all", authenticateToken, getIncidentsController);

// Only admins can view and update incidents
router.get("/", authenticateToken, requireAdmin, getIncidentsController);
router.put("/:id", authenticateToken, updateIncidentController); 
router.delete('/:id', authenticateToken, deleteIncidentController);
export default router;