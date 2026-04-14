import { Router } from "express";
import { optimizationController } from "../controllers/optimizationController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);
router.post("/", asyncHandler(optimizationController.optimize));

export default router;
