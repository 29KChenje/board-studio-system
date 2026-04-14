import { Router } from "express";
import { modelController } from "../controllers/modelController.js";
import { authenticate, authorizeResourceOwner } from "../middleware/authMiddleware.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const canAccessProject = authorizeResourceOwner((req) => projectRepository.findOwnerIdByProjectId(req.params.projectId));

router.use(authenticate);
router.get("/:projectId", canAccessProject, asyncHandler(modelController.getProjectModel));

export default router;
