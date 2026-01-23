
import express from 'express';
import multer from "multer";
import { registerUser } from '../Controllers/RegisterController.js';
import { loginUser, resetPasswordController } from "../Controllers/LoginController.js";
// Password reset

import adminRoutes from './adminRoutes.js';
import incidentRoutes from './IncidentRoutes.js';
import { updateUserProfileController, getCurrentUserController } from '../Controllers/ProfileController.js';
import { authenticateToken } from "../Middleware/AuthMiddleware.js";
import commentRoutes from './commentRoutes.js';

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Register & login
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPasswordController);
// Profile management (protected routes)
router.get("/current-user", authenticateToken, getCurrentUserController);
router.put("/users/:id", authenticateToken, upload.single("photo"), updateUserProfileController);
router.use("/admin", adminRoutes);
router.use("/incidents", incidentRoutes);
router.use('/comments', commentRoutes);


export default router;