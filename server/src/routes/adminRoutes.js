import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/dashboard", asyncHandler(adminController.dashboard));
router.get("/system-health", asyncHandler(adminController.systemHealth));

export default router;
