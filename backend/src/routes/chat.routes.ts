import { Router } from "express";
import { create, chats } from "../controllers/chat.controller";
import messageRoutes from "./message.routes";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

router.post("/", create);
router.get("/list", chats);
router.use("/:chatId/messages", messageRoutes);

export default router;
