import { Request, Response } from "express";
import { successResponse } from "../utils/apiResponse";

export const health = (_: Request, res: Response) => {

  return successResponse(
    res,
    { status: "OK" },
    "Health check successful",
    200
  );
};