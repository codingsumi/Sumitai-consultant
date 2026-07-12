import { Request, Response, NextFunction } from "express";
import { createChat, sendMessageToAi } from "../services/chat.service";
import { successResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { consultant } = req.body;

    const chat = await createChat(consultant);

    return successResponse(res, chat, "Chat created successfully", 201);
});

export const chat = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { consultant, message } = req.body;

    const response = await sendMessageToAi(consultant, message);

    return successResponse(res, response, "Ai response");
});
