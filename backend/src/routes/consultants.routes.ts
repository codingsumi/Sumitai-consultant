import {Router} from "express";
import { getConsultants } from "../controllers/consultants.controller";

const router = Router();

router.get("/", getConsultants);

export default router;