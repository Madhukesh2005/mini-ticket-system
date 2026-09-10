import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { formatValidationErrors } from "../lib/validation.js";
import { createCommentSchema } from "../validators/comment.validator.js";
import { ticketIdSchema } from "../validators/ticket.validator.js";

export const getTicketComments = async (
  req: Request,
  res: Response,
) => {
  const ticketResult = ticketIdSchema.safeParse(
    req.params.id,
  );

  if (!ticketResult.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid ticket ID",
    });
  }

  const ticketId = ticketResult.data;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: "Ticket not found",
    });
  }

  const comments = await prisma.comment.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
  });

  return res.status(200).json({
    success: true,
    data: comments,
  });
};

export const createTicketComment = async (
  req: Request,
  res: Response,
) => {
  const ticketResult = ticketIdSchema.safeParse(
    req.params.id,
  );

  if (!ticketResult.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid ticket ID",
    });
  }

  const ticketId = ticketResult.data;

  const result = createCommentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(result.error.issues),
    });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: "Ticket not found",
    });
  }

  const comment = await prisma.comment.create({
    data: {
      author: result.data.author,
      message: result.data.message,
      ticketId,
    },
  });

  return res.status(201).json({
    success: true,
    data: comment,
  });
};