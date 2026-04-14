import { Router } from "express";
import { exportController } from "../controllers/exportController.js";
import { authenticate, authorizeResourceOwner } from "../middleware/authMiddleware.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const canAccessProject = authorizeResourceOwner((req) => projectRepository.findOwnerIdByProjectId(req.params.projectId));
const canAccessOrder = authorizeResourceOwner((req) => orderRepository.findOwnerIdByOrderId(req.params.orderId));

router.use(authenticate);
router.get("/projects/:projectId/cutting-list.pdf", canAccessProject, asyncHandler(exportController.cuttingList));
router.get("/projects/:projectId/cutting-layout.pdf", canAccessProject, asyncHandler(exportController.cuttingLayout));
router.get("/orders/:orderId/invoice.pdf", canAccessOrder, asyncHandler(exportController.invoice));
router.get("/orders/:orderId/receipt.pdf", canAccessOrder, asyncHandler(exportController.receipt));

export default router;
