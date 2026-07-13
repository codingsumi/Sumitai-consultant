import {Router} from "express";
import { create, chatMessages } from "../controllers/message.controller";
const router = Router({mergeParams: true});

router.post("/", create);
router.get("/", chatMessages);

export default router;