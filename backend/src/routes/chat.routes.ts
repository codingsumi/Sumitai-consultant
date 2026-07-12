import {Router} from "express";
import { chat } from "../controllers/chat.controller";

const router = Router();

router.get("/", chat);

export default router;