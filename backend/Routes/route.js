import express from 'express';
import multer from "multer";
import { registerUser } from '../Controllers/RegisterController.js';
import { loginUser } from "../Controllers/LoginController.js";
import adminRoutes from './adminRoutes.js';
import incidentRoutes from './IncidentRoutes.js';
import { updateUserProfileController, getCurrentUserController } from '../Controllers/ProfileController.js';
import { authenticateToken } from "../Middleware/AuthMiddleware.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Register & login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile management (protected routes)
router.get("/current-user", authenticateToken, getCurrentUserController);
router.put("/users/:id", authenticateToken, upload.single("photo"), updateUserProfileController);
router.use("/admin", adminRoutes);
router.use("/incidents", incidentRoutes);

export default router;