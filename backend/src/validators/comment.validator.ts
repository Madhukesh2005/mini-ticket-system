import { z } from "zod";

export const commentIdSchema = z.uuid("Invalid comment ID");

export const createCommentSchema = z.object({
  author: z
    .string()
    .trim()
    .min(2, "Author must be at least 2 characters"),

  message: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters"),
});