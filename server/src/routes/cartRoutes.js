import { Router } from "express";
import { cartController } from "../controllers/cartController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cartSchemas } from "../utils/requestSchemas.js";

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(cartController.get));
router.post("/items", validate(cartSchemas.addItem), asyncHandler(cartController.addItem));
router.put("/items/:itemId", validate(cartSchemas.updateItem), asyncHandler(cartController.updateItem));
router.delete("/items/:itemId", validate(cartSchemas.removeItem), asyncHandler(cartController.removeItem));

export default router;
