import {Router} from "express";
import { create, chats } from "../controllers/chat.controller";
import messageRoutes from "./message.routes";

const router = Router();

router.post("/", create);
router.get("/list", chats);
router.use("/:chatId/messages", messageRoutes);

export default router;