import { Request, Response } from "express";
import { createMessage } from "../services/message.service";

export const create = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { message } = req.body;

  const response = await createMessage(chatId, message);

  res.json({
    success: true,
    data: response,
  });
};