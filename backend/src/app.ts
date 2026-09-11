import express from "express";
import cors from "cors";

import ticketRoutes from "./routes/ticket.routes.js";
import commentRoutes from "./routes/comment.routes.js";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

import { prisma } from "./lib/prisma.js";

const app = express();

app.disable("x-powered-by");

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

const frontendUrl = process.env.FRONTEND_URL;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !frontendUrl) {
  throw new Error("FRONTEND_URL must be configured in production");
}

const allowedOrigins = [
  frontendUrl,
  ...(isProduction ? [] : ["http://localhost:5173"]),
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  }),
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      success: true,
      message: "API is running",
      database: "connected",
    });
  } catch {
    return res.status(503).json({
      success: false,
      message: "Database connection failed",
      database: "disconnected",
    });
  }
});

app.use("/api/tickets", ticketRoutes);
app.use("/api", commentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;