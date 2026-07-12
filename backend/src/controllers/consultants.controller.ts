import { Request, Response, NextFunction } from "express";
import { getAllConsultants } from "../services/consultant.service";
import { successResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getConsultants = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const consultants = await getAllConsultants();

    return successResponse(
        res,
        consultants,
        "Consultants retrieved successfully",
        200
    );
});