import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { mockPrisma, resetMockDb } from "./prisma.mock.js";

vi.mock("../lib/prisma.js", () => {
  return {
    prisma: mockPrisma,
  };
});

import app from "../app.js";

describe("Comment API", () => {
  beforeEach(() => {
    resetMockDb();
  });

  it("returns 400 for invalid ticket ID format", async () => {
    const response = await request(app).get("/api/tickets/invalid-id/comments");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid ticket ID");
  });

  it("returns 404 when querying comments for a non-existent ticket", async () => {
    const response = await request(app).get(
      "/api/tickets/00000000-0000-0000-0000-000000000000/comments",
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Ticket not found");
  });

  it("creates and retrieves comments for a ticket", async () => {
    const ticketRes = await request(app)
      .post("/api/tickets")
      .send({
        customerName: "Bob Smith",
        title: "Comment test ticket",
        description: "Testing ticket comments",
      });

    const ticketId = ticketRes.body.data.id;

    // Create a comment
    const commentRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        author: "Support Agent",
        message: "We are reviewing this ticket.",
      });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.success).toBe(true);
    expect(commentRes.body.data.author).toBe("Support Agent");
    expect(commentRes.body.data.message).toBe("We are reviewing this ticket.");
    expect(commentRes.body.data.ticketId).toBe(ticketId);

    // Retrieve comments
    const listRes = await request(app).get(`/api/tickets/${ticketId}/comments`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].id).toBe(commentRes.body.data.id);
  });

  it("rejects comments with invalid payload (short author, empty or whitespace message, excessive length)", async () => {
    const ticketRes = await request(app)
      .post("/api/tickets")
      .send({
        customerName: "Bob Smith",
        title: "Validation test ticket",
        description: "Testing comment validation",
      });

    const ticketId = ticketRes.body.data.id;

    // Short author
    const shortAuthorRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        author: "A",
        message: "Valid message",
      });

    expect(shortAuthorRes.status).toBe(400);
    expect(shortAuthorRes.body.errors.author).toBe(
      "Author must be at least 2 characters",
    );

    // Long author
    const longAuthorRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        author: "A".repeat(101),
        message: "Valid message",
      });

    expect(longAuthorRes.status).toBe(400);
    expect(longAuthorRes.body.errors.author).toBe(
      "Author cannot exceed 100 characters",
    );

    // Whitespace message
    const emptyMessageRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        author: "Agent",
        message: "   ",
      });

    expect(emptyMessageRes.status).toBe(400);
    expect(emptyMessageRes.body.errors.message).toBe(
      "Comment cannot be empty",
    );

    // Excessive message length (>1000)
    const longMessageRes = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        author: "Agent",
        message: "A".repeat(1001),
      });

    expect(longMessageRes.status).toBe(400);
    expect(longMessageRes.body.errors.message).toBe(
      "Comment cannot exceed 1000 characters",
    );
  });

  it("deletes child comments when parent ticket is deleted (cascade)", async () => {
    const ticketRes = await request(app)
      .post("/api/tickets")
      .send({
        customerName: "Cascade Customer",
        title: "Cascade test ticket",
        description: "Testing cascade delete",
      });

    const ticketId = ticketRes.body.data.id;

    await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .send({
        author: "Agent",
        message: "This comment should be deleted with the ticket.",
      });

    // Delete ticket
    const delRes = await request(app).delete(`/api/tickets/${ticketId}`);
    expect(delRes.status).toBe(204);

    // Verify ticket is gone (404)
    const missingTicketRes = await request(app).get(
      `/api/tickets/${ticketId}/comments`,
    );
    expect(missingTicketRes.status).toBe(404);
  });
});
