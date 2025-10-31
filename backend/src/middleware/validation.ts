import { NextFunction, Request, Response } from "express";
import { z } from "zod";

// Specific validation for uploaded files
export const validateFile = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file provided",
        });
      }

      const result = schema.safeParse(req.file);

      if (!result.success) {
        const errors = result.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: "File validation failed",
          details: errors,
        });
      }

      req.validatedFile = result.data;
      next();
    } catch (error) {
      console.error("File validation error:", error);
      res.status(500).json({
        success: false,
        error: "Internal file validation error",
      });
    }
  };
};

// Specific validation for request parameters
export const validateParams = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const errors = result.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: "Invalid parameters",
          details: errors,
        });
      }

      req.validatedParams = result.data;
      next();
    } catch (error) {
      console.error("Parameter validation error:", error);
      res.status(500).json({
        success: false,
        error: "Internal validation error",
      });
    }
  };
};

// Specific validation for query parameters
export const validateQuery = <T>(schema: z.ZodType<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = result.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: "Invalid query parameters",
          details: errors,
        });
      }

      req.validatedQuery = result.data;
      next();
    } catch (error) {
      console.error("Query validation error:", error);
      res.status(500).json({
        success: false,
        error: "Internal validation error",
      });
    }
  };
};

// Extend Express Request type to include validated data
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      validatedFile?: any;
      validatedParams?: any;
      validatedQuery?: any;
    }
  }
}
