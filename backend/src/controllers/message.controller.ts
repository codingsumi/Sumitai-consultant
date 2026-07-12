import { Request, Response, NextFunction } from "express";
import { createMessage } from "../services/message.service";
import { successResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { chatId } = req.params;
  const { message } = req.body;

  const response = await createMessage(chatId, message);

  return successResponse(
    res,
    response,
    "Message created successfully",
    201
  );
});