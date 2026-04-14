import { Router } from "express";
import { productController } from "../controllers/productController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../config/upload.js";
import { validate } from "../middleware/validationMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { productSchemas } from "../utils/requestSchemas.js";

const router = Router();

router.get("/", asyncHandler(productController.list));
router.post("/", authenticate, authorize("admin"), upload.single("image"), validate(productSchemas.create), asyncHandler(productController.create));
router.put("/:id", authenticate, authorize("admin"), upload.single("image"), validate(productSchemas.update), asyncHandler(productController.update));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(productController.delete));

export default router;
