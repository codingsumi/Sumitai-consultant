import { Router } from "express";
import chatRoutes from "./chat.routes";
import consultantsRoutes from "./consultants.routes";
import testAiRoutes from "./test.routes";

import { health } from "../controllers/health.controller";

const router = Router();

router.get("/health", health);

router.use("/chat", chatRoutes);
router.use("/consultants", consultantsRoutes);
router.use("/test-ai", testAiRoutes);

export default router;
