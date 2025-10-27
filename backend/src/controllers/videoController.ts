import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../types";

export const helloWorld = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: ApiResponse = {
      success: true,
      data: {
        message: "Hello World!",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};
