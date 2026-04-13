import { Router } from "express";
import { upload } from "../config/upload.js";
import { orderController } from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { orderSchemas } from "../utils/requestSchemas.js";

const router = Router();

router.use(authenticate);
router.post("/workshop", validate(orderSchemas.workshop), asyncHandler(orderController.createWorkshop));
router.post("/checkout", validate(orderSchemas.checkout), asyncHandler(orderController.checkout));
router.get("/mine", asyncHandler(orderController.mine));
router.patch("/:id/status", authorize("admin"), validate(orderSchemas.updateStatus), asyncHandler(orderController.updateStatus));
router.post("/:id/payment-proof", upload.single("proof"), validate(orderSchemas.uploadProof), asyncHandler(orderController.uploadProof));
router.patch("/:id/verify-payment", authorize("admin"), validate(orderSchemas.verifyPayment), asyncHandler(orderController.verifyPayment));
router.get("/", authorize("admin"), asyncHandler(orderController.list));

export default router;
