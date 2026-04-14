import { Router } from "express";
import { pieceController } from "../controllers/pieceController.js";
import { authenticate, authorizeResourceOwner } from "../middleware/authMiddleware.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { validate } from "../middleware/validationMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pieceSchemas } from "../utils/requestSchemas.js";

const router = Router();
const canAccessProject = authorizeResourceOwner((req) =>
  projectRepository.findOwnerIdByProjectId(req.params.projectId || req.body.projectId)
);

router.use(authenticate);
router.post("/", validate(pieceSchemas.create), canAccessProject, asyncHandler(pieceController.create));
router.get("/:projectId", validate(pieceSchemas.byProject), canAccessProject, asyncHandler(pieceController.listByProject));

export default router;
