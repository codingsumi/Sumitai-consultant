import { Request, Response } from "express";
import { createHumanMessage } from "../services/message.service";

export const create = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { message } = req.body;

  const data = await createHumanMessage(chatId, message);

  res.status(201).json({
    success: true,
    data,
  });
};