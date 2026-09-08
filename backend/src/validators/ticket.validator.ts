import { z } from "zod";

export const ticketIdSchema = z.uuid("Invalid ticket ID");

export const createTicketSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters"),

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters"),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .default("MEDIUM"),

  status: z
    .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .default("OPEN"),
});

export const updateTicketSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, "Customer name must be at least 2 characters")
      .optional(),

    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .optional(),

    priority: z
      .enum(["LOW", "MEDIUM", "HIGH"])
      .optional(),

    status: z
      .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const ticketQuerySchema = z.object({
  status: z
    .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"])
    .optional(),

  customer: z
    .string()
    .trim()
    .min(1, "Customer cannot be empty")
    .optional(),

  search: z
    .string()
    .trim()
    .min(1, "Search cannot be empty")
    .optional(),

  page: z.coerce
    .number()
    .int()
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),

  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "title",
      "customerName",
      "priority",
      "status",
    ])
    .default("createdAt"),

  order: z
    .enum(["asc", "desc"])
    .default("desc"),
});