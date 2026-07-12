import {Router} from "express";
import { create } from "../controllers/chat.controller";

const router = Router();

router.post("/", create);

export default router;