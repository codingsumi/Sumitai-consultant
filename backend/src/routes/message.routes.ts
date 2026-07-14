import {Router} from "express";
import { create, chatMessages, streamMessage } from "../controllers/message.controller";
const router = Router({mergeParams: true});

router.post("/", create);
router.post("/stream", streamMessage);
router.get("/", chatMessages);

export default router;