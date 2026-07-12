import {Router} from "express";

const router = Router();

router.get("/", (_, res) => {
    res.json({
        status: "success",
        messsage: "Chat api is working",
    });
});

export default router;