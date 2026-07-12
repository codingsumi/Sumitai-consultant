import { getAllConsultants } from "../services/consultant.service";

export const getConsultants = async (_: any, res: any) => {
    const consultants = await getAllConsultants();

    res.json({
        success: true,
        message: "Consultants retrieved successfully",
        data: consultants,
    });
};