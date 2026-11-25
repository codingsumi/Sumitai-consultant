import { Router } from "express";
import chatRoutes from "./chat.routes";
import consultantsRoutes from "./consultants.routes";
import testAiRoutes from "./test.routes";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";
import feedbackRoutes from "./feedback.routes";

import { health } from "../controllers/health.controller";

const router = Router();

router.get("/health", health);

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/chat", chatRoutes);
router.use("/consultants", consultantsRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/test-ai", testAiRoutes);

export default router;
