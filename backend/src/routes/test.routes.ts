import {Router} from "express";
import {llm} from "../ai/model";

const router = Router();

router.get("/", async (_, res) => {
    const response = await llm.invoke("say hello");
    res.json({message: response.content});
});

export default router;

