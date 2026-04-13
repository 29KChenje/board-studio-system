import { Router } from "express";
import { projectController } from "../controllers/projectController.js";
import { authenticate, authorize, authorizeResourceOwner } from "../middleware/authMiddleware.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { validate } from "../middleware/validationMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { projectSchemas } from "../utils/requestSchemas.js";

const router = Router();
const canAccessProject = authorizeResourceOwner((req) => projectRepository.findOwnerIdByProjectId(req.params.id));

router.use(authenticate);
router.post("/", validate(projectSchemas.create), asyncHandler(projectController.create));
router.get("/mine", asyncHandler(projectController.listMine));
router.get("/admin/all", authorize("admin"), asyncHandler(projectController.listAll));
router.get("/:id", validate(projectSchemas.byId), canAccessProject, asyncHandler(projectController.getById));

export default router;
