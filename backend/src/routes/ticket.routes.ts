import { Router } from "express";
import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  updateTicket,
} from "../controllers/ticket.controller.js";

const router = Router();

router.get("/", getTickets);
router.get("/:id", getTicketById);
router.post("/", createTicket);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);

export default router;
