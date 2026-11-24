import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { errorResponse } from "../utils/apiResponse";
import { AppError } from "../utils/errors";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.status, err.errors);
  }

  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Avatar must be 500KB or smaller"
        : err.message;
    return errorResponse(res, message, 400);
  }

  const status = err.status ?? 500;
  const message = err.message ?? "Something went wrong";
  return errorResponse(res, message, status);
};
