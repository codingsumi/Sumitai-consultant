import { getAllConsultants } from "../services/consultant.service";

export const getConsultants = (_: any, res: any) => {
    const consultant = getAllConsultants();

    res.json({
        success: true,
        message: "Consultants retrieved successfully",
        data: consultant,
    });
};