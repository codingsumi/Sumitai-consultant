import { Router } from "express";
import chatRoutes from "./chat.routes";
import consultantsRoutes from "./consultants.routes";

import { health } from "../controllers/health.controller";

const router = Router();

router.get("/health", health);

router.use("/chat", chatRoutes);
router.use("/consultants", consultantsRoutes);

export default router;
