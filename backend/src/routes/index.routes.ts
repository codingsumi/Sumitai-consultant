import { Router } from "express";
import chatRoutes from "./chat.routes";
import consultantsRoutes from "./consultants.routes";

const router = Router();

router.get("/health", (_, res) => {
    res.json({
        status: "success",
        message: "Server health is OK",
    });
});

router.use("/chat", chatRoutes);
router.use("/consultants", consultantsRoutes);

export default router;
    