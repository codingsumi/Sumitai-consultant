import { Router } from "express";
import { create, createFeedbackSchema } from "../controllers/feedback.controller";
import { validateBody } from "../middlewares/validate";
import { feedbackLimiter } from "../middlewares/rateLimit";

const router = Router();

router.post("/", feedbackLimiter, validateBody(createFeedbackSchema), create);

export default router;
