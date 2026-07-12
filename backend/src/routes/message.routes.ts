import {Router} from "express";
import { create } from "../controllers/message.controller";
const router = Router({mergeParams: true});

router.post("/", create);

export default router;