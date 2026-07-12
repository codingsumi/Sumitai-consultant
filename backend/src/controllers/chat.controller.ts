import { Request, Response } from "express";
import { createChat, sendMessageToAi } from "../services/chat.service";

// create a new chat for a consultant
export const create = async (req: Request, res: Response) => {
    try {
        const { consultant } = req.body;

        const chat = await createChat(consultant);

        res.status(201).json({
            success: true,
            data: chat,
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const chat = async(req: any, res: any) => {
    const { consultant, message } = req.body;

    const response = await sendMessageToAi(consultant, message);

    res.json(response);
};