import { Router } from "express";
import { chain } from "../ai/chain";

const router = Router();

router.get("/", async (_, res) => {
    const response = await chain.invoke({
        query: "I have a headache",
    });

    res.json({ status: true, message: response });
});

export default router;

