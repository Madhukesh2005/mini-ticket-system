import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  createTicketSchema,
  ticketQuerySchema,
  updateTicketSchema,
} from "../validators/ticket.validator.js";

const formatValidationErrors = (
  issues: { path: PropertyKey[]; message: string }[],
) => {
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
};

export const getTickets = async (req: Request, res: Response) => {
  const result = ticketQuerySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: formatValidationErrors(result.error.issues),
    });
  }

  const {
    status,
    priority,
    customer,
    search,
    page,
    limit,
    sortBy,
    order,
  } = result.data;

  const where: Prisma.TicketWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (customer) {
    where.customerName = {
      contains: customer,
      mode: "insensitive",
    };
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        customerName: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [tickets, total, statusCounts] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),

    prisma.ticket.count({
      where,
    }),

    prisma.ticket.groupBy({
      by: ["status"],
      where,
      _count: {
        _all: true,
      },
    }),
  ]);

  const counts = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };

  for (const item of statusCounts) {
    counts[item.status] = item._count._all;
  }

  return res.status(200).json({
    success: true,
    data: tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: counts,
  });
};

export const createTicket = async (req: Request, res: Response) => {
  const result = createTicketSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(result.error.issues),
    });
  }

  const ticket = await prisma.ticket.create({
    data: result.data,
  });

  return res.status(201).json({
    success: true,
    data: ticket,
  });
};

export const getTicketById = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const ticket = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: "Ticket not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: ticket,
  });
};

export const updateTicket = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const result = updateTicketSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(result.error.issues),
    });
  }

  const existingTicket = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!existingTicket) {
    return res.status(404).json({
      success: false,
      message: "Ticket not found",
    });
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: result.data,
  });

  return res.status(200).json({
    success: true,
    data: ticket,
  });
};

export const deleteTicket = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const existingTicket = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!existingTicket) {
    return res.status(404).json({
      success: false,
      message: "Ticket not found",
    });
  }

  await prisma.ticket.delete({
    where: { id },
  });

  return res.status(204).send();
};