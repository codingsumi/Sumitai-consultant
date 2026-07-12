import { sendMessageToAi } from "../services/chat.service";

export const chat = async(req: any, res: any) => {
    const { consultant, message } = req.body;

    const response = await sendMessageToAi(consultant, message);

    res.json(response);
};