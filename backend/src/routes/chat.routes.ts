import {Router} from "express";
import { create } from "../controllers/chat.controller";
import messageRoutes from "./message.routes";

const router = Router();

router.post("/", create);
router.use("/:chatId/messages", messageRoutes);

export default router;