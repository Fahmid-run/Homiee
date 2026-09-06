import { Router } from "express";

import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { Role } from "../../../../prisma/generated/prisma/enums";

const router = Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  auth(Role.ADMIN, Role.TENANT, Role.PROPERTY_OWNER),
  AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);

// router.post("/google", AuthController.googleLogin);
// router.post(
//   "/forgot-password",
//   validateRequest(UserValidation.ForgotPasswordZodSchema),
//   AuthController.forgotPassword,
// );
// router.post(
//   "/reset-password",
//   validateRequest(UserValidation.ResetPasswordZodSchema),
//   AuthController.resetPassword,
// );
export const AuthRoutes = router;
