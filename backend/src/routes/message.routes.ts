import { Router } from "express";
import {
  create,
  chatMessages,
  streamMessage,
  truncate,
  truncateMessagesSchema,
} from "../controllers/message.controller";
import { validateBody } from "../middlewares/validate";

const router = Router({ mergeParams: true });

router.post("/", create);
router.post("/stream", streamMessage);
router.get("/", chatMessages);
router.delete("/", validateBody(truncateMessagesSchema), truncate);

export default router;
