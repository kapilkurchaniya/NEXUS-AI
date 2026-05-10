import { Router } from "express";
import { login, register, verifyEmail , getMe , forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { registerValidationRules, loginValidationRules, validate } from "../middlewares/authValidator.js";
import {verifyuser} from "../middlewares/authmiddleware.js";

const router = Router();

router.post("/register", registerValidationRules, validate, register);
router.post("/login", loginValidationRules, validate, login);
router.get("/verify-email", verifyEmail);
router.get("/get-me", verifyuser, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
