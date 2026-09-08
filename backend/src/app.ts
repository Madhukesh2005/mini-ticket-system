import express from "express";
import cors from "cors";
import ticketRoutes from "./routes/ticket.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/tickets", ticketRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
