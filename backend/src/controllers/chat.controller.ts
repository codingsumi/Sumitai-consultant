import { sendMessageToAi } from "../services/chat.service";

export const chat = async(req: any, res: any) => {
    const { message } = req.body;
    const response = await sendMessageToAi(message);

    res.json({
        success: true,
        message: response,
    });
};