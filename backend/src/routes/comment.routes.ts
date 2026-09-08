import { Router } from "express";
import {
  createTicketComment,
  getTicketComments,
} from "../controllers/comment.controller.js";

const router = Router();

router.get("/tickets/:id/comments", getTicketComments);
router.post("/tickets/:id/comments", createTicketComment);

export default router;
