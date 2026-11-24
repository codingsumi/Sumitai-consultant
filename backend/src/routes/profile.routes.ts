import { Router } from "express";
import multer from "multer";
import {
  get,
  patch,
  uploadAvatar,
  remove,
  updateProfileSchema,
} from "../controllers/profile.controller";
import { requireAuth } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 },
});

const router = Router();

router.use(requireAuth);

router.get("/", get);
router.patch("/", validateBody(updateProfileSchema), patch);
router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.delete("/", remove);

export default router;
