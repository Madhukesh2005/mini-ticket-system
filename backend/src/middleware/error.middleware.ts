import { NextFunction, Request, Response } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response,
) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
