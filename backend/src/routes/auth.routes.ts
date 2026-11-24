import { Router } from "express";
import {
  sendOtp,
  verifyOtp,
  guest,
  me,
  logoutHandler,
  claimGuestHandler,
  sendOtpSchema,
  verifyOtpSchema,
  guestSchema,
  claimGuestSchema,
} from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate";
import {
  otpSendLimiter,
  otpVerifyLimiter,
  guestLimiter,
  authGeneralLimiter,
} from "../middlewares/rateLimit";
import { requireAuth, requireGuest } from "../middlewares/auth";

const router = Router();

router.use(authGeneralLimiter);

router.post("/send-otp", otpSendLimiter, validateBody(sendOtpSchema), sendOtp);
router.post("/verify-otp", otpVerifyLimiter, validateBody(verifyOtpSchema), verifyOtp);
router.post("/guest", guestLimiter, validateBody(guestSchema), guest);
router.post("/logout", logoutHandler);
router.get("/me", requireAuth, me);
router.post(
  "/claim-guest",
  requireAuth,
  requireGuest,
  otpVerifyLimiter,
  validateBody(claimGuestSchema),
  claimGuestHandler
);

export default router;
