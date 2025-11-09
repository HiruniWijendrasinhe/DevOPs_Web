import express from 'express';
import { 
  getUsersController, 
  updateUserRoleController, 
  updateUserTeamController 
} from '../Controllers/AdminController.js';
import { authenticateToken } from "../Middleware/AuthMiddleware.js";
import { requireAdmin } from "../Middleware/AdminMiddleware.js";

const router = express.Router();

// All routes are protected and require admin role
router.get("/users", authenticateToken, requireAdmin, getUsersController);
router.put("/users/:id/role", authenticateToken, requireAdmin, updateUserRoleController);
router.put("/users/:id/team", authenticateToken, requireAdmin, updateUserTeamController);

export default router;