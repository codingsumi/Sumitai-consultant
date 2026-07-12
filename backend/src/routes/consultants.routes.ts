import {Router} from "express";

const router = Router();

router.get("/", (_, res) => {
    res.json({
        status: "success",
        message: "Consultants api is working",
    });
});

export default router;