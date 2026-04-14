import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { validate } from "../middleware/validationMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authSchemas } from "../utils/requestSchemas.js";

const router = Router();

router.post("/register", validate(authSchemas.register), asyncHandler(authController.register));
router.post("/login", validate(authSchemas.login), asyncHandler(authController.login));

export default router;
